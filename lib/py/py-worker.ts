/// <reference lib="webworker" />

import {
  PYODIDE_INDEX_URL,
  type LoadPyodide,
  type PyodideApi,
  type WorkerInbound,
  type WorkerOutbound,
} from "./config";

/**
 * Python runs in a worker, and that is not an optimisation — it is the only way
 * to survive `while True:`.
 *
 * WebAssembly has no preemptive multitasking, so a Python loop cannot be
 * interrupted from outside. Pyodide's cooperative interrupt needs a
 * SharedArrayBuffer, which needs COOP/COEP response headers this deployment does
 * not set. Terminating the worker is therefore the reliable stop, and it only
 * works if the interpreter does not share a thread with the page.
 */

const scope = self as unknown as DedicatedWorkerGlobalScope;

function post(message: WorkerOutbound) {
  scope.postMessage(message);
}

let pyodidePromise: Promise<PyodideApi> | null = null;

async function loadRuntime(): Promise<PyodideApi> {
  if (pyodidePromise) return pyodidePromise;

  pyodidePromise = (async () => {
    post({ type: "phase", phase: "loading" });
    // @vite-ignore keeps Vite from trying to resolve a runtime CDN URL.
    const pyodideModule = (await import(/* @vite-ignore */ `${PYODIDE_INDEX_URL}pyodide.mjs`)) as {
      loadPyodide: LoadPyodide;
    };
    const pyodide = await pyodideModule.loadPyodide({ indexURL: PYODIDE_INDEX_URL });
    post({ type: "phase", phase: "ready" });
    return pyodide;
  })();

  // A failed load must not be cached, or the reader can never retry.
  pyodidePromise.catch(() => {
    pyodidePromise = null;
  });

  return pyodidePromise;
}

/**
 * Turn whatever Pyodide threw into text a student can read.
 *
 * Python tracebacks arrive on `message` and are genuinely useful — the line
 * number and exception type are the lesson — so they are passed through rather
 * than replaced with a generic "something went wrong".
 */
function describeError(error: unknown): string {
  if (error instanceof Error) return error.message || error.name;
  if (typeof error === "string") return error;
  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
}

async function runCode(id: number, code: string) {
  let pyodide: PyodideApi;
  try {
    pyodide = await loadRuntime();
  } catch (error) {
    post({ type: "fatal", message: describeError(error) });
    post({ type: "done", id, ok: false, error: describeError(error) });
    return;
  }

  post({ type: "phase", phase: "running" });

  // Stream as it is produced so a long loop shows progress instead of freezing.
  pyodide.setStdout({ batched: (text) => post({ type: "output", stream: "stdout", text }) });
  pyodide.setStderr({ batched: (text) => post({ type: "output", stream: "stderr", text }) });

  try {
    // Import-driven package loading: a snippet that never mentions numpy does
    // not pay the 2.8 MB for it.
    await pyodide.loadPackagesFromImports(code);
    await pyodide.runPythonAsync(code);
    post({ type: "done", id, ok: true });
  } catch (error) {
    post({ type: "output", stream: "stderr", text: describeError(error) });
    post({ type: "done", id, ok: false, error: describeError(error) });
  } finally {
    post({ type: "phase", phase: "ready" });
  }
}

scope.addEventListener("message", (event: MessageEvent<WorkerInbound>) => {
  const message = event.data;
  if (message?.type === "run") void runCode(message.id, message.code);
});

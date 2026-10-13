import pyWorkerUrl from "./py-worker?worker&url";
import { MAX_OUTPUT_CHARS, TRUNCATION_NOTICE, type PythonPhase, type WorkerOutbound } from "./config";

/**
 * Main-thread side of the Python runtime.
 *
 * One worker per page, shared by every code cell, so variables carry from one
 * cell to the next the way they do in a notebook. Calls are serialised: a second
 * `run` waits for the first to finish rather than interleaving output.
 *
 * The worker URL arrives through Vite's `?worker&url` suffix, which yields a
 * plain path such as `/_next/static/py-worker-<hash>.js`. The more familiar
 * `new Worker(new URL("./py-worker.ts", import.meta.url))` is wrong here: vinext
 * rewrites `import.meta.url` in the browser build to a `file:///ROOT/...`
 * placeholder, so the resulting worker URL cannot be fetched.
 */

export type RunOutcome = { ok: true } | { ok: false; error: string; cancelled: boolean };

export type RunHandlers = {
  onPhase?: (phase: PythonPhase) => void;
  onOutput?: (chunk: string, stream: "stdout" | "stderr") => void;
};

let worker: Worker | null = null;
let nextId = 1;
let activeId: number | null = null;
let queue: Promise<unknown> = Promise.resolve();

type Active = {
  id: number;
  handlers: RunHandlers;
  resolve: (outcome: RunOutcome) => void;
};

let active: Active | null = null;

/** Characters forwarded for the current run; reset per run. */
let forwarded = 0;

/**
 * Forward output, but never without bound.
 *
 * Without this, `while True: print(x)` grows a string and a DOM node without
 * limit, and the tab becomes unusable before the reader can reach Stop.
 */
function forwardOutput(text: string, stream: "stdout" | "stderr", handlers: RunHandlers) {
  if (forwarded >= MAX_OUTPUT_CHARS) return;

  const remaining = MAX_OUTPUT_CHARS - forwarded;
  if (text.length <= remaining) {
    forwarded += text.length;
    handlers.onOutput?.(text, stream);
    return;
  }

  forwarded = MAX_OUTPUT_CHARS;
  handlers.onOutput?.(`${text.slice(0, remaining)}${TRUNCATION_NOTICE}`, stream);
}

function createWorker(): Worker {
  const created = new Worker(pyWorkerUrl, { type: "module" });

  created.addEventListener("message", (event: MessageEvent<WorkerOutbound>) => {
    const message = event.data;
    if (!active) return;

    if (message.type === "phase") {
      active.handlers.onPhase?.(message.phase);
      return;
    }
    if (message.type === "output") {
      forwardOutput(message.text, message.stream, active.handlers);
      return;
    }
    if (message.type === "fatal") {
      // The runtime itself could not start; the caller reports it as a failure.
      forwardOutput(message.message, "stderr", active.handlers);
      return;
    }
    if (message.type === "done" && message.id === active.id) {
      const finished = active;
      active = null;
      activeId = null;
      finished.resolve(
        message.ok ? { ok: true } : { ok: false, error: message.error ?? "", cancelled: false },
      );
    }
  });

  created.addEventListener("error", (event) => {
    // A worker-level error (for example the CDN blocked) must not leave the UI
    // stuck on "running" forever.
    if (!active) return;
    const message = event.message || "Python 运行时加载失败";
    active.handlers.onOutput?.(message, "stderr");
    const failed = active;
    active = null;
    activeId = null;
    failed.resolve({ ok: false, error: message, cancelled: false });
  });

  return created;
}

function ensureWorker(): Worker {
  worker ??= createWorker();
  return worker;
}

/** True while a run is in flight. */
export function isRunning(): boolean {
  return activeId !== null;
}

/**
 * Hard stop.
 *
 * Terminates the worker and drops it; the next run starts a fresh interpreter.
 * Variables are lost, which is exactly what the reader is told when they press
 * Stop on a runaway loop.
 */
export function stopPython(): void {
  if (worker) {
    worker.terminate();
    worker = null;
  }
  if (active) {
    const aborted = active;
    active = null;
    activeId = null;
    aborted.handlers.onPhase?.("idle");
    aborted.resolve({ ok: false, error: "", cancelled: true });
  }
}

/** Whether the page can even attempt to run Python. */
export function pythonSupported(): boolean {
  return (
    typeof Worker !== "undefined" &&
    typeof WebAssembly !== "undefined" &&
    typeof URL !== "undefined"
  );
}

export function runPython(code: string, handlers: RunHandlers = {}): Promise<RunOutcome> {
  const task = () =>
    new Promise<RunOutcome>((resolve) => {
      if (!pythonSupported()) {
        resolve({
          ok: false,
          error: "这个浏览器不支持 WebAssembly，无法在本地运行 Python。",
          cancelled: false,
        });
        return;
      }

      const id = nextId++;
      forwarded = 0;
      activeId = id;
      active = { id, handlers, resolve };
      ensureWorker().postMessage({ type: "run", id, code });
    });

  // Serialise: each run starts only after the previous one settles.
  const result = queue.then(task, task);
  queue = result.catch(() => undefined);
  return result;
}

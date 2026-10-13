/**
 * Python runtime configuration.
 *
 * Pyodide is loaded from a CDN rather than bundled: the payload is far too
 * large for the client bundle, and jsDelivr caches it aggressively so the
 * second visit is nearly free.
 *
 * Measured sizes for this exact version (uncompressed):
 *   pyodide.asm.wasm  9.15 MB
 *   python_stdlib.zip 2.43 MB
 *   pyodide.asm.mjs   1.19 MB
 *   numpy wheel       2.82 MB
 *   ----------------------------------
 *   total            ~15.7 MB
 *
 * The UI must therefore never load this on page load, and must say plainly how
 * big it is before the reader commits.
 */
export const PYODIDE_VERSION = "314.0.7";

export const PYODIDE_INDEX_URL = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;

/** Shown to the reader; deliberately the measured figure, not a guess. */
export const PYODIDE_APPROX_MB = 16;

/**
 * Cap on forwarded output.
 *
 * A runaway `while True: print(...)` would otherwise build an unbounded string
 * in the page and one enormous DOM node. The reader keeps the beginning — which
 * holds their own debugging output — and is told it was cut.
 */
export const MAX_OUTPUT_CHARS = 120_000;

export const TRUNCATION_NOTICE = `\n\n… output was too long; the rest has been dropped.\n`;

/**
 * The slice of the Pyodide API this app uses.
 *
 * Declared by hand rather than depending on the `pyodide` npm package: that
 * package is a 13.9 MB unpacked tarball, and every one of those bytes would be
 * installed purely to obtain type definitions for five methods.
 */
export type PyodideApi = {
  runPythonAsync(code: string): Promise<unknown>;
  loadPackagesFromImports(code: string): Promise<void>;
  setStdout(options: { batched: (text: string) => void }): void;
  setStderr(options: { batched: (text: string) => void }): void;
};

export type LoadPyodide = (options: { indexURL: string }) => Promise<PyodideApi>;

/** Phases the reader can see. */
export type PythonPhase = "idle" | "loading" | "ready" | "running";

/** Messages the worker sends to the page. */
export type WorkerOutbound =
  | { type: "phase"; phase: PythonPhase }
  | { type: "output"; stream: "stdout" | "stderr"; text: string }
  | { type: "done"; id: number; ok: boolean; error?: string }
  | { type: "fatal"; message: string };

/** Messages the page sends to the worker. */
export type WorkerInbound = { type: "run"; id: number; code: string };

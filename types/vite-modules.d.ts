/**
 * Ambient declarations for Vite-specific import suffixes.
 *
 * `?worker&url` bundles the module as a worker and returns its URL as a string.
 * The app uses it — rather than the more common
 * `new Worker(new URL("./x.ts", import.meta.url))` — because vinext rewrites
 * `import.meta.url` in the browser build to a `file:///ROOT/...` placeholder, so
 * that form resolves to an unusable URL at runtime. A plain string path has no
 * such problem.
 */
declare module "*?worker&url" {
  const url: string;
  export default url;
}


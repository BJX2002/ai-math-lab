import katex from "katex";

/**
 * Render LaTeX to MathML on the server.
 *
 * `output: "mathml"` emits no KaTeX HTML, so the site needs no KaTeX CSS and no
 * KaTeX web fonts — the browser's own math font renders it. That keeps
 * formulas working with JavaScript disabled and avoids a ~300 KB font download.
 *
 * `throwOnError: false` degrades a bad formula into a visible error span with
 * the source text instead of failing the whole page render.
 */
export function renderMath(tex: string, displayMode = true): string {
  return katex.renderToString(tex, {
    output: "mathml",
    displayMode,
    throwOnError: false,
    strict: "ignore",
    trust: false,
  });
}

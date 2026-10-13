# AI Math Lab

A bilingual (中文 / English) interactive introduction to linear algebra and neural
networks, written for a first-year AI student who has never met either. Every
module pairs plain-language explanation with figures you can drag and Python you
can actually run in the browser.

## What is here

Twelve modules in two halves, plus a capstone and an extension track.

**Part I — seeing vectors and matrices** (modules 01–06)

| # | Module | The idea |
|---|---|---|
| 01 | `vectors` | data as arrows and lists |
| 02 | `dot-products` | similarity, angle, projection |
| 03 | `matrices` | transforming a whole batch at once |
| 04 | `linear-systems` | solving, and what `det = 0` looks like |
| 05 | `pca-svd` | compressing information honestly |
| 06 | `optimization` | descending a loss surface |

**Part II — from a neuron to backpropagation** (modules 07–12)

| # | Module | The idea |
|---|---|---|
| 07 | `perceptron` | the weighted sum and the threshold rule |
| 08 | `activations` | step, sigmoid (with its slope parameter), ReLU |
| 09 | `layer-shapes` | layers, one-hot labels, tensor shapes, broadcasting |
| 10 | `loss-functions` | cross entropy, and why the 0/1 error cannot train |
| 11 | `backpropagation` | the chain rule, and the `w' = w − α ∂E/∂w` update |
| 12 | `training-practice` | epochs, batches, PyTorch, normalization |

Then `/capstone` (the assessed project and the exam) and `/extensions` (AI
ethics, law and privacy — themselves assessed course content).

## Notation

Part II deliberately follows the notation of the INT2093 lectures it supports,
because that is what is examined:

- the loss is **Error**, written `E(W, b)` — never `L`, `J`, `C` or the word "cost"
- the learning rate is **α** in the mathematics and `lr` in code
- gradients are `∂E/∂wᵢ`; updated weights wear a prime, `w'ᵢ`
- "backpropagation" is one word, "cross entropy" has no hyphen
- hidden layers use `θᵢⱼ` / `θ₀ⱼ`, everything else `W` and `b`

Module 06 predates that convention and uses `η` for a generic loss `L`; the later
modules say so where it matters rather than silently switching symbols.

## Structure

```
app/[locale]/           routes: home, start-here, courses, capstone,
                        extensions, modules/[slug], 404, error, loading
lib/content/            lessons as data (no JSX), so tests can validate them
lib/i18n/               locales, the message dictionary, Localized<T>
lib/viz/                pure maths: viewport, line, descent, svd, shape,
                        loss, backprop, train
lib/py/                 the Pyodide worker and its runtime
components/viz/         Plane, VectorArrow, GridWarp, LineFigure, Curve, icons
components/lesson/      the block renderer, the figures, the code cell
styles/                 tokens, shell, lesson, guide, responsive
tests/                  three suites, see below
```

Content is data, not JSX. `lib/content/types.ts` defines a discriminated union of
lesson blocks, so a module can be validated — and its figures checked against the
registry — in plain Node without a browser or a build.

## Running it

Requires Node.js 22.13 or newer.

```bash
npm install
npm run dev
```

On Windows, `START-AI-MATH-LAB.cmd` starts the local copy and opens it.

The browser Python is **real CPython compiled to WebAssembly** (Pyodide 314.0.7,
about 16 MB, fetched from a CDN the first time someone presses Run). Nothing is
downloaded until then, and if the download fails the code cell still shows its
source and its expected output, so the page remains readable offline.

## Tests

```bash
npm run lint
npm test          # build → typecheck → three suites
```

`npm test` builds, typechecks, and then runs three suites:

| Suite | What it proves |
|---|---|
| `test:unit` | bilingual completeness, valid quiz answers, every formula compiles to MathML, no module repeats a figure, and the site's own numerics |
| `test:cells` | **every code cell is executed with CPython and its stdout compared byte for byte** against the output the page claims; plus NumPy cross-checks of the JS SVD, least squares, PCA, broadcasting rule, cross entropy and analytic gradient |
| `test:rendered` | both languages render, 404s keep the reader's language, every module has ≥3 draggable figures with accessible handles, static routes match the sitemap, the worker URL is fetchable |

Two things worth knowing about the numbers the figures show: they are computed,
not illustrated. The SVD is a real Jacobi decomposition, the PCA variance is the
real explained ratio, the loss surface is sampled from the real `E(W, b)`, and
the training curves come from real mini-batch updates. Where a figure would
otherwise be misleading, the test suite says so — for example a large learning
rate on separable data does **not** diverge, and the figure says that instead of
claiming otherwise.

## Two defects in the source material

The course documents this site aligns to contain two errors, which are reported
on `/capstone` rather than silently corrected:

1. The recovered working for Exam Practice question 1 states the weighted sum as
   `3.0`. It is `3(0.2) + 2(0.4) + 1(0.6) + 2 = 4.0`, giving `σ(4.0) ≈ 0.98`, not
   `0.95`. The page shows the correct steps and warns about the slip.
2. Exam Practice question 2 says "five classes" but both the label and the
   predictions have three entries. Working from the vectors as given gives `2.30`.

Also: **Lecture 6 is absent from the provided files**, so modules 07–12 cover
Lectures 1–5, 7 and 8.

## Accessibility and the no-JavaScript contract

Every figure has a keyboard-reachable handle (`role="slider"` with
`aria-valuetext` carrying both coordinates) plus a typed numeric input, so
nothing requires a mouse. Code cells ship their source in a `<textarea>` and
their expected output server-rendered, so the page reads correctly with
JavaScript disabled; the Run button is an enhancement, not a requirement.

## Images

`public/neural-network-beginner.{avif,webp,png}` are the same picture at 27 KB,
36 KB and 1.8 MB. The page uses `<picture>` so browsers take the smallest format
they support and the PNG remains the fallback. `og.png` is deliberately left as a
PNG because social crawlers are inconsistent about WebP.

## Deployment

The site builds to a Cloudflare Worker (`worker/index.ts`) as a static-first
vinext app. `npm run build` emits `dist/`; `SITE_ORIGIN` in `lib/site.ts` controls
the absolute URLs used in the sitemap and `hreflang` alternates.

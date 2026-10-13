import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import test from "node:test";
import {
  MODULE_SLUGS,
  courseModules,
  deriveCourseStats,
  getModule,
} from "../lib/content/index.ts";
import { STATIC_ROUTES } from "../lib/site.ts";

/**
 * Renders a route through the built Cloudflare Worker entry.
 *
 * The worker module is re-imported with a cache-busting query so each route gets
 * a fresh module registry.
 */
async function render(path = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${path}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(
    new Request(`http://localhost${path}`, { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

/**
 * React separates adjacent text nodes with `<!-- -->` markers, so
 * `<b>06</b> 个模块` is served as `<b>06</b> <!-- -->个模块`. Strip comments
 * before matching text so assertions describe what a reader actually sees.
 */
function stripCommentMarkers(html) {
  return html.replace(/<!--[\s\S]*?-->/g, "");
}

async function renderHtml(path) {
  const response = await render(path);
  return {
    status: response.status,
    html: stripCommentMarkers(await response.text()),
    headers: response.headers,
  };
}

test("a bare / sends the reader to the default language", async () => {
  const response = await render("/");
  assert.equal(response.status, 307);
  assert.equal(response.headers.get("location"), "/zh");
});

test("renders the Chinese homepage as the default language", async () => {
  const { status, html } = await renderHtml("/zh");
  assert.equal(status, 200);

  // The root layout lives inside [locale], which is what makes lang correct.
  assert.match(html, /<html lang="zh-Hans">/);
  assert.match(html, /AI Math Lab/);
  assert.match(html, /这一切都是新的？/);
  assert.match(html, /从这里开始。/);
  assert.match(html, /把我当新手教/);
  assert.match(html, /不假设任何数学基础/);
  assert.match(html, /og\.png/);

  // Mobile layout depends on this tag existing.
  assert.match(html, /<meta name="viewport" content="width=device-width, initial-scale=1"/);

  // The switch preserves the page and points at the other language.
  assert.match(html, /href="\/en"/);

  assert.doesNotMatch(html, /react-loading-skeleton|Your site is taking shape/);
});

test("renders the English homepage under /en", async () => {
  const { status, html } = await renderHtml("/en");
  assert.equal(status, 200);
  assert.match(html, /<html lang="en">/);
  assert.match(html, /New to all of this\?/);
  assert.match(html, /Start here\./);
  assert.match(html, /No maths assumed/);
  assert.match(html, /href="\/zh"/);
  assert.doesNotMatch(html, /这一切都是新的？/);
});

test("renders the course path with numbers derived from the content", async () => {
  const stats = deriveCourseStats();
  const twoDigits = (value) => String(value).padStart(2, "0");

  const zh = await renderHtml("/zh/courses");
  assert.equal(zh.status, 200);
  assert.match(zh.html, /从零开始，一次只加一个想法。/);
  // The page claims these numbers, so they are compared with the content rather
  // than re-typed — that is the whole point of deriving them.
  assert.match(zh.html, new RegExp(`<b>${twoDigits(stats.moduleCount)}</b> 个模块`));
  assert.match(zh.html, new RegExp(`<b>${stats.quizCount}</b> 道测验题`));
  assert.match(zh.html, new RegExp(`<b>${stats.guidedHours}</b> 小时引导学习`));

  const en = await renderHtml("/en/courses");
  assert.equal(en.status, 200);
  assert.match(en.html, /Start from zero\. Build one idea at a time\./);
  assert.match(en.html, new RegExp(`<b>${twoDigits(stats.moduleCount)}</b> modules`));
  assert.match(en.html, new RegExp(`<b>${stats.quizCount}</b> quiz questions`));
  assert.match(en.html, new RegExp(`<b>${stats.guidedHours}</b> hours guided study`));

  // Progress must not be read during server render, or hydration disagrees:
  // the server placeholder is a bare dash, never "0%".
  assert.match(zh.html, /role="progressbar"/);
  assert.match(zh.html, /<b>—<\/b>/);
  assert.match(en.html, /<b>—<\/b>/);
  assert.doesNotMatch(zh.html, /<b>0%<\/b>/);
});

test("renders the absolute-beginner neural network introduction in both languages", async () => {
  const zh = await renderHtml("/zh/start-here");
  assert.equal(zh.status, 200);
  assert.match(zh.html, /AI 到底在做什么？/);
  assert.match(zh.html, /认识一个很小的神经元/);
  assert.match(zh.html, /练习，检查，调整，重复。/);
  assert.match(zh.html, /neural-network-beginner\.png/);

  const en = await renderHtml("/en/start-here");
  assert.equal(en.status, 200);
  assert.match(en.html, /What does AI actually do\?/);
  assert.match(en.html, /MEET ONE TINY NEURON/);
  assert.match(en.html, /Practise, check, adjust, repeat\./);
});

test("an unknown locale is not silently accepted", async () => {
  const { status } = await renderHtml("/de");
  assert.equal(status, 404);
});

test("renders a lesson with its blocks, MathML, and code cell", async () => {
  const zh = await renderHtml("/zh/modules/vectors");
  assert.equal(zh.status, 200);
  assert.match(zh.html, /<html lang="zh-Hans">/);
  assert.match(zh.html, /向量：带方向的数据/);
  assert.match(zh.html, /向量是一张有序的清单/);
  assert.match(zh.html, /先猜一猜/);
  assert.match(zh.html, /把想法画出来/);
  assert.match(zh.html, /module_01\.py/);
  // The completion toggle is disabled until storage has been read, which is what
  // keeps the server HTML and the first client render identical.
  assert.match(zh.html, /准备继续了？/);
  assert.match(zh.html, /<button disabled="">标记完成 ✓<\/button>/);

  // Formulas are server-rendered MathML, so they survive with JavaScript off.
  assert.match(zh.html, /<math/);
  assert.match(zh.html, /application\/x-tex/);
  // A KaTeX parse failure renders a visible error span instead of math.
  assert.doesNotMatch(zh.html, /katex-error/);

  const en = await renderHtml("/en/modules/vectors");
  assert.equal(en.status, 200);
  assert.match(en.html, /<html lang="en">/);
  assert.match(en.html, /Vectors: data with direction/);
  assert.match(en.html, /PREDICT FIRST/);
  assert.doesNotMatch(en.html, /向量是一张有序的清单/);
});

test("every module renders in both languages without a math error", async () => {
  const slugs = MODULE_SLUGS;

  for (const slug of slugs) {
    for (const locale of ["zh", "en"]) {
      const { status, html } = await renderHtml(`/${locale}/modules/${slug}`);
      assert.equal(status, 200, `/${locale}/modules/${slug} did not render`);
      assert.match(html, new RegExp(`<html lang="${locale === "zh" ? "zh-Hans" : "en"}">`));
      assert.match(html, /PLAY WITH THE IDEA|动手玩一玩/, `${slug}: practice section missing`);
      assert.match(html, /id="quiz"/, `${slug}: quiz section missing`);
      assert.doesNotMatch(html, /katex-error/, `${slug} (${locale}): a formula failed to parse`);
      // A missing translation renders as the literal text "undefined" between
      // tags; the RSC payload legitimately contains the word, so only visible
      // text is checked.
      assert.doesNotMatch(html, />\s*undefined\s*</, `${slug} (${locale}): rendered "undefined"`);
    }
  }
});

test("an unknown module slug is a 404, not a silent fallback", async () => {
  const { status } = await renderHtml("/zh/modules/not-a-real-module");
  assert.equal(status, 404);
});

test("a 404 keeps the reader's language", async () => {
  // A path that matches no route still has to belong to a locale, otherwise the
  // document declares Chinese while showing English copy.
  const deepEnglishMiss = await renderHtml("/en/nope/nope");
  assert.equal(deepEnglishMiss.status, 404);
  assert.match(deepEnglishMiss.html, /<html lang="en">/);
  assert.match(deepEnglishMiss.html, /We could not find that page/);
  assert.match(deepEnglishMiss.html, /status-card/);

  const unknownLocale = await renderHtml("/de");
  assert.equal(unknownLocale.status, 404);
  // An unrecognised locale falls back to the site default rather than 500-ing.
  assert.match(unknownLocale.html, /<html lang="zh-Hans">/);
  assert.match(unknownLocale.html, /没有找到这一页/);
});

test("serves the crawler files and the site icon", async () => {
  const robots = await render("/robots.txt");
  assert.equal(robots.status, 200);
  assert.match(await robots.text(), /Sitemap:/);

  const sitemap = await render("/sitemap.xml");
  assert.equal(sitemap.status, 200);
  const xml = await sitemap.text();
  // Nine paths in two languages.
  // Every static route plus every module, in both languages.
  const expectedUrls = (STATIC_ROUTES.length + MODULE_SLUGS.length) * 2;
  assert.equal((xml.match(/<url>/g) ?? []).length, expectedUrls);
  assert.match(xml, /hreflang="en"/);

  const icon = await render("/icon.svg");
  assert.equal(icon.status, 200);
  assert.equal(icon.headers.get("content-type"), "image/svg+xml");
});

test("renders the draggable vector planes with accessible handles", async () => {
  const { status, html } = await renderHtml("/zh/modules/vectors");
  assert.equal(status, 200);

  // Three manipulable figures on the page, plus the numeric practice lab.
  assert.equal((html.match(/class="plane-lab"/g) ?? []).length, 3);
  assert.equal((html.match(/class="plane"/g) ?? []).length, 3);

  // Every drag handle must also be reachable and operable without a pointer:
  // focusable, exposed as a slider, and carrying both coordinates as its value.
  const handles = (html.match(/class="handle /g) ?? []).length;
  assert.ok(handles >= 4, `expected at least 4 drag handles, found ${handles}`);
  assert.equal((html.match(/role="slider"/g) ?? []).length, handles);
  assert.equal((html.match(/tabindex="0"/g) ?? []).length, handles);
  assert.equal((html.match(/aria-valuetext="/g) ?? []).length, handles);

  // A precise, non-pointer path exists for every handle.
  assert.equal((html.match(/class="coord-inputs"/g) ?? []).length, 4);
  assert.match(html, /class="plane-toggle"/);

  // The planes must be real geometry, not a placeholder: grid, axes, arrows.
  assert.match(html, /class="plane-grid"/);
  assert.match(html, /class="plane-axes"/);
  assert.ok((html.match(/class="vec vec-/g) ?? []).length >= 6);

  // Screen coordinates are rounded for output rather than shipping float dust.
  assert.doesNotMatch(html, /x1="\d+\.\d{6,}"/);
});

test("no decorative emoji reaches the rendered pages", async () => {
  for (const path of ["/zh", "/en", "/zh/start-here"]) {
    const { html } = await renderHtml(path);
    const found = html.match(/[\u{1F300}-\u{1FAFF}]/gu) ?? [];
    assert.equal(found.length, 0, `${path} still renders emoji: ${found.join(" ")}`);
    // The illustration vocabulary is inline SVG from the local icon set.
    assert.match(html, /class="icon"/, `${path} renders no icons at all`);
  }
});

test("the code cell ships a complete no-JavaScript fallback", async () => {
  const { html } = await renderHtml("/zh/modules/vectors");
  assert.match(html, /class="py-cell"/);
  // The code is present as an editable field, so it is readable and copyable
  // before any download happens.
  assert.match(html, /<textarea[^>]*class="py-editor"/);
  assert.match(html, /import numpy as np/);
  // Expected output is server-rendered, not produced by running anything, and it
  // is the real stdout of the cell as written — so each Python line must appear.
  assert.match(html, /预期输出/);
  assert.match(html, /shape: \(2,\)/);
  assert.match(html, /length: 5\.0/);
  assert.match(html, /unit vector: \[0\.6 0\.8\]/);
  // The reader is told the real cost before committing to it.
  assert.match(html, /约 16 MB/);
  assert.match(html, />运行</);
  assert.match(html, />停止</);
});

test("the built client bundle points the worker at a fetchable path", async () => {
  // Regression guard: `new Worker(new URL("./py-worker.ts", import.meta.url))`
  // compiles, but vinext rewrites `import.meta.url` in the browser build to a
  // `file:///ROOT/...` placeholder, so the worker can never be fetched. The app
  // uses Vite's `?worker&url` instead, and this asserts the emitted URL is a real
  // static path.
  const chunksDir = new URL("../dist/client/_next/static/chunks/", import.meta.url);
  const files = readdirSync(chunksDir).filter((name) => name.endsWith(".js"));
  assert.ok(files.length > 0, "no client chunks were built");

  let sawWorkerReference = false;
  for (const file of files) {
    const source = readFileSync(new URL(file, chunksDir), "utf8");
    assert.doesNotMatch(source, /file:\/\/\/ROOT/, `${file} contains a file:///ROOT placeholder`);
    assert.doesNotMatch(
      source,
      /new Worker\(new URL\(/,
      `${file} builds a worker from import.meta.url, which cannot resolve in a browser`,
    );
    if (/new Worker\(\s*[a-zA-Z_$]/.test(source) && source.includes("py-worker-")) {
      sawWorkerReference = true;
    }
  }
  assert.ok(sawWorkerReference, "no client chunk references the emitted worker path");

  const staticDir = new URL("../dist/client/_next/static/", import.meta.url);
  const workerChunks = readdirSync(staticDir).filter((name) => name.startsWith("py-worker-"));
  assert.equal(workerChunks.length, 1, "expected exactly one bundled worker chunk");
});

test("every module offers at least three draggable figures", async () => {
  /*
   * One of the project's stated acceptance criteria, checked on the rendered
   * page rather than trusted.
   *
   * Modules listed in PENDING still carry their pre-upgrade labs, which are
   * number inputs rather than figures you can drag. The list is deliberately
   * explicit: it makes the remaining work visible in the suite, and it must end
   * up empty.
   */
  // Phase 3 is complete: every module now has real draggable figures.
  const PENDING = new Set();
  assert.equal(PENDING.size, 0, "no module may be left without draggable figures");

  for (const slug of MODULE_SLUGS) {
    const { html } = await renderHtml(`/zh/modules/${slug}`);
    const figures = (html.match(/class="plane-lab[ "]/g) ?? []).length;
    const handles = (html.match(/role="slider"/g) ?? []).length;

    if (PENDING.has(slug)) continue;

    assert.ok(figures >= 3, `${slug}: expected 3 draggable figures, found ${figures}`);
    assert.ok(handles >= 3, `${slug}: expected 3 drag handles, found ${handles}`);

    // Every handle has to be keyboard operable and state its value, or the
    // figures are pointer-only.
    const focusable = (html.match(/tabindex="0"/g) ?? []).length;
    const valued = (html.match(/aria-valuetext="/g) ?? []).length;
    assert.ok(focusable >= handles, `${slug}: only ${focusable} of ${handles} handles are focusable`);
    assert.ok(valued >= handles, `${slug}: only ${valued} of ${handles} handles state a value`);

    // Each module needs a precise, non-pointer route to the same numbers: a
    // field that accepts a typed value, not only a drag or a slider.
    assert.match(html, /type="number"/, `${slug}: no typed numeric entry anywhere`);
  }
});

test("the course has both halves and every module is reachable", () => {
  const tracks = new Set(courseModules.map((module) => module.track));
  assert.ok(tracks.has("foundations"), "the linear-algebra half must exist");
  assert.ok(tracks.has("ai"), "the neural-network half must exist");

  for (const slug of MODULE_SLUGS) {
    assert.ok(getModule(slug), `${slug} must be findable by slug`);
  }

  // Numbers are the reader's map of the course; they must be ordered and unique.
  const numbers = courseModules.map((module) => Number(module.number));
  assert.deepEqual(numbers, [...numbers].sort((a, b) => a - b), "modules must be numbered in order");
  assert.equal(new Set(numbers).size, numbers.length, "module numbers must be unique");
});

test("the capstone page carries the real project and exam numbers", async () => {
  // These figures come from the course's own Project Specification and Exam
  // Practice documents. They are the reason the page exists, so they are pinned:
  // a typo here would mislead someone about where 45 of their marks come from.
  const zh = await renderHtml("/zh/capstone");
  assert.equal(zh.status, 200, "the Chinese capstone page must render");
  assert.match(zh.html, /35/, "the project weighting must appear");
  assert.match(zh.html, /技术/, "the technology row must appear");
  assert.match(zh.html, /0\.98/, "the worked answer to question 1 must appear");
  assert.match(zh.html, /2\.30/, "the worked answer to question 2 must appear");
  // The source documents contradict themselves in two places; both are flagged.
  assert.match(zh.html, /自相矛盾/, "the contradictory question must be flagged");
  assert.match(zh.html, /少算了/, "the erroneous recovered working must be flagged");

  const en = await renderHtml("/en/capstone");
  assert.equal(en.status, 200, "the English capstone page must render");
  assert.match(en.html, /Technology/);
  assert.match(en.html, /contradicts itself/);
  assert.match(en.html, /dropped a term/);

  // Both marking sheets must add up to the 100 they are marked out of.
  const marks = [...zh.html.matchAll(/class="marks-cell">(\d+)</g)].map((match) =>
    Number(match[1]),
  );
  assert.ok(marks.includes(40), "the 40-mark technology row must be present");
  assert.ok(marks.includes(45), "the 45-mark technology row must be present");
  assert.ok(marks.includes(100), "each sheet must total 100");
  assert.equal(
    marks.filter((value) => value === 100).length,
    2,
    "both sheets must total 100",
  );
});

test("every static route is reachable in both languages and in the sitemap", async () => {
  const { html: xml } = await renderHtml("/sitemap.xml");
  for (const route of STATIC_ROUTES) {
    const path = route === "/" ? "" : route;
    for (const locale of ["zh", "en"]) {
      const { status } = await renderHtml(`/${locale}${path}`);
      assert.equal(status, 200, `/${locale}${path} must render`);
      assert.ok(
        xml.includes(`/${locale}${path}`),
        `sitemap must list /${locale}${path}`,
      );
    }
  }
});

test("the extensions page names the cases the course assesses", async () => {
  // The analysis criterion is worth 20/100 in the presentation and 25/100 in the
  // essay, so the cases the lecture names have to actually be on the page.
  const zh = await renderHtml("/zh/extensions");
  assert.equal(zh.status, 200);
  for (const name of ["自动驾驶", "Alexa", "Facebook", "透明度"]) {
    assert.ok(zh.html.includes(name), `the Chinese page must name ${name}`);
  }
  assert.match(zh.html, /25\/100|25／100/, "the essay weighting must be stated");
  assert.match(zh.html, /参考文献本身就是 10 分/, "the reference marks must be called out");

  const en = await renderHtml("/en/extensions");
  assert.equal(en.status, 200);
  for (const name of ["autonomous driving", "Alexa", "Facebook", "bias"]) {
    assert.ok(en.html.includes(name), `the English page must name ${name}`);
  }

  // Both languages must offer the same number of cases and lenses.
  const countClass = (html, className) =>
    (html.match(new RegExp(`class="[^"]*\\b${className}\\b"`, "g")) ?? []).length;
  assert.equal(countClass(zh.html, "case-item"), countClass(en.html, "case-item"));
  assert.equal(countClass(zh.html, "lens-legal"), countClass(en.html, "lens-legal"));
});

test("the primer illustration ships the small formats with a fallback", async () => {
  // The PNG is 1.8 MB and the WebP of the same picture is 36 KB. Losing the
  // <picture> wrapper would silently cost every reader 1.7 MB, so it is pinned.
  const { html } = await renderHtml("/zh");
  assert.match(html, /<picture>/, "the illustration must be wrapped in <picture>");
  assert.match(html, /neural-network-beginner\.avif/, "an AVIF source must be offered");
  assert.match(html, /neural-network-beginner\.webp/, "a WebP source must be offered");
  assert.match(html, /neural-network-beginner\.png/, "the PNG must remain as the fallback");

  // The formats must contain the same picture, and each must be far smaller.
  const { statSync } = await import("node:fs");
  const size = (name) => statSync(new URL(`../public/${name}`, import.meta.url)).size;
  const png = size("neural-network-beginner.png");
  assert.ok(size("neural-network-beginner.webp") < png / 10, "WebP must be an order smaller");
  assert.ok(size("neural-network-beginner.avif") < png / 10, "AVIF must be an order smaller");
});

test("the extension articles render every topic with its formula", async () => {
  const expected = {
    "linear-algebra": ["invertibility", "determinant-geometry", "eigenvectors", "normal-equations", "condition-number"],
    pytorch: ["data-augmentation", "normalization", "transfer-learning", "gpu-and-devices", "saving-and-loading"],
  };

  for (const [slug, ids] of Object.entries(expected)) {
    for (const locale of ["zh", "en"]) {
      const { status, html } = await renderHtml(`/${locale}/extensions/${slug}`);
      assert.equal(status, 200, `/${locale}/extensions/${slug} must render`);
      for (const id of ids) {
        assert.ok(html.includes(`id="${id}"`), `${slug} must render the ${id} topic`);
      }
      // Each topic card carries a worked example, and the page carries MathML.
      const cards = (html.match(/class="guide-card topic-card"/g) ?? []).length;
      assert.equal(cards, ids.length, `${slug} (${locale}) must render ${ids.length} topic cards`);
      assert.ok((html.match(/<math/g) ?? []).length >= 1, `${slug} (${locale}) must include MathML`);
      assert.ok((html.match(/topic-example/g) ?? []).length >= 1, `${slug} (${locale}) must include a worked example`);
    }
  }

  // PyTorch is not installed here, so no page may claim captured output for it.
  const pt = await renderHtml("/en/extensions/pytorch");
  assert.ok(!/>>>/.test(pt.html), "the PyTorch article must not fake a REPL session");
  // The pretrained normalization constants are the point of one topic.
  assert.ok(pt.html.includes("0.485") && pt.html.includes("0.229"), "the ImageNet constants must appear");
});

test("the responsive and reduced-motion contract is present", async () => {
  const { readFileSync: read } = await import("node:fs");
  const css = [
    "tokens.css",
    "shell.css",
    "lesson.css",
    "guide.css",
    "responsive.css",
  ]
    .map((name) => read(new URL(`../styles/${name}`, import.meta.url), "utf8"))
    .join("\n");

  // A phone breakpoint has to exist: 360px is the narrowest screen the site
  // claims to support, and the figures are two-column grids above it.
  const widths = [...css.matchAll(/max-width:\s*(\d+)px/g)].map((match) => Number(match[1]));
  assert.ok(widths.some((value) => value <= 460), `no breakpoint at or below 460px: ${widths}`);

  // Motion must be reducible for readers who ask for it.
  assert.ok(css.includes("prefers-reduced-motion"), "reduced motion must be honoured");

  // The figures are viewBox SVGs, so they scale; check nothing pins a fixed
  // pixel width on them that would overflow a phone.
  assert.match(css, /\.plane\s*\{[^}]*width:\s*100%/, "the plane must scale to its container");

  // The rendered pages must declare a viewport, or none of the above applies.
  const { html } = await renderHtml("/zh");
  assert.match(html, /name="viewport"/, "a viewport meta tag is required");
});

test("the social card is the size the metadata claims", async () => {
  // A mismatch between the declared width/height and the real file makes some
  // crawlers letterbox or crop the preview, and nothing in the build notices.
  const png = readFileSync(new URL("../public/og.png", import.meta.url));
  assert.equal(png.toString("ascii", 1, 4), "PNG", "og.png must really be a PNG");

  // A PNG's IHDR carries the dimensions as big-endian uint32 at bytes 16 and 20.
  const width = png.readUInt32BE(16);
  const height = png.readUInt32BE(20);

  const layout = readFileSync(new URL("../app/[locale]/layout.tsx", import.meta.url), "utf8");
  const declared = layout.match(/images: \[\{ url: "\/og\.png", width: (\d+), height: (\d+)/);
  assert.ok(declared, "layout.tsx must declare the og image dimensions");
  assert.equal(Number(declared[1]), width, "declared width must match the file");
  assert.equal(Number(declared[2]), height, "declared height must match the file");

  // It is fetched by crawlers, not readers, so it is allowed to be a PNG — but
  // it should not be megabytes now that it is 1200px wide.
  assert.ok(png.length < 900_000, `og.png is ${png.length} bytes; too heavy for a social card`);
  assert.equal(width, 1200, "the standard social card width");
});

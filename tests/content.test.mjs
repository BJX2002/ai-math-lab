import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { courseModules, deriveCourseStats } from "../lib/content/index.ts";
import { FIGURE_IDS, LAB_IDS } from "../lib/content/types.ts";
import { ICON_NAMES, isIconName } from "../lib/icons.ts";
import { LOCALES } from "../lib/i18n/locales.ts";
import { messagesByLocale } from "../lib/i18n/messages.ts";
import { renderMath } from "../lib/math.ts";
import { emptyProgress, normalizeProgress } from "../lib/progress.ts";
import {
  createViewport,
  formatNumber,
  niceStep,
  tickValues,
} from "../lib/viz/viewport.ts";
import {
  classifySystem,
  clipLineToWorld,
  determinantOf,
  fitResiduals,
  intersectLines,
  leastSquaresFit,
  lineFromPoints,
  normalizeLine,
  principalComponents,
} from "../lib/viz/line.ts";
import {
  DEFAULT_BOWL,
  bowlLoss,
  contourEllipse,
  descendBowl,
  descendLine,
  diverged,
  quarticGradient,
  quarticLoss,
  stabilityLimit,
} from "../lib/viz/descent.ts";
import {
  broadcastShapes,
  denseChain,
  denseParameters,
  flattenTrailing,
  oneHot,
  outputWidth,
  shapeSize,
} from "../lib/viz/shape.ts";
import { TOY_DATA, binaryCrossEntropy, discreteError, squaredError } from "../lib/viz/loss.ts";
import {
  datasetGradientW,
  descentSteps,
  forwardAndBackward,
  numericGradient,
} from "../lib/viz/backprop.ts";

/**
 * Content integrity, checked as data rather than through the rendered page.
 *
 * With twelve modules in two languages, the realistic failure modes are a
 * forgotten translation, an answer index that points at no option, and a figure
 * or lab id that no longer exists. None of those show up as a build error.
 */

/** `{ zh, en }` is the shape of every `Localized<T>` in the content model. */
function isLocalized(value) {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    Object.keys(value).length === 2 &&
    "zh" in value &&
    "en" in value
  );
}

function walk(value, path, visit) {
  if (isLocalized(value)) {
    visit(value, path);
    for (const locale of LOCALES) walk(value[locale], `${path}.${locale}`, visit);
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => walk(item, `${path}[${index}]`, visit));
    return;
  }
  if (value && typeof value === "object") {
    for (const [key, item] of Object.entries(value)) walk(item, `${path}.${key}`, visit);
  }
}

function eachModule(handler) {
  for (const lesson of courseModules) handler(lesson, `modules/${lesson.slug}`);
}

test("lesson identity is unique and well formed", () => {
  const slugs = new Set();
  const numbers = new Set();

  eachModule((lesson, path) => {
    assert.match(lesson.slug, /^[a-z0-9-]+$/, `${path}: slug must be url-safe`);
    assert.match(lesson.number, /^\d{2}$/, `${path}: number must be two digits`);
    assert.ok(!slugs.has(lesson.slug), `${path}: duplicate slug`);
    assert.ok(!numbers.has(lesson.number), `${path}: duplicate number`);
    slugs.add(lesson.slug);
    numbers.add(lesson.number);

    assert.ok(["foundations", "ai"].includes(lesson.track), `${path}: unknown track`);
    assert.ok(lesson.durationMinutes > 0, `${path}: duration must be positive`);
    assert.ok(FIGURE_IDS.includes(lesson.figure), `${path}: unknown figure id`);
    assert.ok(LAB_IDS.includes(lesson.lab), `${path}: unknown lab id`);
  });

  assert.ok(courseModules.length >= 6, "the six linear-algebra modules must exist");
});

test("every localized field is complete in both languages", () => {
  /** `["a","b"]` -> `[s,s]`, `[["a"],["b"]]` -> `[[s],[s]]`: compares nesting, not text. */
  const shapeOf = (value) => (Array.isArray(value) ? `[${value.map(shapeOf).join(",")}]` : "s");

  const assertNonEmptyStrings = (value, at) => {
    if (Array.isArray(value)) {
      assert.ok(value.length > 0, `${at}: empty array`);
      value.forEach((item, index) => assertNonEmptyStrings(item, `${at}[${index}]`));
      return;
    }
    assert.equal(typeof value, "string", `${at}: expected a string`);
    assert.ok(value.trim().length > 0, `${at}: empty string`);
  };

  eachModule((lesson, path) => {
    walk(lesson, path, (value, at) => {
      for (const locale of LOCALES) {
        assertNonEmptyStrings(value[locale], `${at}.${locale}`);
      }

      // A translation that silently drops a bullet, a step, or a table row is
      // the most common bilingual mistake and is invisible on the page.
      assert.equal(
        shapeOf(value.zh),
        shapeOf(value.en),
        `${at}: zh is ${shapeOf(value.zh)} but en is ${shapeOf(value.en)}`,
      );
    });
  });
});

test("every quiz and prediction has a valid answer", () => {
  let predicts = 0;

  eachModule((lesson, path) => {
    assert.ok(lesson.quiz.length >= 1, `${path}: needs at least one quiz question`);

    lesson.quiz.forEach((item, index) => {
      const at = `${path}.quiz[${index}]`;
      const options = item.options.zh;
      assert.equal(options.length, item.options.en.length, `${at}: option counts differ`);
      assert.ok(options.length >= 2, `${at}: needs at least two options`);
      assert.equal(new Set(options).size, options.length, `${at}: duplicate zh options`);
      assert.equal(new Set(item.options.en).size, options.length, `${at}: duplicate en options`);
      assert.ok(
        Number.isInteger(item.correct) && item.correct >= 0 && item.correct < options.length,
        `${at}: correct=${item.correct} is out of range`,
      );
    });

    for (const section of lesson.sections) {
      for (const block of section.blocks) {
        if (block.kind !== "predict") continue;
        predicts += 1;
        const at = `${path}.sections["${section.label.en}"].predict`;
        const options = block.options.zh;
        assert.equal(options.length, block.options.en.length, `${at}: option counts differ`);
        assert.ok(options.length >= 2, `${at}: needs at least two options`);
        assert.equal(new Set(options).size, options.length, `${at}: duplicate zh options`);
        assert.ok(
          Number.isInteger(block.answerIndex) &&
            block.answerIndex >= 0 &&
            block.answerIndex < options.length,
          `${at}: answerIndex=${block.answerIndex} is out of range`,
        );
      }
    }
  });

  assert.ok(predicts > 0, "the predict-first device must be used at least once");
});

test("lesson structure is rich enough to teach", () => {
  eachModule((lesson, path) => {
    assert.ok(lesson.sections.length >= 3, `${path}: expected at least three sections`);
    assert.ok(lesson.outcomes.zh.length >= 3, `${path}: expected at least three outcomes`);
    assert.ok(lesson.code.source.trim().length > 0, `${path}: code cell is empty`);

    for (const section of lesson.sections) {
      assert.ok(section.blocks.length >= 2, `${path}: section "${section.label.en}" is too thin`);
    }
  });
});

test("every formula compiles to MathML", () => {
  let formulas = 0;

  eachModule((lesson, path) => {
    for (const section of lesson.sections) {
      for (const block of section.blocks) {
        if (block.kind !== "formula") continue;
        formulas += 1;
        assert.ok(block.tex.trim().length > 0, `${path}: empty tex`);

        const html = renderMath(block.tex);
        assert.match(html, /<math/, `${path}: tex did not produce MathML: ${block.tex}`);
        assert.doesNotMatch(
          html,
          /katex-error/,
          `${path}: KaTeX could not parse tex: ${block.tex}`,
        );
      }
    }
  });

  assert.ok(formulas > 0, "expected at least one formula");
});

test("course statistics are derived, not hand-typed", () => {
  const stats = deriveCourseStats();
  assert.equal(stats.moduleCount, courseModules.length);
  assert.equal(stats.labCount, courseModules.length);
  assert.equal(
    stats.quizCount,
    courseModules.reduce((total, lesson) => total + lesson.quiz.length, 0),
  );
  assert.equal(
    stats.guidedMinutes,
    courseModules.reduce((total, lesson) => total + lesson.durationMinutes, 0),
  );
  assert.equal(stats.guidedHours, Math.floor(stats.guidedMinutes / 30) / 2);
  assert.ok(stats.guidedHours > 0);
});

test("message dictionaries have the same shape in both languages", () => {
  const shapeOf = (value, path = "") => {
    if (typeof value === "string") return [`${path}:string`];
    if (Array.isArray(value)) return [`${path}:array(${value.length})`];
    return Object.entries(value).flatMap(([key, item]) => shapeOf(item, `${path}.${key}`));
  };

  assert.deepEqual(shapeOf(messagesByLocale.zh), shapeOf(messagesByLocale.en));

  const flat = (value) => JSON.stringify(value);
  assert.notEqual(flat(messagesByLocale.zh), flat(messagesByLocale.en), "en is untranslated");
});

test("progress migration survives legacy and corrupt values", () => {
  // v1 stored a bare array of slugs.
  assert.deepEqual(normalizeProgress('["vectors"]').completed, ["vectors"]);
  // v2 stores an object.
  assert.deepEqual(normalizeProgress('{"completed":["vectors"]}').completed, ["vectors"]);
  // Corrupt, empty, and missing values all fall back to empty rather than throw.
  assert.deepEqual(normalizeProgress("{not json").completed, []);
  assert.deepEqual(normalizeProgress("null").completed, []);
  assert.deepEqual(normalizeProgress(null).completed, []);
  assert.deepEqual(normalizeProgress(JSON.stringify({ completed: "nope" })).completed, []);
  assert.deepEqual(normalizeProgress(JSON.stringify({ completed: [1, "", "ok", "ok"] })).completed, [
    "ok",
  ]);
  assert.deepEqual(emptyProgress().completed, []);
});

test("every lab and figure referenced by a block exists", () => {
  let referenced = 0;

  eachModule((lesson, path) => {
    for (const section of lesson.sections) {
      for (const block of section.blocks) {
        if (block.kind === "lab") {
          referenced += 1;
          assert.ok(
            LAB_IDS.includes(block.id),
            `${path}.sections["${section.label.en}"]: unknown lab id "${block.id}"`,
          );
        }
        if (block.kind === "figure") {
          referenced += 1;
          assert.ok(
            FIGURE_IDS.includes(block.id),
            `${path}.sections["${section.label.en}"]: unknown figure id "${block.id}"`,
          );
        }
      }
    }
  });

  assert.ok(referenced > 0, "expected at least one lab or figure block");
});

test("every icon named in the messages exists in the vocabulary", () => {
  const collect = (value, found = []) => {
    if (Array.isArray(value)) {
      for (const item of value) collect(item, found);
      return found;
    }
    if (value && typeof value === "object") {
      for (const [key, item] of Object.entries(value)) {
        if (key === "icon" && typeof item === "string") found.push(item);
        else collect(item, found);
      }
    }
    return found;
  };

  const names = LOCALES.flatMap((locale) => collect(messagesByLocale[locale]));
  assert.ok(names.length >= 10, `expected the icon vocabulary to be used, found ${names.length}`);
  for (const name of names) {
    assert.ok(isIconName(name), `unknown icon "${name}"; known: ${ICON_NAMES.join(", ")}`);
  }
});

test("no decorative emoji survives in messages or markup", () => {
  // The first version used emoji as its entire illustration vocabulary. They
  // render differently per platform and cannot inherit the design's colour, so
  // the replacement should not creep back in.
  const banished = ["🎨", "⚖️", "📦", "🔎", "🧠", "💬", "🔁", "🍎", "💭", "📏", "🔧"];

  const messageText = JSON.stringify(messagesByLocale);
  for (const emoji of banished) {
    assert.ok(!messageText.includes(emoji), `messages still contain the emoji ${emoji}`);
  }

  for (const file of [
    "app/[locale]/page.tsx",
    "app/[locale]/start-here/page.tsx",
    "components/lesson/figures.tsx",
  ]) {
    const source = readFileSync(new URL(`../${file}`, import.meta.url), "utf8");
    for (const emoji of banished) {
      assert.ok(!source.includes(emoji), `${file} still contains the emoji ${emoji}`);
    }
  }
});

test("the plane viewport keeps scale equal on both axes", () => {
  const view = createViewport({
    width: 460,
    height: 330,
    world: { xMin: -5.5, xMax: 5.5, yMin: -4, yMax: 4 },
  });

  const origin = view.toScreen({ x: 0, y: 0 });
  const unitX = view.toScreen({ x: 1, y: 0 });
  const unitY = view.toScreen({ x: 0, y: 1 });
  const dx = Math.hypot(unitX.x - origin.x, unitX.y - origin.y);
  const dy = Math.hypot(unitY.x - origin.x, unitY.y - origin.y);

  // A unit step must be the same number of pixels along either axis, otherwise
  // angles and lengths on the diagram are lies.
  assert.ok(Math.abs(dx - dy) < 1e-9, `x unit is ${dx}px but y unit is ${dy}px`);
  assert.ok(dx > 0);

  // A right angle has to stay a right angle on screen.
  const dot = (unitX.x - origin.x) * (unitY.x - origin.x) + (unitX.y - origin.y) * (unitY.y - origin.y);
  assert.ok(Math.abs(dot) < 1e-9, `axes are not perpendicular on screen (dot=${dot})`);

  // World -> screen -> world must round-trip, including the y flip.
  for (const point of [
    { x: 2.5, y: -1.75 },
    { x: -5.4, y: 3.9 },
    { x: 0, y: 0 },
  ]) {
    const back = view.toWorld(view.toScreen(point));
    assert.ok(
      Math.hypot(back.x - point.x, back.y - point.y) < 1e-9,
      `round trip failed for (${point.x}, ${point.y}) -> (${back.x}, ${back.y})`,
    );
  }

  // The requested rectangle must be fully visible even after aspect correction.
  assert.ok(view.world.xMin <= -5.5 && view.world.xMax >= 5.5);
  assert.ok(view.world.yMin <= -4 && view.world.yMax >= 4);
});

test("grid steps and tick labels stay human-readable", () => {
  assert.equal(niceStep(11, 8), 2);
  assert.equal(niceStep(100, 8), 20);
  assert.equal(niceStep(8, 8), 1);

  assert.deepEqual(tickValues(-1, 1, 0.5), [-1, -0.5, 0, 0.5, 1]);
  // Floating-point dust must never reach the axis labels.
  for (const value of tickValues(-2, 2, 0.25)) {
    assert.ok(String(value).length <= 5, `tick ${value} is not a clean label`);
  }

  assert.equal(formatNumber(0.5), "0.5");
  assert.equal(formatNumber(-0), "0");
  assert.equal(formatNumber(1 / 3, 2), "0.33");
  assert.equal(formatNumber(Number.NaN), "—");
});

test("line helpers agree with hand-checked algebra", () => {
  const world = { xMin: -5, xMax: 5, yMin: -5, yMax: 5 };

  // y = x through the origin, clipped to the frame.
  const diagonal = lineFromPoints({ x: -1, y: -1 }, { x: 1, y: 1 });
  assert.ok(diagonal);
  const chord = clipLineToWorld(diagonal, world);
  assert.ok(chord, "a diagonal line must cross the frame");
  const [start, end] = chord;
  assert.ok(Math.abs(Math.hypot(end.x - start.x, end.y - start.y) - Math.hypot(10, 10)) < 1e-6);

  // Two identical points define no line.
  assert.equal(lineFromPoints({ x: 2, y: 2 }, { x: 2, y: 2 }), null);

  // A vertical line must still be clipped, which solving for y would miss.
  const vertical = lineFromPoints({ x: 3, y: -2 }, { x: 3, y: 4 });
  assert.ok(vertical);
  const verticalChord = clipLineToWorld(vertical, world);
  assert.ok(verticalChord, "a vertical line must cross the frame");
  assert.ok(verticalChord.every((point) => Math.abs(point.x - 3) < 1e-9));

  // A line entirely outside the frame is not drawn.
  assert.equal(clipLineToWorld(lineFromPoints({ x: 0, y: 20 }, { x: 1, y: 21 }), world), null);

  // x + y = 5 meets x - y = 1 at (3, 2).
  const first = lineFromPoints({ x: 5, y: 0 }, { x: 0, y: 5 });
  const second = lineFromPoints({ x: 1, y: 0 }, { x: 0, y: -1 });
  const crossing = intersectLines(first, second);
  assert.ok(crossing);
  assert.ok(Math.abs(crossing.x - 3) < 1e-9 && Math.abs(crossing.y - 2) < 1e-9);
  // Raw coefficients are arbitrary in scale, so the raw determinant is too.
  // Normalised, it is sin θ: these two lines are perpendicular, so det = 1.
  assert.ok(Math.abs(determinantOf(normalizeLine(first), normalizeLine(second)) - 1) < 1e-9);
  assert.ok(Math.abs(determinantOf(first, second) - 10) < 1e-9);
});

test("parallel lines are told apart from the same line", () => {
  // x + y = 1 and x + y = 3: parallel, no solution.
  const parallel = classifySystem(
    lineFromPoints({ x: 1, y: 0 }, { x: 0, y: 1 }),
    lineFromPoints({ x: 3, y: 0 }, { x: 0, y: 3 }),
  );
  assert.equal(parallel, "none");

  // x + y = 1 written twice, and written scaled: the same line, infinitely many.
  const sameLine = lineFromPoints({ x: 1, y: 0 }, { x: 0, y: 1 });
  // (2, 0) and (0, 2) describe x + y = 2, which is parallel but NOT the same line.
  assert.equal(classifySystem(sameLine, lineFromPoints({ x: 2, y: 0 }, { x: 0, y: 2 })), "none");
  // The same line written with scaled coefficients.
  assert.equal(classifySystem({ a: 1, b: 1, c: 1 }, { a: 2, b: 2, c: 2 }), "infinite");
  assert.equal(classifySystem(sameLine, lineFromPoints({ x: 0, y: 1 }, { x: 1, y: 0 })), "infinite");

  // Slopes differing by a hair is still a unique solution.
  const nearly = classifySystem(
    { a: 1, b: 1, c: 1 },
    { a: 1.000001, b: 1, c: 2 },
  );
  assert.equal(nearly, "unique");

  assert.equal(intersectLines({ a: 1, b: 1, c: 1 }, { a: 1, b: 1, c: 2 }), null);
});

test("least squares reproduces the numbers the lesson quotes", () => {
  // The module 04 cell fits y to x = 0,1,2,3 with y = 1.0, 2.1, 2.9, 4.2 and
  // NumPy reports intercept, slope = [0.99, 1.04].
  const fit = leastSquaresFit([
    { x: 0, y: 1.0 },
    { x: 1, y: 2.1 },
    { x: 2, y: 2.9 },
    { x: 3, y: 4.2 },
  ]);
  assert.ok(fit && !fit.vertical);
  assert.ok(Math.abs(fit.intercept - 0.99) < 1e-9, `intercept ${fit.intercept}`);
  assert.ok(Math.abs(fit.slope - 1.04) < 1e-9, `slope ${fit.slope}`);

  // Residuals are what least squares minimizes, so they should be small here.
  const { total } = fitResiduals(
    [
      { x: 0, y: 1.0 },
      { x: 1, y: 2.1 },
      { x: 2, y: 2.9 },
      { x: 3, y: 4.2 },
    ],
    fit,
  );
  assert.ok(total > 0 && total < 0.1, `sum of squares ${total}`);

  // A perfectly collinear set has zero residual, and the fit is exact.
  const exact = leastSquaresFit([
    { x: 0, y: 1 },
    { x: 1, y: 3 },
    { x: 2, y: 5 },
  ]);
  assert.ok(exact && Math.abs(exact.slope - 2) < 1e-12 && Math.abs(exact.intercept - 1) < 1e-12);

  // All x identical: the slope is undefined, so it must not return NaN.
  const vertical = leastSquaresFit([
    { x: 2, y: 0 },
    { x: 2, y: 5 },
  ]);
  assert.ok(vertical && vertical.vertical);
  assert.ok(Number.isFinite(vertical.intercept));

  assert.equal(leastSquaresFit([]), null);
});

test("PCA finds the same direction and variance ratio as NumPy", () => {
  // The module 05 cell decomposes this cloud and NumPy reports explained ratio
  // [0.86493848, 0.13506152] with first component [0.96444065, 0.26429951].
  const cloud = [
    { x: 2, y: 0 },
    { x: 0, y: 1 },
    { x: 3, y: 1 },
    { x: 4, y: 2 },
  ];
  const pca = principalComponents(cloud);
  assert.ok(pca);

  const total = pca.variance[0] + pca.variance[1];
  assert.ok(Math.abs(pca.variance[0] / total - 0.86493848) < 1e-6, `ratio ${pca.variance[0] / total}`);
  assert.ok(Math.abs(pca.direction.x - 0.96444065) < 1e-4, `x ${pca.direction.x}`);
  assert.ok(Math.abs(pca.direction.y - 0.26429951) < 1e-4, `y ${pca.direction.y}`);

  // The two directions are orthonormal, which is what makes PCA a rotation.
  assert.ok(Math.abs(Math.hypot(pca.direction.x, pca.direction.y) - 1) < 1e-12);
  assert.ok(
    Math.abs(pca.direction.x * pca.secondary.x + pca.direction.y * pca.secondary.y) < 1e-12,
  );
  // The mean is the centre the components are measured from.
  assert.ok(Math.abs(pca.mean.x - 2.25) < 1e-12 && Math.abs(pca.mean.y - 1) < 1e-12);

  assert.equal(principalComponents([{ x: 1, y: 1 }]), null);
});

test("the JavaScript descent reproduces the lesson's Python output", () => {
  // The module 06 cell prints eight rows of (step, loss, x-after-update) for
  // x = 5, L(x) = x², η = 0.1. The interactive figure must describe exactly the
  // same run, or the picture and the code disagree.
  const lesson = courseModules.find((item) => item.slug === "optimization");
  assert.ok(lesson, "the optimization module must exist");

  const documented = lesson.code.expectedOutput
    .split("\n")
    .map((line) => line.trim().split(/\s+/).map(Number));

  const history = descendLine((x) => x * x, (x) => 2 * x, 5, 0.1, 8);
  assert.equal(history.length, 9, "eight updates means nine recorded positions");

  documented.forEach(([index, loss, nextX], row) => {
    assert.equal(history[row].index, index, `row ${row}: step index`);
    assert.ok(
      Math.abs(history[row].loss - loss) < 5e-5,
      `row ${row}: loss ${history[row].loss} vs documented ${loss}`,
    );
    assert.ok(
      Math.abs(history[row + 1].x - nextX) < 5e-5,
      `row ${row}: next x ${history[row + 1].x} vs documented ${nextX}`,
    );
  });
});

test("a learning rate past the stability limit is reported as divergence", () => {
  const square = { ax: 1, ay: 1 };
  assert.equal(stabilityLimit(square), 1);
  assert.equal(stabilityLimit({ ax: 0.5, ay: 4 }), 0.25);

  const gentle = descendBowl(square, { x: 1, y: 1 }, 0.1, 12);
  assert.equal(diverged(gentle), false);
  assert.ok(gentle.at(-1).loss < gentle[0].loss);

  const oscillating = descendBowl(square, { x: 1, y: 1 }, 0.9, 12);
  assert.equal(diverged(oscillating), false, "η below the limit must still shrink");

  const explosive = descendBowl(square, { x: 1, y: 1 }, 1.1, 12);
  assert.equal(diverged(explosive), true, "η above the limit must grow");
  assert.ok(explosive.at(-1).loss > explosive[0].loss);
});

test("the drawn contour really is a level set", () => {
  const bowl = DEFAULT_BOWL;
  for (const level of [0.5, 5, 20]) {
    for (const point of contourEllipse(bowl, level, 16)) {
      assert.ok(
        Math.abs(bowlLoss(bowl, point) - level) < 1e-9,
        `point on the level-${level} ellipse has loss ${bowlLoss(bowl, point)}`,
      );
    }
  }
  assert.deepEqual(contourEllipse(bowl, 0), []);
});

test("the quartic really is non-convex, so local minima are possible", () => {
  // A sign change in the gradient is a stationary point. Two of them in this
  // range are the two valleys the figure talks about.
  let signChanges = 0;
  let previous = Math.sign(quarticGradient(-2.4));
  for (let x = -2.4; x <= 2.4; x += 0.001) {
    const current = Math.sign(quarticGradient(x));
    if (current !== 0 && current !== previous) {
      signChanges += 1;
      previous = current;
    }
  }
  assert.equal(signChanges, 3, "two minima around one maximum");

  // Descending from either side lands in a different valley, which is the whole
  // point of the figure.
  const fromLeft = descendLine(quarticLoss, quarticGradient, -2, 0.05, 400);
  const fromRight = descendLine(quarticLoss, quarticGradient, 2, 0.05, 400);
  const left = fromLeft.at(-1).x;
  const right = fromRight.at(-1).x;
  assert.ok(left < 0 && right > 0, `landed at ${left} and ${right}`);
  assert.ok(Math.abs(left - right) > 0.5, "different starts must reach different valleys");
});

test("no module shows the same figure twice", () => {
  // Modules 07 and 08 originally listed their practice figure both inside a
  // section and in the module's \`lab\` slot, so the reader met the identical
  // figure twice on one page. Distinctness is the invariant that prevents it.
  eachModule((lesson, path) => {
    const ids = [`lab:${lesson.lab}`, `figure:${lesson.figure}`];
    for (const section of lesson.sections) {
      for (const block of section.blocks) {
        if (block.kind === "lab") ids.push(`lab:${block.id}`);
        if (block.kind === "figure") ids.push(`figure:${block.id}`);
      }
    }

    const repeated = [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))];
    assert.equal(repeated.length, 0, `${path}: repeats ${repeated.join(", ")}`);

    // Three distinct interactive figures is the course's stated minimum.
    const labs = new Set(ids.filter((id) => id.startsWith("lab:")));
    assert.ok(labs.size >= 3, `${path}: only ${labs.size} distinct labs`);
  });
});

test("shape helpers match the conventions the lessons quote", () => {
  // The MNIST batch the lectures use: (64, 1, 28, 28) flattens to (64, 784).
  const batch = [64, 1, 28, 28];
  assert.equal(shapeSize(batch), 64 * 784);
  assert.deepEqual(flattenTrailing(batch), [64, 784]);
  assert.deepEqual(flattenTrailing([64, 784], 0), [50176]);

  // nn.Linear(784, 256) then nn.Linear(256, 10): 784*256+256 and 256*10+10.
  assert.equal(denseParameters(784, 256), 200960);
  assert.equal(denseParameters(256, 10), 2570);
  const chain = denseChain([784, 256, 10]);
  assert.deepEqual(chain.perLayer, [200960, 2570]);
  assert.equal(chain.total, 203530);

  // Binary needs one output; ten digits need ten.
  assert.equal(outputWidth(2), 1);
  assert.equal(outputWidth(10), 10);
  assert.deepEqual(oneHot(3, 10).slice(0, 5), [0, 0, 0, 1, 0]);
  assert.equal(oneHot(3, 10).reduce((a, b) => a + b, 0), 1);

  // A 1 stretches; anything else mismatched is an error.
  const stretched = broadcastShapes([64, 784], [784]);
  assert.ok(stretched.ok);
  assert.deepEqual(stretched.shape, [64, 784]);
  assert.equal(broadcastShapes([64, 784], [10]).ok, false);
  assert.deepEqual(broadcastShapes([5, 1, 3], [1, 4, 1]).shape, [5, 4, 3]);
});

test("cross entropy punishes confident mistakes and the discrete error cannot", () => {
  // Right and confident costs almost nothing; wrong and confident costs a lot.
  assert.ok(binaryCrossEntropy(0.99, 1) < 0.02);
  assert.ok(binaryCrossEntropy(0.01, 1) > 4.5);
  // Symmetric in the two labels.
  assert.ok(Math.abs(binaryCrossEntropy(0.3, 1) - binaryCrossEntropy(0.7, 0)) < 1e-12);
  // A coin flip is ln 2 either way.
  assert.ok(Math.abs(binaryCrossEntropy(0.5, 1) - Math.LN2) < 1e-12);

  // The discrete error is flat everywhere except exactly at the target, which is
  // precisely why it gives no direction to descend in.
  assert.equal(discreteError(0.001, 1), 1);
  assert.equal(discreteError(0.999, 1), 1);
  assert.equal(discreteError(1, 1), 0);

  // MSE is bounded while cross entropy is not: that is the difference that matters.
  assert.ok(squaredError(0.001, 1) <= 1);
  assert.ok(binaryCrossEntropy(0.001, 1) > 6);

  // The toy dataset the surface figure draws really is separable.
  assert.equal(TOY_DATA.length, 4);
  assert.ok(TOY_DATA.filter((point) => point.y === 1).every((point) => point.x > 0));
});

test("the chain rule the figure displays is arithmetic, not decoration", () => {
  // The figure shows three local derivatives and their product. If the product
  // did not equal the gradient, the picture would be teaching something false.
  const cases = [
    [1, 1, 0.4, -0.2],
    [1, 1, 2.5, 0.5],
    [-1.5, 0, -0.8, 0.3],
    [2, 0, 1.2, -1.1],
  ];

  for (const [x, y, w, b] of cases) {
    const pass = forwardAndBackward(x, y, w, b);
    const product = pass.dErrorDYHat * pass.dYHatDz * pass.dZdw;
    assert.ok(
      Math.abs(product - pass.dErrorDw) < 1e-12,
      `product ${product} vs dErrorDw ${pass.dErrorDw}`,
    );
    // Cross entropy with a sigmoid collapses to (yHat - y) times the input.
    assert.ok(
      Math.abs(pass.dErrorDw - (pass.yHat - y) * x) < 1e-12,
      `dErrorDw ${pass.dErrorDw} vs (yHat - y)x ${(pass.yHat - y) * x}`,
    );
    // And the numeric estimate must agree with the analytic gradient.
    const numeric = numericGradient(x, y, w, b);
    assert.ok(
      Math.abs(numeric.dw - pass.dErrorDw) < 1e-6,
      `numeric dw ${numeric.dw} vs analytic ${pass.dErrorDw}`,
    );
    assert.ok(Math.abs(numeric.db - pass.dErrorDb) < 1e-6);
  }

  // A confident mistake must produce a larger gradient than a confident success.
  const wrong = forwardAndBackward(1, 1, -2, 0);
  const right = forwardAndBackward(1, 1, 3, 0);
  assert.ok(Math.abs(wrong.dErrorDw) > Math.abs(right.dErrorDw) * 5);
});

test("gradient descent on the real Error surface converges and can overshoot", () => {
  const start = { w: -2.4, b: 0 };
  const startError = descentSteps(TOY_DATA, start, 0.5, 0)[0].error;

  // A sensible rate walks downhill, monotonically after the first step.
  const steady = descentSteps(TOY_DATA, start, 0.5, 60);
  assert.ok(steady.at(-1).error < startError, "the error must fall");
  assert.ok(steady.at(-1).error < 0.35, `ended at ${steady.at(-1).error}`);
  assert.ok(Math.abs(steady.at(-1).w) > 0, "the weight must move");

  // A large rate does NOT diverge here, and claiming it does would be a lie the
  // figure then repeats. A separable dataset gives a saturating convex loss, so
  // the step size is bounded by max|x| and the run simply overshoots: it lands on
  // a huge |w| with a near-zero Error. Measured for α = 6, 20, 100000: all fall.
  for (const rate of [6, 20, 1000]) {
    const reckless = descentSteps(TOY_DATA, start, rate, 60);
    const end = reckless.at(-1);
    assert.ok(Number.isFinite(end.error), `α = ${rate} produced ${end.error}`);
    assert.ok(end.error < startError, `α = ${rate} ended at ${end.error}`);
    // The overshoot is visible as a weight far outside the sensible range.
    assert.ok(Math.abs(end.w) > 5, `α = ${rate} only reached w = ${end.w}`);
  }

  // The run-away scales with the rate, which is what the figure's readout shows.
  const gentle = descentSteps(TOY_DATA, start, 1, 60).at(-1).w;
  const fierce = descentSteps(TOY_DATA, start, 50, 60).at(-1).w;
  assert.ok(fierce > gentle * 10, `${fierce} should dwarf ${gentle}`);

  // The gradient really does vanish at the fitted optimum.
  const gradientAtFit = Math.abs(datasetGradientW(TOY_DATA, 6, 0));
  assert.ok(gradientAtFit < 0.5, `gradient at the fit ${gradientAtFit}`);
});

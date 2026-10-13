import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { courseModules } from "../lib/content/index.ts";
import { leastSquaresFit, principalComponents } from "../lib/viz/line.ts";
import { broadcastShapes } from "../lib/viz/shape.ts";
import { TOY_DATA, datasetLoss } from "../lib/viz/loss.ts";
import {
  SAMPLE_IMAGE,
  numericalRank,
  rankKApproximation,
  reconstructionError,
  svd,
} from "../lib/viz/svd.ts";

/**
 * Runs every documented code cell and compares its output, byte for byte, with
 * the `expectedOutput` shown on the page.
 *
 * This exists because the first version shipped an "expected output" that was
 * actually the answer to the follow-up challenge, not what the code printed. A
 * student pressing Run would have seen different numbers from the ones the page
 * promised, and would have been right to distrust it.
 *
 * CPython here is not Pyodide, so this is not a guarantee about the browser — it
 * is a guarantee that the documented output is real, reproducible output of the
 * documented code on CPython with numpy.
 */

const PYTHON_CANDIDATES = [
  process.env.PYTHON,
  "C:\\Users\\PC\\.dsh\\dsh-runtimes\\dsh-primary-runtime\\dependencies\\python\\python.exe",
  "python3",
  "python",
].filter(Boolean);

function findPython() {
  for (const candidate of PYTHON_CANDIDATES) {
    if (candidate.includes("\\") || candidate.includes("/")) {
      if (existsSync(candidate)) return candidate;
      continue;
    }
    const probe = spawnSync(candidate, ["-c", "import numpy"], { encoding: "utf8" });
    if (probe.status === 0) return candidate;
  }
  return null;
}

const python = findPython();
const workdir = python ? mkdtempSync(join(tmpdir(), "aimathlab-cells-")) : null;

test("every code cell runs and prints exactly what the page claims", (t) => {
  if (!python) {
    t.skip("no Python with numpy available; cell output cannot be verified here");
    return;
  }

  for (const lesson of courseModules) {
    const file = join(workdir, `${lesson.slug.replace(/-/g, "_")}.py`);
    writeFileSync(file, lesson.code.source, "utf8");

    const run = spawnSync(python, [file], { encoding: "utf8", timeout: 60_000 });
    const at = `modules/${lesson.slug} (${lesson.code.id})`;

    assert.equal(run.status, 0, `${at}: the cell failed to run\n${run.stderr}`);
    assert.equal(run.stderr, "", `${at}: the cell wrote to stderr\n${run.stderr}`);

    const actual = run.stdout.replace(/\r\n/g, "\n").replace(/\n+$/, "");
    const documented = lesson.code.expectedOutput.replace(/\r\n/g, "\n").replace(/\n+$/, "");

    assert.equal(actual, documented, `${at}: documented output does not match the real run`);
  }
});

test("a code cell documents real output rather than prose", (t) => {
  if (!python) {
    t.skip("no Python available");
    return;
  }

  for (const lesson of courseModules) {
    const output = lesson.code.expectedOutput;
    assert.ok(output.trim().length > 0, `modules/${lesson.slug}: empty expectedOutput`);
    // Program output, not a sentence about it.
    assert.doesNotMatch(output, /[。！？]/, `modules/${lesson.slug}: expectedOutput reads like prose`);
    assert.ok(
      output.split("\n").length >= 1 && !output.startsWith("\n"),
      `modules/${lesson.slug}: expectedOutput has leading whitespace`,
    );
    // The localised note is where explanation belongs.
    assert.ok(lesson.code.expectedNote.zh.length > 20, `modules/${lesson.slug}: zh note too short`);
    assert.ok(lesson.code.expectedNote.en.length > 20, `modules/${lesson.slug}: en note too short`);
  }
});

/**
 * The site's own numerics, checked against NumPy.
 *
 * The figures compute PCA, least squares, and an SVD in JavaScript so they can
 * respond instantly to a drag. That is only trustworthy if the answers match a
 * reference implementation, so these tests run NumPy on the same inputs.
 */
test("the JavaScript SVD agrees with NumPy on the sample image", (t) => {
  if (!python) {
    t.skip("no Python with numpy available");
    return;
  }

  const decomposition = svd(SAMPLE_IMAGE);
  const script = `
import numpy as np
M = np.array(${JSON.stringify(SAMPLE_IMAGE)}, dtype=float)
U, s, Vt = np.linalg.svd(M, full_matrices=False)
print(" ".join(f"{v:.6f}" for v in s))
for k in range(1, 5):
    Mk = (U[:, :k] * s[:k]) @ Vt[:k]
    print(f"{np.linalg.norm(M - Mk) / np.linalg.norm(M):.8f}")
print(np.linalg.matrix_rank(M))
`;
  const file = join(workdir, "svd_check.py");
  writeFileSync(file, script, "utf8");
  const run = spawnSync(python, [file], { encoding: "utf8", timeout: 60_000 });
  assert.equal(run.status, 0, run.stderr);

  const [sigmaLine, ...rest] = run.stdout.trim().split("\n");
  const numpySigma = sigmaLine.trim().split(/\s+/).map(Number);
  const numpyErrors = rest.slice(0, 4).map(Number);
  const numpyRank = Number(rest[4]);

  assert.equal(decomposition.s.length, numpySigma.length);
  // Jacobi works on MᵀM, which squares the condition number, so the near-zero
  // singular values carry less absolute precision than NumPy's. The tolerance is
  // therefore relative to the largest value, and the dominant ones are still
  // required to match tightly.
  const tolerance = 1e-7 * numpySigma[0];
  numpySigma.forEach((value, index) => {
    assert.ok(
      Math.abs(decomposition.s[index] - value) < tolerance,
      `singular value ${index}: ${decomposition.s[index]} vs ${value} (tolerance ${tolerance})`,
    );
  });
  assert.ok(
    Math.abs(decomposition.s[0] - numpySigma[0]) < 1e-6,
    "the leading singular value must match to six decimals",
  );

  for (let k = 1; k <= 4; k += 1) {
    const mine = reconstructionError(SAMPLE_IMAGE, rankKApproximation(decomposition, k));
    assert.ok(Math.abs(mine - numpyErrors[k - 1]) < 1e-8, `k=${k}: ${mine} vs ${numpyErrors[k - 1]}`);
  }

  const rank = numericalRank(decomposition.s);
  assert.equal(rank, numpyRank, "the rank the figure reports must be the real one");
  assert.equal(rank, 4, "the sample image is a rank-4 pattern");
});

test("the JavaScript least squares and PCA agree with NumPy", (t) => {
  if (!python) {
    t.skip("no Python with numpy available");
    return;
  }

  const cloud = [
    { x: 2, y: 0 },
    { x: 0, y: 1 },
    { x: 3, y: 1 },
    { x: 4, y: 2 },
  ];
  const fitPoints = [
    { x: 0, y: 1.0 },
    { x: 1, y: 2.1 },
    { x: 2, y: 2.9 },
    { x: 3, y: 4.2 },
  ];

  const script = `
import numpy as np
X = np.array(${JSON.stringify(fitPoints.map((p) => [p.x, p.y]))}, dtype=float)
A = np.column_stack([X[:, 0], np.ones(len(X))])
beta, *_ = np.linalg.lstsq(A, X[:, 1], rcond=None)
print(f"{beta[0]:.10f} {beta[1]:.10f}")

C = np.array(${JSON.stringify(cloud.map((p) => [p.x, p.y]))}, dtype=float)
Cc = C - C.mean(axis=0)
U, s, Vt = np.linalg.svd(Cc, full_matrices=False)
print(" ".join(f"{v:.10f}" for v in Vt[0]))
print(f"{s[0] ** 2 / np.sum(s ** 2):.10f}")
`;
  const file = join(workdir, "fit_check.py");
  writeFileSync(file, script, "utf8");
  const run = spawnSync(python, [file], { encoding: "utf8", timeout: 60_000 });
  assert.equal(run.status, 0, run.stderr);
  const lines = run.stdout.trim().split("\n");

  const [numpySlope, numpyIntercept] = lines[0].trim().split(/\s+/).map(Number);
  const fit = leastSquaresFit(fitPoints);
  assert.ok(fit && !fit.vertical);
  assert.ok(Math.abs(fit.slope - numpySlope) < 1e-9, `slope ${fit.slope} vs ${numpySlope}`);
  assert.ok(Math.abs(fit.intercept - numpyIntercept) < 1e-9, `intercept ${fit.intercept} vs ${numpyIntercept}`);

  const [numpyX, numpyY] = lines[1].trim().split(/\s+/).map(Number);
  const numpyRatio = Number(lines[2]);
  const pca = principalComponents(cloud);
  assert.ok(pca);
  // A singular vector is only defined up to sign, so compare direction magnitude.
  assert.ok(
    Math.abs(Math.abs(pca.direction.x) - Math.abs(numpyX)) < 1e-6,
    `direction x ${pca.direction.x} vs ${numpyX}`,
  );
  assert.ok(Math.abs(Math.abs(pca.direction.y) - Math.abs(numpyY)) < 1e-6);
  const total = pca.variance[0] + pca.variance[1];
  assert.ok(
    Math.abs(pca.variance[0] / total - numpyRatio) < 1e-9,
    `explained ratio ${pca.variance[0] / total} vs ${numpyRatio}`,
  );
});

test("the JavaScript broadcasting rule agrees with NumPy", (t) => {
  if (!python) {
    t.skip("no Python with numpy available");
    return;
  }

  const pairs = [[[64,784],[784]],[[64,784],[10]],[[3,4],[4]],[[3,4],[3,1]],[[5,1,3],[1,4,1]],[[2,3],[3,2]],[[1],[7]],[[],[3]],[[2,1],[2,3]],[[6,1],[6,1]]];
  const script = `
import numpy as np
pairs = ${JSON.stringify(pairs)}
for a, b in pairs:
    try:
        print(" ".join(str(d) for d in np.broadcast_shapes(tuple(a), tuple(b))))
    except ValueError:
        print("ERR")
`;
  const file = join(workdir, "broadcast_check.py");
  writeFileSync(file, script, "utf8");
  const run = spawnSync(python, [file], { encoding: "utf8", timeout: 60_000 });
  assert.equal(run.status, 0, run.stderr);
  const expected = run.stdout.trim().split("\n");

  // Broadcasting has enough special cases that a figure built on a wrong rule
  // would be quietly wrong rather than obviously broken.
  pairs.forEach(([a, b], index) => {
    const result = broadcastShapes(a, b);
    const mine = result.ok ? result.shape.join(" ") : "ERR";
    assert.equal(mine, expected[index].trim(), `${JSON.stringify(a)} + ${JSON.stringify(b)}`);
  });
});

test("the JavaScript cross entropy agrees with NumPy", (t) => {
  if (!python) {
    t.skip("no Python with numpy available");
    return;
  }

  const parameters = [
    [3, 0],
    [-1.4, -0.6],
    [0, 0],
    [2, 1],
    [0.5, -2],
  ];
  const script = `
import numpy as np
X = np.array([p["x"] for p in ${JSON.stringify(TOY_DATA)}], dtype=float)
Y = np.array([p["y"] for p in ${JSON.stringify(TOY_DATA)}], dtype=float)

def loss(w, b):
    p = 1.0 / (1.0 + np.exp(-(w * X + b)))
    p = np.clip(p, 1e-12, 1 - 1e-12)
    return float(np.mean(-(Y * np.log(p) + (1 - Y) * np.log(1 - p))))

for w, b in ${JSON.stringify(parameters)}:
    print(f"{loss(w, b):.10f}")
`;
  const file = join(workdir, "loss_check.py");
  writeFileSync(file, script, "utf8");
  const run = spawnSync(python, [file], { encoding: "utf8", timeout: 60_000 });
  assert.equal(run.status, 0, run.stderr);
  const expected = run.stdout.trim().split("\n").map(Number);

  parameters.forEach(([w, b], index) => {
    const mine = datasetLoss(TOY_DATA, w, b);
    assert.ok(
      Math.abs(mine - expected[index]) < 1e-9,
      `E(${w}, ${b}) = ${mine} vs NumPy ${expected[index]}`,
    );
  });

  // The surface figure colours cells by these values, so the minimum has to be a
  // real minimum: the well-separated fit must beat a deliberately bad one.
  assert.ok(datasetLoss(TOY_DATA, 3, 0) < datasetLoss(TOY_DATA, 0, 0));
  assert.ok(datasetLoss(TOY_DATA, 0, 0) < datasetLoss(TOY_DATA, -3, 0));
});

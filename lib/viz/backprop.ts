import { logisticProbability, sigmoid, type Labelled } from "./loss";

/**
 * The forward and backward passes for one sigmoid neuron.
 *
 * Written out step by step rather than as a closed form, because the figure's
 * whole purpose is to show the chain: the gradient with respect to a weight is a
 * product of local derivatives, and each factor is displayed separately.
 *
 * `tests/content.test.mjs` checks that the product of the displayed factors
 * really equals the gradient, and that it agrees with a finite-difference
 * estimate — a wrong chain rule is the single most likely error here and it
 * would otherwise look entirely plausible on screen.
 */

export type Pass = {
  /** The input, its true label, and the two parameters. */
  x: number;
  y: 0 | 1;
  w: number;
  b: number;
  /** Forward values, in the order they are computed. */
  z: number;
  yHat: number;
  error: number;
  /** Local derivatives, each shown beside the edge it belongs to. */
  dErrorDYHat: number;
  dYHatDz: number;
  dEpsilonDz: number;
  dZdw: number;
  dZdb: number;
  /** The accumulated gradients the update rule needs. */
  dErrorDw: number;
  dErrorDb: number;
};

/** Error for a single example: `-[y ln ŷ + (1 - y) ln(1 - ŷ)]`. */
function singleError(yHat: number, y: 0 | 1): number {
  const clamped = Math.min(1 - 1e-12, Math.max(1e-12, yHat));
  return -(y * Math.log(clamped) + (1 - y) * Math.log(1 - clamped));
}

export function forwardAndBackward(x: number, y: 0 | 1, w: number, b: number): Pass {
  const z = w * x + b;
  const yHat = sigmoid(z);
  const error = singleError(yHat, y);

  const dErrorDYHat = -y / yHat + (1 - y) / (1 - yHat);
  const dYHatDz = yHat * (1 - yHat);
  const dEpsilonDz = dErrorDYHat * dYHatDz;
  const dZdw = x;
  const dZdb = 1;

  return {
    x,
    y,
    w,
    b,
    z,
    yHat,
    error,
    dErrorDYHat,
    dYHatDz,
    dEpsilonDz,
    dZdw,
    dZdb,
    dErrorDw: dEpsilonDz * dZdw,
    dErrorDb: dEpsilonDz * dZdb,
  };
}

/** Central finite difference, as an independent estimate of the same gradient. */
export function numericGradient(
  x: number,
  y: 0 | 1,
  w: number,
  b: number,
  h = 1e-5,
): { dw: number; db: number } {
  const lossAt = (weight: number, bias: number) =>
    singleError(logisticProbability(x, weight, bias), y);

  return {
    dw: (lossAt(w + h, b) - lossAt(w - h, b)) / (2 * h),
    db: (lossAt(w, b + h) - lossAt(w, b - h)) / (2 * h),
  };
}

/** Mean gradient of `E(W, b)` over a dataset, with the bias held at `b`. */
export function datasetGradientW(points: Labelled[], w: number, b: number): number {
  if (points.length === 0) return 0;
  const total = points.reduce((sum, point) => {
    const pass = forwardAndBackward(point.x, point.y, w, b);
    return sum + pass.dErrorDw;
  }, 0);
  return total / points.length;
}

export function datasetGradientB(points: Labelled[], w: number, b: number): number {
  if (points.length === 0) return 0;
  const total = points.reduce(
    (sum, point) => sum + forwardAndBackward(point.x, point.y, w, b).dErrorDb,
    0,
  );
  return total / points.length;
}

export type UpdateStep = { index: number; w: number; b: number; error: number; gradient: number };

/**
 * Plain gradient descent on the real dataset.
 *
 * Kept here (rather than reusing the generic bowl descent in `descent.ts`)
 * because the lecture's descent is on the actual `E(W, b)` of a dataset, not on
 * a convenient parabola.
 */
export function descentSteps(
  points: Labelled[],
  start: { w: number; b: number },
  rate: number,
  steps: number,
): UpdateStep[] {
  const history: UpdateStep[] = [];
  let current = { ...start };

  for (let index = 0; index <= steps; index += 1) {
    const totalError = points.reduce(
      (sum, point) =>
        sum + forwardAndBackward(point.x, point.y, current.w, current.b).error,
      0,
    );
    const gradient = datasetGradientW(points, current.w, current.b);

    history.push({
      index,
      w: current.w,
      b: current.b,
      error: points.length === 0 ? 0 : totalError / points.length,
      gradient,
    });

    const gradientB = datasetGradientB(points, current.w, current.b);
    current = { w: current.w - rate * gradient, b: current.b - rate * gradientB };
    if (!Number.isFinite(current.w) || Math.abs(current.w) > 1e6) break;
  }
  return history;
}

/** A single input/label pair, used as the worked example in the chain figure. */
export const CHAIN_EXAMPLE = { x: 1, y: 1 as const };

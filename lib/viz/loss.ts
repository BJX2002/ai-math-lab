/**
 * Cross entropy and the loss surface.
 *
 * The course calls the loss "Error" and writes it `E(W, b)`, so these functions
 * use that vocabulary: `E` for the value, `W`/`b` for what is being fitted.
 *
 * Pure and testable. The surface figure samples the real loss over a grid of
 * parameters, so the picture and the arithmetic cannot drift apart.
 */

export type Labelled = { x: number; y: 0 | 1 };

/** Probabilities are clamped away from 0 and 1, where the log is unbounded. */
const EPSILON = 1e-12;

export function sigmoid(z: number): number {
  return 1 / (1 + Math.exp(-z));
}

/**
 * Error for one prediction: `-[y ln p + (1 - y) ln(1 - p)]`.
 *
 * The whole point of the curve is that a confident wrong answer costs a great
 * deal, which only happens because of the logarithm.
 */
export function binaryCrossEntropy(p: number, y: 0 | 1): number {
  const clamped = Math.min(1 - EPSILON, Math.max(EPSILON, p));
  return -(y * Math.log(clamped) + (1 - y) * Math.log(1 - clamped));
}

export function meanBinaryCrossEntropy(samples: { p: number; y: 0 | 1 }[]): number {
  if (samples.length === 0) return 0;
  const total = samples.reduce((sum, sample) => sum + binaryCrossEntropy(sample.p, sample.y), 0);
  return total / samples.length;
}

/** Squared error, for contrast with cross entropy in the comparison figure. */
export function squaredError(p: number, y: 0 | 1): number {
  return (p - y) ** 2;
}

/**
 * The discrete 0/1 error the lectures reject as a training signal.
 *
 * Flat at 0 everywhere except exactly at the target, which is why its gradient
 * carries no information about which way to move.
 */
export function discreteError(p: number, y: 0 | 1): number {
  return Math.abs(p - y) < 1e-9 ? 0 : 1;
}

export function logisticProbability(x: number, w: number, b: number): number {
  return sigmoid(w * x + b);
}

/** Mean cross entropy of a logistic model over a dataset: the `E(W, b)` surface. */
export function datasetLoss(points: Labelled[], w: number, b: number): number {
  if (points.length === 0) return 0;
  const total = points.reduce(
    (sum, point) => sum + binaryCrossEntropy(logisticProbability(point.x, w, b), point.y),
    0,
  );
  return total / points.length;
}

export function datasetAccuracy(points: Labelled[], w: number, b: number): number {
  if (points.length === 0) return 0;
  const correct = points.filter((point) => {
    const predicted = logisticProbability(point.x, w, b) >= 0.5 ? 1 : 0;
    return predicted === point.y;
  }).length;
  return correct / points.length;
}

export type Grid = { values: number[][]; min: number; max: number };

/** Sample `E(W, b)` over a rectangle of parameters, for the heat map. */
export function lossGrid(
  points: Labelled[],
  wRange: [number, number],
  bRange: [number, number],
  steps: number,
): Grid {
  const values: number[][] = [];
  let min = Number.POSITIVE_INFINITY;
  let max = Number.NEGATIVE_INFINITY;

  for (let row = 0; row <= steps; row += 1) {
    // Rows run from the smallest w to the largest, top to bottom on screen.
    const w = wRange[0] + ((wRange[1] - wRange[0]) * row) / steps;
    const line: number[] = [];
    for (let column = 0; column <= steps; column += 1) {
      const b = bRange[0] + ((bRange[1] - bRange[0]) * column) / steps;
      const value = datasetLoss(points, w, b);
      line.push(value);
      if (value < min) min = value;
      if (value > max) max = value;
    }
    values.push(line);
  }

  return { values, min, max };
}

/** A tiny one-feature classification set: two points of each class, separated. */
export const TOY_DATA: Labelled[] = [
  { x: -2, y: 0 },
  { x: -1, y: 0 },
  { x: 1, y: 1 },
  { x: 2, y: 1 },
];

/** The parameters that separate `TOY_DATA` comfortably, used as a starting point. */
export const TOY_FIT = { w: 3, b: 0 };

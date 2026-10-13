import type { Point } from "./viewport";

/**
 * Gradient descent, computed exactly.
 *
 * The old lab plotted a hard-coded geometric formula for one special function and
 * rescaled the chart to its largest value, so a run that diverged looked exactly
 * like a run that converged. These functions iterate the real update rule, and
 * `diverged` makes the failure explicit instead of cosmetic.
 */

/** L(x, y) = ax·x² + ay·y² — an elliptic bowl, the simplest honest loss surface. */
export type Bowl = { ax: number; ay: number };

export const DEFAULT_BOWL: Bowl = { ax: 0.5, ay: 2 };

export function bowlLoss(bowl: Bowl, point: Point): number {
  return bowl.ax * point.x ** 2 + bowl.ay * point.y ** 2;
}

export function bowlGradient(bowl: Bowl, point: Point): Point {
  return { x: 2 * bowl.ax * point.x, y: 2 * bowl.ay * point.y };
}

/**
 * The largest learning rate that still converges for this bowl.
 *
 * Each axis follows x ← x(1 − 2aη), which shrinks only while |1 − 2aη| < 1,
 * i.e. η < 1/a. The stiffest axis decides.
 */
export function stabilityLimit(bowl: Bowl): number {
  return 1 / Math.max(bowl.ax, bowl.ay);
}

export type DescentStep = { index: number; point: Point; loss: number; gradient: Point };

/** Iterate the real update rule and keep every step. */
export function descendBowl(
  bowl: Bowl,
  start: Point,
  rate: number,
  steps: number,
): DescentStep[] {
  const history: DescentStep[] = [];
  let current = start;

  for (let index = 0; index <= steps; index += 1) {
    const gradient = bowlGradient(bowl, current);
    history.push({ index, point: current, loss: bowlLoss(bowl, current), gradient });
    current = { x: current.x - rate * gradient.x, y: current.y - rate * gradient.y };
  }
  return history;
}

/** True once the loss has grown past its starting value, i.e. the run is escaping. */
export function diverged(history: DescentStep[]): boolean {
  if (history.length < 2) return false;
  const start = history[0].loss;
  return history.at(-1)!.loss > start;
}

/** L(x) = x⁴ − 3x² + x: non-convex, with two valleys and a hill between them. */
export function quarticLoss(x: number): number {
  return x ** 4 - 3 * x ** 2 + x;
}

export function quarticGradient(x: number): number {
  return 4 * x ** 3 - 6 * x + 1;
}

export type LineStep = { index: number; x: number; loss: number };

/** Gradient descent on a one-dimensional function, with a numeric gradient. */
export function descendLine(
  value: (x: number) => number,
  gradient: (x: number) => number,
  start: number,
  rate: number,
  steps: number,
): LineStep[] {
  const history: LineStep[] = [];
  let current = start;

  for (let index = 0; index <= steps; index += 1) {
    history.push({ index, x: current, loss: value(current) });
    current -= rate * gradient(current);
    // A diverging 1-D run reaches infinity fast; stop before it becomes NaN and
    // silently poisons the chart.
    if (!Number.isFinite(current) || Math.abs(current) > 1e6) {
      history.push({ index: index + 1, x: current, loss: Number.POSITIVE_INFINITY });
      break;
    }
  }
  return history;
}

/** The self-consistent quadratic L(x) = x², matching the module's Python cell. */
export const SQUARE: { bowl: Bowl } = { bowl: { ax: 1, ay: 1 } };

/** Sample a function into a polyline for plotting. */
export function sampleFunction(
  value: (x: number) => number,
  from: number,
  to: number,
  samples: number,
): Point[] {
  const points: Point[] = [];
  for (let index = 0; index <= samples; index += 1) {
    const x = from + ((to - from) * index) / samples;
    points.push({ x, y: value(x) });
  }
  return points;
}

/** Points on the ellipse bowlLoss = level, for the contour figure. */
export function contourEllipse(
  bowl: Bowl,
  level: number,
  samples = 72,
): Point[] {
  if (level <= 0) return [];
  const radiusX = Math.sqrt(level / bowl.ax);
  const radiusY = Math.sqrt(level / bowl.ay);
  const points: Point[] = [];
  for (let index = 0; index <= samples; index += 1) {
    const angle = (2 * Math.PI * index) / samples;
    points.push({ x: radiusX * Math.cos(angle), y: radiusY * Math.sin(angle) });
  }
  return points;
}

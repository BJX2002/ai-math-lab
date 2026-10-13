import type { Point, Rect } from "./viewport";

/**
 * Lines, intersections, and least squares.
 *
 * Pure and free of React so `tests/content.test.mjs` can check the algebra
 * directly — a wrong intersection point would otherwise only show up as a figure
 * that looks slightly off.
 */

/** A line in the form a·x + b·y = c. */
export type Line = { a: number; b: number; c: number };

const EPS = 1e-9;

/** The line through two points, or null when they coincide. */
export function lineFromPoints(p: Point, q: Point): Line | null {
  const a = q.y - p.y;
  const b = p.x - q.x;
  if (Math.abs(a) < EPS && Math.abs(b) < EPS) return null;
  return { a, b, c: a * p.x + b * p.y };
}

/**
 * The segment of an infinite line that lies inside the world rectangle.
 *
 * Clipping by solving against each of the four edges avoids the classic bug of
 * drawing a line only as far as the two defining points, which makes a line look
 * like a segment and hides the intersection when it is off-screen.
 */
export function clipLineToWorld(line: Line, world: Rect): [Point, Point] | null {
  const candidates: Point[] = [];

  const add = (x: number, y: number) => {
    if (x < world.xMin - EPS || x > world.xMax + EPS) return;
    if (y < world.yMin - EPS || y > world.yMax + EPS) return;
    if (candidates.some((existing) => Math.hypot(existing.x - x, existing.y - y) < 1e-7)) return;
    candidates.push({ x, y });
  };

  if (Math.abs(line.a) > EPS) {
    add((line.c - line.b * world.yMin) / line.a, world.yMin);
    add((line.c - line.b * world.yMax) / line.a, world.yMax);
  }
  if (Math.abs(line.b) > EPS) {
    add(world.xMin, (line.c - line.a * world.xMin) / line.b);
    add(world.xMax, (line.c - line.a * world.xMax) / line.b);
  }

  if (candidates.length < 2) return null;

  // Keep the two furthest apart, which is the visible chord.
  let best: [Point, Point] = [candidates[0], candidates[1]];
  let bestDistance = -1;
  for (let i = 0; i < candidates.length; i += 1) {
    for (let j = i + 1; j < candidates.length; j += 1) {
      const distance = Math.hypot(candidates[i].x - candidates[j].x, candidates[i].y - candidates[j].y);
      if (distance > bestDistance) {
        bestDistance = distance;
        best = [candidates[i], candidates[j]];
      }
    }
  }
  return best;
}

export type SystemOutcome = "unique" | "none" | "infinite";

/** Where two lines meet, or null when they are parallel or identical. */
export function intersectLines(first: Line, second: Line): Point | null {
  const det = first.a * second.b - second.a * first.b;
  if (Math.abs(det) < EPS) return null;
  return {
    x: (first.c * second.b - second.c * first.b) / det,
    y: (first.a * second.c - second.a * first.c) / det,
  };
}

export function determinantOf(first: Line, second: Line): number {
  return first.a * second.b - second.a * first.b;
}

/**
 * Classify a 2x2 system.
 *
 * Parallel lines are distinguished from the same line by whether the
 * right-hand side is proportional too — the difference between "no solution" and
 * "infinitely many", which looks identical if you only compare slopes.
 */
export function classifySystem(first: Line, second: Line): SystemOutcome {
  const det = determinantOf(first, second);
  if (Math.abs(det) > 1e-7) return "unique";

  const cross = first.a * second.c - second.a * first.c;
  const crossOther = first.b * second.c - second.b * first.c;
  const sameLine = Math.abs(cross) < 1e-7 && Math.abs(crossOther) < 1e-7;
  return sameLine ? "infinite" : "none";
}

export type Fit = { slope: number; intercept: number; vertical: boolean; x?: number };

/**
 * Scale a line so that (a, b) is a unit vector.
 *
 * Essential before showing a determinant. A line built from two dragged
 * endpoints has arbitrary scale — (5, 5, 25) is the same line as (1, 1, 5) — so
 * a raw determinant changes as the reader drags without anything geometric
 * changing. Normalised, the determinant is exactly sin θ between the two lines:
 * bounded, signed, and zero precisely when they are parallel.
 */
export function normalizeLine(line: Line): Line {
  const norm = Math.hypot(line.a, line.b);
  if (norm < EPS) return line;
  return { a: line.a / norm, b: line.b / norm, c: line.c / norm };
}

/** Turn a `y = mx + c` fit into the `a x + b y = c` form the Line helpers use. */
export function lineFromFit(fit: Fit): Line {
  if (fit.vertical) return { a: 1, b: 0, c: fit.x ?? 0 };
  return { a: fit.slope, b: -1, c: -fit.intercept };
}

/**
 * Ordinary least squares for y = slope·x + intercept.
 *
 * Returns a vertical line when every x is identical, because the slope is then
 * undefined and dividing by the zero spread would produce NaN.
 */
export function leastSquaresFit(points: Point[]): Fit | null {
  const n = points.length;
  if (n === 0) return null;

  const sumX = points.reduce((total, point) => total + point.x, 0);
  const sumY = points.reduce((total, point) => total + point.y, 0);
  const meanX = sumX / n;
  const meanY = sumY / n;

  const spread = points.reduce((total, point) => total + (point.x - meanX) ** 2, 0);
  if (spread < 1e-12) return { slope: 0, intercept: meanY, vertical: true, x: meanX };

  const covariance = points.reduce(
    (total, point) => total + (point.x - meanX) * (point.y - meanY),
    0,
  );
  const slope = covariance / spread;
  return { slope, intercept: meanY - slope * meanX, vertical: false };
}

/** Squared residuals of a fit, plus their total — the quantity least squares minimizes. */
export function fitResiduals(points: Point[], fit: Fit): { residuals: number[]; total: number } {
  const residuals = points.map((point) => {
    const predicted = fit.vertical ? point.x : fit.slope * point.x + fit.intercept;
    return fit.vertical ? point.x - predicted : point.y - predicted;
  });
  const total = residuals.reduce((sum, value) => sum + value * value, 0);
  return { residuals, total };
}

/**
 * The 2x2 covariance eigen-decomposition used by the PCA figure.
 *
 * Closed form for a symmetric 2x2 matrix, so the principal direction is exact
 * rather than iterated, and the explained variance is the real thing.
 */
export function principalComponents(points: Point[]): {
  mean: Point;
  direction: Point;
  secondary: Point;
  variance: [number, number];
} | null {
  if (points.length < 2) return null;

  const mean = {
    x: points.reduce((total, point) => total + point.x, 0) / points.length,
    y: points.reduce((total, point) => total + point.y, 0) / points.length,
  };

  let sxx = 0;
  let syy = 0;
  let sxy = 0;
  for (const point of points) {
    const dx = point.x - mean.x;
    const dy = point.y - mean.y;
    sxx += dx * dx;
    syy += dy * dy;
    sxy += dx * dy;
  }
  const divisor = points.length - 1;
  sxx /= divisor;
  syy /= divisor;
  sxy /= divisor;

  const trace = sxx + syy;
  const gap = Math.sqrt(Math.max(0, (sxx - syy) ** 2 + 4 * sxy * sxy));
  const large = (trace + gap) / 2;
  const small = (trace - gap) / 2;

  // Eigenvector for the larger eigenvalue.
  let direction = { x: 1, y: 0 };
  if (Math.abs(sxy) > EPS || Math.abs(sxx - syy) > EPS) {
    direction = Math.abs(sxy) > EPS ? { x: large - syy, y: sxy } : sxx >= syy ? { x: 1, y: 0 } : { x: 0, y: 1 };
  }
  const norm = Math.hypot(direction.x, direction.y) || 1;
  direction = { x: direction.x / norm, y: direction.y / norm };
  // Keep the first component non-negative so the figure does not flip sign
  // between renders.
  if (direction.x < 0) direction = { x: -direction.x, y: -direction.y };
  const secondary = { x: -direction.y, y: direction.x };

  return { mean, direction, secondary, variance: [Math.max(0, large), Math.max(0, small)] };
}

/** Scalar coordinate of a point along a unit direction from the mean. */
export function projectScalar(point: Point, origin: Point, direction: Point): number {
  return (point.x - origin.x) * direction.x + (point.y - origin.y) * direction.y;
}

/** Rebuild a point from its coordinate along a unit direction through the origin. */
export function unprojectScalar(value: number, origin: Point, direction: Point): Point {
  return { x: origin.x + direction.x * value, y: origin.y + direction.y * value };
}

/**
 * World <-> screen mapping for the SVG planes.
 *
 * Two things here are easy to get wrong and expensive to debug:
 *
 * 1. The mapping must be **equal-aspect**. If x and y use different scales, a
 *    right angle stops looking like a right angle and "the vector has length 5"
 *    becomes visibly false. This module is the only place that decides scale.
 * 2. SVG user space grows downward while mathematical y grows upward, so every
 *    conversion flips y exactly once.
 *
 * Pure module: no React, no DOM, so it can be unit-tested directly.
 */

export type Point = { x: number; y: number };

export type Rect = { xMin: number; xMax: number; yMin: number; yMax: number };

export type Viewport = {
  /** SVG user-space width. */
  width: number;
  /** SVG user-space height. */
  height: number;
  /** The world rectangle actually visible, widened to preserve aspect ratio. */
  world: Rect;
  /** Screen pixels per world unit. Identical on both axes. */
  scale: number;
  toScreen: (point: Point) => Point;
  toWorld: (point: Point) => Point;
};

export function createViewport({
  width,
  height,
  world,
}: {
  width: number;
  height: number;
  world: Rect;
}): Viewport {
  const worldWidth = world.xMax - world.xMin;
  const worldHeight = world.yMax - world.yMin;
  if (!(worldWidth > 0) || !(worldHeight > 0) || !(width > 0) || !(height > 0)) {
    throw new Error(`createViewport needs positive sizes, got ${width}x${height} and ${worldWidth}x${worldHeight}`);
  }

  const scale = Math.min(width / worldWidth, height / worldHeight);
  const visibleWidth = width / scale;
  const visibleHeight = height / scale;
  const centreX = (world.xMin + world.xMax) / 2;
  const centreY = (world.yMin + world.yMax) / 2;

  const visible: Rect = {
    xMin: centreX - visibleWidth / 2,
    xMax: centreX + visibleWidth / 2,
    yMin: centreY - visibleHeight / 2,
    yMax: centreY + visibleHeight / 2,
  };

  return {
    width,
    height,
    world: visible,
    scale,
    toScreen: ({ x, y }) => ({
      x: (x - visible.xMin) * scale,
      y: height - (y - visible.yMin) * scale,
    }),
    toWorld: ({ x, y }) => ({
      x: visible.xMin + x / scale,
      y: visible.yMin + (height - y) / scale,
    }),
  };
}

/** Multiply a point by the scale implied by a client rect (responsive SVG). */
export function clientToUserSpace(
  client: Point,
  rect: { left: number; top: number; width: number; height: number },
  view: Viewport,
): Point {
  return {
    x: ((client.x - rect.left) / rect.width) * view.width,
    y: ((client.y - rect.top) / rect.height) * view.height,
  };
}

/**
 * Round a screen coordinate for output.
 *
 * `toScreen` stays exact so world round-trips and tests keep full precision;
 * only what actually reaches the DOM is rounded. Without this, a grid line ships
 * as `x1="23.750000000000014"` — noisy, and repeated on every line of every
 * figure.
 */
export function px(value: number): number {
  return Math.round(value * 1000) / 1000;
}

export function snap(value: number, step: number): number {
  if (!(step > 0)) return value;
  return Math.round(value / step) * step;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function length(point: Point): number {
  return Math.hypot(point.x, point.y);
}

export function normalize(point: Point): Point {
  const len = length(point);
  if (len === 0) return { x: 0, y: 0 };
  return { x: point.x / len, y: point.y / len };
}

export function add(a: Point, b: Point): Point {
  return { x: a.x + b.x, y: a.y + b.y };
}

export function scalePoint(point: Point, factor: number): Point {
  return { x: point.x * factor, y: point.y * factor };
}

/**
 * A grid step that lands on 1, 2, or 5 times a power of ten, so labels read as
 * round numbers instead of 0.37-style artefacts.
 */
export function niceStep(range: number, targetLines = 8): number {
  const rough = range / Math.max(1, targetLines);
  const magnitude = Math.pow(10, Math.floor(Math.log10(rough)));
  const normalized = rough / magnitude;
  const stepped = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
  return stepped * magnitude;
}

/** World values for gridlines across a range, inclusive of both ends. */
export function tickValues(min: number, max: number, step: number): number[] {
  if (!(step > 0)) return [];
  const values: number[] = [];
  const start = Math.ceil(min / step) * step;
  for (let value = start; value <= max + step * 1e-6; value += step) {
    // Kill floating-point dust so labels show 0.5 rather than 0.5000000000000001.
    values.push(Math.abs(value) < step * 1e-6 ? 0 : Number(value.toFixed(10)));
  }
  return values;
}

/** Format a coordinate for a tick label or readout without trailing zeros. */
export function formatNumber(value: number, digits = 2): string {
  if (!Number.isFinite(value)) return "—";
  const rounded = Number(value.toFixed(digits));
  return String(Object.is(rounded, -0) ? 0 : rounded);
}

/**
 * Polygon points for an arrowhead sitting at `tip` and pointing away from
 * `from`. Both points are in screen space, because the head must not be scaled
 * by the world transform.
 */
export function arrowHeadPoints(from: Point, tip: Point, size = 10): string {
  const angle = Math.atan2(tip.y - from.y, tip.x - from.x);
  const spread = 0.44;
  const left = {
    x: tip.x - size * Math.cos(angle - spread),
    y: tip.y - size * Math.sin(angle - spread),
  };
  const right = {
    x: tip.x - size * Math.cos(angle + spread),
    y: tip.y - size * Math.sin(angle + spread),
  };
  return `${tip.x},${tip.y} ${left.x},${left.y} ${right.x},${right.y}`;
}

/**
 * Clamp a drag to the visible world rectangle, inset a little so a handle can
 * never be dragged fully off the plot where it cannot be grabbed again.
 */
export function clampToWorld(point: Point, world: Rect, inset = 0.02): Point {
  const marginX = (world.xMax - world.xMin) * inset;
  const marginY = (world.yMax - world.yMin) * inset;
  return {
    x: clamp(point.x, world.xMin + marginX, world.xMax - marginX),
    y: clamp(point.y, world.yMin + marginY, world.yMax - marginY),
  };
}

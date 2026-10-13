"use client";

import { px, type Point, type Viewport } from "../../lib/viz/viewport";

/**
 * Small annotation primitives shared by the two-vector figures: an angle arc
 * and a projection shadow. Both work in screen space, because a radius in world
 * units would change size with the zoom.
 */

export function AngleArc({
  view,
  a,
  b,
  radius = 48,
  label,
}: {
  view: Viewport;
  a: Point;
  b: Point;
  radius?: number;
  label?: string;
}) {
  const origin = view.toScreen({ x: 0, y: 0 });
  const pa = view.toScreen(a);
  const pb = view.toScreen(b);

  const start = Math.atan2(pa.y - origin.y, pa.x - origin.x);
  const end = Math.atan2(pb.y - origin.y, pb.x - origin.x);

  let delta = end - start;
  while (delta > Math.PI) delta -= 2 * Math.PI;
  while (delta <= -Math.PI) delta += 2 * Math.PI;

  const from = { x: origin.x + radius * Math.cos(start), y: origin.y + radius * Math.sin(start) };
  const to = { x: origin.x + radius * Math.cos(end), y: origin.y + radius * Math.sin(end) };
  const mid = start + delta / 2;
  const labelPoint = {
    x: origin.x + (radius + 20) * Math.cos(mid),
    y: origin.y + (radius + 20) * Math.sin(mid),
  };

  return (
    <g className="angle-arc">
      <path
        d={`M ${px(from.x)} ${px(from.y)} A ${radius} ${radius} 0 ${Math.abs(delta) > Math.PI ? 1 : 0} ${delta > 0 ? 1 : 0} ${px(to.x)} ${px(to.y)}`}
      />
      {label ? (
        <text x={px(labelPoint.x)} y={px(labelPoint.y + 5)} textAnchor="middle">
          {label}
        </text>
      ) : null}
    </g>
  );
}

/**
 * The shadow one vector casts along another.
 *
 * Draws the perpendicular drop from the tip plus the shadow itself, which is
 * what makes "the dot product measures agreement in direction" visible rather
 * than asserted.
 */
export function ProjectionShadow({
  view,
  vector,
  onto,
}: {
  view: Viewport;
  vector: Point;
  onto: Point;
}) {
  const denominator = onto.x * onto.x + onto.y * onto.y;
  if (denominator < 1e-12) return null;

  const factor = (vector.x * onto.x + vector.y * onto.y) / denominator;
  const foot = { x: onto.x * factor, y: onto.y * factor };

  const origin = view.toScreen({ x: 0, y: 0 });
  const tip = view.toScreen(vector);
  const footScreen = view.toScreen(foot);

  return (
    <g className="projection">
      <line
        className="projection-shadow"
        x1={px(origin.x)}
        y1={px(origin.y)}
        x2={px(footScreen.x)}
        y2={px(footScreen.y)}
      />
      <line
        className="projection-drop"
        x1={px(tip.x)}
        y1={px(tip.y)}
        x2={px(footScreen.x)}
        y2={px(footScreen.y)}
      />
      <circle className="projection-foot" cx={px(footScreen.x)} cy={px(footScreen.y)} r={5} />
    </g>
  );
}

/** A square right-angle marker at `corner`, opening toward `towardA`/`towardB`. */
export function RightAngleMark({
  view,
  corner,
  towardA,
  towardB,
  size = 16,
}: {
  view: Viewport;
  corner: Point;
  towardA: Point;
  towardB: Point;
  size?: number;
}) {
  const c = view.toScreen(corner);
  const a = view.toScreen(towardA);
  const b = view.toScreen(towardB);

  const unit = (from: Point, to: Point) => {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const len = Math.hypot(dx, dy) || 1;
    return { x: dx / len, y: dy / len };
  };

  const ua = unit(c, a);
  const ub = unit(c, b);
  const p1 = { x: c.x + ua.x * size, y: c.y + ua.y * size };
  const p2 = { x: c.x + ub.x * size, y: c.y + ub.y * size };
  const corner2 = { x: p1.x + ub.x * size, y: p1.y + ub.y * size };

  return (
    <polyline
      className="right-angle"
      points={`${px(p1.x)},${px(p1.y)} ${px(corner2.x)},${px(corner2.y)} ${px(p2.x)},${px(p2.y)}`}
    />
  );
}

"use client";

import { px, type Point, type Viewport } from "../../lib/viz/viewport";

/**
 * Function plots for the activation and loss figures.
 *
 * A polyline through samples, clipped to the visible world. `FunctionPlot`
 * handles continuous functions only; a genuine step function is drawn from
 * explicit segments in the lab, because sampling it would render a steep ramp
 * and quietly turn a discontinuity into a slope.
 */
export function FunctionPlot({
  view,
  value,
  from,
  to,
  samples = 240,
  className,
  dashes,
}: {
  view: Viewport;
  value: (x: number) => number;
  from: number;
  to: number;
  samples?: number;
  className: string;
  dashes?: string;
}) {
  const points: string[] = [];
  for (let index = 0; index <= samples; index += 1) {
    const x = from + ((to - from) * index) / samples;
    const y = value(x);
    if (!Number.isFinite(y)) continue;
    const screen = view.toScreen({ x, y });
    points.push(`${px(screen.x)},${px(screen.y)}`);
  }
  if (points.length < 2) return null;
  return <polyline className={className} points={points.join(" ")} strokeDasharray={dashes} />;
}

/** A step function drawn as two segments plus a dashed riser at the jump. */
export function StepPlot({
  view,
  threshold,
  low,
  high,
  from,
  to,
  className,
  riserClassName,
}: {
  view: Viewport;
  threshold: number;
  low: number;
  high: number;
  from: number;
  to: number;
  className: string;
  riserClassName: string;
}) {
  const left = [view.toScreen({ x: from, y: low }), view.toScreen({ x: threshold, y: low })];
  const right = [view.toScreen({ x: threshold, y: high }), view.toScreen({ x: to, y: high })];
  const riser = [view.toScreen({ x: threshold, y: low }), view.toScreen({ x: threshold, y: high })];
  const path = (segment: Point[]) =>
    segment.map((point) => `${px(point.x)},${px(point.y)}`).join(" ");

  return (
    <g>
      <polyline className={className} points={path(left)} />
      <polyline className={className} points={path(right)} />
      <polyline className={riserClassName} points={path(riser)} />
    </g>
  );
}

/**
 * A full-height vertical guide at a given x, used to read every curve at one
 * input value at once.
 */
export function VerticalGuide({
  view,
  x,
  className,
  label,
}: {
  view: Viewport;
  x: number;
  className: string;
  label?: string;
}) {
  const top = view.toScreen({ x, y: view.world.yMax });
  const bottom = view.toScreen({ x, y: view.world.yMin });
  return (
    <g className={className}>
      <line x1={px(top.x)} y1={px(top.y)} x2={px(bottom.x)} y2={px(bottom.y)} />
      {label ? (
        <text x={px(top.x + 7)} y={px(top.y + 16)}>
          {label}
        </text>
      ) : null}
    </g>
  );
}

/** Marks a single curve's value at the guide's x with a dot. */
export function CurveMarker({
  view,
  point,
  className,
}: {
  view: Viewport;
  point: Point;
  className: string;
}) {
  const screen = view.toScreen(point);
  return <circle className={className} cx={px(screen.x)} cy={px(screen.y)} r={5} />;
}

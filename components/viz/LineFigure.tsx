"use client";

import { formatNumber, px, type Point, type Viewport } from "../../lib/viz/viewport";
import { clipLineToWorld, type Fit, type Line } from "../../lib/viz/line";
import { DragHandle } from "./VectorArrow";

export type LineTone = "a" | "b" | "fit";

/** An infinite line, clipped to the visible world so it reaches the frame edge. */
export function LinePath({
  view,
  line,
  tone = "a",
  dashed = false,
}: {
  view: Viewport;
  line: Line;
  tone?: LineTone;
  dashed?: boolean;
}) {
  const clipped = clipLineToWorld(line, view.world);
  if (!clipped) return null;

  const [start, end] = clipped.map((point) => view.toScreen(point));
  return (
    <line
      className={`line-path line-${tone}`}
      x1={px(start.x)}
      y1={px(start.y)}
      x2={px(end.x)}
      y2={px(end.y)}
      strokeDasharray={dashed ? "8 6" : undefined}
    />
  );
}

/** A labelled point, used for intersections and data. */
export function Dot({
  view,
  point,
  tone = "a",
  label,
  radius = 6,
}: {
  view: Viewport;
  point: Point;
  tone?: "a" | "b" | "fit" | "sum";
  label?: string;
  radius?: number;
}) {
  const screen = view.toScreen(point);
  return (
    <g className={`dot dot-${tone}`}>
      <circle cx={px(screen.x)} cy={px(screen.y)} r={radius} />
      {label ? (
        <text x={px(screen.x + radius + 8)} y={px(screen.y - radius - 4)}>
          {label}
        </text>
      ) : null}
    </g>
  );
}

/** Vertical drops from each data point to the fitted line: the residuals. */
export function ResidualBars({
  view,
  points,
  fit,
}: {
  view: Viewport;
  points: Point[];
  fit: Fit;
}) {
  if (fit.vertical) return null;

  return (
    <g className="residuals">
      {points.map((point, index) => {
        const predicted = fit.slope * point.x + fit.intercept;
        const from = view.toScreen(point);
        const to = view.toScreen({ x: point.x, y: predicted });
        return (
          <line
            key={index}
            className="residual-bar"
            x1={px(from.x)}
            y1={px(from.y)}
            x2={px(to.x)}
            y2={px(to.y)}
          />
        );
      })}
    </g>
  );
}

/** A draggable data point with the standard accessible handle semantics. */
export function DataHandle({
  view,
  point,
  index,
  active,
  onPointerDown,
  onKeyDown,
  label,
}: {
  view: Viewport;
  point: Point;
  index: number;
  active: boolean;
  onPointerDown: (event: React.PointerEvent<SVGGElement>) => void;
  onKeyDown: (event: React.KeyboardEvent<SVGGElement>) => void;
  label: string;
}) {
  return (
    <DragHandle
      view={view}
      point={point}
      tone="b"
      label={`${label} ${index + 1}`}
      valueText={`(${formatNumber(point.x, 1)}, ${formatNumber(point.y, 1)})`}
      active={active}
      onPointerDown={onPointerDown}
      onKeyDown={onKeyDown}
    />
  );
}

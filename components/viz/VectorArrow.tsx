"use client";

import type { KeyboardEvent as ReactKeyboardEvent, PointerEvent as ReactPointerEvent } from "react";
import { arrowHeadPoints, px, type Point, type Viewport } from "../../lib/viz/viewport";

export type VectorTone = "a" | "b" | "sum" | "unit" | "muted";

/** A vector drawn as a line with a manual arrowhead (no marker scaling issues). */
export function VectorArrow({
  view,
  from = { x: 0, y: 0 },
  to,
  tone = "a",
  label,
  dashed = false,
  opacity,
}: {
  view: Viewport;
  from?: Point;
  to: Point;
  tone?: VectorTone;
  label?: string;
  dashed?: boolean;
  opacity?: number;
}) {
  const start = view.toScreen(from);
  const end = view.toScreen(to);
  const tooShort = Math.hypot(end.x - start.x, end.y - start.y) < 6;

  // Offset the label perpendicular to the arrow so it never sits on the line.
  const midX = (start.x + end.x) / 2;
  const midY = (start.y + end.y) / 2;
  const angle = Math.atan2(end.y - start.y, end.x - start.x);
  const labelX = midX - Math.sin(angle) * 14;
  const labelY = midY + Math.cos(angle) * 14;

  return (
    <g className={`vec vec-${tone}`} opacity={opacity}>
      <line
        className="vec-line"
        x1={px(start.x)}
        y1={px(start.y)}
        x2={px(end.x)}
        y2={px(end.y)}
        strokeDasharray={dashed ? "7 6" : undefined}
      />
      {tooShort ? null : (
        <polygon className="vec-head" points={arrowHeadPoints(start, end, 12)} />
      )}
      {label && !tooShort ? (
        <text className="vec-label" x={px(labelX)} y={px(labelY)} textAnchor="middle">
          {label}
        </text>
      ) : null}
    </g>
  );
}

/**
 * A draggable point.
 *
 * Accessibility note: a 2-D handle has no matching ARIA role, so this is
 * declared as a slider whose `aria-valuetext` carries **both** coordinates —
 * screen readers announce `valuetext` in preference to `valuenow`. Arrow keys
 * move it, and every lab that uses a handle also renders number inputs, which
 * are the precise, fully accessible path.
 */
export function DragHandle({
  view,
  point,
  tone = "a",
  label,
  valueText,
  active = false,
  onPointerDown,
  onKeyDown,
}: {
  view: Viewport;
  point: Point;
  tone?: VectorTone;
  label: string;
  valueText: string;
  active?: boolean;
  onPointerDown?: (event: ReactPointerEvent<SVGGElement>) => void;
  onKeyDown?: (event: ReactKeyboardEvent<SVGGElement>) => void;
}) {
  const screen = view.toScreen(point);

  return (
    <g
      className={`handle handle-${tone} ${active ? "is-active" : ""}`}
      transform={`translate(${screen.x} ${screen.y})`}
      tabIndex={0}
      role="slider"
      aria-label={label}
      aria-valuetext={valueText}
      aria-valuenow={Math.round(point.x * 100) / 100}
      aria-valuemin={Math.floor(view.world.xMin)}
      aria-valuemax={Math.ceil(view.world.xMax)}
      onPointerDown={onPointerDown}
      onKeyDown={onKeyDown}
    >
      {/* A generous invisible target: the visible dot is too small to grab. */}
      <circle className="handle-hit" r={24} />
      <circle className="handle-ring" r={14} />
      <circle className="handle-dot" r={8} />
    </g>
  );
}

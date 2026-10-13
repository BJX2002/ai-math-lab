"use client";

import { useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { createViewport, type Point } from "../../../lib/viz/viewport";
import { nudgePoint, usePlaneDrag } from "../../viz/Plane";

/**
 * Pieces every plane lab needs.
 *
 * Extracted after the first three labs triplicated the same viewport, the same
 * readout row, and the same "drag or arrow-key" wiring.
 */

export const PLANE_WIDTH = 460;
export const PLANE_HEIGHT = 330;
export const SNAP_STEP = 0.5;

/** Equal-aspect mapping is enforced by createViewport, not by these bounds. */
export const DEFAULT_WORLD = { xMin: -5.5, xMax: 5.5, yMin: -4, yMax: 4 };

export function makeView(world = DEFAULT_WORLD) {
  return createViewport({ width: PLANE_WIDTH, height: PLANE_HEIGHT, world });
}

export function Readout({ label, value }: { label: string; value: string }) {
  return (
    <div className="lab-readout" aria-live="polite">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export function CoordinateInputs({
  labels,
  point,
  onChange,
  step = SNAP_STEP,
}: {
  labels: [string, string];
  point: Point;
  onChange: (point: Point) => void;
  step?: number;
}) {
  return (
    <div className="coord-inputs">
      {(["x", "y"] as const).map((axis, index) => (
        <label key={axis}>
          {labels[index]}
          <input
            type="number"
            step={step}
            value={point[axis]}
            onChange={(event) => {
              const next = Number(event.target.value);
              if (Number.isFinite(next)) onChange({ ...point, [axis]: next });
            }}
          />
        </label>
      ))}
    </div>
  );
}

/**
 * A single named number, for figures whose only free variable is one input.
 *
 * Drag handles cover the exploratory case; this is the precise path, and it is
 * what makes the figure usable without a pointer.
 */
export function ValueInput({
  label,
  value,
  onChange,
  step = 0.1,
  min,
  max,
  digits = 2,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  step?: number;
  min?: number;
  max?: number;
  digits?: number;
}) {
  const [draft, setDraft] = useState(() => String(Number(value.toFixed(digits))));
  const [syncedValue, setSyncedValue] = useState(value);

  // Adjusting state during render, as React documents, rather than in an effect:
  // the field still follows a drag, without a second render pass, and it does not
  // fight the reader mid-keystroke because typing only changes \`draft\`.
  if (syncedValue !== value) {
    setSyncedValue(value);
    setDraft(String(Number(value.toFixed(digits))));
  }

  return (
    <label className="value-input">
      {label}
      <input
        type="number"
        step={step}
        min={min}
        max={max}
        value={draft}
        onChange={(event) => {
          setDraft(event.target.value);
          const next = Number(event.target.value);
          if (!Number.isFinite(next)) return;
          onChange(Math.min(max ?? next, Math.max(min ?? next, next)));
        }}
      />
    </label>
  );
}

/**
 * Drag plus keyboard for a set of handles on one plane.
 *
 * Returns the pieces `Plane` and `DragHandle` expect, so a lab only has to say
 * which handle moved where.
 */
export function useHandleDrag<T extends string>({
  view,
  onMove,
  step = SNAP_STEP,
}: {
  view: ReturnType<typeof makeView>;
  onMove: (id: T, point: Point) => void;
  step?: number;
}) {
  const { svgRef, activeId, startHandle, svgHandlers } = usePlaneDrag({
    view,
    step,
    onMove: (id, point) => onMove(id as T, point),
  });

  /** Arrow-key equivalent of dragging, so the figure is not pointer-only. */
  const nudge =
    (current: Point, apply: (point: Point) => void) =>
    (event: ReactKeyboardEvent<SVGGElement>) => {
      const next = nudgePoint(current, event.key, step, view.world);
      if (!next) return;
      event.preventDefault();
      apply(next);
    };

  return { svgRef, activeId, startHandle, svgHandlers, nudge };
}

/** A point plus the setter, for labs that own several draggable points. */
export function usePoint(initial: Point) {
  return useState<Point>(initial);
}

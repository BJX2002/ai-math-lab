"use client";

import { useCallback, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import {
  arrowHeadPoints,
  clamp,
  clampToWorld,
  clientToUserSpace,
  formatNumber,
  niceStep,
  px,
  snap,
  tickValues,
  type Point,
  type Viewport,
} from "../../lib/viz/viewport";

const TICK_LABEL_MIN_GAP = 26;

/**
 * The SVG scene every 2-D figure is drawn on: grid, axes, tick labels, and a
 * content layer. Geometry comes entirely from the `Viewport`, so a figure can
 * never accidentally draw with a distorted scale.
 */
export function Plane({
  view,
  label,
  svgRef,
  gridStep,
  children,
  className,
  ...pointerHandlers
}: {
  view: Viewport;
  label: string;
  svgRef?: React.Ref<SVGSVGElement>;
  gridStep?: number;
  children: ReactNode;
  className?: string;
} & React.SVGProps<SVGSVGElement>) {
  const worldWidth = view.world.xMax - view.world.xMin;
  const worldHeight = view.world.yMax - view.world.yMin;
  const major = gridStep ?? niceStep(Math.max(worldWidth, worldHeight), 8);
  const minor = major / 2;

  const origin = view.toScreen({ x: 0, y: 0 });
  // If the origin is off-screen the axis is pinned to the edge so the reader
  // still has a reference line to read ticks against.
  const axisY = clamp(origin.y, 0, view.height);
  const axisX = clamp(origin.x, 0, view.width);

  const verticalMinor = tickValues(view.world.xMin, view.world.xMax, minor).filter(
    (value) => Math.abs(value / major - Math.round(value / major)) > 1e-6,
  );
  const verticalMajor = tickValues(view.world.xMin, view.world.xMax, major);
  const horizontalMinor = tickValues(view.world.yMin, view.world.yMax, minor).filter(
    (value) => Math.abs(value / major - Math.round(value / major)) > 1e-6,
  );
  const horizontalMajor = tickValues(view.world.yMin, view.world.yMax, major);

  const xLabels = verticalMajor.filter(
    (value) =>
      value !== 0 &&
      Math.abs(view.toScreen({ x: value, y: 0 }).x - axisX) > TICK_LABEL_MIN_GAP &&
      view.toScreen({ x: value, y: 0 }).x > 18 &&
      view.toScreen({ x: value, y: 0 }).x < view.width - 10,
  );
  const yLabels = horizontalMajor.filter(
    (value) =>
      value !== 0 &&
      Math.abs(view.toScreen({ x: 0, y: value }).y - axisY) > TICK_LABEL_MIN_GAP &&
      view.toScreen({ x: 0, y: value }).y > 16 &&
      view.toScreen({ x: 0, y: value }).y < view.height - 8,
  );

  // Keep tick labels inside the frame when the axis sits on an edge.
  const labelBelowAxis = axisY < view.height - 26;
  const labelLeftOfAxis = axisX > 34;

  return (
    <svg
      ref={svgRef}
      className={className ? `plane ${className}` : "plane"}
      viewBox={`0 0 ${view.width} ${view.height}`}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label={label}
      {...pointerHandlers}
    >
      <g className="plane-grid" aria-hidden="true">
        {verticalMinor.map((value) => (
          <line
            key={`mx${value}`}
            className="grid-minor"
            x1={px(view.toScreen({ x: value, y: 0 }).x)}
            y1={0}
            x2={px(view.toScreen({ x: value, y: 0 }).x)}
            y2={view.height}
          />
        ))}
        {horizontalMinor.map((value) => (
          <line
            key={`my${value}`}
            className="grid-minor"
            x1={0}
            y1={px(view.toScreen({ x: 0, y: value }).y)}
            x2={view.width}
            y2={px(view.toScreen({ x: 0, y: value }).y)}
          />
        ))}
        {verticalMajor.map((value) => (
          <line
            key={`Mx${value}`}
            className="grid-major"
            x1={px(view.toScreen({ x: value, y: 0 }).x)}
            y1={0}
            x2={px(view.toScreen({ x: value, y: 0 }).x)}
            y2={view.height}
          />
        ))}
        {horizontalMajor.map((value) => (
          <line
            key={`My${value}`}
            className="grid-major"
            x1={0}
            y1={px(view.toScreen({ x: 0, y: value }).y)}
            x2={view.width}
            y2={px(view.toScreen({ x: 0, y: value }).y)}
          />
        ))}
      </g>

      <g className="plane-axes" aria-hidden="true">
        <line x1={0} y1={px(axisY)} x2={view.width - 6} y2={px(axisY)} />
        <polygon points={arrowHeadPoints({ x: 0, y: axisY }, { x: view.width, y: axisY }, 8)} />
        <line x1={px(axisX)} y1={view.height} x2={px(axisX)} y2={6} />
        <polygon points={arrowHeadPoints({ x: axisX, y: view.height }, { x: axisX, y: 0 }, 8)} />
        <text className="axis-name" x={view.width - 14} y={px(axisY - 10)}>
          x
        </text>
        <text className="axis-name" x={px(axisX + 10)} y={16}>
          y
        </text>
      </g>

      <g className="plane-ticks" aria-hidden="true">
        {xLabels.map((value) => (
          <text
            key={`tx${value}`}
            x={px(view.toScreen({ x: value, y: 0 }).x)}
            y={px(labelBelowAxis ? axisY + 17 : axisY - 7)}
            textAnchor="middle"
          >
            {formatNumber(value, 2)}
          </text>
        ))}
        {yLabels.map((value) => (
          <text
            key={`ty${value}`}
            x={px(labelLeftOfAxis ? axisX - 8 : axisX + 8)}
            y={px(view.toScreen({ x: 0, y: value }).y + 4)}
            textAnchor={labelLeftOfAxis ? "end" : "start"}
          >
            {formatNumber(value, 2)}
          </text>
        ))}
      </g>

      <g className="plane-content">{children}</g>
    </svg>
  );
}

/**
 * Dragging for plane handles.
 *
 * Pointer capture is taken on the `<svg>`, not on the handle, so a fast drag
 * that leaves the small handle (or the whole SVG) keeps reporting until the
 * pointer is released. Touch dragging is enabled by `touch-action: none` on
 * `.plane` in the stylesheet.
 */
export function usePlaneDrag({
  view,
  step = 0,
  onMove,
}: {
  view: Viewport;
  step?: number;
  onMove: (id: string, point: Point) => void;
}) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const activeRef = useRef<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  // `view` is a dependency rather than a ref: writing a ref during render is a
  // React rule violation, and the handlers only need to be current, not stable.
  const worldFromEvent = useCallback(
    (event: ReactPointerEvent) => {
      const svg = svgRef.current;
      if (!svg) return null;
      const rect = svg.getBoundingClientRect();
      const user = clientToUserSpace({ x: event.clientX, y: event.clientY }, rect, view);
      return view.toWorld(user);
    },
    [view],
  );

  const startHandle = useCallback(
    (id: string) => (event: ReactPointerEvent<SVGGElement>) => {
      // Ignore secondary mouse buttons; allow touch and pen.
      if (event.pointerType === "mouse" && event.button !== 0) return;
      event.preventDefault();
      activeRef.current = id;
      setActiveId(id);
      try {
        svgRef.current?.setPointerCapture(event.pointerId);
      } catch {
        // Capture can fail if the pointer is already gone; dragging still works
        // while the pointer stays inside the SVG.
      }
    },
    [],
  );

  const endDrag = useCallback((event: ReactPointerEvent<SVGSVGElement>) => {
    activeRef.current = null;
    setActiveId(null);
    try {
      svgRef.current?.releasePointerCapture(event.pointerId);
    } catch {
      // Already released.
    }
  }, []);

  const svgHandlers = {
    onPointerMove: (event: ReactPointerEvent<SVGSVGElement>) => {
      const id = activeRef.current;
      if (!id) return;
      const world = worldFromEvent(event);
      if (!world) return;
      const bounded = clampToWorld(world, view.world);
      onMove(id, step > 0 ? { x: snap(bounded.x, step), y: snap(bounded.y, step) } : bounded);
    },
    onPointerUp: endDrag,
    onPointerCancel: endDrag,
  };

  return { svgRef, activeId, startHandle, svgHandlers };
}

/** Arrow-key nudging shared by every draggable handle. */
export function nudgePoint(
  point: Point,
  key: string,
  step: number,
  world: Viewport["world"],
): Point | null {
  const delta =
    key === "ArrowLeft"
      ? { x: -step, y: 0 }
      : key === "ArrowRight"
        ? { x: step, y: 0 }
        : key === "ArrowUp"
          ? { x: 0, y: step }
          : key === "ArrowDown"
            ? { x: 0, y: -step }
            : null;
  if (!delta) return null;
  return clampToWorld({ x: point.x + delta.x, y: point.y + delta.y }, world);
}

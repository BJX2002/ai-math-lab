"use client";

import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import { px, type Point, type Viewport } from "../../lib/viz/viewport";
import { DragHandle } from "./VectorArrow";

/** A 2x2 matrix in column order: column 1 is (a, c), column 2 is (b, d). */
export type Matrix2 = { a: number; b: number; c: number; d: number };

export const IDENTITY: Matrix2 = { a: 1, b: 0, c: 0, d: 1 };

/** Apply the matrix to a point. Column-major: x' = ax + by, y' = cx + dy. */
export function applyMatrix(matrix: Matrix2, point: Point): Point {
  return {
    x: matrix.a * point.x + matrix.b * point.y,
    y: matrix.c * point.x + matrix.d * point.y,
  };
}

export function determinant(matrix: Matrix2): number {
  return matrix.a * matrix.d - matrix.b * matrix.c;
}

export function columnOne(matrix: Matrix2): Point {
  return { x: matrix.a, y: matrix.c };
}

export function columnTwo(matrix: Matrix2): Point {
  return { x: matrix.b, y: matrix.d };
}

export function withColumnOne(matrix: Matrix2, point: Point): Matrix2 {
  return { ...matrix, a: point.x, c: point.y };
}

export function withColumnTwo(matrix: Matrix2, point: Point): Matrix2 {
  return { ...matrix, b: point.x, d: point.y };
}

/**
 * The image of an integer grid under the matrix.
 *
 * This is the whole point of the figure: a matrix is not a table, it is the
 * instruction "send every point here". Lines stay lines under a linear map, so
 * transforming both endpoints is enough.
 */
export function GridWarp({
  view,
  matrix,
  range = 3,
  showUnitSquare = true,
}: {
  view: Viewport;
  matrix: Matrix2;
  range?: number;
  showUnitSquare?: boolean;
}) {
  const segments: { from: Point; to: Point }[] = [];
  for (let k = -range; k <= range; k += 1) {
    segments.push({ from: applyMatrix(matrix, { x: k, y: -range }), to: applyMatrix(matrix, { x: k, y: range }) });
    segments.push({ from: applyMatrix(matrix, { x: -range, y: k }), to: applyMatrix(matrix, { x: range, y: k }) });
  }

  const unitSquare = [
    applyMatrix(matrix, { x: 0, y: 0 }),
    applyMatrix(matrix, { x: 1, y: 0 }),
    applyMatrix(matrix, { x: 1, y: 1 }),
    applyMatrix(matrix, { x: 0, y: 1 }),
  ];

  return (
    <g className="grid-warp">
      {segments.map((segment, index) => {
        const from = view.toScreen(segment.from);
        const to = view.toScreen(segment.to);
        return (
          <line
            key={index}
            className={index % 2 === 0 ? "warp-vertical" : "warp-horizontal"}
            x1={px(from.x)}
            y1={px(from.y)}
            x2={px(to.x)}
            y2={px(to.y)}
          />
        );
      })}
      {showUnitSquare ? (
        <polygon
          className="warp-unit-square"
          points={unitSquare.map((point) => {
            const screen = view.toScreen(point);
            return `${px(screen.x)},${px(screen.y)}`;
          }).join(" ")}
        />
      ) : null}
    </g>
  );
}

/**
 * Draggable column tips.
 *
 * Dragging the tip of a transformed basis vector *is* editing the matrix, which
 * is why the figure has no separate numeric editor on the plane itself: the
 * point where the basis lands is the number.
 */
export function MatrixHandles({
  view,
  matrix,
  activeId,
  onStart,
  onNudge,
  labels,
  valueLabels,
}: {
  view: Viewport;
  matrix: Matrix2;
  activeId: string | null;
  onStart: (id: string) => (event: React.PointerEvent<SVGGElement>) => void;
  onNudge: (id: string, point: Point, event: ReactKeyboardEvent<SVGGElement>) => void;
  labels: { first: string; second: string };
  valueLabels: { first: string; second: string };
}) {
  const first = columnOne(matrix);
  const second = columnTwo(matrix);

  return (
    <>
      <DragHandle
        view={view}
        point={first}
        tone="a"
        label={labels.first}
        valueText={valueLabels.first}
        active={activeId === "column1"}
        onPointerDown={onStart("column1")}
        onKeyDown={(event) => onNudge("column1", first, event)}
      />
      <DragHandle
        view={view}
        point={second}
        tone="b"
        label={labels.second}
        valueText={valueLabels.second}
        active={activeId === "column2"}
        onPointerDown={onStart("column2")}
        onKeyDown={(event) => onNudge("column2", second, event)}
      />
    </>
  );
}

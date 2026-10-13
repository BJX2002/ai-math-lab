"use client";

import { useState, type ComponentType, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { getMessages } from "../../../lib/i18n/messages";
import { formatNumber, type Point } from "../../../lib/viz/viewport";
import {
  GridWarp,
  IDENTITY,
  MatrixHandles,
  applyMatrix,
  determinant,
  withColumnOne,
  withColumnTwo,
  type Matrix2,
} from "../../viz/GridWarp";
import { Plane } from "../../viz/Plane";
import { DragHandle, VectorArrow } from "../../viz/VectorArrow";
import { CoordinateInputs, Readout, makeView, useHandleDrag } from "./shared";
import type { LabProps } from "./types";

const WARP_WORLD = { xMin: -6, xMax: 6, yMin: -4.5, yMax: 4.5 };

function MatrixEditor({
  labels,
  matrix,
  onChange,
}: {
  labels: [string, string, string, string];
  matrix: Matrix2;
  onChange: (matrix: Matrix2) => void;
}) {
  return (
    <div className="matrix-editor">
      {(["a", "b", "c", "d"] as const).map((key, index) => (
        <label key={key}>
          {labels[index]}
          <input
            type="number"
            step={0.5}
            value={matrix[key]}
            onChange={(event) => {
              const next = Number(event.target.value);
              if (Number.isFinite(next)) onChange({ ...matrix, [key]: next });
            }}
          />
        </label>
      ))}
    </div>
  );
}

function MatrixWarpLab({ locale }: LabProps) {
  const t = getMessages(locale).labs;
  const view = makeView(WARP_WORLD);
  const [matrix, setMatrix] = useState<Matrix2>({ a: 1.5, b: 0.5, c: 0.5, d: 1 });
  const [probe, setProbe] = useState<Point>({ x: 2, y: 1.5 });

  const { svgRef, activeId, startHandle, svgHandlers, nudge } = useHandleDrag<
    "column1" | "column2" | "probe"
  >({
    view,
    onMove: (id, point) => {
      if (id === "column1") setMatrix(withColumnOne(matrix, point));
      else if (id === "column2") setMatrix(withColumnTwo(matrix, point));
      else setProbe(point);
    },
  });

  const det = determinant(matrix);
  const image = applyMatrix(matrix, probe);
  const orientation =
    Math.abs(det) < 1e-6 ? t.orientationCollapsed : det < 0 ? t.orientationFlipped : t.orientationKept;

  return (
    <div className="plane-lab">
      <Plane view={view} label={t.matrixWarpLabel} svgRef={svgRef} {...svgHandlers}>
        <GridWarp view={view} matrix={matrix} range={3} />
        <VectorArrow view={view} to={probe} tone="muted" label="x" dashed />
        <VectorArrow view={view} to={image} tone="sum" label="A·x" />
        <MatrixHandles
          view={view}
          matrix={matrix}
          activeId={activeId}
          onStart={startHandle}
          onNudge={(id, point, event) =>
            nudge(point, (next) => {
              if (id === "column1") setMatrix(withColumnOne(matrix, next));
              else setMatrix(withColumnTwo(matrix, next));
            })(event)
          }
          labels={{ first: t.columnOneHandle, second: t.columnTwoHandle }}
          valueLabels={{
            first: `Ae₁ = (${formatNumber(matrix.a, 2)}, ${formatNumber(matrix.c, 2)})`,
            second: `Ae₂ = (${formatNumber(matrix.b, 2)}, ${formatNumber(matrix.d, 2)})`,
          }}
        />
        <DragHandle
          view={view}
          point={probe}
          tone="sum"
          label={t.probeHandle}
          valueText={`x = (${formatNumber(probe.x, 2)}, ${formatNumber(probe.y, 2)})`}
          active={activeId === "probe"}
          onPointerDown={startHandle("probe")}
          onKeyDown={nudge(probe, setProbe)}
        />
      </Plane>

      <div className="plane-controls">
        <MatrixEditor
          labels={["a", "b", "c", "d"]}
          matrix={matrix}
          onChange={setMatrix}
        />
        <Readout label={t.determinant} value={formatNumber(det, 3)} />
        <Readout label={t.areaScale} value={`${formatNumber(Math.abs(det), 3)}×`} />
        <Readout label={t.orientation} value={orientation} />
        <Readout label="A·x" value={`(${formatNumber(image.x, 2)}, ${formatNumber(image.y, 2)})`} />
        <CoordinateInputs labels={[t.coordX, t.coordY]} point={probe} onChange={setProbe} />
        <p className="plane-hint">{t.matrixWarpHint}</p>
      </div>
    </div>
  );
}

function MatrixOrderLab({ locale }: LabProps) {
  const t = getMessages(locale).labs;
  const view = makeView({ xMin: -4, xMax: 4, yMin: -3.2, yMax: 3.2 });
  // A quarter turn and a horizontal stretch: a classic non-commuting pair.
  const [a, setA] = useState<Matrix2>({ a: 0, b: -1, c: 1, d: 0 });
  const [b, setB] = useState<Matrix2>({ a: 2, b: 0, c: 0, d: 1 });
  const [probe, setProbe] = useState<Point>({ x: 1, y: 1 });

  const { svgRef, activeId, startHandle, svgHandlers, nudge } = useHandleDrag<
    "a1" | "a2" | "b1" | "b2" | "probe"
  >({
    view,
    onMove: (id, point) => {
      if (id === "a1") setA(withColumnOne(a, point));
      else if (id === "a2") setA(withColumnTwo(a, point));
      else if (id === "b1") setB(withColumnOne(b, point));
      else if (id === "b2") setB(withColumnTwo(b, point));
      else setProbe(point);
    },
  });

  const thenB = applyMatrix(b, probe);
  const thenA = applyMatrix(a, probe);
  const bAfterA = applyMatrix(b, thenA);
  const aAfterB = applyMatrix(a, thenB);
  const same = Math.hypot(bAfterA.x - aAfterB.x, bAfterA.y - aAfterB.y) < 1e-9;

  function nudgeMatrix(
    id: string,
    current: Matrix2,
    point: Point,
    event: ReactKeyboardEvent<SVGGElement>,
  ) {
    nudge(point, (next) => {
      if (id === "a1") setA(withColumnOne(current, next));
      else if (id === "a2") setA(withColumnTwo(current, next));
      else if (id === "b1") setB(withColumnOne(current, next));
      else setB(withColumnTwo(current, next));
    })(event);
  }

  return (
    <div className="plane-lab">
      <Plane view={view} label={t.matrixOrderLabel} svgRef={svgRef} {...svgHandlers}>
        <VectorArrow view={view} to={probe} tone="muted" label="x" dashed />
        {/* Applying A then B. */}
        <VectorArrow view={view} to={thenA} tone="a" label="A·x" />
        <VectorArrow view={view} to={bAfterA} tone="sum" label="B(A·x)" />
        {/* Applying B then A. */}
        <VectorArrow view={view} to={thenB} tone="b" label="B·x" />
        <VectorArrow view={view} to={aAfterB} tone="unit" label="A(B·x)" />
        <MatrixHandles
          view={view}
          matrix={a}
          activeId={activeId}
          onStart={startHandle}
          onNudge={(id, point, event) => nudgeMatrix(id, a, point, event)}
          labels={{ first: t.handleA1, second: t.handleA2 }}
          valueLabels={{
            first: `Ae₁ = (${formatNumber(a.a, 2)}, ${formatNumber(a.c, 2)})`,
            second: `Ae₂ = (${formatNumber(a.b, 2)}, ${formatNumber(a.d, 2)})`,
          }}
        />
        <MatrixHandles
          view={view}
          matrix={b}
          activeId={activeId}
          onStart={startHandle}
          onNudge={(id, point, event) => nudgeMatrix(id, b, point, event)}
          labels={{ first: t.handleB1, second: t.handleB2 }}
          valueLabels={{
            first: `Be₁ = (${formatNumber(b.a, 2)}, ${formatNumber(b.c, 2)})`,
            second: `Be₂ = (${formatNumber(b.b, 2)}, ${formatNumber(b.d, 2)})`,
          }}
        />
        <DragHandle
          view={view}
          point={probe}
          tone="sum"
          label={t.probeHandle}
          valueText={`x = (${formatNumber(probe.x, 2)}, ${formatNumber(probe.y, 2)})`}
          active={activeId === "probe"}
          onPointerDown={startHandle("probe")}
          onKeyDown={nudge(probe, setProbe)}
        />
      </Plane>

      <div className="plane-controls">
        <Readout
          label={t.orderBA}
          value={`(${formatNumber(bAfterA.x, 2)}, ${formatNumber(bAfterA.y, 2)})`}
        />
        <Readout
          label={t.orderAB}
          value={`(${formatNumber(aAfterB.x, 2)}, ${formatNumber(aAfterB.y, 2)})`}
        />
        <Readout label={t.orderVerdict} value={same ? t.orderSame : t.orderDifferent} />
        <Readout label={`det(A) × det(B)`} value={formatNumber(determinant(a) * determinant(b), 3)} />
        <p className="plane-hint">{t.orderHint}</p>
      </div>
    </div>
  );
}

const BATCH_POINTS: Point[] = [
  { x: 1, y: 0.5 },
  { x: 2, y: 2 },
  { x: 3, y: 1 },
];

function MatrixBatchLab({ locale }: LabProps) {
  const t = getMessages(locale).labs;
  const view = makeView(WARP_WORLD);
  const [matrix, setMatrix] = useState<Matrix2>({ ...IDENTITY, a: 1.2, d: 0.8 });

  const { svgRef, activeId, startHandle, svgHandlers, nudge } = useHandleDrag<
    "column1" | "column2"
  >({
    view,
    onMove: (id, point) =>
      id === "column1" ? setMatrix(withColumnOne(matrix, point)) : setMatrix(withColumnTwo(matrix, point)),
  });

  return (
    <div className="plane-lab">
      <Plane view={view} label={t.matrixBatchLabel} svgRef={svgRef} {...svgHandlers}>
        <GridWarp view={view} matrix={matrix} range={3} showUnitSquare={false} />
        {BATCH_POINTS.map((point, index) => {
          const image = applyMatrix(matrix, point);
          return (
            <g key={index}>
              <VectorArrow view={view} to={point} tone="muted" dashed />
              <VectorArrow view={view} to={image} tone="sum" label={index === 0 ? "A·xᵢ" : undefined} />
            </g>
          );
        })}
        <MatrixHandles
          view={view}
          matrix={matrix}
          activeId={activeId}
          onStart={startHandle}
          onNudge={(id, point, event) =>
            nudge(point, (next) =>
              id === "column1" ? setMatrix(withColumnOne(matrix, next)) : setMatrix(withColumnTwo(matrix, next)),
            )(event)
          }
          labels={{ first: t.columnOneHandle, second: t.columnTwoHandle }}
          valueLabels={{
            first: `Ae₁ = (${formatNumber(matrix.a, 2)}, ${formatNumber(matrix.c, 2)})`,
            second: `Ae₂ = (${formatNumber(matrix.b, 2)}, ${formatNumber(matrix.d, 2)})`,
          }}
        />
      </Plane>

      <div className="plane-controls">
        <MatrixEditor labels={["a", "b", "c", "d"]} matrix={matrix} onChange={setMatrix} />
        <Readout label={t.batchCount} value={"3 → 3"} />
        {BATCH_POINTS.map((point, index) => {
          const image = applyMatrix(matrix, point);
          return (
            <Readout
              key={index}
              label={`x${index + 1} → A·x${index + 1}`}
              value={`(${formatNumber(image.x, 1)}, ${formatNumber(image.y, 1)})`}
            />
          );
        })}
        <p className="plane-hint">{t.matrixBatchHint}</p>
      </div>
    </div>
  );
}

export const matrixLabs: Record<
  "matrix-warp" | "matrix-order" | "matrix-batch",
  ComponentType<LabProps>
> = {
  "matrix-warp": MatrixWarpLab,
  "matrix-order": MatrixOrderLab,
  "matrix-batch": MatrixBatchLab,
};

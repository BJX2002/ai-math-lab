"use client";

import { useState, type ComponentType, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { getMessages } from "../../../lib/i18n/messages";
import { Plane, nudgePoint, usePlaneDrag } from "../../viz/Plane";
import { DragHandle, VectorArrow } from "../../viz/VectorArrow";
import { add, formatNumber, length, normalize, scalePoint, type Point } from "../../../lib/viz/viewport";
import { CoordinateInputs, Readout, makeView } from "./shared";
import type { LabProps } from "./types";

const SNAP_STEP = 0.5;

function VectorPlaneLab({ locale }: LabProps) {
  const t = getMessages(locale).labs;
  const view = makeView();
  const [vector, setVector] = useState<Point>({ x: 3, y: 2 });
  const [showUnit, setShowUnit] = useState(true);

  const { svgRef, activeId, startHandle, svgHandlers } = usePlaneDrag({
    view,
    step: SNAP_STEP,
    onMove: (_id, point) => setVector(point),
  });

  const norm = length(vector);
  const unit = normalize(vector);

  function onKeyDown(event: ReactKeyboardEvent<SVGGElement>) {
    const next = nudgePoint(vector, event.key, SNAP_STEP, view.world);
    if (!next) return;
    event.preventDefault();
    setVector(next);
  }

  return (
    <div className="plane-lab">
      <Plane view={view} label={t.planeVectorLabel} svgRef={svgRef} {...svgHandlers}>
        <VectorArrow
          view={view}
          to={vector}
          tone="a"
          label="x"
          opacity={showUnit ? 0.4 : 1}
        />
        {showUnit ? <VectorArrow view={view} to={unit} tone="unit" label="x̂" /> : null}
        <DragHandle
          view={view}
          point={vector}
          tone="a"
          label={t.planeVectorHandle}
          valueText={`x = ${formatNumber(vector.x)}, y = ${formatNumber(vector.y)}`}
          active={activeId === "x"}
          onPointerDown={startHandle("x")}
          onKeyDown={onKeyDown}
        />
      </Plane>

      <div className="plane-controls">
        <CoordinateInputs labels={[t.coordX, t.coordY]} point={vector} onChange={setVector} />
        <Readout label={t.dimension} value={String(2)} />
        <Readout label="‖x‖₂" value={formatNumber(norm, 3)} />
        <Readout
          label={t.normalized}
          value={norm === 0 ? "—" : `(${formatNumber(unit.x, 2)}, ${formatNumber(unit.y, 2)})`}
        />
        <label className="plane-toggle">
          <input type="checkbox" checked={showUnit} onChange={() => setShowUnit(!showUnit)} />
          {t.showUnitVector}
        </label>
        <p className="plane-hint">{t.planeHint}</p>
      </div>
    </div>
  );
}

function VectorAdditionLab({ locale }: LabProps) {
  const t = getMessages(locale).labs;
  const view = makeView();
  const [a, setA] = useState<Point>({ x: 3, y: 1 });
  const [b, setB] = useState<Point>({ x: 1, y: 3 });

  const { svgRef, activeId, startHandle, svgHandlers } = usePlaneDrag({
    view,
    step: SNAP_STEP,
    onMove: (id, point) => (id === "a" ? setA(point) : setB(point)),
  });

  const sum = add(a, b);

  function keyHandler(current: Point, apply: (point: Point) => void) {
    return (event: ReactKeyboardEvent<SVGGElement>) => {
      const next = nudgePoint(current, event.key, SNAP_STEP, view.world);
      if (!next) return;
      event.preventDefault();
      apply(next);
    };
  }

  return (
    <div className="plane-lab">
      <Plane view={view} label={t.planeSumLabel} svgRef={svgRef} {...svgHandlers}>
        {/* b drawn head-to-tail so the parallelogram is visible. */}
        <VectorArrow view={view} from={a} to={sum} tone="b" label="b" dashed />
        <VectorArrow view={view} to={a} tone="a" label="a" />
        <VectorArrow view={view} to={b} tone="b" label="b" />
        <VectorArrow view={view} to={sum} tone="sum" label="a+b" />
        <DragHandle
          view={view}
          point={a}
          tone="a"
          label={t.handleA}
          valueText={`a = (${formatNumber(a.x)}, ${formatNumber(a.y)})`}
          active={activeId === "a"}
          onPointerDown={startHandle("a")}
          onKeyDown={keyHandler(a, setA)}
        />
        <DragHandle
          view={view}
          point={b}
          tone="b"
          label={t.handleB}
          valueText={`b = (${formatNumber(b.x)}, ${formatNumber(b.y)})`}
          active={activeId === "b"}
          onPointerDown={startHandle("b")}
          onKeyDown={keyHandler(b, setB)}
        />
      </Plane>

      <div className="plane-controls">
        <CoordinateInputs labels={["a₁", "a₂"]} point={a} onChange={setA} />
        <CoordinateInputs labels={["b₁", "b₂"]} point={b} onChange={setB} />
        <Readout
          label="a + b"
          value={`(${formatNumber(sum.x, 2)}, ${formatNumber(sum.y, 2)})`}
        />
        <Readout label="‖a + b‖₂" value={formatNumber(length(sum), 3)} />
        <Readout
          label={t.compareRule}
          value={
            length(sum) <= length(a) + length(b) + 1e-9 ? t.triangleHolds : t.triangleBroken
          }
        />
        <p className="plane-hint">{t.sumHint}</p>
      </div>
    </div>
  );
}

function VectorScalingLab({ locale }: LabProps) {
  const t = getMessages(locale).labs;
  const view = makeView();
  const [vector, setVector] = useState<Point>({ x: 3, y: 2 });
  const [factor, setFactor] = useState(1.5);

  const { svgRef, activeId, startHandle, svgHandlers } = usePlaneDrag({
    view,
    step: SNAP_STEP,
    onMove: (_id, point) => setVector(point),
  });

  const scaled = scalePoint(vector, factor);

  function onKeyDown(event: ReactKeyboardEvent<SVGGElement>) {
    const next = nudgePoint(vector, event.key, SNAP_STEP, view.world);
    if (!next) return;
    event.preventDefault();
    setVector(next);
  }

  return (
    <div className="plane-lab">
      <Plane view={view} label={t.planeScaleLabel} svgRef={svgRef} {...svgHandlers}>
        <VectorArrow view={view} to={vector} tone="a" label="x" opacity={0.4} />
        <VectorArrow view={view} to={scaled} tone="sum" label={`${formatNumber(factor, 2)}x`} />
        <DragHandle
          view={view}
          point={vector}
          tone="a"
          label={t.planeVectorHandle}
          valueText={`x = (${formatNumber(vector.x)}, ${formatNumber(vector.y)})`}
          active={activeId === "x"}
          onPointerDown={startHandle("x")}
          onKeyDown={onKeyDown}
        />
      </Plane>

      <div className="plane-controls">
        <label className="plane-slider">
          {t.scaleFactor} k = <strong>{formatNumber(factor, 2)}</strong>
          <input
            type="range"
            min={-2}
            max={2}
            step={0.25}
            value={factor}
            onChange={(event) => setFactor(Number(event.target.value))}
          />
        </label>
        <CoordinateInputs labels={[t.coordX, t.coordY]} point={vector} onChange={setVector} />
        <Readout
          label="k·x"
          value={`(${formatNumber(scaled.x, 2)}, ${formatNumber(scaled.y, 2)})`}
        />
        <Readout label="‖x‖₂" value={formatNumber(length(vector), 3)} />
        <Readout
          label={t.compareRule}
          value={t.scaleRule.replace("{k}", formatNumber(Math.abs(factor), 2))}
        />
        <p className="plane-hint">{t.scaleHint}</p>
      </div>
    </div>
  );
}

export const vectorLabs: Record<
  "vector-plane" | "vector-addition" | "vector-scaling",
  ComponentType<LabProps>
> = {
  "vector-plane": VectorPlaneLab,
  "vector-addition": VectorAdditionLab,
  "vector-scaling": VectorScalingLab,
};

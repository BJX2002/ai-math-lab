"use client";

import { useState, type ComponentType } from "react";
import { getMessages } from "../../../lib/i18n/messages";
import { add, formatNumber, length, normalize, type Point } from "../../../lib/viz/viewport";
import { AngleArc, ProjectionShadow } from "../../viz/geometry";
import { Plane } from "../../viz/Plane";
import { DragHandle, VectorArrow } from "../../viz/VectorArrow";
import { CoordinateInputs, Readout, makeView, useHandleDrag } from "./shared";
import type { LabProps } from "./types";

type HandleId = "a" | "b";
type View = ReturnType<typeof makeView>;

/** Renders a and b with their handles, and wires drag plus keyboard. */
function TwoVectorPlane({
  view,
  a,
  b,
  setA,
  setB,
  label,
  colors = { a: "a", b: "b" },
  children,
  labels,
}: {
  view: View;
  a: Point;
  b: Point;
  setA: (point: Point) => void;
  setB: (point: Point) => void;
  label: string;
  colors?: { a: "a" | "sum"; b: "b" | "muted" };
  children?: React.ReactNode;
  labels: { handleA: string; handleB: string };
}) {
  const { svgRef, activeId, startHandle, svgHandlers, nudge } = useHandleDrag<HandleId>({
    view,
    onMove: (id, point) => (id === "a" ? setA(point) : setB(point)),
  });

  return (
    <Plane view={view} label={label} svgRef={svgRef} {...svgHandlers}>
      <VectorArrow view={view} to={a} tone={colors.a} label="a" />
      <VectorArrow view={view} to={b} tone={colors.b} label="b" />
      {children}
      <DragHandle
        view={view}
        point={a}
        tone={colors.a === "sum" ? "sum" : "a"}
        label={labels.handleA}
        valueText={`a = (${formatNumber(a.x)}, ${formatNumber(a.y)})`}
        active={activeId === "a"}
        onPointerDown={startHandle("a")}
        onKeyDown={nudge(a, setA)}
      />
      <DragHandle
        view={view}
        point={b}
        tone={colors.b === "muted" ? "muted" : "b"}
        label={labels.handleB}
        valueText={`b = (${formatNumber(b.x)}, ${formatNumber(b.y)})`}
        active={activeId === "b"}
        onPointerDown={startHandle("b")}
        onKeyDown={nudge(b, setB)}
      />
    </Plane>
  );
}

function AngleLab({ locale }: LabProps) {
  const t = getMessages(locale).labs;
  const view = makeView();
  const [a, setA] = useState<Point>({ x: 3, y: 0.5 });
  const [b, setB] = useState<Point>({ x: 2, y: 3 });

  const dot = a.x * b.x + a.y * b.y;
  const cosine = length(a) && length(b) ? dot / (length(a) * length(b)) : 0;
  const angle = (Math.acos(Math.max(-1, Math.min(1, cosine))) * 180) / Math.PI;

  const relation =
    Math.abs(cosine) < 0.06
      ? t.relationPerpendicular
      : cosine > 0
        ? t.relationSameWay
        : t.relationOpposite;

  return (
    <div className="plane-lab">
      <TwoVectorPlane
        view={view}
        a={a}
        b={b}
        setA={setA}
        setB={setB}
        label={t.dotAngleLabel}
        labels={{ handleA: t.handleA, handleB: t.handleB }}
      >
        <AngleArc view={view} a={a} b={b} label={`${formatNumber(angle, 1)}°`} />
      </TwoVectorPlane>

      <div className="plane-controls">
        <CoordinateInputs labels={["a₁", "a₂"]} point={a} onChange={setA} />
        <CoordinateInputs labels={["b₁", "b₂"]} point={b} onChange={setB} />
        <Readout label="a · b" value={formatNumber(dot, 3)} />
        <Readout label={t.cosine} value={formatNumber(cosine, 3)} />
        <Readout label={t.angle} value={`${formatNumber(angle, 1)}°`} />
        <Readout label={t.relation} value={relation} />
        <p className="plane-hint">{t.angleHint}</p>
      </div>
    </div>
  );
}

function ProjectionLab({ locale }: LabProps) {
  const t = getMessages(locale).labs;
  const view = makeView();
  const [a, setA] = useState<Point>({ x: 3, y: 3 });
  const [b, setB] = useState<Point>({ x: 4, y: 0.5 });

  const bLength = length(b);
  const dot = a.x * b.x + a.y * b.y;
  const scalar = bLength ? dot / bLength : 0;
  const unitB = normalize(b);
  const foot = { x: unitB.x * scalar, y: unitB.y * scalar };

  return (
    <div className="plane-lab">
      <TwoVectorPlane
        view={view}
        a={a}
        b={b}
        setA={setA}
        setB={setB}
        label={t.projectionLabel}
        labels={{ handleA: t.handleA, handleB: t.handleB }}
      >
        <ProjectionShadow view={view} vector={a} onto={b} />
        <VectorArrow view={view} to={foot} tone="sum" label={t.shadow} />
      </TwoVectorPlane>

      <div className="plane-controls">
        <CoordinateInputs labels={["a₁", "a₂"]} point={a} onChange={setA} />
        <CoordinateInputs labels={["b₁", "b₂"]} point={b} onChange={setB} />
        <Readout label={t.scalarProjection} value={formatNumber(scalar, 3)} />
        <Readout label="‖b‖₂" value={formatNumber(bLength, 3)} />
        <Readout label="a · b" value={formatNumber(dot, 3)} />
        <Readout
          label={t.projectionCheck}
          value={`${formatNumber(scalar * bLength, 3)} = ${formatNumber(dot, 3)}`}
        />
        <p className="plane-hint">{t.projectionHint}</p>
      </div>
    </div>
  );
}

function NeuronLab({ locale }: LabProps) {
  const t = getMessages(locale).labs;
  const view = makeView();
  const [w, setW] = useState<Point>({ x: 1.5, y: 1 });
  const [probe, setProbe] = useState<Point>({ x: 3, y: 2.5 });
  const [bias, setBias] = useState(-1);

  const score = w.x * probe.x + w.y * probe.y + bias;
  const positive = score >= 0;

  // The boundary is w·x + b = 0: a straight line, drawn across the whole plane.
  const boundary =
    Math.abs(w.y) > 1e-6
      ? [
          { x: view.world.xMin, y: -(w.x * view.world.xMin + bias) / w.y },
          { x: view.world.xMax, y: -(w.x * view.world.xMax + bias) / w.y },
        ]
      : null;
  const boundaryIsVertical = Math.abs(w.y) <= 1e-6;

  const { svgRef, activeId, startHandle, svgHandlers, nudge } = useHandleDrag<"w" | "probe">({
    view,
    onMove: (id, point) => (id === "w" ? setW(point) : setProbe(point)),
  });

  return (
    <div className="plane-lab">
      <Plane view={view} label={t.neuronLabel} svgRef={svgRef} {...svgHandlers}>
        {boundary ? (
          <line
            className="boundary-line"
            x1={view.toScreen(boundary[0]).x}
            y1={view.toScreen(boundary[0]).y}
            x2={view.toScreen(boundary[1]).x}
            y2={view.toScreen(boundary[1]).y}
          />
        ) : (
          <line
            className="boundary-line"
            x1={view.toScreen({ x: -bias / (w.x || 1), y: view.world.yMin }).x}
            y1={0}
            x2={view.toScreen({ x: -bias / (w.x || 1), y: view.world.yMin }).x}
            y2={view.height}
          />
        )}
        {/* The score is a dot product, so draw the two vectors that produce it. */}
        <VectorArrow view={view} to={w} tone="a" label="w" />
        <VectorArrow view={view} to={probe} tone="muted" label="x" dashed />
        <VectorArrow view={view} to={add(w, probe)} tone="sum" opacity={0.5} />
        <DragHandle
          view={view}
          point={w}
          tone="a"
          label={t.weightHandle}
          valueText={`w = (${formatNumber(w.x, 2)}, ${formatNumber(w.y, 2)})`}
          active={activeId === "w"}
          onPointerDown={startHandle("w")}
          onKeyDown={nudge(w, setW)}
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
        <CoordinateInputs labels={["w₁", "w₂"]} point={w} onChange={setW} />
        <CoordinateInputs labels={["x₁", "x₂"]} point={probe} onChange={setProbe} />
        <label className="plane-slider">
          {t.bias} b = <strong>{formatNumber(bias, 2)}</strong>
          <input
            type="range"
            min={-5}
            max={5}
            step={0.25}
            value={bias}
            onChange={(event) => setBias(Number(event.target.value))}
          />
        </label>
        <Readout label={t.score} value={formatNumber(score, 3)} />
        <Readout label={t.side} value={positive ? t.sidePositive : t.sideNegative} />
        <Readout
          label="w · x"
          value={formatNumber(score - bias, 3)}
        />
        <p className="plane-hint">
          {boundaryIsVertical ? t.verticalBoundaryNote : t.neuronHint}
        </p>
      </div>
    </div>
  );
}

export const dotLabs: Record<
  "dot-angle" | "dot-projection" | "neuron-boundary",
  ComponentType<LabProps>
> = {
  "dot-angle": AngleLab,
  "dot-projection": ProjectionLab,
  "neuron-boundary": NeuronLab,
};

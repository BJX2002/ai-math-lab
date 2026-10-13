"use client";

import { useState, type ComponentType } from "react";
import { getMessages } from "../../../lib/i18n/messages";
import { formatNumber, type Point } from "../../../lib/viz/viewport";
import { CurveMarker, FunctionPlot, StepPlot, VerticalGuide } from "../../viz/Curve";
import { Plane } from "../../viz/Plane";
import { DragHandle } from "../../viz/VectorArrow";
import { Readout, ValueInput, makeView, useHandleDrag } from "./shared";
import type { LabProps } from "./types";

/** The course's sigmoid: s(x) = 1 / (1 + e^{-a x}), with `a` the slope parameter. */
function sigmoid(x: number, slope = 1): number {
  return 1 / (1 + Math.exp(-slope * x));
}

function sigmoidDerivative(x: number, slope = 1): number {
  const value = sigmoid(x, slope);
  return slope * value * (1 - value);
}

function relu(x: number): number {
  return Math.max(0, x);
}

function tanh(x: number): number {
  return Math.tanh(x);
}

const CURVE_WORLD = { xMin: -6, xMax: 6, yMin: -1.5, yMax: 1.6 };

/** A handle that slides along the x axis, plus the keyboard equivalent. */
function useInputDrag(initial: number, view: ReturnType<typeof makeView>) {
  const [input, setInput] = useState(initial);
  const { svgRef, activeId, startHandle, svgHandlers, nudge } = useHandleDrag<"input">({
    view,
    onMove: (_id, point) => setInput(Math.max(view.world.xMin, Math.min(view.world.xMax, point.x))),
  });

  const handle = (axisY: number) => {
    const anchor: Point = { x: input, y: axisY };
    return (
      <DragHandle
        view={view}
        point={anchor}
        tone="sum"
        label="x"
        valueText={`x = ${formatNumber(input, 2)}`}
        active={activeId === "input"}
        onPointerDown={startHandle("input")}
        onKeyDown={nudge(anchor, (next) => setInput(next.x))}
      />
    );
  };

  return { input, setInput, svgRef, svgHandlers, handle };
}

function ActivationShapeLab({ locale }: LabProps) {
  const t = getMessages(locale).labs;
  const view = makeView(CURVE_WORLD);
  const [slope, setSlope] = useState(1);
  const { input, setInput, svgRef, svgHandlers, handle } = useInputDrag(1.5, view);

  const value = sigmoid(input, slope);
  const derivative = sigmoidDerivative(input, slope);

  return (
    <div className="plane-lab">
      <Plane view={view} label={t.activationShapeLabel} svgRef={svgRef} {...svgHandlers}>
        {/* The step function for contrast: what the sigmoid is softening. */}
        <StepPlot
          view={view}
          threshold={0}
          low={0}
          high={1}
          from={CURVE_WORLD.xMin}
          to={CURVE_WORLD.xMax}
          className="curve-step"
          riserClassName="curve-step-riser"
        />
        <FunctionPlot
          view={view}
          value={(x) => sigmoid(x, slope)}
          from={CURVE_WORLD.xMin}
          to={CURVE_WORLD.xMax}
          className="curve-primary"
        />
        <VerticalGuide view={view} x={input} className="curve-guide" label={`x = ${formatNumber(input, 2)}`} />
        <CurveMarker view={view} point={{ x: input, y: value }} className="curve-marker" />
        {handle(0)}
      </Plane>

      <div className="plane-controls">
        <label className="plane-slider">
          {t.slopeParameter} a = <strong>{formatNumber(slope, 2)}</strong>
          <input
            type="range"
            min={0.2}
            max={5}
            step={0.1}
            value={slope}
            onChange={(event) => setSlope(Number(event.target.value))}
          />
        </label>
        <ValueInput label="x" value={input} onChange={setInput} min={CURVE_WORLD.xMin} max={CURVE_WORLD.xMax} />
        <Readout label="x" value={formatNumber(input, 3)} />
        <Readout label="s(x)" value={formatNumber(value, 4)} />
        <Readout label="s′(x)" value={formatNumber(derivative, 4)} />
        <Readout label={t.stepValue} value={input >= 0 ? "1" : "0"} />
        <p className="plane-hint">{t.activationShapeHint}</p>
      </div>
    </div>
  );
}

function ActivationCompareLab({ locale }: LabProps) {
  const t = getMessages(locale).labs;
  const view = makeView(CURVE_WORLD);
  const { input, setInput, svgRef, svgHandlers, handle } = useInputDrag(1.2, view);

  const values = {
    step: input >= 0 ? 1 : 0,
    sigmoid: sigmoid(input),
    relu: relu(input),
    tanh: tanh(input),
  };

  return (
    <div className="plane-lab">
      <Plane view={view} label={t.activationCompareLabel} svgRef={svgRef} {...svgHandlers}>
        <StepPlot
          view={view}
          threshold={0}
          low={0}
          high={1}
          from={CURVE_WORLD.xMin}
          to={CURVE_WORLD.xMax}
          className="curve-step"
          riserClassName="curve-step-riser"
        />
        <FunctionPlot
          view={view}
          value={sigmoid}
          from={CURVE_WORLD.xMin}
          to={CURVE_WORLD.xMax}
          className="curve-sigmoid"
        />
        <FunctionPlot
          view={view}
          value={tanh}
          from={CURVE_WORLD.xMin}
          to={CURVE_WORLD.xMax}
          className="curve-tanh"
        />
        <FunctionPlot
          view={view}
          value={relu}
          from={CURVE_WORLD.xMin}
          to={CURVE_WORLD.xMax}
          className="curve-relu"
        />
        <VerticalGuide view={view} x={input} className="curve-guide" label={`x = ${formatNumber(input, 2)}`} />
        <CurveMarker view={view} point={{ x: input, y: values.step }} className="marker-step" />
        <CurveMarker view={view} point={{ x: input, y: values.sigmoid }} className="marker-sigmoid" />
        <CurveMarker view={view} point={{ x: input, y: values.relu }} className="marker-relu" />
        <CurveMarker view={view} point={{ x: input, y: values.tanh }} className="marker-tanh" />
        {handle(0)}
      </Plane>

      <div className="plane-controls">
        <ValueInput label="x" value={input} onChange={setInput} min={CURVE_WORLD.xMin} max={CURVE_WORLD.xMax} />
        <Readout label={t.stepValue} value={String(values.step)} />
        <Readout label="sigmoid" value={formatNumber(values.sigmoid, 4)} />
        <Readout label="tanh" value={formatNumber(values.tanh, 4)} />
        <Readout label="ReLU" value={formatNumber(values.relu, 4)} />
        <p className="plane-hint">{t.activationCompareHint}</p>
      </div>
    </div>
  );
}

function ActivationGradientLab({ locale }: LabProps) {
  const t = getMessages(locale).labs;
  const view = makeView(CURVE_WORLD);
  const { input, setInput, svgRef, svgHandlers, handle } = useInputDrag(-2.5, view);

  const value = sigmoid(input);
  const derivative = sigmoidDerivative(input);
  const flat = Math.abs(derivative) < 0.02;

  return (
    <div className="plane-lab">
      <Plane view={view} label={t.activationGradientLabel} svgRef={svgRef} {...svgHandlers}>
        {/* The step function's derivative is zero everywhere: no gradient at all. */}
        <polyline
          className="curve-zero"
          points={[
            view.toScreen({ x: CURVE_WORLD.xMin, y: 0 }),
            view.toScreen({ x: CURVE_WORLD.xMax, y: 0 }),
          ]
            .map((point) => `${point.x.toFixed(2)},${point.y.toFixed(2)}`)
            .join(" ")}
        />
        <FunctionPlot
          view={view}
          value={sigmoid}
          from={CURVE_WORLD.xMin}
          to={CURVE_WORLD.xMax}
          className="curve-sigmoid"
        />
        <FunctionPlot
          view={view}
          value={sigmoidDerivative}
          from={CURVE_WORLD.xMin}
          to={CURVE_WORLD.xMax}
          className="curve-derivative"
        />
        <VerticalGuide view={view} x={input} className="curve-guide" label={`x = ${formatNumber(input, 2)}`} />
        <CurveMarker view={view} point={{ x: input, y: value }} className="marker-sigmoid" />
        <CurveMarker view={view} point={{ x: input, y: derivative }} className="marker-derivative" />
        {handle(0)}
      </Plane>

      <div className="plane-controls">
        <ValueInput label="x" value={input} onChange={setInput} min={CURVE_WORLD.xMin} max={CURVE_WORLD.xMax} />
        <Readout label="s(x)" value={formatNumber(value, 4)} />
        <Readout label="s′(x)" value={formatNumber(derivative, 4)} />
        <Readout label={t.stepDerivative} value="0" />
        <Readout label={t.belief} value={flat ? t.gradientNearZero : t.gradientHealthy} />
        {flat ? <p className="py-banner py-banner-stopped">{t.zeroGradientWarning}</p> : null}
        <p className="plane-hint">{t.activationGradientHint}</p>
      </div>
    </div>
  );
}

export const activationLabs: Record<
  "activation-shape" | "activation-compare" | "activation-gradient",
  ComponentType<LabProps>
> = {
  "activation-shape": ActivationShapeLab,
  "activation-compare": ActivationCompareLab,
  "activation-gradient": ActivationGradientLab,
};

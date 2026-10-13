"use client";

import { useState, type ComponentType } from "react";
import { getMessages } from "../../../lib/i18n/messages";
import {
  CHAIN_EXAMPLE,
  descentSteps,
  datasetGradientW,
  forwardAndBackward,
  numericGradient,
} from "../../../lib/viz/backprop";
import { TOY_DATA, datasetLoss } from "../../../lib/viz/loss";
import { formatNumber, px } from "../../../lib/viz/viewport";
import { FunctionPlot, VerticalGuide } from "../../viz/Curve";
import { Plane } from "../../viz/Plane";
import { DragHandle } from "../../viz/VectorArrow";
import { Readout, ValueInput, makeView, useHandleDrag } from "./shared";
import type { LabProps } from "./types";

/**
 * A box whose number you change by dragging it up or down.
 *
 * The graph has no coordinate axes, so a plane-style handle would not make
 * sense; these boxes are the draggable objects.
 */
function ValueBox({
  x,
  y,
  label,
  value,
  min,
  max,
  step = 0.1,
  tone,
  active,
  setActive,
  onChange,
}: {
  x: number;
  y: number;
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  tone: "input" | "param" | "computed" | "loss";
  active: boolean;
  setActive: (id: string | null) => void;
  onChange: (next: number) => void;
}) {
  const id = label;
  const clamp = (next: number) => Math.max(min, Math.min(max, next));

  return (
    <g
      className={`value-box box-${tone} ${active ? "is-active" : ""}`}
      transform={`translate(${x} ${y})`}
      role="slider"
      tabIndex={0}
      aria-label={label}
      aria-valuetext={`${label} = ${formatNumber(value, 3)}`}
      aria-valuenow={Math.round(value * 1000) / 1000}
      aria-valuemin={min}
      aria-valuemax={max}
      onPointerDown={(event) => {
        event.preventDefault();
        setActive(id);
      }}
      onPointerMove={(event) => {
        if (!active) return;
        const delta = Math.sign(event.movementY);
        if (delta !== 0) onChange(clamp(value - delta * step));
      }}
      onPointerUp={() => setActive(null)}
      onPointerCancel={() => setActive(null)}
      onKeyDown={(event) => {
        if (event.key === "ArrowUp") {
          event.preventDefault();
          onChange(clamp(value + step));
        }
        if (event.key === "ArrowDown") {
          event.preventDefault();
          onChange(clamp(value - step));
        }
      }}
    >
      <rect className="value-box-body" x={-46} y={-26} width={92} height={52} rx={8} />
      <text className="value-box-label" x={0} y={-6} textAnchor="middle">
        {label}
      </text>
      <text className="value-box-number" x={0} y={16} textAnchor="middle">
        {formatNumber(value, 3)}
      </text>
    </g>
  );
}

/** A labelled arrow between two boxes, carrying a local derivative backwards. */
function Edge({
  from,
  to,
  forward,
  backward,
}: {
  from: { x: number; y: number };
  to: { x: number; y: number };
  forward: string;
  backward: string;
}) {
  const midX = (from.x + to.x) / 2;
  return (
    <g className="graph-edge">
      <line x1={from.x + 46} y1={from.y} x2={to.x - 46} y2={to.y} />
      <polygon
        className="graph-arrow"
        points={`${to.x - 46},${to.y} ${to.x - 58},${to.y - 5} ${to.x - 58},${to.y + 5}`}
      />
      <text className="edge-forward" x={midX} y={from.y - 34} textAnchor="middle">
        {forward}
      </text>
      <text className="edge-backward" x={midX} y={from.y + 44} textAnchor="middle">
        {backward}
      </text>
    </g>
  );
}

function BackpropChainLab({ locale }: LabProps) {
  const t = getMessages(locale).labs;
  const [w, setW] = useState(0.4);
  const [b, setB] = useState(-0.2);
  const [active, setActive] = useState<string | null>(null);

  const pass = forwardAndBackward(CHAIN_EXAMPLE.x, CHAIN_EXAMPLE.y, w, b);

  return (
    <div className="plane-lab">
      <svg className="plane graph-plane" viewBox="0 0 720 330" role="img" aria-label={t.backpropChainLabel}>
        <ValueBox
          x={70}
          y={90}
          label="x"
          value={CHAIN_EXAMPLE.x}
          min={-3}
          max={3}
          tone="input"
          active={false}
          setActive={() => {}}
          onChange={() => {}}
        />
        <ValueBox
          x={70}
          y={210}
          label="w"
          value={w}
          min={-5}
          max={5}
          tone="param"
          active={active === "w"}
          setActive={setActive}
          onChange={setW}
        />
        <ValueBox
          x={70}
          y={290}
          label="b"
          value={b}
          min={-5}
          max={5}
          tone="param"
          active={active === "b"}
          setActive={setActive}
          onChange={setB}
        />

        <ValueBox
          x={280}
          y={150}
          label="z = wx + b"
          value={pass.z}
          min={-20}
          max={20}
          tone="computed"
          active={false}
          setActive={() => {}}
          onChange={() => {}}
        />
        <ValueBox
          x={480}
          y={150}
          label="ŷ = σ(z)"
          value={pass.yHat}
          min={0}
          max={1}
          tone="computed"
          active={false}
          setActive={() => {}}
          onChange={() => {}}
        />
        <ValueBox
          x={660}
          y={150}
          label="E"
          value={pass.error}
          min={0}
          max={20}
          tone="loss"
          active={false}
          setActive={() => {}}
          onChange={() => {}}
        />

        <Edge
          from={{ x: 116, y: 90 }}
          to={{ x: 234, y: 150 }}
          forward={`x = ${formatNumber(CHAIN_EXAMPLE.x, 2)}`}
          backward={`∂z/∂w = x = ${formatNumber(pass.dZdw, 2)}`}
        />
        <Edge
          from={{ x: 116, y: 290 }}
          to={{ x: 234, y: 170 }}
          forward=""
          backward={`∂z/∂b = 1`}
        />
        <Edge
          from={{ x: 326, y: 150 }}
          to={{ x: 434, y: 150 }}
          forward={`z = ${formatNumber(pass.z, 3)}`}
          backward={`∂ŷ/∂z = ŷ(1−ŷ) = ${formatNumber(pass.dYHatDz, 4)}`}
        />
        <Edge
          from={{ x: 526, y: 150 }}
          to={{ x: 614, y: 150 }}
          forward={`ŷ = ${formatNumber(pass.yHat, 3)}`}
          backward={`∂E/∂ŷ = ${formatNumber(pass.dErrorDYHat, 4)}`}
        />

        <text className="graph-heading" x={70} y={40} textAnchor="middle">
          {t.forwardPass}
        </text>
        <text className="graph-heading" x={400} y={290} textAnchor="middle">
          {t.backwardPass}
        </text>
        <text className="graph-product" x={360} y={250} textAnchor="middle">
          ∂E/∂w = ∂E/∂ŷ · ∂ŷ/∂z · ∂z/∂w = {formatNumber(pass.dErrorDw, 5)}
        </text>
      </svg>

      <div className="plane-controls">
        <ValueInput label="w" value={w} onChange={setW} step={0.1} min={-5} max={5} digits={3} />
        <ValueInput label="b" value={b} onChange={setB} step={0.1} min={-5} max={5} digits={3} />
        <Readout label="z" value={formatNumber(pass.z, 4)} />
        <Readout label="ŷ" value={formatNumber(pass.yHat, 4)} />
        <Readout label="E" value={formatNumber(pass.error, 4)} />
        <Readout label="∂E/∂ŷ" value={formatNumber(pass.dErrorDYHat, 4)} />
        <Readout label="∂ŷ/∂z" value={formatNumber(pass.dYHatDz, 4)} />
        <Readout label="∂z/∂w" value={formatNumber(pass.dZdw, 4)} />
        <Readout label="∂E/∂w" value={formatNumber(pass.dErrorDw, 5)} />
        <Readout label={t.simplifiedGradient} value={formatNumber(pass.yHat - CHAIN_EXAMPLE.y, 5)} />
        <p className="plane-hint">{t.backpropChainHint}</p>
      </div>
    </div>
  );
}

const GRADIENT_WORLD = { xMin: -2, xMax: 6, yMin: -2, yMax: 8 };

function GradientCheckLab({ locale }: LabProps) {
  const t = getMessages(locale).labs;
  const view = makeView(GRADIENT_WORLD);
  const [w, setW] = useState(3.6);

  const { svgRef, activeId, startHandle, svgHandlers, nudge } = useHandleDrag<"w">({
    view,
    onMove: (_id, point) => setW(point.x),
  });

  const analytic = datasetGradientW(TOY_DATA, w, 0);
  const numeric = numericGradient(1, 1, w, 0).dw;
  const agreement = Math.abs(analytic - numeric);

  // The tangent the gradient describes, drawn against the real curve.
  const loss = datasetLoss(TOY_DATA, w, 0);
  const tangent = (x: number) => loss + analytic * (x - w);

  return (
    <div className="plane-lab">
      <Plane view={view} label={t.gradientCheckLabel} svgRef={svgRef} {...svgHandlers}>
        <FunctionPlot
          view={view}
          value={(x) => datasetLoss(TOY_DATA, x, 0)}
          from={GRADIENT_WORLD.xMin}
          to={GRADIENT_WORLD.xMax}
          className="curve-primary"
        />
        <FunctionPlot
          view={view}
          value={tangent}
          from={w - 1.1}
          to={w + 1.1}
          className="gradient-tangent"
        />
        <VerticalGuide view={view} x={w} className="curve-guide" label={`w = ${formatNumber(w, 3)}`} />
        <DragHandle
          view={view}
          point={{ x: w, y: loss }}
          tone="sum"
          label="w"
          valueText={`w = ${formatNumber(w, 3)}`}
          active={activeId === "w"}
          onPointerDown={startHandle("w")}
          onKeyDown={nudge({ x: w, y: loss }, (next) => setW(next.x))}
        />
      </Plane>

      <div className="plane-controls">
        <ValueInput label="w" value={w} onChange={setW} step={0.05} min={GRADIENT_WORLD.xMin} max={GRADIENT_WORLD.xMax} />
        <Readout label={t.analyticGradient} value={formatNumber(analytic, 6)} />
        <Readout label={t.numericGradient} value={formatNumber(numeric, 6)} />
        <Readout label={t.gradientAgreement} value={agreement.toExponential(2)} />
        <Readout label="E(W, b)" value={formatNumber(loss, 5)} />
        <p className="plane-hint">{t.gradientCheckHint}</p>
      </div>
    </div>
  );
}

const UPDATE_WORLD = { xMin: -3, xMax: 12, yMin: -0.6, yMax: 5 };

function WeightUpdateLab({ locale }: LabProps) {
  const t = getMessages(locale).labs;
  const view = makeView(UPDATE_WORLD);
  const [startW, setStartW] = useState(-2.4);
  const [rate, setRate] = useState(0.9);

  const { svgRef, activeId, startHandle, svgHandlers, nudge } = useHandleDrag<"w">({
    view,
    onMove: (_id, point) => setStartW(point.x),
  });

  const history = descentSteps(TOY_DATA, { w: startW, b: 0 }, rate, 8);
  const startLoss = datasetLoss(TOY_DATA, startW, 0);
  const last = history[history.length - 1];
  // On a linearly separable dataset the logistic Error has no finite minimiser:
  // it keeps pushing |w| up. So a large α does not diverge — it runs away to a
  // huge weight with an almost-zero Error and a wildly overconfident model.
  // Measured: α = 6 ends at w ≈ 6.6 and α = 100000 at w ≈ 145022; both fall.
  const stepSize = Math.abs((history[1]?.w ?? startW) - startW);
  const runaway = Math.abs(last.w) > 20;
  const improved = last.error <= startLoss;

  return (
    <div className="plane-lab">
      <Plane view={view} label={t.weightUpdateLabel} svgRef={svgRef} {...svgHandlers}>
        <FunctionPlot
          view={view}
          value={(x) => datasetLoss(TOY_DATA, x, 0)}
          from={UPDATE_WORLD.xMin}
          to={UPDATE_WORLD.xMax}
          className="curve-primary"
        />
        {/* Each step is a dot on the curve, so overshoot is visible as a jump. */}
        {history.map((step) => {
          if (!Number.isFinite(step.error) || Math.abs(step.w) > 40) return null;
          const screen = view.toScreen({ x: step.w, y: step.error });
          return (
            <g key={step.index} className={`update-step ${runaway ? "is-diverging" : ""}`}>
              <circle cx={px(screen.x)} cy={px(screen.y)} r={step.index === 0 ? 7 : 5} />
              <text x={px(screen.x)} y={px(screen.y - 13)} textAnchor="middle">
                {step.index}
              </text>
            </g>
          );
        })}
        <DragHandle
          view={view}
          point={{ x: startW, y: startLoss }}
          tone="sum"
          label={t.startHandle}
          valueText={`w = ${formatNumber(startW, 3)}`}
          active={activeId === "w"}
          onPointerDown={startHandle("w")}
          onKeyDown={nudge({ x: startW, y: startLoss }, (next) => setStartW(next.x))}
        />
      </Plane>

      <div className="plane-controls">
        <label className="plane-slider">
          α = <strong>{formatNumber(rate, 2)}</strong>
          <input
            type="range"
            min={0.05}
            max={3}
            step={0.05}
            value={rate}
            onChange={(event) => setRate(Number(event.target.value))}
          />
        </label>
        <ValueInput label={t.startHandle} value={startW} onChange={setStartW} step={0.1} min={UPDATE_WORLD.xMin} max={UPDATE_WORLD.xMax} />
        <Readout label={t.startError} value={formatNumber(startLoss, 5)} />
        <Readout label={t.gradientNow} value={formatNumber(history[0].gradient, 5)} />
        <Readout label={t.stepSize} value={formatNumber(stepSize, 4)} />
        <Readout label={t.afterOneStep} value={formatNumber(history[1]?.w ?? startW, 5)} />
        <Readout label={t.finalError} value={formatNumber(last.error, 6)} />
        <Readout label={t.reachedWeight} value={formatNumber(last.w, 2)} />
        <Readout
          label={t.runOutcome}
          value={runaway ? t.outcomeRunaway : improved ? t.outcomeConverging : t.outcomeStalled}
        />
        {runaway ? <p className="py-banner py-banner-failed">{t.runawayWarning}</p> : null}
        <p className="plane-hint">{t.weightUpdateHint}</p>
      </div>
    </div>
  );
}

export const backpropLabs: Record<
  "backprop-chain" | "gradient-check" | "weight-update",
  ComponentType<LabProps>
> = {
  "backprop-chain": BackpropChainLab,
  "gradient-check": GradientCheckLab,
  "weight-update": WeightUpdateLab,
};

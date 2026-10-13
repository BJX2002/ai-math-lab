"use client";

import { useState, type ComponentType } from "react";
import { getMessages } from "../../../lib/i18n/messages";
import {
  TOY_DATA,
  binaryCrossEntropy,
  datasetAccuracy,
  datasetLoss,
  discreteError,
  logisticProbability,
  lossGrid,
  squaredError,
} from "../../../lib/viz/loss";
import { formatNumber, px } from "../../../lib/viz/viewport";
import { FunctionPlot, StepPlot, VerticalGuide } from "../../viz/Curve";
import { Plane } from "../../viz/Plane";
import { DragHandle } from "../../viz/VectorArrow";
import { Readout, ValueInput, makeView, useHandleDrag } from "./shared";
import type { LabProps } from "./types";

const CURVE_WORLD = { xMin: 0, xMax: 1, yMin: 0, yMax: 6 };
const GRID_STEPS = 30;

function useProbability(initial: number, view: ReturnType<typeof makeView>) {
  const [p, setP] = useState(initial);
  const { svgRef, activeId, startHandle, svgHandlers, nudge } = useHandleDrag<"p">({
    view,
    onMove: (_id, point) =>
      setP(Math.min(0.999, Math.max(0.001, point.x))),
  });

  const handle = (
    <DragHandle
      view={view}
      point={{ x: p, y: 0 }}
      tone="sum"
      label="p"
      valueText={`p = ${formatNumber(p, 3)}`}
      active={activeId === "p"}
      onPointerDown={startHandle("p")}
      onKeyDown={nudge({ x: p, y: 0 }, (next) => setP(Math.min(0.999, Math.max(0.001, next.x))))}
    />
  );

  return { p, setP, svgRef, svgHandlers, handle };
}

function CrossEntropyLab({ locale }: LabProps) {
  const t = getMessages(locale).labs;
  const view = makeView(CURVE_WORLD);
  const { p, setP, svgRef, svgHandlers, handle } = useProbability(0.35, view);

  const whenTrue = binaryCrossEntropy(p, 1);
  const whenFalse = binaryCrossEntropy(p, 0);

  return (
    <div className="plane-lab">
      <Plane view={view} label={t.lossCrossEntropyLabel} svgRef={svgRef} {...svgHandlers}>
        <FunctionPlot
          view={view}
          value={(x) => binaryCrossEntropy(x, 1)}
          from={0.002}
          to={1}
          className="loss-curve-is-true"
        />
        <FunctionPlot
          view={view}
          value={(x) => binaryCrossEntropy(x, 0)}
          from={0}
          to={0.998}
          className="loss-curve-is-false"
        />
        <VerticalGuide view={view} x={p} className="curve-guide" label={`p = ${formatNumber(p, 3)}`} />
        {handle}
      </Plane>

      <div className="plane-controls">
        <ValueInput label="p" value={p} onChange={setP} step={0.01} min={0.001} max={0.999} digits={3} />
        <Readout label={t.lossWhenTrue} value={formatNumber(whenTrue, 4)} />
        <Readout label={t.lossWhenFalse} value={formatNumber(whenFalse, 4)} />
        <Readout label={t.examScore} value={formatNumber(p, 3)} />
        <Readout label={t.discreteErrorLabel} value={formatNumber(discreteError(p, 1), 0)} />
        <p className="plane-hint">{t.lossCrossEntropyHint}</p>
      </div>
    </div>
  );
}

function LossCompareLab({ locale }: LabProps) {
  const t = getMessages(locale).labs;
  const view = makeView({ xMin: 0, xMax: 1, yMin: 0, yMax: 3 });
  const { p, setP, svgRef, svgHandlers, handle } = useProbability(0.3, view);

  return (
    <div className="plane-lab">
      <Plane view={view} label={t.lossCompareLabel} svgRef={svgRef} {...svgHandlers}>
        {/* The discrete error is a step: flat, and therefore useless as a signal. */}
        <StepPlot
          view={view}
          threshold={1}
          low={1}
          high={0}
          from={0}
          to={1}
          className="loss-curve-discrete"
          riserClassName="curve-step-riser"
        />
        <FunctionPlot
          view={view}
          value={(x) => squaredError(x, 1)}
          from={0}
          to={1}
          className="loss-curve-mse"
        />
        <FunctionPlot
          view={view}
          value={(x) => binaryCrossEntropy(x, 1)}
          from={0.002}
          to={1}
          className="loss-curve-is-true"
        />
        <VerticalGuide view={view} x={p} className="curve-guide" label={`p = ${formatNumber(p, 3)}`} />
        {handle}
      </Plane>

      <div className="plane-controls">
        <ValueInput label="p" value={p} onChange={setP} step={0.01} min={0.001} max={0.999} digits={3} />
        <Readout label={t.discreteErrorLabel} value={formatNumber(discreteError(p, 1), 0)} />
        <Readout label={t.crossEntropyLabel} value={formatNumber(binaryCrossEntropy(p, 1), 4)} />
        <Readout label={t.squaredErrorLabel} value={formatNumber(squaredError(p, 1), 4)} />
        <Readout
          label={t.crossEntropySlope}
          value={formatNumber(-1 / Math.max(p, 1e-3), 2)}
        />
        <p className="plane-hint">{t.lossCompareHint}</p>
      </div>
    </div>
  );
}

const SURFACE_WORLD = { xMin: -2, xMax: 6, yMin: -6, yMax: 6 };

function LossSurfaceLab({ locale }: LabProps) {
  const t = getMessages(locale).labs;
  const view = makeView(SURFACE_WORLD);
  const [w, setW] = useState(-1.4);
  const [b, setB] = useState(-0.6);
  const [active, setActive] = useState(false);

  const grid = lossGrid(TOY_DATA, [SURFACE_WORLD.xMin, SURFACE_WORLD.xMax], [SURFACE_WORLD.yMin, SURFACE_WORLD.yMax], GRID_STEPS);
  const cellW = (SURFACE_WORLD.xMax - SURFACE_WORLD.xMin) / GRID_STEPS;
  const cellH = (SURFACE_WORLD.yMax - SURFACE_WORLD.yMin) / GRID_STEPS;
  const span = Math.max(1e-9, grid.max - grid.min);

  const loss = datasetLoss(TOY_DATA, w, b);
  const accuracy = datasetAccuracy(TOY_DATA, w, b);

  // The logistic curve for the current parameters, in the panel's own pixels:
  // x runs -2.5..2.5 across 40 px per unit, probability 0..1 up 96 px.
  const fitPath = Array.from({ length: 41 }, (_, index) => {
    const x = -2.5 + (index * 5) / 40;
    const p = logisticProbability(x, w, b);
    return `${index === 0 ? "M" : "L"} ${(110 + x * 40).toFixed(1)} ${(116 - p * 96).toFixed(1)}`;
  }).join(" ");

  return (
    <div className="plane-lab loss-surface-lab">
      <Plane
        view={view}
        label={t.lossSurfaceLabel}
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId);
          setActive(true);
        }}
        onPointerMove={(event) => {
          if (!active) return;
          const rect = event.currentTarget.getBoundingClientRect();
          const x = SURFACE_WORLD.xMin + ((event.clientX - rect.left) / rect.width) * (SURFACE_WORLD.xMax - SURFACE_WORLD.xMin);
          const y = SURFACE_WORLD.yMax - ((event.clientY - rect.top) / rect.height) * (SURFACE_WORLD.yMax - SURFACE_WORLD.yMin);
          setW(Math.min(SURFACE_WORLD.xMax, Math.max(SURFACE_WORLD.xMin, x)));
          setB(Math.min(SURFACE_WORLD.yMax, Math.max(SURFACE_WORLD.yMin, y)));
        }}
        onPointerUp={() => setActive(false)}
        onPointerCancel={() => setActive(false)}
      >
        {grid.values.map((row, rowIndex) =>
          row.map((value, columnIndex) => {
            const top = SURFACE_WORLD.yMax - rowIndex * cellH;
            const left = SURFACE_WORLD.xMin + columnIndex * cellW;
            const a = view.toScreen({ x: left, y: top });
            const corner = view.toScreen({ x: left + cellW, y: top - cellH });
            // Darker means a larger error, so the low-loss valley reads as light.
            const shade = Math.max(0, Math.min(1, (value - grid.min) / span));
            return (
              <rect
                key={`${rowIndex}-${columnIndex}`}
                className="surface-cell"
                x={px(Math.min(a.x, corner.x))}
                y={px(Math.min(a.y, corner.y))}
                width={px(Math.abs(corner.x - a.x) + 0.6)}
                height={px(Math.abs(corner.y - a.y) + 0.6)}
                fill={`rgba(11, 117, 112, ${(shade * 0.85).toFixed(3)})`}
              />
            );
          }),
        )}
        <DragHandle
          view={view}
          point={{ x: w, y: b }}
          tone="sum"
          label={`${t.parameters}: w, b`}
          valueText={`w = ${formatNumber(w, 2)}, b = ${formatNumber(b, 2)}`}
          active={false}
          onPointerDown={() => setActive(true)}
          onKeyDown={(event) => {
            const step = 0.1;
            if (event.key === "ArrowLeft") {
              event.preventDefault();
              setW((value) => value - step);
            }
            if (event.key === "ArrowRight") {
              event.preventDefault();
              setW((value) => value + step);
            }
            if (event.key === "ArrowUp") {
              event.preventDefault();
              setB((value) => value + step);
            }
            if (event.key === "ArrowDown") {
              event.preventDefault();
              setB((value) => value - step);
            }
          }}
        />
      </Plane>

      {/* The data and the fit it produces, in its own space. */}
      <svg className="fit-panel" viewBox="0 0 220 150" role="img" aria-label={t.fitPanelLabel}>
        <rect className="fit-frame" x={1} y={1} width={218} height={148} rx={6} />
        {[0, 1].map((line) => (
          <line key={line} className="fit-rule" x1={16} y1={20 + line * 96} x2={204} y2={20 + line * 96} />
        ))}
        {TOY_DATA.map((point, index) => {
          const x = 110 + point.x * 40;
          const y = 116 - point.y * 96;
          return <circle key={index} className={`fit-point y-${point.y}`} cx={x} cy={y} r={6} />;
        })}
        {/* The data and the logistic fit these parameters produce, in their own space. */}
        <path className="fit-curve" d={fitPath} />
      </svg>

      <div className="plane-controls">
        <ValueInput label="w" value={w} onChange={setW} step={0.1} min={SURFACE_WORLD.xMin} max={SURFACE_WORLD.xMax} />
        <ValueInput label="b" value={b} onChange={setB} step={0.1} min={SURFACE_WORLD.yMin} max={SURFACE_WORLD.yMax} />
        <Readout label={t.errorValue} value={formatNumber(loss, 4)} />
        <Readout label={t.accuracyLabel} value={`${formatNumber(accuracy * 100, 0)}%`} />
        <Readout label={t.bestError} value={formatNumber(grid.min, 4)} />
        <p className="plane-hint">{t.lossSurfaceHint}</p>
      </div>
    </div>
  );
}

export const lossLabs: Record<
  "loss-cross-entropy" | "loss-compare" | "loss-surface",
  ComponentType<LabProps>
> = {
  "loss-cross-entropy": CrossEntropyLab,
  "loss-compare": LossCompareLab,
  "loss-surface": LossSurfaceLab,
};

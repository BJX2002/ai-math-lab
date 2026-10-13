"use client";

import { useState, type ComponentType } from "react";
import { getMessages } from "../../../lib/i18n/messages";
import {
  hessianCondition,
  loss2,
  miniBatchTrain,
  scaledData,
} from "../../../lib/viz/train";
import { formatNumber, px } from "../../../lib/viz/viewport";
import { Plane } from "../../viz/Plane";
import { DragHandle } from "../../viz/VectorArrow";
import { Readout, ValueInput, makeView, useHandleDrag } from "./shared";
import type { LabProps } from "./types";

const BATCH_SIZES = [1, 2, 4, 8, 16];

/**
 * A draggable read-off along a loss trace.
 *
 * The sliders choose the run; this is the figure's own handle, so a reader can
 * pick an update and read the Error there — and do it from the keyboard, one
 * update per arrow press.
 */
function TraceScrubber({
  history,
  peak,
  padding,
  plotWidth,
  plotHeight,
  index,
  label,
  onPick,
}: {
  history: { update: number; loss: number }[];
  peak: number;
  padding: { left: number; top: number };
  plotWidth: number;
  plotHeight: number;
  index: number;
  label: string;
  onPick: (next: number) => void;
}) {
  const clamped = Math.max(0, Math.min(index, history.length - 1));
  const point = history[clamped];
  const last = history[history.length - 1].update || 1;
  const x = padding.left + (point.update / last) * plotWidth;
  const y = padding.top + plotHeight - (point.loss / peak) * plotHeight;

  const pickFromEvent = (event: React.PointerEvent<SVGGElement>) => {
    const svg = event.currentTarget.ownerSVGElement;
    if (!svg) return;
    const box = svg.getBoundingClientRect();
    const viewX = ((event.clientX - box.left) / box.width) * svg.viewBox.baseVal.width;
    const ratio = (viewX - padding.left) / plotWidth;
    onPick(Math.round(Math.max(0, Math.min(1, ratio)) * (history.length - 1)));
  };

  return (
    <g
      className="trace-scrubber"
      role="slider"
      tabIndex={0}
      aria-label={label}
      aria-valuetext={`update ${point.update}: E = ${point.loss.toFixed(5)}`}
      aria-valuenow={point.update}
      aria-valuemin={0}
      aria-valuemax={last}
      onPointerDown={(event) => {
        event.preventDefault();
        event.currentTarget.setPointerCapture(event.pointerId);
        pickFromEvent(event);
      }}
      onPointerMove={(event) => {
        if (event.currentTarget.hasPointerCapture(event.pointerId)) pickFromEvent(event);
      }}
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          onPick(Math.max(0, clamped - 1));
        }
        if (event.key === "ArrowRight") {
          event.preventDefault();
          onPick(Math.min(history.length - 1, clamped + 1));
        }
      }}
    >
      <circle className="handle-hit" cx={x} cy={y} r={18} />
      <circle className="trace-dot" cx={x} cy={y} r={6} />
      <text className="trace-label" x={x} y={y - 13} textAnchor="middle">
        {point.update}
      </text>
    </g>
  );
}

function EpochBatchLab({ locale }: LabProps) {
  const t = getMessages(locale).labs;
  const [batchSize, setBatchSize] = useState(4);
  const [rate, setRate] = useState(0.5);
  const [scrub, setScrub] = useState(6);

  const data = scaledData(1);
  const result = miniBatchTrain(data, { rate, batchSize, epochs: 6, seed: 7 });
  const peak = Math.max(...result.history.map((point) => point.loss), 1e-6);

  const width = 460;
  const height = 240;
  const padding = { left: 48, right: 16, top: 18, bottom: 30 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;
  const maxUpdate = Math.max(1, result.history.at(-1)?.update ?? 1);

  const path = result.history
    .map((point, index) => {
      const x = padding.left + (point.update / maxUpdate) * plotWidth;
      const y = padding.top + plotHeight - (point.loss / peak) * plotHeight;
      return `${index === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <div className="plane-lab">
      <svg className="plane shape-plane" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={t.epochBatchLabel}>
        <line className="loss-axis" x1={padding.left} y1={padding.top + plotHeight} x2={width - padding.right} y2={padding.top + plotHeight} />
        <line className="loss-axis" x1={padding.left} y1={padding.top} x2={padding.left} y2={padding.top + plotHeight} />
        <path className="train-curve" d={path} />
        {result.history.map((point, index) => {
          const x = padding.left + (point.update / maxUpdate) * plotWidth;
            // Epoch boundaries are marked so the reader can count them off.
          const boundary = index > 0 && point.epoch !== result.history[index - 1].epoch;
          return boundary ? (
            <line key={index} className="epoch-rule" x1={x} y1={padding.top} x2={x} y2={padding.top + plotHeight} />
          ) : null;
        })}
        <text className="shape-caption" x={padding.left} y={12}>
          E(W, b) →  {formatNumber(result.history.at(-1)?.loss ?? 0, 4)}
        </text>
        <TraceScrubber
          history={result.history}
          peak={peak}
          padding={padding}
          plotWidth={plotWidth}
          plotHeight={plotHeight}
          index={scrub}
          label={t.readOffUpdate}
          onPick={setScrub}
        />
        <text className="shape-caption" x={width - padding.right} y={height - 8} textAnchor="end">
          {t.updatesAxis}
        </text>
      </svg>

      <div className="plane-controls">
        <label className="plane-slider">
          {t.batchSizeLabel} B = <strong>{batchSize}</strong>
          <input
            type="range"
            min={0}
            max={BATCH_SIZES.length - 1}
            step={1}
            value={BATCH_SIZES.indexOf(batchSize)}
            onChange={(event) => setBatchSize(BATCH_SIZES[Number(event.target.value)])}
          />
        </label>
        <label className="plane-slider">
          α = <strong>{formatNumber(rate, 2)}</strong>
          <input
            type="range"
            min={0.05}
            max={2}
            step={0.05}
            value={rate}
            onChange={(event) => setRate(Number(event.target.value))}
          />
        </label>
        <Readout label={t.datasetSize} value={String(data.length)} />
        <Readout label={t.updatesPerEpoch} value={String(result.updatesPerEpoch)} />
        <Readout label={t.totalUpdates} value={String(result.history.at(-1)?.update ?? 0)} />
        <Readout label={t.trainingFinalError} value={formatNumber(result.history.at(-1)?.loss ?? 0, 5)} />
        <ValueInput label={t.batchSizeLabel} value={batchSize} onChange={setBatchSize} step={1} min={1} max={16} digits={0} />
        <p className="plane-hint">{t.epochBatchHint}</p>
      </div>
    </div>
  );
}

function TrainingCurveLab({ locale }: LabProps) {
  const t = getMessages(locale).labs;
  const [rate, setRate] = useState(0.5);
  const [batchSize, setBatchSize] = useState(2);
  const [scrub, setScrub] = useState(4);

  const data = scaledData(1);
  const result = miniBatchTrain(data, { rate, batchSize, epochs: 20, seed: 3 });

  return (
    <div className="plane-lab">
      <svg className="plane shape-plane" viewBox="0 0 460 200" role="img" aria-label={t.trainingCurveLabel}>
        <line className="loss-axis" x1={48} y1={160} x2={444} y2={160} />
        <line className="loss-axis" x1={48} y1={18} x2={48} y2={160} />
        <path
          className="train-curve"
          d={result.history
            .map((point, index) => {
              const span = Math.max(1, result.history[result.history.length - 1].update);
              const top = Math.max(...result.history.map((entry) => entry.loss), 1e-6);
              const x = 48 + (point.update / span) * 396;
              const y = 160 - (point.loss / top) * 142;
              return `${index === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
            })
            .join(" ")}
        />
        <TraceScrubber
          history={result.history}
          peak={Math.max(...result.history.map((entry) => entry.loss), 1e-6)}
          padding={{ left: 48, top: 18 }}
          plotWidth={396}
          plotHeight={142}
          index={scrub}
          label={t.readOffUpdate}
          onPick={setScrub}
        />
        <text className="shape-caption" x={48} y={12}>
          E(W, b) → {formatNumber(result.history[result.history.length - 1].loss, 4)}
        </text>
      </svg>

      <svg className="plane fit-panel" viewBox="0 0 300 220" role="img" aria-label={t.decisionBoundaryLabel}>
        <rect className="fit-frame" x={1} y={1} width={298} height={218} rx={6} />
        {[-1.5, 0, 1.5].map((value) => (
          <line key={value} className="fit-rule" x1={20} y1={110 - value * 56} x2={280} y2={110 - value * 56} />
        ))}
        {data.map((sample, index) => (
          <circle
            key={index}
            className={`fit-point y-${sample.y}`}
            cx={150 + sample.features[0] * 80}
            cy={110 - sample.features[1] * 56}
            r={6}
          />
        ))}
        {/* The decision boundary w1 x1 + w2 x2 = 0, drawn as a line through the origin. */}
        {Math.abs(result.weights[1]) > 1e-6 ? (
          <line
            className="boundary-line"
            x1={150 + -2 * 80}
            y1={110 - ((-result.weights[0] * -2) / result.weights[1]) * 56}
            x2={150 + 2 * 80}
            y2={110 - ((-result.weights[0] * 2) / result.weights[1]) * 56}
          />
        ) : null}
      </svg>

      <div className="plane-controls">
        <label className="plane-slider">
          α = <strong>{formatNumber(rate, 2)}</strong>
          <input
            type="range"
            min={0.05}
            max={2}
            step={0.05}
            value={rate}
            onChange={(event) => setRate(Number(event.target.value))}
          />
        </label>
        <label className="plane-slider">
          {t.batchSizeLabel} B = <strong>{batchSize}</strong>
          <input
            type="range"
            min={0}
            max={BATCH_SIZES.length - 1}
            step={1}
            value={BATCH_SIZES.indexOf(batchSize)}
            onChange={(event) => setBatchSize(BATCH_SIZES[Number(event.target.value)])}
          />
        </label>
        <Readout label={t.epochsRun} value="20" />
        <Readout label={t.totalUpdates} value={String(result.history.at(-1)?.update ?? 0)} />
        <Readout label={t.trainingFinalError} value={formatNumber(result.history.at(-1)?.loss ?? 0, 5)} />
        <Readout label="w₁" value={formatNumber(result.weights[0], 4)} />
        <Readout label="w₂" value={formatNumber(result.weights[1], 4)} />
        <ValueInput label={t.batchSizeLabel} value={batchSize} onChange={setBatchSize} step={1} min={1} max={16} digits={0} />
        <p className="plane-hint">{t.trainingCurveHint}</p>
      </div>
    </div>
  );
}

const SURFACE_WORLD = { xMin: -6, xMax: 6, yMin: -6, yMax: 6 };
const CELLS = 26;

function NormalizationLab({ locale }: LabProps) {
  const t = getMessages(locale).labs;
  const view = makeView(SURFACE_WORLD);
  const [scale, setScale] = useState(1);
  const [point, setPoint] = useState({ x: 2, y: 0 });

  const { svgRef, activeId, startHandle, svgHandlers, nudge } = useHandleDrag<"point">({
    view,
    onMove: (_id, next) => setPoint(next),
  });

  const data = scaledData(scale);
  const cellW = (SURFACE_WORLD.xMax - SURFACE_WORLD.xMin) / CELLS;
  const cellH = (SURFACE_WORLD.yMax - SURFACE_WORLD.yMin) / CELLS;

  // Sample the real loss over the parameter plane.
  const values: number[][] = [];
  let min = Number.POSITIVE_INFINITY;
  let max = Number.NEGATIVE_INFINITY;
  for (let row = 0; row <= CELLS; row += 1) {
    const w1 = SURFACE_WORLD.xMin + ((SURFACE_WORLD.xMax - SURFACE_WORLD.xMin) * row) / CELLS;
    const line: number[] = [];
    for (let column = 0; column <= CELLS; column += 1) {
      const w2 = SURFACE_WORLD.yMin + ((SURFACE_WORLD.yMax - SURFACE_WORLD.yMin) * column) / CELLS;
      const value = loss2(data, w1, w2);
      line.push(value);
      if (value < min) min = value;
      if (value > max) max = value;
    }
    values.push(line);
  }
  const span = Math.max(1e-9, max - min);
  const condition = hessianCondition(data, 0, 0);

  // How far the near-flat region reaches along each axis, an honest visual proxy.
  const plateau = min + span * 0.15;

  return (
    <div className="plane-lab loss-surface-lab">
      <Plane view={view} label={t.normalizationLabel} svgRef={svgRef} {...svgHandlers}>
        {values.map((row, rowIndex) =>
          row.map((value, columnIndex) => {
            if (value > plateau) return null;
            const top = SURFACE_WORLD.yMax - rowIndex * cellH;
            const left = SURFACE_WORLD.xMin + columnIndex * cellW;
            const a = view.toScreen({ x: left, y: top });
            const corner = view.toScreen({ x: left + cellW, y: top - cellH });
            return (
              <rect
                key={`${rowIndex}-${columnIndex}`}
                className="surface-cell"
                x={px(Math.min(a.x, corner.x))}
                y={px(Math.min(a.y, corner.y))}
                width={px(Math.abs(corner.x - a.x) + 0.6)}
                height={px(Math.abs(corner.y - a.y) + 0.6)}
                fill={`rgba(11, 117, 112, ${(0.25 + 0.6 * (1 - (value - min) / span)).toFixed(3)})`}
              />
            );
          }),
        )}
        <DragHandle
          view={view}
          point={point}
          tone="sum"
          label={t.parameterPoint}
          valueText={`w₁ = ${formatNumber(point.x, 2)}, w₂ = ${formatNumber(point.y, 2)}`}
          active={activeId === "point"}
          onPointerDown={startHandle("point")}
          onKeyDown={nudge(point, setPoint)}
        />
      </Plane>

      <div className="plane-controls">
        <label className="plane-slider">
          {t.featureScale} = <strong>{formatNumber(scale, 2)}</strong>
          <input
            type="range"
            min={0.25}
            max={8}
            step={0.25}
            value={scale}
            onChange={(event) => setScale(Number(event.target.value))}
          />
        </label>
        <ValueInput label={t.featureScale} value={scale} onChange={setScale} step={0.25} min={0.25} max={8} />
        <Readout
          label={t.conditionNumber}
          value={Number.isFinite(condition) ? formatNumber(condition, 1) : "∞"}
        />
        <Readout label={t.lowErrorRegion} value={t.lowErrorShape} />
        <Readout label={t.errorHere} value={formatNumber(loss2(data, point.x, point.y), 5)} />
        <Readout label={t.warningSign} value={condition > 20 ? t.illConditioned : t.wellConditioned} />
        {condition > 20 ? <p className="py-banner py-banner-failed">{t.normalizationWarning}</p> : null}
        <p className="plane-hint">{t.normalizationHint}</p>
      </div>
    </div>
  );
}

export const trainLabs: Record<
  "epoch-batch" | "training-curve" | "normalization",
  ComponentType<LabProps>
> = {
  "epoch-batch": EpochBatchLab,
  "training-curve": TrainingCurveLab,
  normalization: NormalizationLab,
};

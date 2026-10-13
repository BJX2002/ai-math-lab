"use client";

import { useState, type ComponentType } from "react";
import { getMessages } from "../../../lib/i18n/messages";
import {
  DEFAULT_BOWL,
  contourEllipse,
  descendBowl,
  descendLine,
  diverged as runDiverged,
  quarticGradient,
  quarticLoss,
  sampleFunction,
  stabilityLimit,
  type Bowl,
} from "../../../lib/viz/descent";
import { formatNumber, px, type Point } from "../../../lib/viz/viewport";
import { Plane } from "../../viz/Plane";
import { DragHandle } from "../../viz/VectorArrow";
import { CoordinateInputs, Readout, makeView, useHandleDrag } from "./shared";
import type { LabProps } from "./types";

const CONTOUR_WORLD = { xMin: -6, xMax: 6, yMin: -4.5, yMax: 4.5 };
const TRAJECTORY_STEPS = 18;
/** Beyond this the run has clearly escaped; drawing further only makes huge numbers. */
const ESCAPE_BOUND = 40;

/** Points up to the first one that leaves the drawing area. */
function visiblePath(points: Point[]): Point[] {
  const path: Point[] = [];
  for (const point of points) {
    path.push(point);
    if (Math.abs(point.x) > ESCAPE_BOUND || Math.abs(point.y) > ESCAPE_BOUND) break;
  }
  return path;
}

function Polyline({
  view,
  points,
  className,
}: {
  view: ReturnType<typeof makeView>;
  points: Point[];
  className: string;
}) {
  if (points.length < 2) return null;
  return (
    <polyline
      className={className}
      points={points
        .map((point) => {
          const screen = view.toScreen(point);
          return `${px(screen.x)},${px(screen.y)}`;
        })
        .join(" ")}
    />
  );
}

function ContourBowlLab({ locale }: LabProps) {
  const t = getMessages(locale).labs;
  const view = makeView(CONTOUR_WORLD);
  const bowl: Bowl = DEFAULT_BOWL;
  const [start, setStart] = useState<Point>({ x: -5, y: 3.4 });
  const [rate, setRate] = useState(0.2);

  const { svgRef, activeId, startHandle, svgHandlers, nudge } = useHandleDrag<"start">({
    view,
    onMove: (_id, point) => setStart(point),
  });

  const history = descendBowl(bowl, start, rate, TRAJECTORY_STEPS);
  const escaped = runDiverged(history);
  const limit = stabilityLimit(bowl);
  const tooFast = rate >= limit;

  const levels = [0.5, 2, 5, 9, 14, 20, 27];

  return (
    <div className="plane-lab">
      <Plane view={view} label={t.descentContourLabel} svgRef={svgRef} {...svgHandlers}>
        {levels.map((level) => (
          <Polyline
            key={level}
            view={view}
            points={contourEllipse(bowl, level)}
            className="contour-line"
          />
        ))}
        <Polyline
          view={view}
          points={visiblePath(history.map((step) => step.point))}
          className={escaped ? "descent-path is-diverging" : "descent-path"}
        />
        {history.slice(0, 12).map((step) => {
          const screen = view.toScreen(step.point);
          if (Math.abs(step.point.x) > ESCAPE_BOUND || Math.abs(step.point.y) > ESCAPE_BOUND) return null;
          return (
            <circle key={step.index} className="descent-step" cx={px(screen.x)} cy={px(screen.y)} r={4} />
          );
        })}
        <DragHandle
          view={view}
          point={start}
          tone="sum"
          label={t.startHandle}
          valueText={`(${formatNumber(start.x, 2)}, ${formatNumber(start.y, 2)})`}
          active={activeId === "start"}
          onPointerDown={startHandle("start")}
          onKeyDown={nudge(start, setStart)}
        />
      </Plane>

      <div className="plane-controls">
        <label className="plane-slider">
          {t.learningRate}: <strong>{formatNumber(rate, 2)}</strong>
          <input
            type="range"
            min={0.02}
            max={1.2}
            step={0.02}
            value={rate}
            onChange={(event) => setRate(Number(event.target.value))}
          />
        </label>
        <Readout label={t.startLoss} value={formatNumber(history[0].loss, 3)} />
        <Readout label={t.finalLoss} value={formatNumber(history.at(-1)!.loss, 3)} />
        <Readout label={t.stabilityLimit} value={formatNumber(limit, 2)} />
        <Readout label={t.runOutcome} value={escaped ? t.outcomeDiverged : t.outcomeConverging} />
        <CoordinateInputs labels={[t.coordX, t.coordY]} point={start} onChange={setStart} />
        {tooFast ? <p className="py-banner py-banner-failed">{t.rateTooFast}</p> : null}
        <p className="plane-hint">{t.contourHint}</p>
      </div>
    </div>
  );
}

function DescentCurveLab({ locale }: LabProps) {
  const t = getMessages(locale).labs;
  const view = makeView({ xMin: -2.6, xMax: 2.6, yMin: -4, yMax: 4 });
  const [start, setStart] = useState<Point>({ x: -2.1, y: 0 });
  const [rate, setRate] = useState(0.05);

  const { svgRef, activeId, startHandle, svgHandlers, nudge } = useHandleDrag<"start">({
    view,
    // Only x matters on this figure; the handle slides along the curve.
    onMove: (_id, point) => setStart({ x: point.x, y: quarticLoss(point.x) }),
  });

  const history = descendLine(quarticLoss, quarticGradient, start.x, rate, 24);
  const escaped = Math.abs(history.at(-1)!.x) > 1e5;

  // The handle sits on the curve, so dragging is choosing a starting x.
  const handlePoint = { x: start.x, y: quarticLoss(start.x) };
  const stepPoints = history
    .filter((step) => Number.isFinite(step.loss) && Math.abs(step.x) < 3)
    .map((step) => ({ x: step.x, y: step.loss }));

  return (
    <div className="plane-lab">
      <Plane view={view} label={t.descentCurveLabel} svgRef={svgRef} {...svgHandlers}>
        <Polyline
          view={view}
          points={sampleFunction(quarticLoss, -2.6, 2.6, 260)}
          className="loss-curve-line"
        />
        {/* Three stationary points: two valleys and the hill between them. */}
        <polyline
          className="loss-axis"
          points={[view.toScreen({ x: -2.6, y: 0 }), view.toScreen({ x: 2.6, y: 0 })].map(
            (point) => `${px(point.x)},${px(point.y)}`,
          ).join(" ")}
        />
        {stepPoints.map((point, index) => {
          const screen = view.toScreen(point);
          return (
            <circle
              key={index}
              className={`descent-step step-${Math.min(index, 6)}`}
              cx={px(screen.x)}
              cy={px(screen.y)}
              r={index === 0 ? 6 : 4}
            />
          );
        })}
        <DragHandle
          view={view}
          point={handlePoint}
          tone="sum"
          label={t.startHandle}
          valueText={`x = ${formatNumber(start.x, 3)}`}
          active={activeId === "start"}
          onPointerDown={startHandle("start")}
          onKeyDown={nudge(handlePoint, (next) => setStart({ x: next.x, y: quarticLoss(next.x) }))}
        />
      </Plane>

      <div className="plane-controls">
        <label className="plane-slider">
          {t.learningRate}: <strong>{formatNumber(rate, 3)}</strong>
          <input
            type="range"
            min={0.005}
            max={0.2}
            step={0.005}
            value={rate}
            onChange={(event) => setRate(Number(event.target.value))}
          />
        </label>
        <Readout label={t.startLoss} value={formatNumber(quarticLoss(start.x), 3)} />
        <Readout label={t.finalLoss} value={escaped ? t.outcomeDiverged : formatNumber(history.at(-1)!.loss, 4)} />
        <Readout label={t.landedAt} value={escaped ? "—" : formatNumber(history.at(-1)!.x, 4)} />
        <Readout label={t.runOutcome} value={escaped ? t.outcomeDiverged : t.outcomeConverging} />
        <p className="plane-hint">{t.curveHint}</p>
      </div>
    </div>
  );
}

const RATE_LABELS = [0.1, 0.9, 1.1];

function DescentRatesLab({ locale }: LabProps) {
  const t = getMessages(locale).labs;
  const view = makeView({ xMin: -3.2, xMax: 3.2, yMin: -1, yMax: 10 });
  const [start, setStart] = useState<Point>({ x: 1.6, y: 2.56 });

  const { svgRef, activeId, startHandle, svgHandlers, nudge } = useHandleDrag<"start">({
    view,
    onMove: (_id, point) => setStart({ x: point.x, y: point.x * point.x }),
  });

  const series = RATE_LABELS.map((rate) => ({
    rate,
    steps: descendLine((x) => x * x, (x) => 2 * x, start.x, rate, 14),
  }));

  const verdict = (steps: { x: number; loss: number }[]) => {
    if (steps.length < 3) return t.outcomeConverging;
    const last = steps.at(-1)!;
    if (!Number.isFinite(last.loss) || Math.abs(last.x) > 1e5) return t.outcomeDiverged;
    if (Math.abs(last.x) > Math.abs(steps[0].x)) return t.outcomeGrowing;
    const firstMove = steps[1].x - steps[0].x;
    const secondMove = steps[2].x - steps[1].x;
    if (Math.sign(firstMove) !== Math.sign(secondMove)) return t.outcomeOscillating;
    return t.outcomeConverging;
  };

  const handlePoint = { x: start.x, y: start.x * start.x };

  return (
    <div className="plane-lab">
      <Plane view={view} label={t.descentRatesLabel} svgRef={svgRef} {...svgHandlers}>
        <Polyline
          view={view}
          points={sampleFunction((x) => x * x, -3.2, 3.2, 160)}
          className="loss-curve-line"
        />
        {series.map((entry, rateIndex) =>
          entry.steps
            .filter((step) => Number.isFinite(step.loss) && Math.abs(step.x) < 3.2)
            .map((step) => {
              const screen = view.toScreen({ x: step.x, y: step.loss });
              return (
                <circle
                  key={`${entry.rate}-${step.index}`}
                  className={`rate-dot rate-dot-${rateIndex}`}
                  cx={px(screen.x)}
                  cy={px(screen.y)}
                  r={step.index === 0 ? 6 : 3.5}
                />
              );
            }),
        )}
        <DragHandle
          view={view}
          point={handlePoint}
          tone="sum"
          label={t.startHandle}
          valueText={`x₀ = ${formatNumber(start.x, 3)}`}
          active={activeId === "start"}
          onPointerDown={startHandle("start")}
          onKeyDown={nudge(handlePoint, (next) => setStart({ x: next.x, y: next.x * next.x }))}
        />
      </Plane>

      <div className="plane-controls">
        {series.map((entry) => (
          <Readout
            key={entry.rate}
            label={`η = ${entry.rate}`}
            value={`${verdict(entry.steps)} · ${formatNumber(entry.steps.at(-1)!.loss, 4)}`}
          />
        ))}
        <Readout label={t.startLoss} value={formatNumber(start.x * start.x, 3)} />
        <p className="plane-hint">{t.ratesHint}</p>
      </div>
    </div>
  );
}

export const descentLabs: Record<
  "descent-contour" | "descent-curve" | "descent-rates",
  ComponentType<LabProps>
> = {
  "descent-contour": ContourBowlLab,
  "descent-curve": DescentCurveLab,
  "descent-rates": DescentRatesLab,
};

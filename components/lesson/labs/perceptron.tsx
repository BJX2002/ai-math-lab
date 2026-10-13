"use client";

import { useState, type ComponentType } from "react";
import { getMessages } from "../../../lib/i18n/messages";
import { lineFromPoints } from "../../../lib/viz/line";
import { formatNumber, type Point } from "../../../lib/viz/viewport";
import { LinePath } from "../../viz/LineFigure";
import { Plane } from "../../viz/Plane";
import { DragHandle } from "../../viz/VectorArrow";
import { Readout, ValueInput, makeView, useHandleDrag } from "./shared";
import type { LabProps } from "./types";

const WIDTH = 460;
const HEIGHT = 320;
const AXIS_LEFT = 40;
const AXIS_RIGHT = 420;
const INPUT_RANGE = { min: -3.2, max: 3.2 };
const SPAN = INPUT_RANGE.max;

function toX(value: number): number {
  return AXIS_LEFT + ((value + SPAN) / (2 * SPAN)) * (AXIS_RIGHT - AXIS_LEFT);
}

function fromX(pixel: number): number {
  const raw = ((pixel - AXIS_LEFT) / (AXIS_RIGHT - AXIS_LEFT)) * 2 * SPAN - SPAN;
  return Math.max(-SPAN, Math.min(SPAN, raw));
}

/**
 * The weighted sum as arithmetic rather than geometry.
 *
 * Two draggable inputs on their own number lines, then the three contributions
 * stacked from zero so the reader can see the score being assembled and where it
 * crosses the threshold.
 */
function PerceptronScoreLab({ locale }: LabProps) {
  const t = getMessages(locale).labs;
  // The lecture's admission example: Score = 2·Test + Grades − 18.
  const [w1, setW1] = useState(2);
  const [w2, setW2] = useState(1);
  const [bias, setBias] = useState(-18 / 10);
  const [x1, setX1] = useState(1);
  const [x2, setX2] = useState(0.6);
  const [dragging, setDragging] = useState<string | null>(null);

  const contributions = [
    { key: "w1x1", value: w1 * x1 },
    { key: "w2x2", value: w2 * x2 },
    { key: "bias", value: bias },
  ];
  const score = contributions.reduce((total, item) => total + item.value, 0);
  const fires = score >= 0;

  /** Scale so the widest contribution always fits the bar area. */
  const barWidth = AXIS_RIGHT - AXIS_LEFT;
  const extent = Math.max(1, ...contributions.map((item) => Math.abs(item.value)), Math.abs(score));
  const perUnit = barWidth / 2 / extent;

  const barY = 214;
  const barHeight = 34;
  const center = (AXIS_LEFT + AXIS_RIGHT) / 2;
  let cursor = 0;

  function pointerDown(id: string) {
    return (event: React.PointerEvent<SVGSVGElement>) => {
      event.preventDefault();
      event.currentTarget.setPointerCapture(event.pointerId);
      setDragging(id);
    };
  }

  function pointerMove(event: React.PointerEvent<SVGSVGElement>) {
    if (!dragging) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const pixel = ((event.clientX - rect.left) / rect.width) * WIDTH;
    const value = fromX(pixel);
    if (dragging === "x1") setX1(value);
    if (dragging === "x2") setX2(value);
  }

  function endDrag(event: React.PointerEvent<SVGSVGElement>) {
    setDragging(null);
    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      // Already released.
    }
  }

  function keyMove(current: number, apply: (value: number) => void) {
    return (event: React.KeyboardEvent<SVGSVGElement>) => {
      const step = event.key === "ArrowLeft" ? -0.1 : event.key === "ArrowRight" ? 0.1 : 0;
      if (step === 0) return;
      event.preventDefault();
      apply(Math.max(-SPAN, Math.min(SPAN, current + step)));
    };
  }

  const numberLine = (
    y: number,
    value: number,
    label: string,
    id: string,
    apply: (next: number) => void,
  ) => (
    <g className="number-line">
      <line x1={AXIS_LEFT} y1={y} x2={AXIS_RIGHT} y2={y} />
      {[-3, -2, -1, 0, 1, 2, 3].map((tick) => (
        <line key={tick} className="number-tick" x1={toX(tick)} y1={y - 5} x2={toX(tick)} y2={y + 5} />
      ))}
      <text className="number-label" x={AXIS_LEFT - 6} y={y + 4} textAnchor="end">
        {label}
      </text>
      <g
        className={`number-handle ${dragging === id ? "is-active" : ""}`}
        transform={`translate(${toX(value)} ${y})`}
        role="slider"
        tabIndex={0}
        aria-label={label}
        aria-valuetext={`${label} = ${formatNumber(value, 2)}`}
        aria-valuenow={Math.round(value * 100) / 100}
        aria-valuemin={INPUT_RANGE.min}
        aria-valuemax={INPUT_RANGE.max}
        onPointerDown={pointerDown(id)}
        onKeyDown={keyMove(value, apply)}
      >
        <circle className="handle-hit" r={20} />
        <circle className="number-dot" r={9} />
      </g>
      <text className="number-value" x={AXIS_RIGHT + 4} y={y + 4}>
        {formatNumber(value, 2)}
      </text>
    </g>
  );

  return (
    <div className="plane-lab">
      <svg
        className="plane"
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="img"
        aria-label={t.perceptronScoreLabel}
        onPointerMove={pointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        {numberLine(52, x1, "x₁", "x1", setX1)}
        {numberLine(104, x2, "x₂", "x2", setX2)}

        {/* The weighted sum, assembled from zero. */}
        <text className="number-label" x={AXIS_LEFT - 6} y={barY + 22} textAnchor="end">
          Σ
        </text>
        <rect className="score-track" x={AXIS_LEFT} y={barY} width={barWidth} height={barHeight} />
        {contributions.map((item) => {
          const start = center + cursor * perUnit;
          cursor += item.value;
          const end = center + cursor * perUnit;
          const x = Math.min(start, end);
          return (
            <rect
              key={item.key}
              className={`score-segment score-${item.key}`}
              x={x}
              y={barY}
              width={Math.max(1, Math.abs(end - start))}
              height={barHeight}
            />
          );
        })}
        <line className="score-threshold" x1={center} y1={barY - 8} x2={center} y2={barY + barHeight + 8} />
        <text className="number-value" x={center + 8} y={barY - 12}>
          {t.thresholdZero}
        </text>
        <text className="number-value" x={AXIS_LEFT} y={barY + barHeight + 26}>
          {t.weightedSum} = {formatNumber(score, 3)}
        </text>
        <text
          className={fires ? "score-verdict is-on" : "score-verdict is-off"}
          x={AXIS_RIGHT}
          y={barY + barHeight + 26}
          textAnchor="end"
        >
          ŷ = {fires ? 1 : 0}
        </text>
      </svg>

      <div className="plane-controls">
        <label className="plane-slider">
          w₁ = <strong>{formatNumber(w1, 2)}</strong>
          <input
            type="range"
            min={-3}
            max={3}
            step={0.1}
            value={w1}
            onChange={(event) => setW1(Number(event.target.value))}
          />
        </label>
        <label className="plane-slider">
          w₂ = <strong>{formatNumber(w2, 2)}</strong>
          <input
            type="range"
            min={-3}
            max={3}
            step={0.1}
            value={w2}
            onChange={(event) => setW2(Number(event.target.value))}
          />
        </label>
        <label className="plane-slider">
          b = <strong>{formatNumber(bias, 2)}</strong>
          <input
            type="range"
            min={-3}
            max={3}
            step={0.1}
            value={bias}
            onChange={(event) => setBias(Number(event.target.value))}
          />
        </label>
        <ValueInput label="x₁" value={x1} onChange={setX1} min={INPUT_RANGE.min} max={INPUT_RANGE.max} />
        <ValueInput label="x₂" value={x2} onChange={setX2} min={INPUT_RANGE.min} max={INPUT_RANGE.max} />
        <Readout label={t.weightedSum} value={formatNumber(score, 3)} />
        <Readout label="w₁x₁" value={formatNumber(w1 * x1, 3)} />
        <Readout label="w₂x₂" value={formatNumber(w2 * x2, 3)} />
        <Readout label="b" value={formatNumber(bias, 3)} />
        <Readout label={t.thresholdOutput} value={fires ? t.firesYes : t.firesNo} />
        <p className="plane-hint">{t.perceptronScoreHint}</p>
      </div>
    </div>
  );
}

const CLASS_A: Point[] = [
  { x: -3.4, y: 2.6 },
  { x: -2.4, y: 3.4 },
];
const CLASS_B: Point[] = [
  { x: 2.6, y: -2.8 },
  { x: 3.4, y: -1.8 },
];

type LimitHandle = "p1" | "p2" | "b1" | "b2" | "a1" | "a2";

/** One straight boundary, and four points it may or may not separate. */
function PerceptronLimitLab({ locale }: LabProps) {
  const t = getMessages(locale).labs;
  const view = makeView({ xMin: -6, xMax: 6, yMin: -5, yMax: 5 });
  const [line1, setLine1] = useState<Point>({ x: -6, y: 4.4 });
  const [line2, setLine2] = useState<Point>({ x: 6, y: -4.4 });
  const [positives, setPositives] = useState<Point[]>(CLASS_A);
  const [negatives, setNegatives] = useState<Point[]>(CLASS_B);

  const { svgRef, activeId, startHandle, svgHandlers, nudge } = useHandleDrag<LimitHandle>({
    view,
    onMove: (id, point) => {
      if (id === "p1") setLine1(point);
      else if (id === "p2") setLine2(point);
      else if (id === "a1") setPositives([point, positives[1]]);
      else if (id === "a2") setPositives([positives[0], point]);
      else if (id === "b1") setNegatives([point, negatives[1]]);
      else setNegatives([negatives[0], point]);
    },
  });

  const boundary = lineFromPoints(line1, line2);
  // Positive side is where the line's normal points; the sign of the decision is
  // decided by which side of the line the point sits on.
  const sideOf = (point: Point) => {
    if (!boundary) return 0;
    return boundary.a * point.x + boundary.b * point.y - boundary.c;
  };

  const allPoints = [
    ...positives.map((point, index) => ({ point, label: `+${index + 1}`, positive: true })),
    ...negatives.map((point, index) => ({ point, label: `−${index + 1}`, positive: false })),
  ];
  // Flip the convention if needed so that "positive" means positive.
  const flip = sideOf(positives[0]) < 0;
  const misclassified = allPoints.filter(({ point, positive }) => {
    const side = flip ? -sideOf(point) : sideOf(point);
    return positive ? side < 0 : side >= 0;
  });

  const handles: { id: LimitHandle; point: Point; tone: "a" | "b" | "sum"; label: string }[] = [
    { id: "p1", point: line1, tone: "sum", label: `${t.boundaryHandle} 1` },
    { id: "p2", point: line2, tone: "sum", label: `${t.boundaryHandle} 2` },
    { id: "a1", point: positives[0], tone: "a", label: `${t.classHandle} A1` },
    { id: "a2", point: positives[1], tone: "a", label: `${t.classHandle} A2` },
    { id: "b1", point: negatives[0], tone: "b", label: `${t.classHandle} B1` },
    { id: "b2", point: negatives[1], tone: "b", label: `${t.classHandle} B2` },
  ];

  return (
    <div className="plane-lab">
      <Plane view={view} label={t.perceptronLimitLabel} svgRef={svgRef} {...svgHandlers}>
        {boundary ? <LinePath view={view} line={boundary} tone="fit" /> : null}
        {allPoints.map(({ point, label, positive }) => {
          const side = flip ? -sideOf(point) : sideOf(point);
          const wrong = positive ? side < 0 : side >= 0;
          const screen = view.toScreen(point);
          return (
            <g key={label} className={wrong ? "class-point is-wrong" : "class-point"}>
              <circle cx={screen.x} cy={screen.y} r={9} />
              <text x={screen.x} y={screen.y + 4} textAnchor="middle">
                {positive ? "+" : "−"}
              </text>
            </g>
          );
        })}
        {handles.map((entry) => (
          <DragHandle
            key={entry.id}
            view={view}
            point={entry.point}
            tone={entry.tone}
            label={entry.label}
            valueText={`(${formatNumber(entry.point.x, 1)}, ${formatNumber(entry.point.y, 1)})`}
            active={activeId === entry.id}
            onPointerDown={startHandle(entry.id)}
            onKeyDown={nudge(entry.point, (next) => {
              if (entry.id === "p1") setLine1(next);
              else if (entry.id === "p2") setLine2(next);
              else if (entry.id === "a1") setPositives([next, positives[1]]);
              else if (entry.id === "a2") setPositives([positives[0], next]);
              else if (entry.id === "b1") setNegatives([next, negatives[1]]);
              else setNegatives([negatives[0], next]);
            })}
          />
        ))}
      </Plane>

      <div className="plane-controls">
        <Readout label={t.misclassified} value={String(misclassified.length)} />
        <Readout
          label={t.separable}
          value={misclassified.length === 0 ? t.separableYes : t.separableNo}
        />
        <Readout
          label={t.boundaryEquation}
          value={boundary ? t.boundaryShape : "—"}
        />
        <p className="plane-hint">{t.perceptronLimitHint}</p>
      </div>
    </div>
  );
}

export const perceptronLabs: Record<
  "perceptron-score" | "perceptron-limit",
  ComponentType<LabProps>
> = {
  "perceptron-score": PerceptronScoreLab,
  "perceptron-limit": PerceptronLimitLab,
};

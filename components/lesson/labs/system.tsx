"use client";

import { useState, type ComponentType } from "react";
import { getMessages } from "../../../lib/i18n/messages";
import {
  classifySystem,
  determinantOf,
  fitResiduals,
  intersectLines,
  leastSquaresFit,
  lineFromFit,
  lineFromPoints,
  normalizeLine,
} from "../../../lib/viz/line";
import { formatNumber, type Point } from "../../../lib/viz/viewport";
import { ProjectionShadow, RightAngleMark } from "../../viz/geometry";
import { DataHandle, Dot, LinePath, ResidualBars } from "../../viz/LineFigure";
import { Plane } from "../../viz/Plane";
import { DragHandle, VectorArrow } from "../../viz/VectorArrow";
import { CoordinateInputs, Readout, makeView, useHandleDrag } from "./shared";
import type { LabProps } from "./types";

const LINE_WORLD = { xMin: -6, xMax: 6, yMin: -5, yMax: 5 };

type SystemHandle = "p1" | "p2" | "p3" | "p4";

function SystemLinesLab({ locale }: LabProps) {
  const t = getMessages(locale).labs;
  const view = makeView(LINE_WORLD);
  const [p1, setP1] = useState<Point>({ x: -5, y: -2 });
  const [p2, setP2] = useState<Point>({ x: 4, y: 3 });
  const [p3, setP3] = useState<Point>({ x: -5, y: 4 });
  const [p4, setP4] = useState<Point>({ x: 4, y: -1 });

  const setters: Record<SystemHandle, (point: Point) => void> = {
    p1: setP1,
    p2: setP2,
    p3: setP3,
    p4: setP4,
  };
  const current: Record<SystemHandle, Point> = { p1, p2, p3, p4 };

  const { svgRef, activeId, startHandle, svgHandlers, nudge } = useHandleDrag<SystemHandle>({
    view,
    onMove: (id, point) => setters[id](point),
  });

  const first = lineFromPoints(p1, p2);
  const second = lineFromPoints(p3, p4);
  const outcome = first && second ? classifySystem(first, second) : null;
  const crossing = first && second ? intersectLines(first, second) : null;
  // Normalised, so the determinant is sin θ between the lines rather than a
  // number that changes with how far apart the endpoints happen to be.
  const det = first && second ? determinantOf(normalizeLine(first), normalizeLine(second)) : null;
  const angle = det === null ? null : (Math.asin(Math.min(1, Math.abs(det))) * 180) / Math.PI;

  const outcomeLabel =
    outcome === "unique" ? t.uniqueSolution : outcome === "none" ? t.noSolution : t.infiniteSolutions;

  return (
    <div className="plane-lab">
      <Plane view={view} label={t.systemLinesLabel} svgRef={svgRef} {...svgHandlers}>
        {first ? <LinePath view={view} line={first} tone="a" /> : null}
        {second ? <LinePath view={view} line={second} tone="b" /> : null}
        {crossing ? <Dot view={view} point={crossing} tone="sum" label="x" /> : null}
        {(["p1", "p2", "p3", "p4"] as SystemHandle[]).map((id) => (
          <DragHandle
            key={id}
            view={view}
            point={current[id]}
            tone={id === "p1" || id === "p2" ? "a" : "b"}
            label={`${t.systemHandle} ${id.slice(1)}`}
            valueText={`(${formatNumber(current[id].x, 1)}, ${formatNumber(current[id].y, 1)})`}
            active={activeId === id}
            onPointerDown={startHandle(id)}
            onKeyDown={nudge(current[id], setters[id])}
          />
        ))}
      </Plane>

      <div className="plane-controls">
        <Readout label={t.solutionKind} value={outcomeLabel} />
        <Readout label={t.detAsSine} value={det === null ? "—" : formatNumber(det, 3)} />
        <Readout
          label={t.angleBetween}
          value={angle === null ? "—" : `${formatNumber(angle, 1)}°`}
        />
        <Readout
          label={t.solutionPoint}
          value={crossing ? `(${formatNumber(crossing.x, 2)}, ${formatNumber(crossing.y, 2)})` : t.noUnique}
        />
        <CoordinateInputs labels={[t.coordX, t.coordY]} point={p1} onChange={setP1} />
        <p className="plane-hint">{t.systemLinesHint}</p>
      </div>
    </div>
  );
}

const INITIAL_DATA: Point[] = [
  { x: -3, y: -2 },
  { x: -1, y: 0 },
  { x: 1, y: 1 },
  { x: 3, y: 4 },
];

function LeastSquaresLab({ locale }: LabProps) {
  const t = getMessages(locale).labs;
  const view = makeView(LINE_WORLD);
  const [points, setPoints] = useState<Point[]>(INITIAL_DATA);

  const { svgRef, activeId, startHandle, svgHandlers, nudge } = useHandleDrag<string>({
    view,
    onMove: (id, point) => {
      const index = Number(id);
      setPoints((previous) => previous.map((item, i) => (i === index ? point : item)));
    },
  });

  const fit = leastSquaresFit(points);
  const residualInfo = fit ? fitResiduals(points, fit) : null;

  return (
    <div className="plane-lab">
      <Plane view={view} label={t.leastSquaresLabel} svgRef={svgRef} {...svgHandlers}>
        {fit ? <LinePath view={view} line={lineFromFit(fit)} tone="fit" dashed /> : null}
        {fit && residualInfo ? <ResidualBars view={view} points={points} fit={fit} /> : null}
        {points.map((point, index) => (
          <DataHandle
            key={index}
            view={view}
            point={point}
            index={index}
            label={t.dataPoint}
            active={activeId === String(index)}
            onPointerDown={startHandle(String(index))}
            onKeyDown={nudge(point, (next) =>
              setPoints((previous) => previous.map((item, i) => (i === index ? next : item))),
            )}
          />
        ))}
      </Plane>

      <div className="plane-controls">
        <Readout
          label={t.intercept}
          value={fit ? (fit.vertical ? "—" : formatNumber(fit.intercept, 3)) : "—"}
        />
        <Readout
          label={t.slope}
          value={fit ? (fit.vertical ? t.verticalFit : formatNumber(fit.slope, 3)) : "—"}
        />
        <Readout
          label={t.residualSum}
          value={residualInfo ? formatNumber(residualInfo.total, 4) : "—"}
        />
        <CoordinateInputs
          labels={[t.coordX, t.coordY]}
          point={points[0]}
          onChange={(next) => setPoints((previous) => previous.map((item, i) => (i === 0 ? next : item)))}
        />
        <p className="plane-hint">{t.leastSquaresHint}</p>
      </div>
    </div>
  );
}

function ProjectionLeastSquaresLab({ locale }: LabProps) {
  const t = getMessages(locale).labs;
  const view = makeView();
  const [direction, setDirection] = useState<Point>({ x: 4, y: 1 });
  const [b, setB] = useState<Point>({ x: 2, y: 3.5 });

  const { svgRef, activeId, startHandle, svgHandlers, nudge } = useHandleDrag<"a" | "b">({
    view,
    onMove: (id, point) => (id === "a" ? setDirection(point) : setB(point)),
  });

  const denominator = direction.x ** 2 + direction.y ** 2;
  const coefficient = denominator > 1e-12 ? (b.x * direction.x + b.y * direction.y) / denominator : 0;
  const fitted = { x: direction.x * coefficient, y: direction.y * coefficient };
  const residual = { x: b.x - fitted.x, y: b.y - fitted.y };

  return (
    <div className="plane-lab">
      <Plane view={view} label={t.projectionFitLabel} svgRef={svgRef} {...svgHandlers}>
        {/* The column space of a 2x1 matrix is the line through this direction. */}
        <LinePath
          view={view}
          line={{ a: direction.y, b: -direction.x, c: 0 }}
          tone="a"
          dashed
        />
        <VectorArrow view={view} to={direction} tone="a" label="a" />
        <VectorArrow view={view} to={b} tone="b" label="b" />
        <ProjectionShadow view={view} vector={b} onto={direction} />
        <VectorArrow view={view} to={fitted} tone="sum" label="a·x̂" />
        {denominator > 1e-12 ? (
          <RightAngleMark view={view} corner={fitted} towardA={b} towardB={{ x: 0, y: 0 }} />
        ) : null}
        <DragHandle
          view={view}
          point={direction}
          tone="a"
          label={t.columnSpaceHandle}
          valueText={`a = (${formatNumber(direction.x, 2)}, ${formatNumber(direction.y, 2)})`}
          active={activeId === "a"}
          onPointerDown={startHandle("a")}
          onKeyDown={nudge(direction, setDirection)}
        />
        <DragHandle
          view={view}
          point={b}
          tone="b"
          label={t.targetHandle}
          valueText={`b = (${formatNumber(b.x, 2)}, ${formatNumber(b.y, 2)})`}
          active={activeId === "b"}
          onPointerDown={startHandle("b")}
          onKeyDown={nudge(b, setB)}
        />
      </Plane>

      <div className="plane-controls">
        <Readout label={t.fittedCoefficient} value={formatNumber(coefficient, 3)} />
        <Readout
          label={t.fittedPoint}
          value={`(${formatNumber(fitted.x, 2)}, ${formatNumber(fitted.y, 2)})`}
        />
        <Readout
          label={t.residualVector}
          value={`(${formatNumber(residual.x, 2)}, ${formatNumber(residual.y, 2)})`}
        />
        <Readout
          label={t.perpendicularCheck}
          value={formatNumber(residual.x * direction.x + residual.y * direction.y, 6)}
        />
        <p className="plane-hint">{t.projectionFitHint}</p>
      </div>
    </div>
  );
}

export const systemLabs: Record<
  "system-lines" | "least-squares" | "projection-least-squares",
  ComponentType<LabProps>
> = {
  "system-lines": SystemLinesLab,
  "least-squares": LeastSquaresLab,
  "projection-least-squares": ProjectionLeastSquaresLab,
};

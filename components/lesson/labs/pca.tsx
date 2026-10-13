"use client";

import { useState, type ComponentType } from "react";
import { getMessages } from "../../../lib/i18n/messages";
import { principalComponents, projectScalar, unprojectScalar } from "../../../lib/viz/line";
import {
  SAMPLE_IMAGE,
  numericalRank,
  rankKApproximation,
  reconstructionError,
  storedNumbers,
  svd,
  type Matrix,
} from "../../../lib/viz/svd";
import { formatNumber, px, type Point } from "../../../lib/viz/viewport";
import { Plane } from "../../viz/Plane";
import { DragHandle } from "../../viz/VectorArrow";
import { CoordinateInputs, Readout, makeView, useHandleDrag } from "./shared";
import type { LabProps } from "./types";

const CLOUD_WORLD = { xMin: -5.5, xMax: 5.5, yMin: -4, yMax: 4 };

const INITIAL_CLOUD: Point[] = [
  { x: -4, y: -2.6 },
  { x: -2.4, y: -1.2 },
  { x: -1, y: -1.4 },
  { x: 1.2, y: 0.6 },
  { x: 2.8, y: 1.4 },
  { x: 4.2, y: 2.6 },
];

function CloudLab({ locale }: LabProps) {
  const t = getMessages(locale).labs;
  const view = makeView(CLOUD_WORLD);
  const [points, setPoints] = useState<Point[]>(INITIAL_CLOUD);
  const [showShadows, setShowShadows] = useState(true);

  const { svgRef, activeId, startHandle, svgHandlers, nudge } = useHandleDrag<string>({
    view,
    onMove: (id, point) => {
      const index = Number(id);
      setPoints((previous) => previous.map((item, i) => (i === index ? point : item)));
    },
  });

  const pca = principalComponents(points);
  const total = pca ? pca.variance[0] + pca.variance[1] : 0;
  const ratio = pca && total > 0 ? pca.variance[0] / total : 0;

  // A long segment through the mean along the principal direction.
  const reach = 8;
  const axisLine = pca
    ? {
        from: unprojectScalar(-reach, pca.mean, pca.direction),
        to: unprojectScalar(reach, pca.mean, pca.direction),
      }
    : null;

  // The 1-D shadow of each point, and the drop from the point to it.
  const shadows =
    pca && showShadows
      ? points.map((point) => {
          const scalar = projectScalar(point, pca.mean, pca.direction);
          return { point, foot: unprojectScalar(scalar, pca.mean, pca.direction) };
        })
      : [];

  return (
    <div className="plane-lab">
      <Plane view={view} label={t.pcaCloudLabel} svgRef={svgRef} {...svgHandlers}>
        {axisLine ? (
          <line
            className="pca-axis"
            x1={px(view.toScreen(axisLine.from).x)}
            y1={px(view.toScreen(axisLine.from).y)}
            x2={px(view.toScreen(axisLine.to).x)}
            y2={px(view.toScreen(axisLine.to).y)}
          />
        ) : null}
        {pca ? (
          <line
            className="pca-secondary"
            x1={px(view.toScreen(unprojectScalar(-reach, pca.mean, pca.secondary)).x)}
            y1={px(view.toScreen(unprojectScalar(-reach, pca.mean, pca.secondary)).y)}
            x2={px(view.toScreen(unprojectScalar(reach, pca.mean, pca.secondary)).x)}
            y2={px(view.toScreen(unprojectScalar(reach, pca.mean, pca.secondary)).y)}
          />
        ) : null}
        {shadows.map((shadow, index) => (
          <g key={index} className="pca-shadow">
            <line
              x1={px(view.toScreen(shadow.point).x)}
              y1={px(view.toScreen(shadow.point).y)}
              x2={px(view.toScreen(shadow.foot).x)}
              y2={px(view.toScreen(shadow.foot).y)}
            />
            <circle cx={px(view.toScreen(shadow.foot).x)} cy={px(view.toScreen(shadow.foot).y)} r={4} />
          </g>
        ))}
        {pca ? (
          <circle
            className="pca-mean"
            cx={px(view.toScreen(pca.mean).x)}
            cy={px(view.toScreen(pca.mean).y)}
            r={5}
          />
        ) : null}
        {points.map((point, index) => (
          <DragHandle
            key={index}
            view={view}
            point={point}
            tone="b"
            label={`${t.cloudPoint} ${index + 1}`}
            valueText={`(${formatNumber(point.x, 1)}, ${formatNumber(point.y, 1)})`}
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
          label={t.explainedFirst}
          value={pca ? `${formatNumber(ratio * 100, 1)}%` : "—"}
        />
        <Readout
          label={t.explainedSecond}
          value={pca ? `${formatNumber((1 - ratio) * 100, 1)}%` : "—"}
        />
        <Readout
          label={t.principalDirection}
          value={
            pca
              ? `(${formatNumber(pca.direction.x, 3)}, ${formatNumber(pca.direction.y, 3)})`
              : "—"
          }
        />
        <label className="plane-toggle">
          <input
            type="checkbox"
            checked={showShadows}
            onChange={() => setShowShadows(!showShadows)}
          />
          {t.showShadows}
        </label>
        <CoordinateInputs
          labels={[t.coordX, t.coordY]}
          point={points[0]}
          onChange={(next) => setPoints((previous) => previous.map((item, i) => (i === 0 ? next : item)))}
        />
        <p className="plane-hint">{t.pcaCloudHint}</p>
      </div>
    </div>
  );
}

const CELL = 24;

/** A grayscale-as-teal heatmap of a small matrix. */
function Heatmap({
  matrix,
  max,
  label,
}: {
  matrix: Matrix;
  max: number;
  label: string;
}) {
  const rows = matrix.length;
  const columns = matrix[0]?.length ?? 0;
  return (
    <svg
      className="heatmap"
      viewBox={`0 0 ${columns * CELL} ${rows * CELL}`}
      role="img"
      aria-label={label}
    >
      {matrix.map((row, i) =>
        row.map((value, j) => (
          <rect
            key={`${i}-${j}`}
            x={j * CELL}
            y={i * CELL}
            width={CELL}
            height={CELL}
            fill={`rgba(11,117,112,${Math.max(0, Math.min(1, value / max))})`}
            stroke="#e2ebe7"
            strokeWidth="1"
          />
        )),
      )}
    </svg>
  );
}

function RankLab({ locale }: LabProps) {
  const t = getMessages(locale).labs;
  const [k, setK] = useState(1);
  const decomposition = svd(SAMPLE_IMAGE);
  const approximation = rankKApproximation(decomposition, k);
  const error = reconstructionError(SAMPLE_IMAGE, approximation);
  const max = Math.max(...SAMPLE_IMAGE.flat());
  const rank = numericalRank(decomposition.s);

  return (
    <div className="plane-lab rank-lab">
      <div className="heatmap-pair">
        <figure>
          <figcaption>{t.originalImage}</figcaption>
          <Heatmap matrix={SAMPLE_IMAGE} max={max} label={t.originalImage} />
        </figure>
        <figure>
          <figcaption>
            {t.reconstruction} k = {k}
          </figcaption>
          <Heatmap matrix={approximation} max={max} label={`${t.reconstruction} k=${k}`} />
        </figure>
      </div>

      <div className="plane-controls">
        <label className="plane-slider">
          {t.keepComponents}: <strong>{k}</strong>
          <input
            type="range"
            min={0}
            max={decomposition.s.length}
            step={1}
            value={k}
            onChange={(event) => setK(Number(event.target.value))}
          />
        </label>
        <Readout label={t.relativeError} value={`${formatNumber(error * 100, 3)}%`} />
        <Readout
          label={t.spectrum}
          value={decomposition.s.map((value) => formatNumber(value, 0)).join(" · ")}
        />
        <Readout label={t.trueRank} value={String(rank)} />
        <Readout
          label={t.storedNumbers}
          value={`${storedNumbers(8, 8, k)} / ${8 * 8}`}
        />
        <p className="plane-hint">{t.rankHint}</p>
      </div>
    </div>
  );
}

function CompressLab({ locale }: LabProps) {
  const t = getMessages(locale).labs;
  const [size, setSize] = useState(300);
  const [k, setK] = useState(20);

  const raw = size * size;
  const kept = storedNumbers(size, size, k);
  const ratio = kept > 0 ? raw / kept : 0;
  const pays = kept < raw;

  const decomposition = svd(SAMPLE_IMAGE);
  const maxSigma = decomposition.s[0] || 1;
  const error = reconstructionError(
    SAMPLE_IMAGE,
    rankKApproximation(decomposition, Math.min(k, decomposition.s.length)),
  );

  return (
    <div className="plane-lab">
      <div className="spectrum">
        {decomposition.s.map((value, index) => (
          <div key={index} className="spectrum-bar">
            <span style={{ height: `${Math.max(2, (value / maxSigma) * 100)}%` }} />
            <small>{formatNumber(value, 0)}</small>
          </div>
        ))}
      </div>

      <div className="plane-controls">
        <label className="plane-slider">
          {t.matrixSize}: <strong>{size} × {size}</strong>
          <input
            type="range"
            min={1}
            max={4}
            step={1}
            value={[8, 32, 128, 300].indexOf(size)}
            onChange={(event) => setSize([8, 32, 128, 300][Number(event.target.value)])}
          />
        </label>
        <label className="plane-slider">
          {t.keepComponents}: <strong>{k}</strong>
          <input
            type="range"
            min={1}
            max={60}
            step={1}
            value={k}
            onChange={(event) => setK(Number(event.target.value))}
          />
        </label>
        <Readout label={t.rawNumbers} value={raw.toLocaleString()} />
        <Readout label={t.keptNumbers} value={kept.toLocaleString()} />
        <Readout
          label={t.compressionRatio}
          value={pays ? `${formatNumber(ratio, 2)}×` : t.noSaving}
        />
        <Readout
          label={t.errorOnSample}
          value={`${formatNumber(error * 100, 3)}%`}
        />
        <p className="plane-hint">{t.compressHint}</p>
      </div>
    </div>
  );
}

export const pcaLabs: Record<"pca-cloud" | "pca-rank" | "pca-compress", ComponentType<LabProps>> = {
  "pca-cloud": CloudLab,
  "pca-rank": RankLab,
  "pca-compress": CompressLab,
};

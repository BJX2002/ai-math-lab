"use client";

import { useMemo, useState, type ComponentType } from "react";
import type { LabId } from "../../lib/content/types";
import type { Locale } from "../../lib/i18n/locales";
import { getMessages } from "../../lib/i18n/messages";
import { vectorLabs } from "./labs/vectors";
import { dotLabs } from "./labs/dot";
import { matrixLabs } from "./labs/matrix";
import { systemLabs } from "./labs/system";
import { descentLabs } from "./labs/descent";
import { pcaLabs } from "./labs/pca";
import { perceptronLabs } from "./labs/perceptron";
import { activationLabs } from "./labs/activation";
import { tensorLabs } from "./labs/tensor";
import { lossLabs } from "./labs/loss";
import { backpropLabs } from "./labs/backprop";
import { trainLabs } from "./labs/train";
import type { LabProps } from "./labs/types";

/**
 * Interactive labs, keyed by id.
 *
 * Content refers to a lab by id and the registry is an exhaustive
 * `Record<LabId, …>`, so an unknown slug can no longer silently render the
 * optimization lab (which is what the previous `if` chain did).
 */

const DIMENSION_MIN = 1;
const DIMENSION_MAX = 20;

/**
 * Parse "1, 2, 3" into numbers.
 *
 * Returns `null` rather than dropping unreadable entries: silently turning
 * "1, 2, abc" into `[1, 2]` changed the dimension without telling the reader.
 */
function parseVector(value: string): number[] | null {
  const parts = value.split(",").map((part) => part.trim());
  if (parts.length === 0) return null;

  const numbers: number[] = [];
  for (const part of parts) {
    if (part === "") return null;
    const parsed = Number(part);
    if (!Number.isFinite(parsed)) return null;
    numbers.push(parsed);
  }
  return numbers;
}

function clampDimension(raw: string): number {
  const parsed = Math.floor(Number(raw));
  if (!Number.isFinite(parsed)) return DIMENSION_MIN;
  return Math.min(DIMENSION_MAX, Math.max(DIMENSION_MIN, parsed));
}

function VectorLab({ locale }: LabProps) {
  const t = getMessages(locale).labs;
  const [value, setValue] = useState("3, 4");
  const vector = useMemo(() => parseVector(value), [value]);

  const norm = vector ? Math.sqrt(vector.reduce((total, x) => total + x * x, 0)) : 0;
  const unit = vector ? (norm ? vector.map((x) => x / norm) : vector.map(() => 0)) : [];

  return (
    <div className="mini-lab-grid">
      <label>
        {t.vectorInput}
        <input value={value} onChange={(event) => setValue(event.target.value)} />
      </label>
      {vector === null ? (
        <p className="lab-error lab-wide">{t.parseError}</p>
      ) : (
        <>
          <div className="lab-readout" aria-live="polite">
            <span>{t.dimension}</span>
            <strong>{vector.length}</strong>
          </div>
          <div className="lab-readout" aria-live="polite">
            <span>‖x‖₂</span>
            <strong>{norm.toFixed(3)}</strong>
          </div>
          <div className="lab-wide">
            <span>{t.normalized}</span>
            <code>[{unit.map((x) => x.toFixed(3)).join(", ")}]</code>
          </div>
        </>
      )}
    </div>
  );
}

function DotLab({ locale }: LabProps) {
  const t = getMessages(locale).labs;
  const [aValue, setAValue] = useState("1, 2, 1");
  const [bValue, setBValue] = useState("2, 3, 0");
  const a = useMemo(() => parseVector(aValue), [aValue]);
  const b = useMemo(() => parseVector(bValue), [bValue]);

  const unreadable = a === null || b === null;
  const valid = !unreadable && a.length === b.length && a.length > 0;
  const dot = valid ? a.reduce((sum, x, index) => sum + x * b[index], 0) : 0;
  const normA = a ? Math.sqrt(a.reduce((sum, x) => sum + x * x, 0)) : 0;
  const normB = b ? Math.sqrt(b.reduce((sum, x) => sum + x * x, 0)) : 0;
  const cosine = valid && normA && normB ? dot / (normA * normB) : 0;

  return (
    <div className="mini-lab-grid">
      <label>
        {t.vectorA}
        <input value={aValue} onChange={(event) => setAValue(event.target.value)} />
      </label>
      <label>
        {t.vectorB}
        <input value={bValue} onChange={(event) => setBValue(event.target.value)} />
      </label>
      {unreadable ? (
        <p className="lab-error lab-wide">{t.parseError}</p>
      ) : !valid ? (
        <p className="lab-error lab-wide">{t.sameDimension}</p>
      ) : (
        <>
          <div className="lab-readout" aria-live="polite">
            <span>{t.dotProduct}</span>
            <strong>{dot.toFixed(3)}</strong>
          </div>
          <div className="lab-readout" aria-live="polite">
            <span>{t.cosine}</span>
            <strong>{cosine.toFixed(3)}</strong>
          </div>
        </>
      )}
    </div>
  );
}

function MatrixLab({ locale }: LabProps) {
  const t = getMessages(locale).labs;
  const [aRows, setARows] = useState(4);
  const [aCols, setACols] = useState(3);
  const [bRows, setBRows] = useState(3);
  const [bCols, setBCols] = useState(2);
  const compatible = aCols === bRows;

  const numberInput = (
    label: string,
    value: number,
    setter: (value: number) => void,
  ) => (
    <input
      type="number"
      aria-label={label}
      min={DIMENSION_MIN}
      max={DIMENSION_MAX}
      value={value}
      // `max` alone is not enforced for typed input, so clamp here too.
      onChange={(event) => setter(clampDimension(event.target.value))}
    />
  );

  return (
    <div className="shape-lab">
      <div className="shape-box">
        <span>A</span>
        {numberInput("A rows", aRows, setARows)}
        <b aria-hidden="true">×</b>
        {numberInput("A columns", aCols, setACols)}
      </div>
      <span className="shape-operator" aria-hidden="true">
        @
      </span>
      <div className="shape-box">
        <span>B</span>
        {numberInput("B rows", bRows, setBRows)}
        <b aria-hidden="true">×</b>
        {numberInput("B columns", bCols, setBCols)}
      </div>
      <span className="shape-operator" aria-hidden="true">
        →
      </span>
      <div className={`shape-result ${compatible ? "valid" : "invalid"}`} aria-live="polite">
        {compatible ? `(${aRows}, ${bCols})` : `${aCols} ≠ ${bRows}`}
        <small>{compatible ? t.validOutput : t.innerDiffer}</small>
      </div>
    </div>
  );
}

function SystemLab({ locale }: LabProps) {
  const t = getMessages(locale).labs;
  const [a, setA] = useState(2);
  const [b, setB] = useState(1);
  const [c, setC] = useState(5);
  const [d, setD] = useState(1);
  const [e, setE] = useState(-1);
  const [f, setF] = useState(1);

  const det = a * e - b * d;
  const x = det ? (c * e - b * f) / det : 0;
  const y = det ? (a * f - c * d) / det : 0;

  const setters = [setA, setB, setC, setD, setE, setF];
  const values = [a, b, c, d, e, f];

  return (
    <div className="system-lab">
      <p>{t.systemIntro}</p>
      <div className="coefficient-row">
        {values.map((value, index) => (
          <input
            aria-label={`coefficient ${index + 1}`}
            key={index}
            type="number"
            value={value}
            onChange={(event) => setters[index](Number(event.target.value))}
          />
        ))}
      </div>
      <div className="system-result" aria-live="polite">
        <span>det(A) = {det.toFixed(2)}</span>
        <strong>{det ? `x = ${x.toFixed(3)}, y = ${y.toFixed(3)}` : t.noUnique}</strong>
      </div>
    </div>
  );
}

function PcaLab({ locale }: LabProps) {
  const t = getMessages(locale).labs;
  const [rank, setRank] = useState(20);
  const rows = 300;
  const cols = 450;
  const original = rows * cols;
  const compressed = rank * (rows + cols + 1);
  const ratio = original / compressed;

  return (
    <div className="slider-lab">
      <label>
        {t.rank}: <strong>{rank}</strong>
        <input
          type="range"
          min="1"
          max="150"
          value={rank}
          onChange={(event) => setRank(Number(event.target.value))}
        />
      </label>
      <div className="compression-bars" aria-live="polite">
        <span style={{ width: "100%" }}>
          {t.original}: {original.toLocaleString()} {t.numbers}
        </span>
        <span style={{ width: `${Math.max(10, 100 / ratio)}%` }}>
          rank-{rank}: {compressed.toLocaleString()}
        </span>
      </div>
      <p>
        {t.compression}: <strong>{ratio.toFixed(1)}×</strong>
      </p>
    </div>
  );
}

/** Loss of the first step is always 25, so the chart uses a fixed scale. */
const REFERENCE_LOSS = 25;

function OptimizationLab({ locale }: LabProps) {
  const t = getMessages(locale).labs;
  const [rate, setRate] = useState(0.1);

  const points = useMemo(
    () =>
      Array.from({ length: 9 }, (_, step) => {
        const x = 5 * Math.pow(1 - 2 * rate, step);
        return { step, x, loss: x * x };
      }),
    [rate],
  );

  // Scaling each frame to the largest value hidden divergence: a run that blew
  // up looked exactly like a run that converged. A fixed scale keeps the
  // lesson visible.
  const diverging = points.some((point) => point.loss > REFERENCE_LOSS);

  return (
    <div className="slider-lab">
      <label>
        {t.learningRate}: <strong>{rate.toFixed(2)}</strong>
        <input
          type="range"
          min="0.01"
          max="1.2"
          step="0.01"
          value={rate}
          onChange={(event) => setRate(Number(event.target.value))}
        />
      </label>
      <div className="descent-chart" aria-label={t.lossAfter}>
        {points.map((point) => (
          <span
            key={point.step}
            title={`step ${point.step}: loss ${point.loss.toFixed(3)}`}
            className={point.loss > REFERENCE_LOSS ? "is-overflow" : undefined}
            style={{ height: `${Math.max(4, Math.min(100, (point.loss / REFERENCE_LOSS) * 100))}%` }}
          />
        ))}
      </div>
      <p aria-live="polite">
        {t.lossAfter}: <strong>{points.at(-1)?.loss.toFixed(5)}</strong>
        {diverging ? <em className="lab-error"> {t.diverged}</em> : null}
      </p>
    </div>
  );
}

export const LABS: Record<LabId, ComponentType<LabProps>> = {
  ...vectorLabs,
  ...dotLabs,
  ...matrixLabs,
  ...systemLabs,
  ...descentLabs,
  ...pcaLabs,
  ...perceptronLabs,
  ...activationLabs,
  ...tensorLabs,
  ...lossLabs,
  ...backpropLabs,
  ...trainLabs,
  vectors: VectorLab,
  "dot-products": DotLab,
  matrices: MatrixLab,
  "linear-systems": SystemLab,
  "pca-svd": PcaLab,
  optimization: OptimizationLab,
};

export function LabView({ id, locale }: { id: LabId; locale: Locale }) {
  const Lab = LABS[id];
  return <Lab locale={locale} />;
}

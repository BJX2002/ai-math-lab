"use client";

import { useMemo, useState } from "react";

function parseVector(value: string) {
  return value.split(",").map((part) => Number(part.trim())).filter(Number.isFinite);
}

function VectorLab() {
  const [value, setValue] = useState("3, 4");
  const vector = useMemo(() => parseVector(value), [value]);
  const norm = Math.sqrt(vector.reduce((total, x) => total + x * x, 0));
  const unit = norm ? vector.map((x) => x / norm) : vector.map(() => 0);
  return (
    <div className="mini-lab-grid">
      <label>Vector x<input value={value} onChange={(event) => setValue(event.target.value)} /></label>
      <div className="lab-readout"><span>dimension</span><strong>{vector.length}</strong></div>
      <div className="lab-readout"><span>‖x‖₂</span><strong>{norm.toFixed(3)}</strong></div>
      <div className="lab-wide"><span>normalized x</span><code>[{unit.map((x) => x.toFixed(3)).join(", ")}]</code></div>
    </div>
  );
}

function DotLab() {
  const [aValue, setAValue] = useState("1, 2, 1");
  const [bValue, setBValue] = useState("2, 3, 0");
  const a = useMemo(() => parseVector(aValue), [aValue]);
  const b = useMemo(() => parseVector(bValue), [bValue]);
  const valid = a.length === b.length && a.length > 0;
  const dot = valid ? a.reduce((sum, x, index) => sum + x * b[index], 0) : 0;
  const normA = Math.sqrt(a.reduce((sum, x) => sum + x * x, 0));
  const normB = Math.sqrt(b.reduce((sum, x) => sum + x * x, 0));
  const cosine = valid && normA && normB ? dot / (normA * normB) : 0;
  return (
    <div className="mini-lab-grid">
      <label>Vector a<input value={aValue} onChange={(event) => setAValue(event.target.value)} /></label>
      <label>Vector b<input value={bValue} onChange={(event) => setBValue(event.target.value)} /></label>
      {!valid ? <p className="lab-error lab-wide">Vectors need the same non-zero dimension.</p> : <>
        <div className="lab-readout"><span>a · b</span><strong>{dot.toFixed(3)}</strong></div>
        <div className="lab-readout"><span>cosine</span><strong>{cosine.toFixed(3)}</strong></div>
      </>}
    </div>
  );
}

function MatrixLab() {
  const [aRows, setARows] = useState(4);
  const [aCols, setACols] = useState(3);
  const [bRows, setBRows] = useState(3);
  const [bCols, setBCols] = useState(2);
  const compatible = aCols === bRows;
  const numberInput = (value: number, setter: (value: number) => void) => (
    <input type="number" min="1" max="20" value={value} onChange={(event) => setter(Math.max(1, Number(event.target.value)))} />
  );
  return (
    <div className="shape-lab">
      <div className="shape-box"><span>A</span>{numberInput(aRows, setARows)}<b>×</b>{numberInput(aCols, setACols)}</div>
      <span className="shape-operator">@</span>
      <div className="shape-box"><span>B</span>{numberInput(bRows, setBRows)}<b>×</b>{numberInput(bCols, setBCols)}</div>
      <span className="shape-operator">→</span>
      <div className={`shape-result ${compatible ? "valid" : "invalid"}`}>
        {compatible ? `(${aRows}, ${bCols})` : `${aCols} ≠ ${bRows}`}
        <small>{compatible ? "valid output" : "inner dimensions differ"}</small>
      </div>
    </div>
  );
}

function SystemLab() {
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
      <p>Edit the coefficients in <strong>ax + by = c</strong> and <strong>dx + ey = f</strong>.</p>
      <div className="coefficient-row">{values.map((value, index) => <input aria-label={`coefficient ${index + 1}`} key={index} type="number" value={value} onChange={(event) => setters[index](Number(event.target.value))} />)}</div>
      <div className="system-result">
        <span>det(A) = {det.toFixed(2)}</span>
        <strong>{det ? `x = ${x.toFixed(3)}, y = ${y.toFixed(3)}` : "No unique solution"}</strong>
      </div>
    </div>
  );
}

function PcaLab() {
  const [rank, setRank] = useState(20);
  const rows = 300;
  const cols = 450;
  const original = rows * cols;
  const compressed = rank * (rows + cols + 1);
  const ratio = original / compressed;
  return (
    <div className="slider-lab">
      <label>Rank k: <strong>{rank}</strong><input type="range" min="1" max="150" value={rank} onChange={(event) => setRank(Number(event.target.value))} /></label>
      <div className="compression-bars"><span style={{ width: "100%" }}>original: {original.toLocaleString()} numbers</span><span style={{ width: `${Math.max(10, 100 / ratio)}%` }}>rank-{rank}: {compressed.toLocaleString()}</span></div>
      <p>Approximate storage reduction: <strong>{ratio.toFixed(1)}×</strong></p>
    </div>
  );
}

function OptimizationLab() {
  const [rate, setRate] = useState(0.1);
  const points = useMemo(() => Array.from({ length: 9 }, (_, step) => {
    const x = 5 * Math.pow(1 - 2 * rate, step);
    return { step, x, loss: x * x };
  }), [rate]);
  const maxLoss = Math.max(25, ...points.map((point) => point.loss));
  return (
    <div className="slider-lab">
      <label>Learning rate η: <strong>{rate.toFixed(2)}</strong><input type="range" min="0.01" max="1.2" step="0.01" value={rate} onChange={(event) => setRate(Number(event.target.value))} /></label>
      <div className="descent-chart" aria-label="Loss over eight gradient descent steps">
        {points.map((point) => <span key={point.step} title={`step ${point.step}: loss ${point.loss.toFixed(3)}`} style={{ height: `${Math.max(4, Math.min(100, point.loss / maxLoss * 100))}%` }} />)}
      </div>
      <p>Loss after 8 steps: <strong>{points.at(-1)?.loss.toFixed(5)}</strong></p>
    </div>
  );
}

export function InteractiveLab({ slug }: { slug: string }) {
  if (slug === "vectors") return <VectorLab />;
  if (slug === "dot-products") return <DotLab />;
  if (slug === "matrices") return <MatrixLab />;
  if (slug === "linear-systems") return <SystemLab />;
  if (slug === "pca-svd") return <PcaLab />;
  return <OptimizationLab />;
}

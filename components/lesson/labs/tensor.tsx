"use client";

import { useState, type ComponentType } from "react";
import { getMessages } from "../../../lib/i18n/messages";
import {
  broadcastShapes,
  denseChain,
  denseParameters,
  flattenTrailing,
  shapeLabel,
  shapeSize,
} from "../../../lib/viz/shape";
import { Readout, ValueInput } from "./shared";
import type { LabProps } from "./types";

const CELL = 26;

/** A draggable edge, the only way to resize an axis here. */
function EdgeHandle({
  x,
  y,
  orientation,
  label,
  value,
  min,
  max,
  active,
  onChange,
  onActivate,
}: {
  x: number;
  y: number;
  orientation: "horizontal" | "vertical";
  label: string;
  value: number;
  min: number;
  max: number;
  active: boolean;
  onChange: (next: number) => void;
  onActivate: (id: string | null) => void;
}) {
  const move = (delta: number) => onChange(Math.max(min, Math.min(max, value + delta)));

  return (
    <g
      className={`edge-handle edge-${orientation} ${active ? "is-active" : ""}`}
      transform={`translate(${x} ${y})`}
      role="slider"
      tabIndex={0}
      aria-label={label}
      aria-valuetext={`${label}: ${value}`}
      aria-valuenow={value}
      aria-valuemin={min}
      aria-valuemax={max}
      onPointerDown={(event) => {
        event.preventDefault();
        (event.target as Element).setPointerCapture?.(event.pointerId);
        onActivate(label);
      }}
      onPointerMove={(event) => {
        if (!active) return;
        const step = orientation === "horizontal" ? event.movementX : event.movementY;
        if (step !== 0) move(Math.sign(step));
      }}
      onPointerUp={() => onActivate(null)}
      onKeyDown={(event) => {
        const back = orientation === "horizontal" ? "ArrowLeft" : "ArrowUp";
        const forward = orientation === "horizontal" ? "ArrowRight" : "ArrowDown";
        if (event.key === back) {
          event.preventDefault();
          move(-1);
        }
        if (event.key === forward) {
          event.preventDefault();
          move(1);
        }
      }}
    >
      <rect className="edge-hit" x={-18} y={-18} width={36} height={36} />
      <rect
        className="edge-grip"
        x={orientation === "horizontal" ? -4 : -3}
        y={orientation === "horizontal" ? -3 : -4}
        width={orientation === "horizontal" ? 8 : 6}
        height={orientation === "horizontal" ? 6 : 8}
        rx={2}
      />
    </g>
  );
}

function ShapeLab({ locale }: LabProps) {
  const t = getMessages(locale).labs;
  const [rows, setRows] = useState(3);
  const [columns, setColumns] = useState(4);
  const [active, setActive] = useState<string | null>(null);

  const width = columns * CELL;
  const height = rows * CELL;
  const flattened = flattenTrailing([rows, columns]);

  return (
    <div className="plane-lab">
      <svg
        className="plane shape-plane"
        viewBox="0 0 460 300"
        role="img"
        aria-label={t.tensorShapeLabel}
      >
        <g transform="translate(60 40)">
          {Array.from({ length: rows }, (_, row) =>
            Array.from({ length: columns }, (_, column) => (
              <rect
                key={`${row}-${column}`}
                className="shape-cell"
                x={column * CELL}
                y={row * CELL}
                width={CELL}
                height={CELL}
              />
            )),
          )}
          <rect className="shape-outline" x={0} y={0} width={width} height={height} />
          <EdgeHandle
            x={width}
            y={height / 2}
            orientation="horizontal"
            label={t.axisColumns}
            value={columns}
            min={1}
            max={8}
            active={active === t.axisColumns}
            onChange={setColumns}
            onActivate={setActive}
          />
          <EdgeHandle
            x={width / 2}
            y={height}
            orientation="vertical"
            label={t.axisRows}
            value={rows}
            min={1}
            max={6}
            active={active === t.axisRows}
            onChange={setRows}
            onActivate={setActive}
          />
          <text className="shape-caption" x={width / 2} y={-14} textAnchor="middle">
            {t.axisColumns} = {columns}
          </text>
          <text className="shape-caption" x={-14} y={height / 2} textAnchor="middle">
            {t.axisRows} = {rows}
          </text>
        </g>

        {/* The flatten step: everything after the batch becomes one axis. */}
        <g transform="translate(60 210)">
          <text className="shape-caption" x={0} y={0}>
            {t.flattenTo} {shapeLabel([shapeSize(flattened)])}
          </text>
          {Array.from({ length: Math.min(shapeSize(flattened), 16) }, (_, index) => (
            <rect
              key={index}
              className="shape-cell flat"
              x={index * 20}
              y={12}
              width={18}
              height={26}
            />
          ))}
          {shapeSize(flattened) > 16 ? (
            <text className="shape-caption" x={16 * 20 + 6} y={30}>
              …
            </text>
          ) : null}
        </g>
      </svg>

      <div className="plane-controls">
        <Readout label={t.shapeLabel} value={shapeLabel([rows, columns])} />
        <Readout label={t.rankLabel} value={String(2)} />
        <Readout label={t.sizeLabel} value={String(rows * columns)} />
        <Readout label={t.flattenedShape} value={shapeLabel(flattened)} />
        <ValueInput label={t.axisRows} value={rows} onChange={setRows} step={1} min={1} max={6} digits={0} />
        <ValueInput
          label={t.axisColumns}
          value={columns}
          onChange={setColumns}
          step={1}
          min={1}
          max={8}
          digits={0}
        />
        <p className="plane-hint">{t.tensorShapeHint}</p>
      </div>
    </div>
  );
}

function BroadcastLab({ locale }: LabProps) {
  const t = getMessages(locale).labs;
  const [rows, setRows] = useState(4);
  const [columns, setColumns] = useState(3);
  const [features, setFeatures] = useState(3);
  const [active, setActive] = useState<string | null>(null);

  const result = broadcastShapes([rows, columns], [features]);
  const width = columns * CELL;

  return (
    <div className="plane-lab">
      <svg
        className="plane shape-plane"
        viewBox="0 0 460 320"
        role="img"
        aria-label={t.tensorBroadcastLabel}
      >
        <g transform="translate(50 46)">
          <text className="shape-caption" x={0} y={-16}>
            A {shapeLabel([rows, columns])}
          </text>
          {Array.from({ length: rows }, (_, row) =>
            Array.from({ length: columns }, (_, column) => (
              <rect
                key={`${row}-${column}`}
                className="shape-cell"
                x={column * CELL}
                y={row * CELL}
                width={CELL}
                height={CELL}
              />
            )),
          )}
          <rect className="shape-outline" x={0} y={0} width={width} height={rows * CELL} />
          <EdgeHandle
            x={width}
            y={(rows * CELL) / 2}
            orientation="horizontal"
            label={t.axisColumns}
            value={columns}
            min={1}
            max={6}
            active={active === `A-${t.axisColumns}`}
            onChange={setColumns}
            onActivate={(id) => setActive(id ? `A-${id}` : null)}
          />
          <EdgeHandle
            x={width / 2}
            y={rows * CELL}
            orientation="vertical"
            label={t.axisRows}
            value={rows}
            min={1}
            max={5}
            active={active === `A-${t.axisRows}`}
            onChange={setRows}
            onActivate={(id) => setActive(id ? `A-${id}` : null)}
          />
        </g>

        <g transform="translate(300 46)">
          <text className="shape-caption" x={0} y={-16}>
            B {shapeLabel([features])}
          </text>
          {Array.from({ length: features }, (_, index) => (
            <rect
              key={index}
              className="shape-cell flat"
              x={index * CELL}
              y={0}
              width={CELL}
              height={CELL}
            />
          ))}
          <rect className="shape-outline" x={0} y={0} width={features * CELL} height={CELL} />
          <EdgeHandle
            x={features * CELL}
            y={CELL / 2}
            orientation="horizontal"
            label={t.axisFeatures}
            value={features}
            min={1}
            max={6}
            active={active === `B-${t.axisFeatures}`}
            onChange={setFeatures}
            onActivate={(id) => setActive(id ? `B-${id}` : null)}
          />
        </g>

        <text className="shape-caption" x={230} y={200} textAnchor="middle">
          {result.ok ? t.broadcastOk : t.broadcastFails}
        </text>
        <text className="broadcast-result" x={230} y={234} textAnchor="middle">
          {result.ok ? shapeLabel(result.shape) : shapeLabel([rows, columns])}
        </text>
        <text className="shape-caption" x={230} y={268} textAnchor="middle">
          {result.ok ? t.broadcastAligned : t.broadcastMismatch}
        </text>
      </svg>

      <div className="plane-controls">
        <Readout
          label={t.broadcastResult}
          value={result.ok ? shapeLabel(result.shape) : t.broadcastFails}
        />
        <Readout
          label={t.broadcastAligned}
          value={String(columns === features || features === 1)}
        />
        <ValueInput label={t.axisRows} value={rows} onChange={setRows} step={1} min={1} max={5} digits={0} />
        <ValueInput
          label={t.axisColumns}
          value={columns}
          onChange={setColumns}
          step={1}
          min={1}
          max={6}
          digits={0}
        />
        <ValueInput
          label={t.axisFeatures}
          value={features}
          onChange={setFeatures}
          step={1}
          min={1}
          max={6}
          digits={0}
        />
        <p className="plane-hint">{t.tensorBroadcastHint}</p>
      </div>
    </div>
  );
}

function LayerSizesLab({ locale }: LabProps) {
  const t = getMessages(locale).labs;
  const [hidden, setHidden] = useState(4);
  const [outputs, setOutputs] = useState(2);
  const [active, setActive] = useState<string | null>(null);

  const chain = denseChain([784, hidden, outputs]);
  const inputNodes = 4;
  const hiddenNodes = Math.min(hidden, 6);

  const drag = (value: number, set: (next: number) => void, min: number, max: number, key: string) => ({
    role: "slider" as const,
    tabIndex: 0,
    "aria-label": key,
    "aria-valuetext": `${key}: ${value}`,
    "aria-valuenow": value,
    "aria-valuemin": min,
    "aria-valuemax": max,
    className: `edge-handle ${active === key ? "is-active" : ""}`,
    onPointerDown: (event: React.PointerEvent<SVGGElement>) => {
      event.preventDefault();
      setActive(key);
    },
    onPointerMove: (event: React.PointerEvent<SVGGElement>) => {
      if (active !== key) return;
      const step = Math.sign(event.movementY);
      if (step !== 0) set(Math.max(min, Math.min(max, value + step)));
    },
    onPointerUp: () => setActive(null),
    onKeyDown: (event: React.KeyboardEvent<SVGGElement>) => {
      if (event.key === "ArrowUp") {
        event.preventDefault();
        set(Math.max(min, value - 1));
      }
      if (event.key === "ArrowDown") {
        event.preventDefault();
        set(Math.min(max, value + 1));
      }
    },
  });

  const column = (x: number, count: number, first: number, tone: string) =>
    Array.from({ length: count }, (_, index) => (
      <circle key={index} className={`layer-node ${tone}`} cx={x} cy={60 + index * 34} r={13} />
    )).concat(
      Array.from({ length: count }, (_, index) => (
        <text key={`label-${index}`} className="layer-index" x={x} y={64 + index * 34} textAnchor="middle">
          {index === 0 ? first : index === count - 1 && count > 3 ? count : ""}
        </text>
      )),
    );

  return (
    <div className="plane-lab">
      <svg className="plane shape-plane" viewBox="0 0 460 320" role="img" aria-label={t.layerSizesLabel}>
        <g>{column(70, inputNodes, 1, "is-input")}</g>
        <g>{column(210, hiddenNodes, 1, "is-hidden")}</g>
        <g>{column(370, Math.min(outputs, 5), 1, "is-output")}</g>

        {Array.from({ length: inputNodes }, (_, from) =>
          Array.from({ length: hiddenNodes }, (_, to) => (
            <line
              key={`${from}-${to}`}
              className="layer-link"
              x1={70}
              y1={60 + from * 34}
              x2={210}
              y2={60 + to * 34}
            />
          )),
        )}
        {Array.from({ length: hiddenNodes }, (_, from) =>
          Array.from({ length: Math.min(outputs, 5) }, (_, to) => (
            <line
              key={`${from}-${to}`}
              className="layer-link"
              x1={210}
              y1={60 + from * 34}
              x2={370}
              y2={60 + to * 34}
            />
          )),
        )}

        <text className="shape-caption" x={70} y={30} textAnchor="middle">
          784
        </text>
        <text className="shape-caption" x={210} y={30} textAnchor="middle">
          {hidden}
        </text>
        <text className="shape-caption" x={370} y={30} textAnchor="middle">
          {outputs}
        </text>

        <g transform="translate(258 190)" {...drag(hidden, setHidden, 1, 5, t.hiddenWidth)}>
          <rect className="edge-hit" x={-18} y={-12} width={36} height={24} />
          <rect className="edge-grip" x={-10} y={-3} width={20} height={6} rx={2} />
          <text className="layer-index" x={0} y={-18} textAnchor="middle">
            {t.hiddenWidth}
          </text>
        </g>
        <g transform="translate(418 120)" {...drag(outputs, setOutputs, 1, 4, t.outputWidth)}>
          <rect className="edge-hit" x={-18} y={-12} width={36} height={24} />
          <rect className="edge-grip" x={-10} y={-3} width={20} height={6} rx={2} />
        </g>
        <text className="layer-index" x={418} y={100} textAnchor="middle">
          {t.outputWidth}
        </text>

        <text className="shape-caption" x={20} y={296}>
          nn.Linear(784, {hidden}) → nn.Linear({hidden}, {outputs})
        </text>
      </svg>

      <div className="plane-controls">
        <Readout label={t.hiddenWidth} value={String(hidden)} />
        <Readout label={t.outputWidth} value={String(outputs)} />
        <Readout
          label={t.layerOneParameters}
          value={String(denseParameters(784, hidden))}
        />
        <Readout
          label={t.layerTwoParameters}
          value={String(denseParameters(hidden, outputs))}
        />
        <Readout label={t.totalParameters} value={chain.total.toLocaleString()} />
        <ValueInput label={t.hiddenWidth} value={hidden} onChange={setHidden} step={1} min={1} max={5} digits={0} />
        <ValueInput
          label={t.outputWidth}
          value={outputs}
          onChange={setOutputs}
          step={1}
          min={1}
          max={4}
          digits={0}
        />
        <p className="plane-hint">{t.layerSizesHint}</p>
      </div>
    </div>
  );
}

export const tensorLabs: Record<
  "tensor-shape" | "tensor-broadcast" | "layer-sizes",
  ComponentType<LabProps>
> = {
  "tensor-shape": ShapeLab,
  "tensor-broadcast": BroadcastLab,
  "layer-sizes": LayerSizesLab,
};

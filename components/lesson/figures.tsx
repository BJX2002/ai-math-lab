import type { ComponentType } from "react";
import type { FigureId } from "../../lib/content/types";
import type { Locale } from "../../lib/i18n/locales";
import { getMessages } from "../../lib/i18n/messages";
import { Icon } from "../icons";

/**
 * Illustrated figures, keyed by id.
 *
 * Content refers to a figure by id, and `Record<FigureId, …>` plus the
 * `FIGURE_IDS` union means a missing or misspelled figure is a build error
 * rather than a silent fallback to some other picture.
 *
 * These are the original decorative diagrams, translated. `viz/` primitives
 * replace them with manipulable versions module by module.
 */
type FigureProps = { locale: Locale };

function VectorPicture({ locale }: FigureProps) {
  const f = getMessages(locale).figures.vectors;
  return (
    <div className="vector-picture">
      <div className="thing-card">
        <span>
          <Icon name="specimen" size={40} />
        </span>
        <strong>{f.thing}</strong>
      </div>
      <span className="picture-arrow" aria-hidden="true">
        →
      </span>
      <div className="feature-list">
        <span>
          <small>{f.redness}</small>
          <b>0.9</b>
        </span>
        <span>
          <small>{f.weight}</small>
          <b>0.6</b>
        </span>
        <span>
          <small>{f.roundness}</small>
          <b>0.8</b>
        </span>
      </div>
      <span className="picture-arrow" aria-hidden="true">
        →
      </span>
      <div className="vector-bracket">
        <b>[</b>
        <span>
          0.9
          <br />
          0.6
          <br />
          0.8
        </span>
        <b>]</b>
      </div>
    </div>
  );
}

function DotPicture({ locale }: FigureProps) {
  const messages = getMessages(locale);
  const f = messages.figures.dotProducts;
  // The clues being weighted are the same ones the vector figure introduces.
  const clue = messages.figures.vectors;
  return (
    <div className="dot-picture">
      <div className="dot-row">
        <span>
          {clue.redness} <b>0.9</b>
        </span>
        <i aria-hidden="true">×</i>
        <span>
          {f.importance} <b>0.8</b>
        </span>
        <em>= 0.72</em>
      </div>
      <div className="dot-row">
        <span>
          {clue.weight} <b>0.6</b>
        </span>
        <i aria-hidden="true">×</i>
        <span>
          {f.importance} <b>0.2</b>
        </span>
        <em>= 0.12</em>
      </div>
      <div className="dot-total">
        <span>{f.addMatches}</span>
        <strong>
          {f.score} = 0.84
        </strong>
      </div>
    </div>
  );
}

function MatrixPicture({ locale }: FigureProps) {
  const f = getMessages(locale).figures.matrices;
  return (
    <div className="matrix-picture">
      <div>
        <small>{f.apples}</small>
        <div className="matrix-grid grid-nine">
          {[0.9, 0.6, 0.8, 0.3, 0.7, 0.5, 0.8, 0.4, 0.9].map((value, index) => (
            <i key={index} style={{ opacity: value }}>
              {value}
            </i>
          ))}
        </div>
      </div>
      <span className="picture-arrow" aria-hidden="true">
        →
      </span>
      <div className="machine-box">
        <span>{f.recipe}</span>
      </div>
      <span className="picture-arrow" aria-hidden="true">
        →
      </span>
      <div>
        <small>{f.scores}</small>
        <div className="matrix-grid grid-three">
          <i>.84</i>
          <i>.37</i>
          <i>.90</i>
        </div>
      </div>
    </div>
  );
}

function SystemPicture({ locale }: FigureProps) {
  const f = getMessages(locale).figures.linearSystems;
  return (
    <div className="system-picture">
      <svg viewBox="0 0 520 250" role="img" aria-label={f.aria}>
        <path className="axis" d="M40 220H490M70 235V20" />
        <path className="rule-one" d="M55 205L470 35" />
        <path className="rule-two" d="M70 40L455 220" />
        <circle cx="270" cy="117" r="11" />
      </svg>
      <span className="system-label label-one">{f.ruleOne}</span>
      <span className="system-label label-two">{f.ruleTwo}</span>
      <strong>{f.bothTrue}</strong>
    </div>
  );
}

function PcaPicture({ locale }: FigureProps) {
  const f = getMessages(locale).figures.pcaSvd;
  const dots: [number, number][] = [
    [70, 184],
    [105, 166],
    [140, 170],
    [170, 143],
    [202, 149],
    [236, 121],
    [268, 127],
    [300, 100],
    [332, 95],
    [365, 76],
    [402, 74],
    [440, 50],
    [120, 196],
    [210, 118],
    [315, 126],
    [389, 50],
  ];
  return (
    <div className="pca-picture">
      <svg viewBox="0 0 520 250" role="img" aria-label={f.aria}>
        <path d="M55 210L470 32" />
        {dots.map(([x, y], index) => (
          <circle key={index} cx={x} cy={y} r="8" />
        ))}
      </svg>
      <div>
        <span>{f.detail}</span>
        <span>{f.pattern}</span>
      </div>
    </div>
  );
}

function OptimizationPicture({ locale }: FigureProps) {
  const f = getMessages(locale).figures.optimization;
  const steps: [number, number][] = [
    [90, 67],
    [150, 131],
    [200, 183],
    [244, 211],
  ];
  return (
    <div className="optimization-picture">
      <svg viewBox="0 0 520 250" role="img" aria-label={f.aria}>
        <path className="loss-curve" d="M45 35C120 35 150 215 260 215S400 35 475 35" />
        <path className="step-path" d="M90 67L150 131L200 183L244 211" />
        {steps.map(([x, y], index) => (
          <g key={index}>
            <circle cx={x} cy={y} r="10" />
            <text x={x} y={y - 17}>
              {index + 1}
            </text>
          </g>
        ))}
      </svg>
      <div>
        <span>{f.largeMistake}</span>
        <strong>{f.smallestMistake}</strong>
      </div>
    </div>
  );
}

export const FIGURES: Record<FigureId, ComponentType<FigureProps>> = {
  vectors: VectorPicture,
  "dot-products": DotPicture,
  matrices: MatrixPicture,
  "linear-systems": SystemPicture,
  "pca-svd": PcaPicture,
  optimization: OptimizationPicture,
};

export function FigureView({
  id,
  locale,
  caption,
}: {
  id: FigureId;
  locale: Locale;
  caption?: string;
}) {
  const Picture = FIGURES[id];
  const t = getMessages(locale);

  return (
    <figure className={`lesson-illustration illustration-${id}`}>
      <div className="illustration-label">
        <span>{t.illustration.label}</span>
        <small>{t.illustration.noSymbols}</small>
      </div>
      <div className="illustration-stage">
        <Picture locale={locale} />
      </div>
      {caption ? <figcaption>{caption}</figcaption> : null}
    </figure>
  );
}

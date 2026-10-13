import type { Localized } from "../i18n/localized";

/**
 * Figures and labs are referenced by id from content, never by slug guessing.
 *
 * The old code fell through an `if` chain and rendered the *optimization* lab
 * for any unrecognised slug — so adding a module silently showed the wrong
 * figure and lab. These unions plus `Record<FigureId, …>` registries make a
 * missing figure a TypeScript error instead.
 */
export const FIGURE_IDS = [
  "vectors",
  "dot-products",
  "matrices",
  "linear-systems",
  "pca-svd",
  "optimization",
] as const;
export type FigureId = (typeof FIGURE_IDS)[number];

export const LAB_IDS = [
  "vectors",
  "vector-plane",
  "vector-addition",
  "vector-scaling",
  "dot-products",
  "dot-angle",
  "dot-projection",
  "neuron-boundary",
  "matrices",
  "matrix-warp",
  "matrix-order",
  "matrix-batch",
  "linear-systems",
  "system-lines",
  "least-squares",
  "projection-least-squares",
  "pca-svd",
  "pca-cloud",
  "pca-rank",
  "pca-compress",
  "optimization",
  "descent-contour",
  "descent-curve",
  "descent-rates",
  "perceptron-score",
  "perceptron-limit",
  "activation-shape",
  "activation-compare",
  "activation-gradient",
  "tensor-shape",
  "tensor-broadcast",
  "layer-sizes",
  "loss-cross-entropy",
  "loss-compare",
  "loss-surface",
  "backprop-chain",
  "gradient-check",
  "weight-update",
  "epoch-batch",
  "training-curve",
  "normalization",
] as const;
export type LabId = (typeof LAB_IDS)[number];

export type CalloutTone = "analogy" | "warning" | "takeaway" | "tip";

/**
 * A piece of lesson content.
 *
 * A discriminated union rather than a fixed "three paragraphs plus optional
 * formula" shape: that shape is why every lesson looked the same and why rich
 * figures, predictions, and tables had nowhere to live.
 */
export type LessonBlock =
  | { kind: "prose"; paragraphs: Localized<string[]> }
  | { kind: "formula"; tex: string; caption?: Localized<string>; reveal?: boolean }
  | { kind: "callout"; tone: CalloutTone; title?: Localized<string>; body: Localized<string> }
  | {
      kind: "example";
      title: Localized<string>;
      steps: Localized<string[]>;
      result?: Localized<string>;
    }
  | {
      kind: "predict";
      prompt: Localized<string>;
      options: Localized<string[]>;
      answerIndex: number;
      why: Localized<string>;
    }
  | { kind: "figure"; id: FigureId; caption?: Localized<string> }
  | { kind: "lab"; id: LabId }
  | {
      kind: "table";
      headers: Localized<string[]>;
      rows: Localized<string[][]>;
      caption?: Localized<string>;
    };

/** A numbered lesson section: the `01 / INTUITION` rail in the design. */
export type LessonSection = {
  label: Localized<string>;
  title: Localized<string>;
  blocks: LessonBlock[];
};

export type QuizItem = {
  question: Localized<string>;
  options: Localized<string[]>;
  correct: number;
  explanation: Localized<string>;
};

/**
 * A runnable Python cell.
 *
 * `source` and `expectedOutput` are never translated: a program prints the same
 * bytes in every language. `tests/code-cells.test.mjs` runs `source` and asserts
 * the output matches `expectedOutput` exactly, so the panel cannot drift from
 * what the reader will actually see when they press Run.
 */
export type CodeCell = {
  id: string;
  title: Localized<string>;
  intro: Localized<string>;
  source: string;
  challenge: Localized<string>;
  /** Exact stdout of `source` as written, newline separated, no trailing newline. */
  expectedOutput: string;
  /** What to notice, and what changes once the challenge is attempted. */
  expectedNote: Localized<string>;
};

export type CourseModule = {
  slug: string;
  number: string;
  /** Which half of the course this belongs to. */
  track: "foundations" | "ai";
  title: Localized<string>;
  shortTitle: Localized<string>;
  subtitle: Localized<string>;
  description: Localized<string>;
  /** The one-sentence idea, shown before any symbols. */
  plainIdea: Localized<string>;
  analogy: Localized<string>;
  beforeMath: Localized<string>;
  durationMinutes: number;
  level: Localized<string>;
  aiConnection: Localized<string>;
  outcomes: Localized<string[]>;
  /** Opening figure for the "start gently" section. */
  figure: FigureId;
  /** Caption under the opening figure. */
  figureCaption: Localized<string>;
  sections: LessonSection[];
  lab: LabId;
  code: CodeCell;
  quiz: QuizItem[];
};

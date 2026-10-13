/**
 * Tensor shapes, one-hot labels, and dense-layer arithmetic.
 *
 * Pure and testable, because broadcasting has enough special cases to get subtly
 * wrong and the error would only show up as a figure that disagrees with NumPy.
 * `tests/code-cells.test.mjs` compares `broadcastShapes` with `np.broadcast_shapes`
 * on a table of shape pairs.
 */

export type Shape = readonly number[];

export type BroadcastResult =
  | { ok: true; shape: number[] }
  | { ok: false; mismatch: [number, number] };

/**
 * NumPy's broadcasting rule: line the shapes up from the right, treat missing
 * leading dimensions as 1, and require each pair to be equal or to contain a 1.
 */
export function broadcastShapes(a: Shape, b: Shape): BroadcastResult {
  const width = Math.max(a.length, b.length);
  const result: number[] = [];

  for (let offset = 1; offset <= width; offset += 1) {
    const left = a[a.length - offset] ?? 1;
    const right = b[b.length - offset] ?? 1;
    if (left === right) result.unshift(left);
    else if (left === 1) result.unshift(right);
    else if (right === 1) result.unshift(left);
    else return { ok: false, mismatch: [left, right] };
  }

  return { ok: true, shape: result };
}

export function shapeSize(shape: Shape): number {
  // The identity for a product is 1, not 0: a scalar's size is 1, and reducing
  // from 0 would make every size 0.
  return shape.reduce((total, dimension) => total * dimension, 1);
}

export function shapeLabel(shape: Shape): string {
  return `(${shape.join(", ")})`;
}

export function rank(shape: Shape): number {
  return shape.length;
}

/**
 * Flatten every dimension after `keep` into one.
 *
 * This is the `(64, 1, 28, 28)` to `(64, 784)` step: the batch stays first and
 * everything else becomes the feature vector.
 */
export function flattenTrailing(shape: Shape, keep = 1): number[] {
  if (shape.length <= keep) return [...shape];
  const leading = shape.slice(0, keep);
  const trailing = shapeSize(shape.slice(keep));
  return [...leading, trailing];
}

/** One dense layer stores a weight per input-output pair plus one bias per output. */
export function denseParameters(inFeatures: number, outFeatures: number): number {
  return inFeatures * outFeatures + outFeatures;
}

export type DenseChain = {
  pairs: [number, number][];
  perLayer: number[];
  total: number;
};

/** A stack of dense layers, as `nn.Linear(784, 256)` followed by `nn.Linear(256, 10)`. */
export function denseChain(widths: readonly number[]): DenseChain {
  const pairs: [number, number][] = [];
  for (let index = 0; index + 1 < widths.length; index += 1) {
    pairs.push([widths[index], widths[index + 1]]);
  }
  const perLayer = pairs.map(([input, output]) => denseParameters(input, output));
  return { pairs, perLayer, total: perLayer.reduce((sum, count) => sum + count, 0) };
}

/**
 * The label a classification problem needs.
 *
 * Binary problems need one output; `n` classes need `n`, with the truth written
 * as a one-hot vector rather than a class index.
 */
export function outputWidth(classes: number): number {
  return classes <= 2 ? 1 : classes;
}

export function oneHot(index: number, classes: number): number[] {
  return Array.from({ length: classes }, (_, position) => (position === index ? 1 : 0));
}

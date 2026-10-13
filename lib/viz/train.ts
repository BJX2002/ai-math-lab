import { jacobiEigen } from "./svd";
import { sigmoid } from "./loss";

/**
 * Mini-batch training and the shape of the Error surface.
 *
 * Written so the two figures that depend on it compute rather than illustrate:
 * the loss traces come from real updates on a real dataset, and the
 * normalization figure reports the true condition number of the Hessian rather
 * than an impression of how stretched the picture looks.
 */

export type Sample2 = { features: [number, number]; y: 0 | 1 };

/** Deterministic PRNG, so a "random" mini-batch split is reproducible. */
export function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * A small two-feature set, split by the sign of the first feature.
 *
 * The second feature is deliberately near-useless, so the fitted surface has one
 * stiff direction and one almost flat one — which is what makes the condition
 * number worth showing.
 */
const BASE: [number, number][] = [
  [-1.0, 0.3],
  [-0.6, -0.4],
  [-0.3, 0.1],
  [0.3, -0.2],
  [0.6, 0.5],
  [1.0, -0.1],
  [-0.8, 0.6],
  [0.8, -0.5],
];

/**
 * The dataset with the first feature multiplied by `scale`.
 *
 * Leaving it at 1 is "normalized"; turning it up is exactly the mistake the
 * lectures warn about, and the figure shows why it hurts.
 */
export function scaledData(scale: number): Sample2[] {
  return BASE.map(([first, second], index) => ({
    features: [first * scale, second],
    y: (index < 4 ? 0 : 1) as 0 | 1,
  }));
}

export function loss2(data: Sample2[], w1: number, w2: number): number {
  if (data.length === 0) return 0;
  const total = data.reduce((sum, sample) => {
    const z = w1 * sample.features[0] + w2 * sample.features[1];
    const p = Math.min(1 - 1e-12, Math.max(1e-12, sigmoid(z)));
    return sum - (sample.y * Math.log(p) + (1 - sample.y) * Math.log(1 - p));
  }, 0);
  return total / data.length;
}

export function gradient2(data: Sample2[], w1: number, w2: number): [number, number] {
  if (data.length === 0) return [0, 0];
  let g1 = 0;
  let g2 = 0;
  for (const sample of data) {
    const z = w1 * sample.features[0] + w2 * sample.features[1];
    const residual = sigmoid(z) - sample.y;
    g1 += residual * sample.features[0];
    g2 += residual * sample.features[1];
  }
  return [g1 / data.length, g2 / data.length];
}

/**
 * Condition number of the Hessian of `E(W, b)` at a point.
 *
 * For logistic regression the Hessian is `(1/m) Σ p(1-p) x xᵀ`, so it depends on
 * the feature scales. A large ratio means one direction of the surface is far
 * steeper than the other, which is why a single learning rate cannot serve both.
 */
export function hessianCondition(data: Sample2[], w1: number, w2: number): number {
  let h11 = 0;
  let h12 = 0;
  let h22 = 0;
  for (const sample of data) {
    const z = w1 * sample.features[0] + w2 * sample.features[1];
    const p = sigmoid(z);
    const weight = p * (1 - p);
    const [a, b] = sample.features;
    h11 += weight * a * a;
    h12 += weight * a * b;
    h22 += weight * b * b;
  }
  const size = Math.max(1, data.length);
  h11 /= size;
  h12 /= size;
  h22 /= size;

  const { values } = jacobiEigen([
    [h11, h12],
    [h12, h22],
  ]);
  const large = Math.max(...values);
  const small = Math.min(...values);
  if (small <= 1e-12) return Number.POSITIVE_INFINITY;
  return large / small;
}

export type TrainOptions = {
  rate: number;
  batchSize: number;
  epochs: number;
  seed?: number;
};

export type TrainPoint = { update: number; epoch: number; loss: number };

export type TrainResult = {
  history: TrainPoint[];
  weights: [number, number];
  updatesPerEpoch: number;
};

/**
 * Real mini-batch gradient descent with the lecture's update rule
 * `w' = w - α ∂E/∂w`, one batch at a time.
 *
 * A batch size equal to the dataset size reproduces full-batch descent exactly,
 * which is what the test compares against NumPy.
 */
export function miniBatchTrain(data: Sample2[], options: TrainOptions): TrainResult {
  const { rate, batchSize, epochs } = options;
  const random = mulberry32(options.seed ?? 1);
  const size = Math.max(1, Math.min(batchSize, data.length));
  const updatesPerEpoch = Math.ceil(data.length / size);

  let weights: [number, number] = [0, 0];
  const history: TrainPoint[] = [{ update: 0, epoch: 0, loss: loss2(data, weights[0], weights[1]) }];

  let update = 0;
  for (let epoch = 0; epoch < epochs; epoch += 1) {
    // Fisher-Yates. The tempting `sort(() => random() - 0.5)` is not a uniform
    // shuffle and would make the batch composition quietly biased — a poor thing
    // for a figure that is teaching what a DataLoader does.
    const order = data.map((_, index) => index);
    for (let index = order.length - 1; index > 0; index -= 1) {
      const swap = Math.floor(random() * (index + 1));
      [order[index], order[swap]] = [order[swap], order[index]];
    }
    for (let start = 0; start < order.length; start += size) {
      const batch = order.slice(start, start + size).map((index) => data[index]);
      const [g1, g2] = gradient2(batch, weights[0], weights[1]);
      weights = [weights[0] - rate * g1, weights[1] - rate * g2];
      update += 1;
      history.push({ update, epoch: epoch + 1, loss: loss2(data, weights[0], weights[1]) });
    }
  }

  return { history, weights, updatesPerEpoch };
}

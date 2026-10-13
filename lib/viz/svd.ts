/**
 * A small, real singular value decomposition.
 *
 * Written rather than faked because the module 05 figures claim to show actual
 * low-rank structure: the singular values, the reconstruction, and the error all
 * have to be the genuine article or the picture is a cartoon.
 *
 * Method: the eigen-decomposition of the symmetric matrix MᵀM by cyclic Jacobi
 * rotations, then U = M V / σ. Jacobi is slower than the usual bidiagonalisation
 * but it is short, numerically stable, and easy to check — `tests/content.test.mjs`
 * compares its output with NumPy's on the same matrix.
 */

export type Matrix = number[][];

export type Svd = {
  /** Left singular vectors, one per column. */
  u: Matrix;
  /** Singular values, descending. */
  s: number[];
  /** Right singular vectors, one per column. */
  v: Matrix;
};

function identity(size: number): Matrix {
  return Array.from({ length: size }, (_, row) =>
    Array.from({ length: size }, (_, column) => (row === column ? 1 : 0)),
  );
}

function multiply(a: Matrix, b: Matrix): Matrix {
  const rows = a.length;
  const inner = b.length;
  const columns = b[0]?.length ?? 0;
  const out: Matrix = Array.from({ length: rows }, () => new Array(columns).fill(0));
  for (let i = 0; i < rows; i += 1) {
    for (let k = 0; k < inner; k += 1) {
      const aik = a[i][k];
      if (aik === 0) continue;
      for (let j = 0; j < columns; j += 1) out[i][j] += aik * b[k][j];
    }
  }
  return out;
}

export function transpose(matrix: Matrix): Matrix {
  const columns = matrix[0]?.length ?? 0;
  return Array.from({ length: columns }, (_, j) => matrix.map((row) => row[j]));
}

/**
 * Eigen-decomposition of a symmetric matrix by cyclic Jacobi rotations.
 *
 * Returns eigenvalues descending with matching eigenvectors as columns.
 */
export function jacobiEigen(
  input: Matrix,
  maxSweeps = 60,
): { values: number[]; vectors: Matrix } {
  const size = input.length;
  const a = input.map((row) => [...row]);
  const vectors = identity(size);

  for (let sweep = 0; sweep < maxSweeps; sweep += 1) {
    let offDiagonal = 0;
    for (let p = 0; p < size; p += 1) {
      for (let q = p + 1; q < size; q += 1) offDiagonal += a[p][q] * a[p][q];
    }
    if (offDiagonal < 1e-24) break;

    for (let p = 0; p < size; p += 1) {
      for (let q = p + 1; q < size; q += 1) {
        if (Math.abs(a[p][q]) < 1e-18) continue;

        const theta = (a[q][q] - a[p][p]) / (2 * a[p][q]);
        const sign = theta >= 0 ? 1 : -1;
        const t = sign / (Math.abs(theta) + Math.sqrt(theta * theta + 1));
        const c = 1 / Math.sqrt(t * t + 1);
        const s = t * c;

        for (let k = 0; k < size; k += 1) {
          const akp = a[k][p];
          const akq = a[k][q];
          a[k][p] = c * akp - s * akq;
          a[k][q] = s * akp + c * akq;
        }
        for (let k = 0; k < size; k += 1) {
          const apk = a[p][k];
          const aqk = a[q][k];
          a[p][k] = c * apk - s * aqk;
          a[q][k] = s * apk + c * aqk;
        }
        for (let k = 0; k < size; k += 1) {
          const vkp = vectors[k][p];
          const vkq = vectors[k][q];
          vectors[k][p] = c * vkp - s * vkq;
          vectors[k][q] = s * vkp + c * vkq;
        }
      }
    }
  }

  const pairs = Array.from({ length: size }, (_, index) => ({
    value: a[index][index],
    vector: vectors.map((row) => row[index]),
  })).sort((first, second) => second.value - first.value);

  return {
    values: pairs.map((pair) => pair.value),
    vectors: pairs[0].vector.map((_, row) => pairs.map((pair) => pair.vector[row])),
  };
}

export function svd(matrix: Matrix): Svd {
  const rows = matrix.length;
  const columns = matrix[0]?.length ?? 0;
  // Pad so the shorter dimension is the one we decompose, which keeps V square.
  const gram = multiply(transpose(matrix), matrix);
  const { values, vectors } = jacobiEigen(gram);

  const singularValues = values.map((value) => Math.sqrt(Math.max(0, value)));
  const v = vectors;

  // u_i = M v_i / σ_i; a zero singular value contributes nothing to any
  // reconstruction, so leaving that column as zeros is safe.
  const u: Matrix = Array.from({ length: rows }, () => new Array(columns).fill(0));
  for (let index = 0; index < columns; index += 1) {
    const sigma = singularValues[index];
    if (sigma < 1e-12) continue;
    for (let row = 0; row < rows; row += 1) {
      let sum = 0;
      for (let k = 0; k < columns; k += 1) sum += matrix[row][k] * v[k][index];
      u[row][index] = sum / sigma;
    }
  }

  return { u, s: singularValues, v };
}

/**
 * Numerical rank, using a tolerance relative to the largest singular value.
 *
 * An absolute threshold is wrong here. Decomposing MᵀM squares the condition
 * number, so a genuinely zero singular value comes back around 1e-6 instead of
 * 1e-16 — big enough to sneak past an absolute cutoff and make a rank-4 image
 * look like rank 5.
 */
export function numericalRank(singularValues: number[], tolerance = 1e-6): number {
  const largest = singularValues[0] ?? 0;
  if (largest === 0) return 0;
  return singularValues.filter((value) => value > tolerance * largest).length;
}

/** The best rank-k approximation U_k Σ_k V_kᵀ. */
export function rankKApproximation({ u, s, v }: Svd, k: number): Matrix {
  const rows = u.length;
  const columns = v.length;
  const out: Matrix = Array.from({ length: rows }, () => new Array(columns).fill(0));
  for (let component = 0; component < Math.min(k, s.length); component += 1) {
    const sigma = s[component];
    if (sigma < 1e-12) continue;
    for (let row = 0; row < rows; row += 1) {
      const left = u[row][component] * sigma;
      if (left === 0) continue;
      for (let column = 0; column < columns; column += 1) {
        out[row][column] += left * v[column][component];
      }
    }
  }
  return out;
}

export function frobeniusNorm(matrix: Matrix): number {
  let total = 0;
  for (const row of matrix) for (const value of row) total += value * value;
  return Math.sqrt(total);
}

/** Relative reconstruction error ‖M − M_k‖_F / ‖M‖_F. */
export function reconstructionError(original: Matrix, approximation: Matrix): number {
  const rows = original.length;
  const columns = original[0]?.length ?? 0;
  let total = 0;
  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const difference = original[row][column] - approximation[row][column];
      total += difference * difference;
    }
  }
  const norm = frobeniusNorm(original);
  return norm === 0 ? 0 : Math.sqrt(total) / norm;
}

/**
 * Numbers actually stored by a rank-k approximation: U_k, Σ_k and V_kᵀ.
 *
 * This replaces the hand-typed compression ratio the first version showed, which
 * was arithmetic about numbers nobody was actually storing.
 */
export function storedNumbers(rows: number, columns: number, k: number): number {
  return k * (rows + columns + 1);
}

/** An 8x8 "photograph": a bright plateau inside a darker frame. */
export const SAMPLE_IMAGE: Matrix = [
  [10, 10, 10, 10, 10, 10, 10, 10],
  [10, 60, 60, 60, 60, 60, 60, 10],
  [10, 60, 200, 200, 200, 200, 60, 10],
  [10, 60, 200, 255, 255, 200, 60, 10],
  [10, 60, 200, 255, 255, 200, 60, 10],
  [10, 60, 200, 200, 200, 200, 60, 10],
  [10, 60, 60, 60, 60, 60, 60, 10],
  [10, 10, 10, 10, 10, 10, 10, 10],
];

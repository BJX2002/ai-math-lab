export type LessonSection = {
  title: string;
  label: string;
  body: string[];
  formula?: string;
  example?: string;
  takeaway?: string;
};

export type QuizItem = {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
};

export type CourseModule = {
  slug: string;
  number: string;
  title: string;
  shortTitle: string;
  subtitle: string;
  description: string;
  plainIdea: string;
  analogy: string;
  beforeMath: string;
  duration: string;
  level: string;
  aiConnection: string;
  outcomes: string[];
  sections: LessonSection[];
  codeTitle: string;
  codeIntro: string;
  code: string;
  challenge: string;
  expected: string;
  quiz: QuizItem[];
};

export const courseModules: CourseModule[] = [
  {
    slug: "vectors",
    number: "01",
    title: "Vectors: data with direction",
    shortTitle: "Vectors",
    subtitle: "Represent data",
    description: "Turn lists of numbers into a language for features, images, words, and model parameters.",
    plainIdea: "A vector is just a list of numbers that belong together.",
    analogy: "Think of a character sheet in a game: health, speed, and strength are three numbers describing one character.",
    beforeMath: "If you can read a shopping list, you already understand the basic idea of a vector.",
    duration: "35 min",
    level: "Foundation",
    aiConnection: "An input row, an embedding, and a model's weights can all be represented as vectors.",
    outcomes: [
      "Read vector notation and identify its dimension",
      "Add, scale, and compare vectors",
      "Use the L2 norm to measure vector length",
      "Create and inspect vectors with NumPy",
    ],
    sections: [
      {
        label: "INTUITION",
        title: "A vector is an ordered list",
        body: [
          "A vector stores several related numbers in a fixed order. The order gives each position meaning: [hours studied, sleep, attendance] is not the same as [sleep, attendance, hours studied].",
          "We write vectors vertically in mathematics and usually as one-dimensional arrays in Python. Their dimension is simply the number of entries.",
        ],
        formula: "x = [x₁, x₂, …, xₙ]   →   x ∈ ℝⁿ",
        example: "A student profile x = [6, 7.5, 0.9] has dimension 3.",
        takeaway: "Always ask: what does each coordinate mean, and in what units?",
      },
      {
        label: "OPERATIONS",
        title: "Add information; scale influence",
        body: [
          "Vector addition combines matching coordinates. Scalar multiplication changes every coordinate by the same factor. Both operations preserve the vector's dimension.",
          "In machine learning, an update such as w_new = w − 0.01g subtracts a small, scaled gradient vector from a weight vector.",
        ],
        formula: "[1, 2] + [3, −1] = [4, 1]     2[1, 2] = [2, 4]",
        example: "You may add two 3D vectors, but you cannot add a 2D vector directly to a 3D vector.",
      },
      {
        label: "MEASUREMENT",
        title: "Length is captured by a norm",
        body: [
          "The L2 norm is the ordinary straight-line length from the origin to the vector. Square each coordinate, add the squares, then take the square root.",
          "Normalization divides a non-zero vector by its norm. The result keeps the same direction and has length 1.",
        ],
        formula: "‖x‖₂ = √(x₁² + x₂² + … + xₙ²)     x̂ = x / ‖x‖₂",
        example: "For x = [3, 4], ‖x‖₂ = 5 and x̂ = [0.6, 0.8].",
        takeaway: "Norms help compare magnitudes, regularize models, and normalize embeddings.",
      },
    ],
    codeTitle: "Inspect and normalize a vector",
    codeIntro: "NumPy makes shape and numerical operations explicit. The tiny epsilon avoids division by zero in production code.",
    code: `import numpy as np

x = np.array([3.0, 4.0])
length = np.linalg.norm(x)
unit_x = x / (length + 1e-12)

print("shape:", x.shape)
print("length:", length)
print("unit vector:", unit_x)`,
    challenge: "Change x to [1, 2, 2]. Predict the dimension and norm before running the code.",
    expected: "shape: (3,), length: 3.0, unit vector: [0.333..., 0.666..., 0.666...]",
    quiz: [
      { question: "What is the dimension of [2, 0, −1, 5]?", options: ["2", "4", "5"], correct: 1, explanation: "Dimension counts entries, so this vector is in ℝ⁴." },
      { question: "What is 3[1, −2]?", options: ["[3, −6]", "[4, 1]", "[3, −2]"], correct: 0, explanation: "A scalar multiplies every coordinate." },
      { question: "What does normalization usually preserve?", options: ["Magnitude", "Direction", "Dimension and magnitude only"], correct: 1, explanation: "Normalization changes the length to 1 while preserving direction." },
    ],
  },
  {
    slug: "dot-products",
    number: "02",
    title: "Dot products: similarity and scores",
    shortTitle: "Dot products",
    subtitle: "Measure similarity",
    description: "Connect multiplication, geometry, cosine similarity, and the score computed by a neuron.",
    plainIdea: "A dot product asks: how well do these two lists match?",
    analogy: "It works like a recipe score: multiply each ingredient by how important it is, then add the results.",
    beforeMath: "The answer is one number—a score—not another list.",
    duration: "40 min",
    level: "Foundation",
    aiConnection: "Attention scores, recommendation similarity, and a neuron's weighted sum all use dot products.",
    outcomes: ["Compute a dot product", "Interpret its sign geometrically", "Calculate cosine similarity", "Recognize w·x + b inside a neuron"],
    sections: [
      {
        label: "CALCULATION",
        title: "Multiply matching entries, then add",
        body: ["The dot product takes two vectors of the same dimension and produces one number. It is therefore a vector-to-scalar operation.", "That number becomes a useful score when one vector stores input features and the other stores feature importance."],
        formula: "a · b = a₁b₁ + a₂b₂ + … + aₙbₙ",
        example: "[2, 1] · [3, −4] = 2×3 + 1×(−4) = 2.",
      },
      {
        label: "GEOMETRY",
        title: "The dot product sees angle",
        body: ["The same operation also equals the product of the vectors' lengths and the cosine of the angle between them.", "A positive result indicates broadly similar directions; zero means perpendicular; a negative result indicates opposing directions."],
        formula: "a · b = ‖a‖ ‖b‖ cos θ",
        example: "[1, 0] · [0, 1] = 0, so the coordinate axes are perpendicular.",
        takeaway: "Magnitude affects the raw dot product; cosine similarity removes magnitude.",
      },
      {
        label: "AI BRIDGE",
        title: "A neuron begins with a dot product",
        body: ["A neuron assigns one weight to each input, computes their dot product, and adds a bias. An activation function then decides how that score should pass forward.", "Large positive weights reward matching positive features; negative weights penalize them."],
        formula: "z = w · x + b     output = activation(z)",
        example: "w=[0.2, 0.8], x=[1, 0.5], b=−0.1 gives z=0.5.",
      },
    ],
    codeTitle: "Compare two embeddings",
    codeIntro: "Cosine similarity is the normalized dot product. Values near 1 point in similar directions.",
    code: `import numpy as np

a = np.array([1.0, 2.0, 1.0])
b = np.array([2.0, 3.0, 0.0])

dot = a @ b
cosine = dot / (np.linalg.norm(a) * np.linalg.norm(b))
print("dot:", dot)
print("cosine:", round(cosine, 3))`,
    challenge: "Replace b with −a. Predict the cosine similarity and explain its geometric meaning.",
    expected: "cosine: −1.0 — the vectors point in exactly opposite directions.",
    quiz: [
      { question: "What shape is the result of a dot product between two vectors?", options: ["A scalar", "A vector", "A matrix"], correct: 0, explanation: "A vector dot vector operation sums to one scalar." },
      { question: "If non-zero vectors have cosine similarity 0, they are…", options: ["Parallel", "Perpendicular", "Identical"], correct: 1, explanation: "cos 90° = 0, so the vectors are perpendicular." },
      { question: "Which expression starts a typical neuron?", options: ["w + x + b", "w · x + b", "‖w‖ / x"], correct: 1, explanation: "A neuron uses a weighted sum: the dot product plus bias." },
    ],
  },
  {
    slug: "matrices",
    number: "03",
    title: "Matrices: transformations and batches",
    shortTitle: "Matrices",
    subtitle: "Transform batches",
    description: "Read shapes confidently and understand how matrix multiplication powers dense neural-network layers.",
    plainIdea: "A matrix is a table of numbers, and it can change many inputs at once.",
    analogy: "Imagine a spreadsheet: each row is one student and each column is one fact about that student.",
    beforeMath: "Matrices let a neural network process a whole group instead of one item at a time.",
    duration: "45 min",
    level: "Core",
    aiConnection: "A dense layer transforms a batch of examples with Y = XW + b.",
    outcomes: ["Read rows, columns, and shapes", "Transpose a matrix", "Check matrix multiplication compatibility", "Connect XW + b to a dense layer"],
    sections: [
      {
        label: "STRUCTURE",
        title: "A matrix is a rectangular table",
        body: ["A matrix with m rows and n columns has shape m × n. In datasets, rows often represent examples and columns represent features.", "Index Aᵢⱼ means the entry in row i and column j."],
        formula: "A ∈ ℝᵐˣⁿ     shape(A) = (m, n)",
        example: "100 students described by 8 features form a data matrix X with shape (100, 8).",
      },
      {
        label: "TRANSFORM",
        title: "Matrix multiplication combines dot products",
        body: ["For AB to exist, the inner dimensions must agree. Every result entry is the dot product of one row of A and one column of B.", "This shape rule is the fastest way to catch many AI coding errors."],
        formula: "(m × n)(n × p) → (m × p)",
        example: "X(32×128) W(128×64) produces Y(32×64).",
        takeaway: "The shared inner dimension disappears; the outer dimensions remain.",
      },
      {
        label: "ORIENTATION",
        title: "Transpose swaps rows and columns",
        body: ["The transpose Aᵀ turns every row into a column. Its shape changes from m × n to n × m.", "Transposes help align dimensions and appear throughout covariance, least squares, and backpropagation."],
        formula: "(Aᵀ)ᵢⱼ = Aⱼᵢ     (AB)ᵀ = BᵀAᵀ",
        example: "If X has shape (200, 5), Xᵀ has shape (5, 200).",
      },
    ],
    codeTitle: "Build a dense-layer forward pass",
    codeIntro: "The batch dimension stays intact while the feature dimension changes from 3 to 2.",
    code: `import numpy as np

X = np.array([[1.0, 0.5, -1.0],
              [0.0, 2.0,  1.0]])   # (2, 3)
W = np.array([[0.2, 0.8],
              [0.5, 0.1],
              [0.3, 0.4]])          # (3, 2)
b = np.array([0.1, -0.1])           # (2,)

Y = X @ W + b
print(Y.shape)
print(Y)`,
    challenge: "Without running it, predict Y.shape. Then explain why adding b works for both rows.",
    expected: "Y.shape is (2, 2). NumPy broadcasts the length-2 bias across both examples.",
    quiz: [
      { question: "Can shapes (4, 3) and (3, 2) be multiplied in that order?", options: ["Yes, result (4, 2)", "Yes, result (3, 3)", "No"], correct: 0, explanation: "The inner 3s agree; the outer dimensions give (4, 2)." },
      { question: "What is the transpose shape of (12, 5)?", options: ["(12, 5)", "(5, 12)", "(60,)"], correct: 1, explanation: "Transpose swaps rows and columns." },
      { question: "In XW, what usually does each row of X represent?", options: ["One feature", "One example", "One weight"], correct: 1, explanation: "The common row-major convention stores one example per row." },
    ],
  },
  {
    slug: "linear-systems",
    number: "04",
    title: "Linear systems: solving for the unknown",
    shortTitle: "Linear systems",
    subtitle: "Find useful solutions",
    description: "Understand Ax=b, uniqueness, rank, and why least squares is useful when real data is imperfect.",
    plainIdea: "A linear system is a set of clues that point to the same unknown answer.",
    analogy: "If two friends give you different clues about a hidden number, the answer must satisfy both clues.",
    beforeMath: "Solving means finding the place where all the rules agree.",
    duration: "50 min",
    level: "Core",
    aiConnection: "Linear regression and many estimation problems ask for a best-fitting solution to a system.",
    outcomes: ["Translate equations into Ax=b", "Recognize unique, missing, or multiple solutions", "Explain rank informally", "Use solve and least squares correctly"],
    sections: [
      {
        label: "MODEL",
        title: "Many equations become one matrix equation",
        body: ["A linear system groups coefficients into A, unknowns into x, and observed values into b. Solving means finding an x that makes Ax equal b.", "Each equation describes a line or plane; a common solution lies at their intersection."],
        formula: "Ax = b",
        example: "2x+y=5 and x−y=1 become [[2,1],[1,−1]][x,y]ᵀ=[5,1]ᵀ.",
      },
      {
        label: "STRUCTURE",
        title: "Rank counts independent information",
        body: ["If one equation merely repeats another, it adds no new information. Rank summarizes how many independent directions or constraints a matrix contains.", "For a square system, full rank gives a unique solution. Lower rank can create no solution or infinitely many."],
        formula: "full rank square A  →  A⁻¹ exists  →  unique x",
        takeaway: "Do not compute A⁻¹ in ordinary code just to solve Ax=b; use a numerical solver.",
      },
      {
        label: "REAL DATA",
        title: "Least squares finds the closest fit",
        body: ["Noisy datasets usually contain more equations than unknowns and may have no exact solution. Least squares chooses x that minimizes the squared residual length.", "This is the algebraic heart of ordinary linear regression."],
        formula: "x* = arg minₓ ‖Ax − b‖₂²",
        example: "Fit one straight line to many points even when no line passes through every point.",
      },
    ],
    codeTitle: "Exact solve versus best fit",
    codeIntro: "Use np.linalg.solve for a square full-rank system and lstsq for an overdetermined fit.",
    code: `import numpy as np

A = np.array([[2.0, 1.0], [1.0, -1.0]])
b = np.array([5.0, 1.0])
x = np.linalg.solve(A, b)
print("exact:", x)

X = np.array([[1, 0], [1, 1], [1, 2], [1, 3]])
y = np.array([1.0, 2.1, 2.9, 4.2])
beta, *_ = np.linalg.lstsq(X, y, rcond=None)
print("intercept, slope:", beta)`,
    challenge: "Change the final y value from 4.2 to 8.0. Which fitted parameter changes more, and why?",
    expected: "The fitted slope rises substantially because the high-x observation is pulled upward.",
    quiz: [
      { question: "What does Ax=b ask us to find?", options: ["A", "x", "The shape of b"], correct: 1, explanation: "A and b are known; x contains the unknowns." },
      { question: "What does low rank suggest?", options: ["Some information is redundant", "All entries are negative", "The matrix is always large"], correct: 0, explanation: "Rank measures independent rows or columns, not size or sign." },
      { question: "Least squares minimizes…", options: ["The number of features", "The squared residual", "The matrix rank"], correct: 1, explanation: "It minimizes ‖Ax−b‖²." },
    ],
  },
  {
    slug: "pca-svd",
    number: "05",
    title: "PCA & SVD: keep the useful structure",
    shortTitle: "PCA & SVD",
    subtitle: "Compress information",
    description: "See projection, principal directions, explained variance, and low-rank approximation without losing the big picture.",
    plainIdea: "PCA and SVD keep the big pattern and throw away some tiny detail.",
    analogy: "A thumbnail is smaller than the original photo but still lets you recognize what the picture shows.",
    beforeMath: "Compression is useful when data has many numbers but only a few important patterns.",
    duration: "55 min",
    level: "Explore",
    aiConnection: "Dimensionality reduction, recommendation systems, image compression, and latent features rely on low-rank structure.",
    outcomes: ["Understand projection", "Explain what PCA preserves", "Read an SVD factorization", "Reason about low-rank compression"],
    sections: [
      {
        label: "PROJECTION",
        title: "Describe data along a chosen direction",
        body: ["Projection asks how much of a vector points along another direction. With a unit direction u, the scalar coordinate is x·u and the projected vector is (x·u)u.", "Reducing dimensions means choosing a few informative directions and recording only those coordinates."],
        formula: "projᵤ(x) = (x · u)u   when ‖u‖=1",
        example: "A 100-feature example can be represented by 10 projection scores.",
      },
      {
        label: "PCA",
        title: "Principal components capture variance",
        body: ["PCA first centers the dataset by subtracting the feature means. It then finds orthogonal directions that capture as much variation as possible.", "The first component captures the most variance, the second captures the most remaining variance, and so on."],
        formula: "X_centered = X − mean(X)",
        takeaway: "PCA is sensitive to feature scale, so standardization may be necessary.",
      },
      {
        label: "SVD",
        title: "Factor a matrix into useful directions",
        body: ["SVD writes a matrix as UΣVᵀ. U and V contain orthogonal directions; the singular values in Σ rank their importance.", "Keeping only the largest k singular values gives the best rank-k approximation under common matrix norms."],
        formula: "X = UΣVᵀ     Xₖ = UₖΣₖVₖᵀ",
        example: "Images can be stored approximately using a small number of singular components.",
      },
    ],
    codeTitle: "Run PCA with SVD",
    codeIntro: "After centering, the right singular vectors give principal directions and squared singular values measure captured variance.",
    code: `import numpy as np

X = np.array([[2., 0.], [0., 1.], [3., 1.], [4., 2.]])
Xc = X - X.mean(axis=0)
U, s, Vt = np.linalg.svd(Xc, full_matrices=False)

scores_1d = Xc @ Vt[0]
explained = s**2 / np.sum(s**2)
print("first component:", Vt[0])
print("explained ratio:", explained)
print("1D coordinates:", scores_1d)`,
    challenge: "Reconstruct Xc using only the first component. What shape is the reconstruction, and what has been lost?",
    expected: "The reconstruction still has Xc's original shape, but variation along later components is removed.",
    quiz: [
      { question: "What must normally happen before PCA?", options: ["Center the data", "Delete negative values", "Make every row identical"], correct: 0, explanation: "PCA works on variation around the feature means." },
      { question: "Which singular values are kept in a rank-k approximation?", options: ["The k smallest", "The k largest", "Only negative ones"], correct: 1, explanation: "The largest singular values capture the strongest structure." },
      { question: "PCA components are…", options: ["Orthogonal directions", "Class labels", "Random duplicates"], correct: 0, explanation: "Principal directions are mutually orthogonal." },
    ],
  },
  {
    slug: "optimization",
    number: "06",
    title: "Optimization: how a model learns",
    shortTitle: "Optimization",
    subtitle: "Teach models to learn",
    description: "Connect loss, gradients, learning rates, and gradient descent to the training loop used by neural networks.",
    plainIdea: "Learning means making a guess, measuring the mistake, and adjusting a little.",
    analogy: "It is like walking downhill in fog: feel which way slopes down, take a small step, and repeat.",
    beforeMath: "A model learns by repeating this correction many times—not by suddenly becoming intelligent.",
    duration: "50 min",
    level: "AI bridge",
    aiConnection: "Training repeatedly computes a loss, differentiates it, and updates parameter vectors and matrices.",
    outcomes: ["Interpret a loss function", "Read a gradient vector", "Perform a gradient-descent update", "Reason about learning-rate size"],
    sections: [
      {
        label: "OBJECTIVE",
        title: "Loss turns quality into a number",
        body: ["A loss function measures how wrong a model is. Training searches for parameters that make this number small.", "The loss surface maps every possible parameter setting to its loss value."],
        formula: "θ* = arg minθ L(θ)",
        example: "Mean squared error penalizes the squared difference between prediction and target.",
      },
      {
        label: "DIRECTION",
        title: "The gradient points uphill",
        body: ["For many parameters, the gradient is a vector of partial derivatives. It identifies the direction of steepest local increase.", "To reduce loss, move a small distance in the opposite direction."],
        formula: "∇L(θ) = [∂L/∂θ₁, …, ∂L/∂θₙ]",
        takeaway: "The gradient has the same shape as the parameters it updates.",
      },
      {
        label: "UPDATE",
        title: "Learning rate controls step size",
        body: ["Gradient descent repeats: compute predictions, calculate loss, find gradients, and update parameters.", "A rate that is too large may overshoot or diverge; one that is too small may learn painfully slowly."],
        formula: "θ_new = θ_old − η∇L(θ_old)",
        example: "For L(x)=x², the gradient is 2x and x←x−η(2x).",
      },
    ],
    codeTitle: "Watch gradient descent converge",
    codeIntro: "This small loop uses the analytical gradient of L(x)=x². Neural networks use automatic differentiation for the same update pattern.",
    code: `x = 5.0
learning_rate = 0.1

for step in range(8):
    loss = x ** 2
    gradient = 2 * x
    x = x - learning_rate * gradient
    print(step, round(loss, 4), round(x, 4))`,
    challenge: "Try learning rates 0.01, 0.5, and 1.1. Which converges fastest, stalls, or diverges?",
    expected: "0.01 is slow; 0.5 reaches zero in one step for this function; 1.1 oscillates with growing magnitude.",
    quiz: [
      { question: "Which direction reduces loss locally?", options: ["The gradient", "The negative gradient", "Any perpendicular direction"], correct: 1, explanation: "The gradient points uphill, so its negative points downhill." },
      { question: "What does η represent?", options: ["The learning rate", "The number of labels", "The matrix rank"], correct: 0, explanation: "η controls the update step size." },
      { question: "A very large learning rate may…", options: ["Always reach the minimum", "Overshoot and diverge", "Remove all features"], correct: 1, explanation: "Steps can jump across the valley and grow rather than settle." },
    ],
  },
];

export function getModule(slug: string) {
  return courseModules.find((module) => module.slug === slug);
}

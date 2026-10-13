import type { CourseModule } from "../types";

export const linearSystems: CourseModule = {
  slug: "linear-systems",
  number: "04",
  track: "foundations",
  durationMinutes: 50,
  level: { zh: "核心", en: "Core" },
  title: {
    zh: "线性方程组：解出未知数",
    en: "Linear systems: solving for the unknown",
  },
  shortTitle: { zh: "线性方程组", en: "Linear systems" },
  subtitle: { zh: "找到有用的解", en: "Find useful solutions" },
  description: {
    zh: "理解 Ax = b、解的唯一性、秩，以及在真实数据不完美时最小二乘为什么有用。",
    en: "Understand Ax=b, uniqueness, rank, and why least squares is useful when real data is imperfect.",
  },
  plainIdea: {
    zh: "线性方程组是一组线索，它们指向同一个未知的答案。",
    en: "A linear system is a set of clues that point to the same unknown answer.",
  },
  analogy: {
    zh: "两个朋友各给你一条线索。答案必须同时满足两条线索，否则它就不是答案。",
    en: "Two friends each give you a clue about a hidden number. The answer must satisfy both clues, or it is not the answer.",
  },
  beforeMath: {
    zh: "求解，就是找出所有规则都同意的那一点。",
    en: "Solving means finding the place where all the rules agree.",
  },
  aiConnection: {
    zh: "线性回归和很多估计问题，都是在找一组「最贴合」的解。",
    en: "Linear regression and many estimation problems ask for a best-fitting solution to a system.",
  },
  outcomes: {
    zh: ["把方程翻译成 Ax = b", "分辨唯一解、无解、无穷多解", "用直觉解释「秩」", "正确使用 solve 与最小二乘"],
    en: [
      "Translate equations into Ax=b",
      "Recognize unique, missing, or multiple solutions",
      "Explain rank informally",
      "Use solve and least squares correctly",
    ],
  },
  figure: "linear-systems",
  figureCaption: {
    zh: "每条直线是一条规则。它们的交点，就是同时满足两条规则的答案。",
    en: "Each line is one rule. Their crossing point is the answer that satisfies both rules.",
  },
  sections: [
    {
      label: { zh: "建模", en: "MODEL" },
      title: { zh: "很多个方程，合成一个矩阵方程", en: "Many equations become one matrix equation" },
      blocks: [
        {
          kind: "prose",
          paragraphs: {
            zh: [
              "线性方程组把系数收进 A、未知数收进 x、已知的结果收进 b。求解就是找一个 x，让 Ax 等于 b。",
              "每个方程描述一条直线或一个平面；共同的解就在它们的交点或交线上。",
            ],
            en: [
              "A linear system groups coefficients into A, unknowns into x, and observed values into b. Solving means finding an x that makes Ax equal b.",
              "Each equation describes a line or plane; a common solution lies at their intersection.",
            ],
          },
        },
        {
          kind: "formula",
          tex: String.raw`\begin{cases} 2x + y = 5 \\ x - y = 1 \end{cases} \qquad\Longleftrightarrow\qquad \begin{bmatrix} 2 & 1 \\ 1 & -1 \end{bmatrix}\begin{bmatrix} x \\ y \end{bmatrix} = \begin{bmatrix} 5 \\ 1 \end{bmatrix}`,
          reveal: true,
        },
        {
          kind: "lab",
          id: "system-lines",
        },
        {
          kind: "example",
          title: { zh: "消元法：把规则一步步变简单", en: "Elimination: simplify the rules step by step" },
          steps: {
            zh: [
              "从 x + 2y + 3z = 6、2x + 5y + 2z = 4、6x − 3y + z = 2 出发。",
              "第 2 行减去 2 倍第 1 行：得到 y − 4z = −8。",
              "第 3 行减去 6 倍第 1 行：得到 −15y − 17z = −34。",
              "第 3 行加上 15 倍第 2 行：得到 −77z = −154，所以 z = 2。",
              "回代：y − 4(2) = −8，所以 y = 0；再由第 1 行 x + 0 + 6 = 6，所以 x = 0。",
            ],
            en: [
              "Start from x + 2y + 3z = 6, 2x + 5y + 2z = 4, and 6x − 3y + z = 2.",
              "Row 2 minus 2 × row 1: y − 4z = −8.",
              "Row 3 minus 6 × row 1: −15y − 17z = −34.",
              "Row 3 plus 15 × row 2: −77z = −154, so z = 2.",
              "Back-substitute: y − 4(2) = −8 gives y = 0, and row 1 gives x + 0 + 6 = 6, so x = 0.",
            ],
          },
          result: {
            zh: "解是 (x, y, z) = (0, 0, 2)。每一步都只是「把一条规则换成等价的、更简单的规则」，答案集合从未改变。",
            en: "The solution is (x, y, z) = (0, 0, 2). Each step only replaces a rule with an equivalent simpler one — the set of solutions never changes.",
          },
        },
      ],
    },
    {
      label: { zh: "结构", en: "STRUCTURE" },
      title: { zh: "秩，数的是「有几条独立的信息」", en: "Rank counts independent information" },
      blocks: [
        {
          kind: "prose",
          paragraphs: {
            zh: [
              "如果一个方程只是另一个方程的重复，它没有带来任何新信息。秩，概括的就是一个矩阵里到底有多少条相互独立的方向或约束。",
              "对方阵来说：满秩 → 有唯一解；秩不足 → 要么无解，要么无穷多解。",
            ],
            en: [
              "If one equation merely repeats another, it adds no new information. Rank summarizes how many independent directions or constraints a matrix contains.",
              "For a square system, full rank gives a unique solution. Lower rank can create no solution or infinitely many.",
            ],
          },
        },
        {
          kind: "formula",
          tex: String.raw`\text{full rank } A \;\Longrightarrow\; A^{-1} \text{ exists} \;\Longrightarrow\; \text{unique } x`,
          reveal: true,
        },
        {
          kind: "predict",
          prompt: {
            zh: "真实数据里，两个特征其实是同一件事的两种记录（比如「平方米」和「平方英尺」的面积）。这个矩阵的秩会怎样？",
            en: "In real data two features are the same fact recorded twice (say area in square metres and in square feet). What happens to the rank?",
          },
          options: {
            zh: ["秩仍然满", "秩会少 1，矩阵变得不可逆"],
            en: ["It stays full rank", "It drops by 1 and the matrix becomes singular"],
          },
          answerIndex: 1,
          why: {
            zh: "其中一列只是另一列的倍数，没有带来新方向，所以秩少 1。这就是「多重共线性」，它会让回归系数变得极不稳定——数值上表现为 det(A)≈0，解会剧烈跳动。",
            en: "One column is just a multiple of the other, so it adds no new direction and the rank drops by 1. This is multicollinearity: regression coefficients become wildly unstable, and numerically det(A)≈0 makes the solution jump around.",
          },
        },
        {
          kind: "callout",
          tone: "warning",
          body: {
            zh: "不要在普通代码里先算 A⁻¹ 再乘 b。求解器的精度和速度都更好：用 np.linalg.solve，而不是 inv(A) @ b。",
            en: "Do not compute A⁻¹ and then multiply by b in ordinary code. A solver is both faster and more accurate: use np.linalg.solve, not inv(A) @ b.",
          },
        },
      ],
    },
    {
      label: { zh: "真实数据", en: "REAL DATA" },
      title: { zh: "最小二乘：找最接近的解", en: "Least squares finds the closest fit" },
      blocks: [
        {
          kind: "prose",
          paragraphs: {
            zh: [
              "带噪声的数据往往「方程比未知数多」，而且可能根本没有精确解。最小二乘的做法是：选一个 x，让残差向量的平方长度 ‖Ax − b‖² 最小。",
              "这就是普通线性回归背后的代数核心。",
            ],
            en: [
              "Noisy datasets usually contain more equations than unknowns and may have no exact solution. Least squares chooses x that minimizes the squared length of the residual, ‖Ax − b‖².",
              "This is the algebraic heart of ordinary linear regression.",
            ],
          },
        },
        {
          kind: "formula",
          tex: String.raw`x^{*} = \arg\min_{x} \|Ax - b\|_2^2`,
          reveal: true,
          caption: {
            zh: "几何上，最小二乘把 b 投影到 A 的所有列张成的空间上。",
            en: "Geometrically, least squares projects b onto the space spanned by the columns of A.",
          },
        },
        {
          kind: "lab",
          id: "least-squares",
        },
        {
          kind: "lab",
          id: "projection-least-squares",
        },
        {
          kind: "table",
          headers: { zh: ["情形", "方程数 vs 未知数", "结果"], en: ["Case", "Equations vs unknowns", "Outcome"] },
          rows: {
            zh: [
              ["唯一解", "相等且满秩", "直线交于一点"],
              ["无解", "更多方程", "没有直线同时穿过所有点"],
              ["无穷多解", "更少方程", "一条直线或整个平面都是解"],
            ],
            en: [
              ["Unique", "Equal, full rank", "The lines meet at one point"],
              ["No exact solution", "More equations", "No line passes through every point"],
              ["Infinitely many", "Fewer equations", "A whole line or plane of solutions"],
            ],
          },
          caption: {
            zh: "真实数据几乎总是第二种，所以我们才需要最小二乘。",
            en: "Real data is almost always the second case, which is why least squares exists.",
          },
        },
      ],
    },
  ],
  lab: "linear-systems",
  code: {
    id: "module_04.py",
    title: { zh: "精确解 与 最佳拟合", en: "Exact solve versus best fit" },
    intro: {
      zh: "方阵满秩时用 np.linalg.solve；方程多于未知数时用 lstsq。",
      en: "Use np.linalg.solve for a square full-rank system and lstsq for an overdetermined fit.",
    },
    source: `import numpy as np

A = np.array([[2.0, 1.0], [1.0, -1.0]])
b = np.array([5.0, 1.0])
x = np.linalg.solve(A, b)
print("exact:", x)

X = np.array([[1, 0], [1, 1], [1, 2], [1, 3]])
y = np.array([1.0, 2.1, 2.9, 4.2])
beta, *_ = np.linalg.lstsq(X, y, rcond=None)
print("intercept, slope:", beta)`,
    challenge: {
      zh: "把最后一个 y 从 4.2 改成 8.0。哪个拟合参数变化更大？为什么？",
      en: "Change the final y value from 4.2 to 8.0. Which fitted parameter changes more, and why?",
    },
    expectedOutput:
      "exact: [2. 1.]\nintercept, slope: [0.99 1.04]",
    expectedNote: {
      zh: "第一行是精确解 x = 2, y = 1。第二行的数据并不完全落在一条直线上，所以最小二乘给出的是「最接近」的截距和斜率 0.99 与 1.04。把最后的 4.2 改成 8.0 之后会变成 [0.23, 2.18]——x 最大的那个观测被抬高，斜率被明显拉起。",
      en: "The first line is the exact solution x = 2, y = 1. The second dataset does not lie on a perfect line, so least squares returns the closest intercept and slope, 0.99 and 1.04. Change the final 4.2 to 8.0 and it becomes [0.23, 2.18]: the largest-x observation drags the slope up sharply.",
    },
  },
  quiz: [
    {
      question: { zh: "Ax = b 让我们求什么？", en: "What does Ax=b ask us to find?" },
      options: { zh: ["A", "x", "b 的形状"], en: ["A", "x", "The shape of b"] },
      correct: 1,
      explanation: {
        zh: "A 和 b 是已知的，x 装着未知数。",
        en: "A and b are known; x contains the unknowns.",
      },
    },
    {
      question: { zh: "秩偏低说明什么？", en: "What does low rank suggest?" },
      options: {
        zh: ["有一些信息是冗余的", "所有元素都是负数", "矩阵一定很大"],
        en: ["Some information is redundant", "All entries are negative", "The matrix is always large"],
      },
      correct: 0,
      explanation: {
        zh: "秩衡量的是独立行或列的条数，和大小、正负号无关。",
        en: "Rank measures independent rows or columns, not size or sign.",
      },
    },
    {
      question: { zh: "最小二乘在最小化……", en: "Least squares minimizes…" },
      options: { zh: ["特征的个数", "残差的平方", "矩阵的秩"], en: ["The number of features", "The squared residual", "The matrix rank"] },
      correct: 1,
      explanation: {
        zh: "它最小化 ‖Ax − b‖²。",
        en: "It minimizes ‖Ax−b‖².",
      },
    },
  ],
};

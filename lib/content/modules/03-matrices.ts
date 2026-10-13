import type { CourseModule } from "../types";

export const matrices: CourseModule = {
  slug: "matrices",
  number: "03",
  track: "foundations",
  durationMinutes: 45,
  level: { zh: "核心", en: "Core" },
  title: {
    zh: "矩阵：变换与批量",
    en: "Matrices: transformations and batches",
  },
  shortTitle: { zh: "矩阵", en: "Matrices" },
  subtitle: { zh: "一次变换一批", en: "Transform batches" },
  description: {
    zh: "自信地读懂形状，并理解矩阵乘法为什么撑起了神经网络的密集层。",
    en: "Read shapes confidently and understand how matrix multiplication powers dense neural-network layers.",
  },
  plainIdea: {
    zh: "矩阵就是一张数字表格，它能一次改变很多个输入。",
    en: "A matrix is a table of numbers, and it can change many inputs at once.",
  },
  analogy: {
    zh: "想象一张成绩表：每一行是一个学生，每一列是关于他的一个事实。",
    en: "Imagine a spreadsheet: each row is one student and each column is one fact about that student.",
  },
  beforeMath: {
    zh: "矩阵让神经网络一次处理一整组样本，而不是一个一个来。",
    en: "Matrices let a neural network process a whole group instead of one item at a time.",
  },
  aiConnection: {
    zh: "一个全连接层，就是用 Y = XW + b 变换一整批样本。",
    en: "A dense layer transforms a batch of examples with Y = XW + b.",
  },
  outcomes: {
    zh: ["读懂行、列与形状", "会做转置", "检查矩阵乘法能不能相乘", "把 XW + b 对应到密集层"],
    en: [
      "Read rows, columns, and shapes",
      "Transpose a matrix",
      "Check matrix multiplication compatibility",
      "Connect XW + b to a dense layer",
    ],
  },
  figure: "matrices",
  figureCaption: {
    zh: "把几个向量放进一行行里，矩阵就能一次变换整批数据。",
    en: "Put several vectors into rows and a matrix can transform the whole batch in one operation.",
  },
  sections: [
    {
      label: { zh: "结构", en: "STRUCTURE" },
      title: { zh: "矩阵就是一张长方形的表格", en: "A matrix is a rectangular table" },
      blocks: [
        {
          kind: "prose",
          paragraphs: {
            zh: [
              "一个有 m 行、n 列的矩阵，形状记为 m × n。在数据集里，行通常代表样本，列代表特征。",
              "Aᵢⱼ 表示第 i 行第 j 列的那个数。写形状时，永远是「先行后列」。",
            ],
            en: [
              "A matrix with m rows and n columns has shape m × n. In datasets, rows often represent examples and columns represent features.",
              "Aᵢⱼ means the entry in row i and column j. When writing a shape, rows always come first.",
            ],
          },
        },
        {
          kind: "formula",
          tex: String.raw`A \in \mathbb{R}^{m \times n} \qquad \text{shape}(A) = (m,\ n)`,
          reveal: true,
        },
        {
          kind: "lab",
          id: "matrix-batch",
        },
        {
          kind: "predict",
          prompt: {
            zh: "100 位同学，每人由 8 个特征描述。数据矩阵 X 的形状是？",
            en: "100 students, each described by 8 features. What is the shape of the data matrix X?",
          },
          options: { zh: ["(8, 100)", "(100, 8)", "(800,)"], en: ["(8, 100)", "(100, 8)", "(800,)"] },
          answerIndex: 1,
          why: {
            zh: "行是样本、列是特征，所以是 (100, 8)。选 (8, 100) 是把行列写反了——很多报错都源自这一次不小心。",
            en: "Rows are examples and columns are features, so (100, 8). Choosing (8, 100) swaps them — a huge share of real-world bugs start here.",
          },
        },
      ],
    },
    {
      label: { zh: "变换", en: "TRANSFORM" },
      title: { zh: "矩阵乘法就是一堆点积", en: "Matrix multiplication combines dot products" },
      blocks: [
        {
          kind: "prose",
          paragraphs: {
            zh: [
              "AB 能相乘的条件是：A 的列数等于 B 的行数。结果的每个元素，都是 A 的某一行点乘 B 的某一列。",
              "这条形状规则是排查 AI 代码错误最快的一招。",
            ],
            en: [
              "For AB to exist, the inner dimensions must agree. Every result entry is the dot product of one row of A and one column of B.",
              "This shape rule is the fastest way to catch many AI coding errors.",
            ],
          },
        },
        {
          kind: "formula",
          tex: String.raw`(m \times n)\,(n \times p) \;\longrightarrow\; (m \times p)`,
          reveal: true,
          caption: {
            zh: "中间的 n 消掉了，剩下外面两个维度。",
            en: "The shared inner dimension disappears; the outer dimensions remain.",
          },
        },
        {
          kind: "lab",
          id: "matrix-warp",
        },
        {
          kind: "example",
          title: { zh: "手算一个 2×2 乘法", en: "One 2×2 product by hand" },
          steps: {
            zh: [
              "左上角 = 第 1 行 · 第 1 列 = 1×5 + 2×7 = 19。",
              "右上角 = 第 1 行 · 第 2 列 = 1×6 + 2×8 = 22。",
              "左下角 = 第 2 行 · 第 1 列 = 3×5 + 4×7 = 43。",
              "右下角 = 第 2 行 · 第 2 列 = 3×6 + 4×8 = 50。",
            ],
            en: [
              "Top-left = row 1 · column 1 = 1×5 + 2×7 = 19.",
              "Top-right = row 1 · column 2 = 1×6 + 2×8 = 22.",
              "Bottom-left = row 2 · column 1 = 3×5 + 4×7 = 43.",
              "Bottom-right = row 2 · column 2 = 3×6 + 4×8 = 50.",
            ],
          },
          result: {
            zh: "[[1,2],[3,4]] × [[5,6],[7,8]] = [[19,22],[43,50]]。注意顺序不能换：矩阵乘法不满足交换律。",
            en: "[[1,2],[3,4]] × [[5,6],[7,8]] = [[19,22],[43,50]]. The order matters: matrix multiplication is not commutative.",
          },
        },
        {
          kind: "predict",
          prompt: {
            zh: "(4, 3) 和 (3, 2) 能按这个顺序相乘吗？结果是多大？",
            en: "Can shapes (4, 3) and (3, 2) be multiplied in that order, and what size is the result?",
          },
          options: {
            zh: ["可以，(4, 2)", "可以，(3, 3)", "不可以"],
            en: ["Yes, (4, 2)", "Yes, (3, 3)", "No"],
          },
          answerIndex: 0,
          why: {
            zh: "内侧的两个 3 相等，可以相乘；外侧的 4 和 2 留下来，得到 (4, 2)。(3, 3) 是误把内侧维度留下来了。",
            en: "The inner 3s match, so it works; the outer 4 and 2 remain, giving (4, 2). Answer (3, 3) comes from keeping the inner dimensions by mistake.",
          },
        },
      ],
    },
    {
      label: { zh: "朝向", en: "ORIENTATION" },
      title: { zh: "转置把行列互换", en: "Transpose swaps rows and columns" },
      blocks: [
        {
          kind: "prose",
          paragraphs: {
            zh: [
              "转置 Aᵀ 把每一行变成一列，形状从 m × n 变成 n × m。",
              "转置用来对齐维度，它在协方差、最小二乘和反向传播里到处出现。",
            ],
            en: [
              "The transpose Aᵀ turns every row into a column. Its shape changes from m × n to n × m.",
              "Transposes help align dimensions and appear throughout covariance, least squares, and backpropagation.",
            ],
          },
        },
        {
          kind: "formula",
          tex: String.raw`(A^{\top})_{ij} = A_{ji} \qquad\qquad (AB)^{\top} = B^{\top} A^{\top}`,
          reveal: true,
          caption: {
            zh: "注意右边那条：转置一个乘积，顺序会反过来。反向传播里正是这条规则在传递梯度。",
            en: "Note the right-hand rule: transposing a product reverses the order. That is exactly what backpropagation does with gradients.",
          },
        },
        {
          kind: "lab",
          id: "matrix-order",
        },
        {
          kind: "callout",
          tone: "tip",
          body: {
            zh: "在代码里不确定形状对不对，先 print(x.shape)。这比在脑子里推演快十倍。",
            en: "When unsure about shapes in code, print(x.shape) first. It is ten times faster than reasoning in your head.",
          },
        },
      ],
    },
  ],
  lab: "matrices",
  code: {
    id: "module_03.py",
    title: { zh: "搭一个密集层的前向传播", en: "Build a dense-layer forward pass" },
    intro: {
      zh: "批次那一维始终保持不变，特征那一维从 3 变成 2。",
      en: "The batch dimension stays intact while the feature dimension changes from 3 to 2.",
    },
    source: `import numpy as np

X = np.array([[1.0, 0.5, -1.0],
              [0.0, 2.0,  1.0]])   # (2, 3)
W = np.array([[0.2, 0.8],
              [0.5, 0.1],
              [0.3, 0.4]])          # (3, 2)
b = np.array([0.1, -0.1])           # (2,)

Y = X @ W + b
print(Y.shape)
print(Y)`,
    challenge: {
      zh: "先不要运行，预测 Y.shape。再解释为什么加上 b 对两行都成立。",
      en: "Without running it, predict Y.shape. Then explain why adding b works for both rows.",
    },
    expectedOutput:
      "(2, 2)\n[[0.25 0.35]\n [1.4  0.5 ]]",
    expectedNote: {
      zh: "批次维数 2 保持不变，特征从 3 个变成 2 个，所以是 (2, 2)。第二行整体比第一行大，因为它的输入数值更大；偏置对两行都加了同一组数字，这就是广播。",
      en: "The batch dimension stays 2 while features go from 3 to 2, giving (2, 2). The second row is larger overall because its inputs are larger, and the bias adds the same pair of numbers to both rows — that is broadcasting.",
    },
  },
  quiz: [
    {
      question: {
        zh: "形状 (4, 3) 与 (3, 2) 相乘，结果是？",
        en: "Multiplying shapes (4, 3) and (3, 2) gives what?",
      },
      options: { zh: ["(4, 2)", "(3, 3)", "不能相乘"], en: ["(4, 2)", "(3, 3)", "Cannot multiply"] },
      correct: 0,
      explanation: {
        zh: "内侧的 3 相等，所以可以相乘；外侧的 4 和 2 构成结果形状。",
        en: "The inner 3s agree, and the outer dimensions give the result.",
      },
    },
    {
      question: { zh: "(12, 5) 转置之后的形状是？", en: "What is the transpose shape of (12, 5)?" },
      options: { zh: ["(12, 5)", "(5, 12)", "(60,)"], en: ["(12, 5)", "(5, 12)", "(60,)"] },
      correct: 1,
      explanation: {
        zh: "转置把行和列交换。",
        en: "Transpose swaps rows and columns.",
      },
    },
    {
      question: {
        zh: "在 XW 里，X 的每一行通常代表什么？",
        en: "In XW, what does each row of X usually represent?",
      },
      options: { zh: ["一个特征", "一个样本", "一个权重"], en: ["One feature", "One example", "One weight"] },
      correct: 1,
      explanation: {
        zh: "常用的「行为样本」约定里，一行就是一个样本。",
        en: "The common row-major convention stores one example per row.",
      },
    },
  ],
};

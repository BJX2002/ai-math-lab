import type { CourseModule } from "../types";

export const vectors: CourseModule = {
  slug: "vectors",
  number: "01",
  track: "foundations",
  durationMinutes: 35,
  level: { zh: "基础", en: "Foundation" },
  title: {
    zh: "向量：带方向的数据",
    en: "Vectors: data with direction",
  },
  shortTitle: { zh: "向量", en: "Vectors" },
  subtitle: { zh: "表示数据", en: "Represent data" },
  description: {
    zh: "把一串数字变成一种语言，用来描述特征、图像、词语和模型参数。",
    en: "Turn lists of numbers into a language for features, images, words, and model parameters.",
  },
  plainIdea: {
    zh: "向量就是一串放在一起、彼此相关的数字。",
    en: "A vector is just a list of numbers that belong together.",
  },
  analogy: {
    zh: "就像游戏里的角色卡：生命、速度、力量是描述同一个角色的三个数字。它们必须放在一起才有意义。",
    en: "Think of a character sheet in a game: health, speed, and strength are three numbers describing one character. They only mean something together.",
  },
  beforeMath: {
    zh: "如果你会看购物清单，你就已经懂了向量最基本的想法。",
    en: "If you can read a shopping list, you already understand the basic idea of a vector.",
  },
  aiConnection: {
    zh: "输入的一行数据、一个 embedding、一个模型的全部权重，都可以表示成向量。",
    en: "An input row, an embedding, and a model's weights can all be represented as vectors.",
  },
  outcomes: {
    zh: [
      "读懂向量的写法，并数出它的维数",
      "做向量加法与数乘",
      "用 L2 范数衡量向量的长度",
      "用 NumPy 创建并检查向量",
    ],
    en: [
      "Read vector notation and identify its dimension",
      "Add, scale, and compare vectors",
      "Use the L2 norm to measure vector length",
      "Create and inspect vectors with NumPy",
    ],
  },
  figure: "vectors",
  figureCaption: {
    zh: "一个东西可以用几个数字来描述。把这些数字放在一起，就是一个向量。",
    en: "One thing can be described by several numbers. Keep those numbers together and you have a vector.",
  },
  sections: [
    {
      label: { zh: "直觉", en: "INTUITION" },
      title: { zh: "向量是一张有序的清单", en: "A vector is an ordered list" },
      blocks: [
        {
          kind: "prose",
          paragraphs: {
            zh: [
              "向量把几个相关的数字按固定顺序存起来。顺序本身携带信息：[学习时长, 睡眠, 出勤率] 和 [睡眠, 出勤率, 学习时长] 是两个不同的向量。",
              "数学里我们习惯把它竖着写成列向量，在 Python 里通常写成一维数组。它的维数就是里面数字的个数。",
            ],
            en: [
              "A vector stores several related numbers in a fixed order. The order carries meaning: [hours studied, sleep, attendance] is not the same as [sleep, attendance, hours studied].",
              "We write vectors vertically in mathematics and usually as one-dimensional arrays in Python. Their dimension is simply the number of entries.",
            ],
          },
        },
        {
          kind: "formula",
          tex: String.raw`x = \begin{bmatrix} x_1 \\ x_2 \\ \vdots \\ x_n \end{bmatrix} \in \mathbb{R}^n`,
          reveal: true,
          caption: {
            zh: "n 个数字放在一起，就属于 n 维实数空间。",
            en: "n numbers together belong to n-dimensional real space.",
          },
        },
        {
          kind: "lab",
          id: "vector-plane",
        },
        {
          kind: "predict",
          prompt: {
            zh: "一位同学的特征写成 x = [6, 7.5, 0.9]（学习时长、睡眠、出勤率）。如果把顺序换成 [7.5, 6, 0.9]，它还是同一个向量吗？",
            en: "A student profile is x = [6, 7.5, 0.9] for (hours studied, sleep, attendance). If we write [7.5, 6, 0.9], is it still the same vector?",
          },
          options: {
            zh: ["是同一个，只是写法不同", "不是同一个，因为每个位置的含义变了"],
            en: ["Yes, it is just written differently", "No, because each position now means something else"],
          },
          answerIndex: 1,
          why: {
            zh: "向量的位置是约定的一部分。[7.5, 6, 0.9] 表示睡了 7.5 小时、学习 6 小时——换了一个人。这也是为什么数据集的列顺序一旦定下就不能随便改。",
            en: "Positions are part of the convention. [7.5, 6, 0.9] says 7.5 hours of sleep and 6 hours of study — a different person. This is why the column order of a dataset must not be shuffled casually.",
          },
        },
        {
          kind: "callout",
          tone: "takeaway",
          body: {
            zh: "拿到一个向量，先问两件事：每个位置代表什么？单位是什么？",
            en: "Given any vector, ask two things first: what does each position mean, and in what unit?",
          },
        },
      ],
    },
    {
      label: { zh: "运算", en: "OPERATIONS" },
      title: { zh: "加法叠加信息，数乘调整影响", en: "Add information; scale influence" },
      blocks: [
        {
          kind: "prose",
          paragraphs: {
            zh: [
              "向量加法把位置相同的两项相加。数乘则把每个位置都乘上同一个系数。两种运算都不会改变维数。",
              "在机器学习里，一次权重更新 w_new = w − 0.01g 就是用一个小系数去缩放梯度向量 g，再从权重向量 w 里减掉它。",
            ],
            en: [
              "Vector addition combines matching coordinates. Scalar multiplication changes every coordinate by the same factor. Both operations preserve the vector's dimension.",
              "In machine learning, an update such as w_new = w − 0.01g subtracts a small, scaled gradient vector from a weight vector.",
            ],
          },
        },
        {
          kind: "formula",
          tex: String.raw`\begin{bmatrix} 1 \\ 2 \end{bmatrix} + \begin{bmatrix} 3 \\ -1 \end{bmatrix} = \begin{bmatrix} 4 \\ 1 \end{bmatrix} \qquad\qquad 2\begin{bmatrix} 1 \\ 2 \end{bmatrix} = \begin{bmatrix} 2 \\ 4 \end{bmatrix}`,
          reveal: true,
        },
        {
          kind: "lab",
          id: "vector-addition",
        },
        {
          kind: "lab",
          id: "vector-scaling",
        },
        {
          kind: "example",
          title: { zh: "这两个能相加吗？", en: "Can these be added?" },
          steps: {
            zh: [
              "第一个向量 [1, 2] 有 2 个位置。",
              "第二个向量 [5, 4, 3] 有 3 个位置。",
              "加法要求逐位对应，位置对不上，所以不能相加。",
            ],
            en: [
              "The first vector [1, 2] has 2 positions.",
              "The second vector [5, 4, 3] has 3 positions.",
              "Addition pairs up positions, and there is no third position to pair with — so it is undefined.",
            ],
          },
          result: {
            zh: "维数必须先一致。这条规则以后会变成矩阵乘法的「内维相等」，也是排查代码报错的第一招。",
            en: "Dimensions must match first. Later this becomes the matrix-multiplication rule about inner dimensions, and it is the fastest way to spot a shape bug.",
          },
        },
      ],
    },
    {
      label: { zh: "度量", en: "MEASUREMENT" },
      title: { zh: "长度由范数给出", en: "Length is captured by a norm" },
      blocks: [
        {
          kind: "prose",
          paragraphs: {
            zh: [
              "L2 范数就是从原点到这个向量的直线距离：每个坐标平方、求和、再开根号。它就是中学里学过的勾股定理。",
              "单位化（normalization）把非零向量除以它自己的范数。结果保持方向不变，但长度变成 1。",
            ],
            en: [
              "The L2 norm is the ordinary straight-line length from the origin to the vector: square each coordinate, add the squares, then take the square root. It is Pythagoras' theorem.",
              "Normalization divides a non-zero vector by its own norm. The result keeps the same direction and has length 1.",
            ],
          },
        },
        {
          kind: "formula",
          tex: String.raw`\|x\|_2 = \sqrt{x_1^2 + x_2^2 + \cdots + x_n^2} \qquad\qquad \hat{x} = \frac{x}{\|x\|_2}`,
          reveal: true,
        },
        {
          kind: "predict",
          prompt: {
            zh: "x = [3, 4] 的 L2 范数是多少？",
            en: "What is the L2 norm of x = [3, 4]?",
          },
          options: {
            zh: ["5", "7", "25"],
            en: ["5", "7", "25"],
          },
          answerIndex: 0,
          why: {
            zh: "√(3² + 4²) = √25 = 5。7 是直接相加（那是 L1 范数），25 是忘记开根号。这两个错误都很常见，值得知道它们错在哪。",
            en: "√(3² + 4²) = √25 = 5. The value 7 comes from adding instead (that is the L1 norm), and 25 from forgetting the square root. Both mistakes are common and worth recognising.",
          },
        },
        {
          kind: "callout",
          tone: "takeaway",
          body: {
            zh: "范数用来比较大小、做正则化、把 embedding 单位化——因为单位化之后，两个向量点积的大小就只剩下「方向有多像」。",
            en: "Norms let us compare magnitudes, regularize models, and normalize embeddings — once lengths are 1, a dot product measures only how similar the directions are.",
          },
        },
      ],
    },
  ],
  lab: "vectors",
  code: {
    id: "module_01.py",
    title: { zh: "检查并单位化一个向量", en: "Inspect and normalize a vector" },
    intro: {
      zh: "NumPy 让形状和数值运算变得很明确。那个极小的 epsilon 是为了在生产代码里避免除以零。",
      en: "NumPy makes shape and numerical operations explicit. The tiny epsilon avoids division by zero in production code.",
    },
    source: `import numpy as np

x = np.array([3.0, 4.0])
length = np.linalg.norm(x)
unit_x = x / (length + 1e-12)

print("shape:", x.shape)
print("length:", length)
print("unit vector:", unit_x)`,
    challenge: {
      zh: "把 x 改成 [1, 2, 2]。先预测它的维数和范数，再运行代码。",
      en: "Change x to [1, 2, 2]. Predict the dimension and norm before running the code.",
    },
    expectedOutput:
      "shape: (2,)\nlength: 5.0\nunit vector: [0.6 0.8]",
    expectedNote: {
      zh: "这就是「原样运行」会看到的输出。把 x 改成挑战里的 [1, 2, 2] 之后，会变成 shape: (3,)、length: 3.0、unit vector: [0.33333333 0.66666667 0.66666667]——注意 0.6 和 0.8 加起来平方正好是 1，这就是单位向量。",
      en: "This is what the code prints exactly as written. After changing x to [1, 2, 2] as the challenge asks, it becomes shape: (3,), length: 3.0, unit vector: [0.33333333 0.66666667 0.66666667]. Notice 0.6² + 0.8² = 1: that is what makes it a unit vector.",
    },
  },
  quiz: [
    {
      question: { zh: "[2, 0, −1, 5] 的维数是多少？", en: "What is the dimension of [2, 0, −1, 5]?" },
      options: { zh: ["2", "4", "5"], en: ["2", "4", "5"] },
      correct: 1,
      explanation: {
        zh: "维数数的是「有几个位置」，所以这个向量在 ℝ⁴ 里。",
        en: "Dimension counts entries, so this vector is in ℝ⁴.",
      },
    },
    {
      question: { zh: "3[1, −2] 等于多少？", en: "What is 3[1, −2]?" },
      options: { zh: ["[3, −6]", "[4, 1]", "[3, −2]"], en: ["[3, −6]", "[4, 1]", "[3, −2]"] },
      correct: 0,
      explanation: {
        zh: "数乘会把每一个坐标都乘上这个系数，而不是只乘第一个。",
        en: "A scalar multiplies every coordinate, not only the first one.",
      },
    },
    {
      question: {
        zh: "单位化通常会保留什么？",
        en: "What does normalization usually preserve?",
      },
      options: {
        zh: ["长度", "方向", "维数和长度"],
        en: ["Magnitude", "Direction", "Dimension and magnitude only"],
      },
      correct: 1,
      explanation: {
        zh: "单位化把长度变成 1，方向不变。",
        en: "Normalization changes the length to 1 while preserving direction.",
      },
    },
  ],
};

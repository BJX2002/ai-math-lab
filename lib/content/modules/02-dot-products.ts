import type { CourseModule } from "../types";

export const dotProducts: CourseModule = {
  slug: "dot-products",
  number: "02",
  track: "foundations",
  durationMinutes: 40,
  level: { zh: "基础", en: "Foundation" },
  title: {
    zh: "点积：相似度与分数",
    en: "Dot products: similarity and scores",
  },
  shortTitle: { zh: "点积", en: "Dot products" },
  subtitle: { zh: "衡量相似度", en: "Measure similarity" },
  description: {
    zh: "把乘法、几何、余弦相似度，和神经元真正算出来的那个分数连起来。",
    en: "Connect multiplication, geometry, cosine similarity, and the score a neuron actually computes.",
  },
  plainIdea: {
    zh: "点积问的是：这两串数字到底有多匹配？",
    en: "A dot product asks: how well do these two lists match?",
  },
  analogy: {
    zh: "它像给一份食谱打分：把每种食材的用量乘上它的重要性，再把结果全部加起来。",
    en: "It works like scoring a recipe: multiply each ingredient by how important it is, then add up the results.",
  },
  beforeMath: {
    zh: "重点是：答案是一个数——一个分数，而不是另一串数字。",
    en: "The key point: the answer is one number — a score — not another list.",
  },
  aiConnection: {
    zh: "注意力分数（attention score）、推荐系统的相似度、神经元的加权和，用的都是点积。",
    en: "Attention scores, recommendation similarity, and a neuron's weighted sum all use dot products.",
  },
  outcomes: {
    zh: [
      "动手算出一个点积",
      "从几何角度理解它的正负号",
      "计算余弦相似度",
      "在神经元里认出 w·x + b",
    ],
    en: [
      "Compute a dot product",
      "Interpret its sign geometrically",
      "Calculate cosine similarity",
      "Recognize w·x + b inside a neuron",
    ],
  },
  figure: "dot-products",
  figureCaption: {
    zh: "给每条线索一个重要性，相乘，再相加。最后得到的分数帮神经元做决定。",
    en: "Give each clue an importance, multiply, then add. The final score helps a neuron make a decision.",
  },
  sections: [
    {
      label: { zh: "计算", en: "CALCULATION" },
      title: { zh: "对应位置相乘，然后相加", en: "Multiply matching entries, then add" },
      blocks: [
        {
          kind: "prose",
          paragraphs: {
            zh: [
              "点积要求两个向量维数相同，它把两个向量变成一个数。所以它是一个「向量到标量」的运算。",
              "当其中一个向量存的是输入特征，另一个存的是「每个特征有多重要」，这个数就变成了一个非常有用的分数。",
            ],
            en: [
              "The dot product takes two vectors of the same dimension and produces one number, so it is a vector-to-scalar operation.",
              "When one vector stores input features and the other stores how important each feature is, that number becomes a genuinely useful score.",
            ],
          },
        },
        {
          kind: "formula",
          tex: String.raw`a \cdot b = a_1 b_1 + a_2 b_2 + \cdots + a_n b_n = \sum_{i=1}^{n} a_i b_i`,
          reveal: true,
        },
        {
          kind: "lab",
          id: "dot-angle",
        },
        {
          kind: "predict",
          prompt: {
            zh: "[2, 1] · [3, −4] 等于多少？",
            en: "What is [2, 1] · [3, −4]?",
          },
          options: {
            zh: ["2", "[6, −4]", "−2"],
            en: ["2", "[6, −4]", "−2"],
          },
          answerIndex: 0,
          why: {
            zh: "2×3 + 1×(−4) = 6 − 4 = 2。选 [6, −4] 是按位置相乘后就停下——那是逐元素乘法，不是点积；选 −2 是把 6 − 4 算错了（−4 前面是加号）。",
            en: "2×3 + 1×(−4) = 6 − 4 = 2. Choosing [6, −4] stops after multiplying elementwise — that is the Hadamard product, not a dot product. Choosing −2 mis-signs the addition of 6 and −4.",
          },
        },
      ],
    },
    {
      label: { zh: "几何", en: "GEOMETRY" },
      title: { zh: "点积能看见「角度」", en: "The dot product sees the angle" },
      blocks: [
        {
          kind: "prose",
          paragraphs: {
            zh: [
              "同一个运算也等于两个向量长度之积，再乘上它们夹角的余弦。",
              "结果是正的，说明两个方向大致相同；等于 0，说明互相垂直；是负的，说明方向相反。",
            ],
            en: [
              "The same operation also equals the product of the vectors' lengths times the cosine of the angle between them.",
              "A positive result indicates broadly similar directions; zero means perpendicular; a negative result indicates opposing directions.",
            ],
          },
        },
        {
          kind: "formula",
          tex: String.raw`a \cdot b = \|a\|\,\|b\|\cos\theta \qquad\Longrightarrow\qquad \cos\theta = \frac{a \cdot b}{\|a\|\,\|b\|}`,
          reveal: true,
        },
        {
          kind: "lab",
          id: "dot-projection",
        },
        {
          kind: "callout",
          tone: "warning",
          title: { zh: "为什么还要费劲算余弦？", en: "Why bother with cosine, then?" },
          body: {
            zh: "因为原始点积会被长度污染。一篇长文章和一个短句子可能有完全相同的主题，但向量长度差很多，点积就差很多。除以两个长度之后，剩下的才是「方向有多像」。",
            en: "Because the raw dot product is contaminated by length. A long article and a short sentence can be about exactly the same thing but have very different vector lengths. Dividing by both lengths leaves only how similar the directions are.",
          },
        },
        {
          kind: "predict",
          prompt: {
            zh: "两个向量的余弦相似度是 0，它们是什么关系？（都非零）",
            en: "Two non-zero vectors have cosine similarity 0. What is their relationship?",
          },
          options: {
            zh: ["方向相同", "互相垂直", "完全相反"],
            en: ["Same direction", "Perpendicular", "Exactly opposite"],
          },
          answerIndex: 1,
          why: {
            zh: "cos 90° = 0。在二维里就是 [1, 0] 和 [0, 1]——一个只往右，一个只往上，彼此「没有共同方向」。",
            en: "cos 90° = 0. In two dimensions that is [1, 0] and [0, 1]: one points right, one points up, and they share no direction.",
          },
        },
      ],
    },
    {
      label: { zh: "通往 AI", en: "AI BRIDGE" },
      title: { zh: "一个神经元，从点积开始", en: "A neuron begins with a dot product" },
      blocks: [
        {
          kind: "prose",
          paragraphs: {
            zh: [
              "一个神经元给每个输入配一个权重，算出它们的点积，再加上偏置。然后由一个激活函数决定这个分数该怎么往下传。",
              "权重很大且为正，就是在奖励匹配的正特征；权重为负，就是在惩罚它们。训练做的事情，就是把这些权重调到刚刚好。",
            ],
            en: [
              "A neuron assigns one weight to each input, computes their dot product, and adds a bias. An activation function then decides how that score should pass forward.",
              "Large positive weights reward matching positive features; negative weights penalize them. Training is the process of tuning those weights.",
            ],
          },
        },
        {
          kind: "formula",
          tex: String.raw`z = w \cdot x + b \qquad\qquad \hat{y} = \sigma(z)`,
          reveal: true,
          caption: {
            zh: "这一行就是整个深度学习的原子。剩下的都是它的重复和堆叠。",
            en: "This one line is the atom of deep learning. Everything else is repetition and stacking.",
          },
        },
        {
          kind: "lab",
          id: "neuron-boundary",
        },
        {
          kind: "example",
          title: { zh: "手算一次神经元", en: "One neuron by hand" },
          steps: {
            zh: [
              "权重 w = [0.2, 0.8]，输入 x = [1, 0.5]，偏置 b = −0.1。",
              "点积：0.2×1 + 0.8×0.5 = 0.2 + 0.4 = 0.6。",
              "加上偏置：z = 0.6 + (−0.1) = 0.5。",
            ],
            en: [
              "Weights w = [0.2, 0.8], input x = [1, 0.5], bias b = −0.1.",
              "Dot product: 0.2×1 + 0.8×0.5 = 0.2 + 0.4 = 0.6.",
              "Add the bias: z = 0.6 + (−0.1) = 0.5.",
            ],
          },
          result: {
            zh: "注意第二个输入虽然只有 0.5，但因为它的权重是 0.8，贡献反而一样大。这就是「重要性」的含义。",
            en: "The second input is only 0.5, yet it contributes just as much because its weight is 0.8. That is what \"importance\" means.",
          },
        },
      ],
    },
  ],
  lab: "dot-products",
  code: {
    id: "module_02.py",
    title: { zh: "用点积做电影推荐", en: "Recommend films with a dot product" },
    intro: {
      zh: "把一个人的口味和每部电影都表示成向量，再用余弦相似度看哪一部更像他。",
      en: "Represent one person's taste and each film as vectors, then use cosine similarity to see which film matches.",
    },
    source: `import numpy as np

# Three taste dimensions: [action, romance, comedy]
taste = np.array([0.9, 0.1, 0.5])
big_action = np.array([0.9, 0.1, 0.4])
quiet_romance = np.array([0.1, 0.9, 0.2])


def cosine(a, b):
    return (a @ b) / (np.linalg.norm(a) * np.linalg.norm(b))


print("action:", round(cosine(taste, big_action), 3))
print("romance:", round(cosine(taste, quiet_romance), 3))`,
    challenge: {
      zh: "把 taste 改成 [0.1, 0.9, 0.2]，重新预测两部电影哪个分数更高。",
      en: "Change taste to [0.1, 0.9, 0.2] and predict which film scores higher.",
    },
    expectedOutput:
      "action: 0.996\nromance: 0.292",
    expectedNote: {
      zh: "口味向量几乎和动作片平行，所以余弦相似度接近 1；和文艺片几乎垂直，所以接近 0.3。把 taste 改成 [0.1, 0.9, 0.2] 之后两个分数会对调过来。",
      en: "The taste vector is nearly parallel to the action film, so the cosine sits near 1; against the romance it is nearly perpendicular, so it drops to about 0.3. Change taste to [0.1, 0.9, 0.2] and the two scores swap.",
    },
  },
  quiz: [
    {
      question: {
        zh: "两个向量做点积，结果的形状是什么？",
        en: "What shape is the result of a dot product between two vectors?",
      },
      options: { zh: ["一个标量", "一个向量", "一个矩阵"], en: ["A scalar", "A vector", "A matrix"] },
      correct: 0,
      explanation: {
        zh: "向量点乘向量会求和成一个标量。想要向量结果，那是逐元素乘法。",
        en: "A vector dot vector operation sums to one scalar. If you want a vector answer, that is elementwise multiplication.",
      },
    },
    {
      question: {
        zh: "两个非零向量的余弦相似度是 0，说明它们……",
        en: "If non-zero vectors have cosine similarity 0, they are…",
      },
      options: { zh: ["平行", "垂直", "完全相同"], en: ["Parallel", "Perpendicular", "Identical"] },
      correct: 1,
      explanation: {
        zh: "cos 90° = 0，所以它们互相垂直。",
        en: "cos 90° = 0, so the vectors are perpendicular.",
      },
    },
    {
      question: {
        zh: "哪个表达式是一个神经元的开头？",
        en: "Which expression starts a typical neuron?",
      },
      options: { zh: ["w + x + b", "w · x + b", "‖w‖ / x"], en: ["w + x + b", "w · x + b", "‖w‖ / x"] },
      correct: 1,
      explanation: {
        zh: "神经元用的是加权和：点积加上偏置。",
        en: "A neuron uses a weighted sum: the dot product plus bias.",
      },
    },
  ],
};

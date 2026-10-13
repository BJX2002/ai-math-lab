import type { CourseModule } from "../types";

export const optimization: CourseModule = {
  slug: "optimization",
  number: "06",
  track: "foundations",
  durationMinutes: 50,
  level: { zh: "通往 AI", en: "AI bridge" },
  title: {
    zh: "优化：模型如何学习",
    en: "Optimization: how a model learns",
  },
  shortTitle: { zh: "优化", en: "Optimization" },
  subtitle: { zh: "教模型学习", en: "Teach models to learn" },
  description: {
    zh: "把损失、梯度、学习率和梯度下降，跟神经网络真正用的训练循环连起来。",
    en: "Connect loss, gradients, learning rates, and gradient descent to the training loop neural networks actually use.",
  },
  plainIdea: {
    zh: "学习就是先猜一个、量一下错得多离谱、然后调整一点点。",
    en: "Learning means making a guess, measuring the mistake, and adjusting a little.",
  },
  analogy: {
    zh: "像在雾里下山：先感觉哪边是下坡，迈一小步，然后再感觉一次，重复下去。",
    en: "It is like walking downhill in fog: feel which way slopes down, take a small step, and repeat.",
  },
  beforeMath: {
    zh: "模型是靠把这个修正重复很多很多次才学会的，不是突然变聪明。",
    en: "A model learns by repeating this correction many times — not by suddenly becoming intelligent.",
  },
  aiConnection: {
    zh: "训练会反复地算损失、求导，然后更新参数向量和参数矩阵。",
    en: "Training repeatedly computes a loss, differentiates it, and updates parameter vectors and matrices.",
  },
  outcomes: {
    zh: ["读懂损失函数", "读懂梯度向量", "完成一次梯度下降更新", "判断学习率是大了还是小了"],
    en: [
      "Interpret a loss function",
      "Read a gradient vector",
      "Perform a gradient-descent update",
      "Reason about learning-rate size",
    ],
  },
  figure: "optimization",
  figureCaption: {
    zh: "学习就是一步步下坡。每一步都应该让错误，也就是损失，变得更小。",
    en: "Learning takes small downhill steps. Each step should make the mistake, or loss, smaller.",
  },
  sections: [
    {
      label: { zh: "目标", en: "OBJECTIVE" },
      title: { zh: "损失把「好」变成一个数字", en: "Loss turns quality into a number" },
      blocks: [
        {
          kind: "prose",
          paragraphs: {
            zh: [
              "损失函数衡量模型错得有多厉害。训练就是在找一组参数，让这个数字尽量小。",
              "「损失曲面」把每一种参数取值映射到它对应的损失值，学习的过程就是在这张曲面上往下走。",
            ],
            en: [
              "A loss function measures how wrong a model is. Training searches for parameters that make this number small.",
              "The loss surface maps every possible parameter setting to its loss value, and learning is a walk downhill on that surface.",
            ],
          },
        },
        {
          kind: "formula",
          tex: String.raw`\theta^{*} = \arg\min_{\theta} L(\theta)`,
          reveal: true,
          caption: {
            zh: "θ 是所有参数的统称——可能包含几百万个数字，但形式就是这么简单。",
            en: "θ stands for every parameter at once — possibly millions of numbers, yet the form stays this simple.",
          },
        },
        {
          kind: "lab",
          id: "descent-contour",
        },
        {
          kind: "predict",
          prompt: {
            zh: "一个模型把每张图都预测成「80% 是猫」。损失是高还是低？",
            en: "A model predicts \"80% cat\" for every single image. Is the loss high or low?",
          },
          options: {
            zh: ["很低，因为它很自信", "很高，因为它对猫和非猫一样自信"],
            en: ["Low, because it is confident", "High, because it is equally confident about cats and non-cats"],
          },
          answerIndex: 1,
          why: {
            zh: "损失不只是看「自信不自信」，还要看方向对不对。对一张真正的狗，说「80% 是猫」会被重罚。一个对所有输入都给出同样答案的模型，损失会停在很高的地方——它什么也没学到。",
            en: "Loss does not reward confidence on its own; it rewards being confidently right. Saying \"80% cat\" about a dog is punished heavily. A model that answers the same way for every input sits at a high loss: it has learned nothing.",
          },
        },
      ],
    },
    {
      label: { zh: "方向", en: "DIRECTION" },
      title: { zh: "梯度指向「上坡」", en: "The gradient points uphill" },
      blocks: [
        {
          kind: "prose",
          paragraphs: {
            zh: [
              "当参数有很多个时，梯度就是一个由偏导数组成的向量。它指出损失上升最快的方向。",
              "要让损失变小，就往它的反方向走一小段。",
            ],
            en: [
              "For many parameters, the gradient is a vector of partial derivatives. It identifies the direction of steepest local increase.",
              "To reduce loss, move a small distance in the opposite direction.",
            ],
          },
        },
        {
          kind: "formula",
          tex: String.raw`\nabla L(\theta) = \left[ \frac{\partial L}{\partial \theta_1},\ \frac{\partial L}{\partial \theta_2},\ \ldots,\ \frac{\partial L}{\partial \theta_n} \right]`,
          reveal: true,
        },
        {
          kind: "lab",
          id: "descent-curve",
        },
        {
          kind: "callout",
          tone: "takeaway",
          body: {
            zh: "梯度向量的形状一定和参数本身相同。这条「形状必须一致」的直觉，在反向传播里会变成最实用的一句检查。",
            en: "The gradient has exactly the same shape as the parameters it updates. That shape match becomes the most useful sanity check in backpropagation.",
          },
        },
      ],
    },
    {
      label: { zh: "更新", en: "UPDATE" },
      title: { zh: "学习率决定步子有多大", en: "Learning rate controls step size" },
      blocks: [
        {
          kind: "prose",
          paragraphs: {
            zh: [
              "梯度下降反复做四件事：算预测、算损失、求梯度、更新参数。",
              "学习率太大，步子会跨过谷底甚至越走越高；学习率太小，则慢得让人失去耐心。",
            ],
            en: [
              "Gradient descent repeats: compute predictions, calculate loss, find gradients, and update parameters.",
              "A rate that is too large may overshoot or diverge; one that is too small may learn painfully slowly.",
            ],
          },
        },
        {
          kind: "formula",
          tex: String.raw`\theta_{\text{new}} = \theta_{\text{old}} - \eta \,\nabla L(\theta_{\text{old}})`,
          reveal: true,
          caption: {
            zh: "注意那个减号——梯度指向上坡，我们要往下坡走。",
            en: "Mind the minus sign: the gradient points uphill, and we want to go down.",
          },
        },
        {
          kind: "lab",
          id: "descent-rates",
        },
        {
          kind: "example",
          title: { zh: "取 L(x) = x²，从 x = 5 出发", en: "Take L(x) = x², starting at x = 5" },
          steps: {
            zh: [
              "梯度是 2x，所以在 x = 5 处梯度是 10。",
              "取 η = 0.1，更新 x ← 5 − 0.1 × 10 = 4。",
              "再算一次：梯度 8，x ← 4 − 0.8 = 3.2。",
              "每走一步，x 都会乘上 (1 − 2η) = 0.8。",
            ],
            en: [
              "The gradient is 2x, so at x = 5 it equals 10.",
              "With η = 0.1, update x ← 5 − 0.1 × 10 = 4.",
              "Again: gradient 8, so x ← 4 − 0.8 = 3.2.",
              "Every step multiplies x by (1 − 2η) = 0.8.",
            ],
          },
          result: {
            zh: "如果 η = 0.5，乘数就是 0——一步就落到最小值。如果 η > 0.5，乘数绝对值大于 1，每一步都会放大，于是发散。这就是学习率的临界点。",
            en: "If η = 0.5 the multiplier is 0 — one step lands exactly on the minimum. If η > 0.5 the multiplier exceeds 1 in magnitude and every step grows, so the run diverges. That is the tipping point of the learning rate.",
          },
        },
      ],
    },
  ],
  lab: "optimization",
  code: {
    id: "module_06.py",
    title: { zh: "看梯度下降收敛", en: "Watch gradient descent converge" },
    intro: {
      zh: "这个小循环用的是 L(x) = x² 的解析梯度。神经网络用自动微分做同一件事。",
      en: "This small loop uses the analytical gradient of L(x)=x². Neural networks use automatic differentiation for the same update pattern.",
    },
    source: `x = 5.0
learning_rate = 0.1

for step in range(8):
    loss = x ** 2
    gradient = 2 * x
    x = x - learning_rate * gradient
    print(step, round(loss, 4), round(x, 4))`,
    challenge: {
      zh: "分别试 η = 0.01、0.5 和 1.1。哪个最快、哪个卡住、哪个发散？",
      en: "Try learning rates 0.01, 0.5, and 1.1. Which converges fastest, stalls, or diverges?",
    },
    expectedOutput:
      "0 25.0 4.0\n1 16.0 3.2\n2 10.24 2.56\n3 6.5536 2.048\n4 4.1943 1.6384\n5 2.6844 1.3107\n6 1.718 1.0486\n7 1.0995 0.8389",
    expectedNote: {
      zh: "损失从 25 一路降到 1.0995，每走一步 x 都乘上 (1 − 2η) = 0.8。试 η = 0.01 会很慢，η = 0.5 一步到位，η = 1.1 时乘数的绝对值大于 1，损失会越来越大。",
      en: "The loss falls from 25 to 1.0995, with x multiplied by (1 − 2η) = 0.8 at every step. Try η = 0.01 to watch it crawl, η = 0.5 to land in one step, and η = 1.1 to see the multiplier exceed 1 and the loss grow instead.",
    },
  },
  quiz: [
    {
      question: {
        zh: "哪个方向能让损失局部下降？",
        en: "Which direction reduces loss locally?",
      },
      options: { zh: ["梯度方向", "梯度的反方向", "任何一个垂直方向"], en: ["The gradient", "The negative gradient", "Any perpendicular direction"] },
      correct: 1,
      explanation: {
        zh: "梯度指向上坡，所以它的反方向指向下坡。",
        en: "The gradient points uphill, so its negative points downhill.",
      },
    },
    {
      question: { zh: "η 代表什么？", en: "What does η represent?" },
      options: { zh: ["学习率", "标签个数", "矩阵的秩"], en: ["The learning rate", "The number of labels", "The matrix rank"] },
      correct: 0,
      explanation: {
        zh: "η 控制每一步走多大。",
        en: "η controls the update step size.",
      },
    },
    {
      question: { zh: "学习率非常大时可能……", en: "A very large learning rate may…" },
      options: {
        zh: ["总能到达最小值", "越过谷底并发散", "把所有特征删掉"],
        en: ["Always reach the minimum", "Overshoot and diverge", "Remove all features"],
      },
      correct: 1,
      explanation: {
        zh: "步子会跨过山谷，越跳越大，而不是安定下来。",
        en: "Steps can jump across the valley and grow rather than settle.",
      },
    },
  ],
};

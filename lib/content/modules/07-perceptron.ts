import type { CourseModule } from "../types";

export const perceptron: CourseModule = {
  slug: "perceptron",
  number: "07",
  track: "ai",
  durationMinutes: 45,
  level: { zh: "通往 AI", en: "AI bridge" },
  title: {
    zh: "感知机：一个神经元如何做决定",
    en: "The perceptron: how one neuron decides",
  },
  shortTitle: { zh: "感知机", en: "Perceptron" },
  subtitle: { zh: "一条直线能做多少判断", en: "How much can one straight line decide?" },
  description: {
    zh: "从权重、偏置和阈值出发，读懂加权和、sigmoid 与线性决策边界，看清一条直线为什么不够，以及把两个感知机叠起来为什么就能分开。",
    en: "Start from weights, bias, and a threshold; read the weighted sum, the sigmoid, and the linear decision boundary, then see why one straight line is not enough and how stacking two perceptrons escapes it.",
  },
  plainIdea: {
    zh: "感知机（perceptron）是一台画线机：它画一条直线，把世界分成两边，然后只回答「是」或「不是」。",
    en: "A perceptron is a line-drawing machine: it draws one straight line, splits the world into two sides, and answers only yes or no.",
  },
  analogy: {
    zh: "它像一位只肯说「过」或「不过」的评委：把每个方面打分，按重要性加权，加总，再和一条及格线比较。",
    en: "It behaves like a judge who will only say pass or fail: score each aspect, weight it by importance, add the parts up, and compare the total with one cut-off.",
  },
  beforeMath: {
    zh: "先记住三个词：权重（weight）是「这一项有多重要」，偏置（bias）是「起跑线在哪里」，阈值（threshold）是「总分到多少才算通过」。",
    en: "Three words are enough to begin: a weight is how much one feature matters, a bias is where the starting line sits, and a threshold is the total that counts as a pass.",
  },
  aiConnection: {
    zh: "感知机是神经网络的原子。一个全连接层就是许多感知机并排放着，深度学习则是把这样的层一层层叠起来。",
    en: "The perceptron is the atom of a neural network. A dense layer is many perceptrons standing side by side, and deep learning stacks those layers.",
  },
  outcomes: {
    zh: [
      "用权重、偏置、阈值解释一个神经元的输出",
      "写出并算出加权和 w₁x₁ + w₂x₂ + b 与阈值规则",
      "画出并读懂线性决策边界 w₁x₁ + w₂x₂ + b = 0",
      "说明一条直线为什么分不开 XOR，以及两个感知机如何做到",
      "读懂 E(W, b)、α、∂E/∂w_i 与 [3, 2, 1]ᵀ 这套记号",
    ],
    en: [
      "Explain one neuron's output using weights, a bias, and a threshold",
      "Write and evaluate the weighted sum w₁x₁ + w₂x₂ + b and the threshold rule",
      "Draw and read the linear decision boundary w₁x₁ + w₂x₂ + b = 0",
      "Say why one straight line cannot separate XOR, and how two perceptrons can",
      "Read the notation E(W, b), α, ∂E/∂w_i, and [3, 2, 1]ᵀ",
    ],
  },
  figure: "vectors",
  figureCaption: {
    zh: "把每个样本画成一个点：权重决定哪一个方向重要，偏置决定分界线离原点多远。",
    en: "Draw each example as a point: the weights choose which direction matters, and the bias sets how far the dividing line sits from the origin.",
  },
  sections: [
    {
      label: { zh: "直觉", en: "INTUITION" },
      title: { zh: "一个神经元，就是一次加权投票", en: "A neuron is one weighted vote" },
      blocks: [
        {
          kind: "prose",
          paragraphs: {
            zh: [
              "平时做判断，我们本来就在自动加权：选房子的时候，通勤时间通常比墙的颜色重要得多。权重（weight）就是这个「有多重要」的数字；它可以是负数——正权重奖励这个特征，负权重惩罚它。",
              "偏置（bias）是起跑线。它不看任何一个特征，只把总分整体抬高或压低；换句话说，它决定及格线画在哪里。",
              "最后一步是阈值（threshold）判断：总分够了就输出 1，不够就输出 0。加起来、比一比——这就是感知机（perceptron）做的全部事情。",
            ],
            en: [
              "Everyday judgement is already weighted: when choosing a flat, the commute usually matters far more than the colour of the walls. A weight is exactly that number, and it may be negative — a positive weight rewards a feature while a negative one punishes it.",
              "The bias is the starting line. It looks at no single feature; it lifts or lowers the whole total, which is the same as deciding where the pass mark sits.",
              "The last step is a threshold: if the total is high enough, output 1; otherwise output 0. Add up, then compare — that is everything a perceptron does.",
            ],
          },
        },
        {
          kind: "formula",
          tex: String.raw`z = w_1 x_1 + w_2 x_2 + b`,
          reveal: true,
          caption: {
            zh: "加权和（weighted sum）：每个输入乘上自己的权重，全部加起来，最后加上偏置。这里的 x₁、x₂ 是两个特征，w₁、w₂ 是它们的权重。",
            en: "The weighted sum: multiply each input by its own weight, add them all up, then add the bias. Here x₁ and x₂ are the two features and w₁, w₂ are their weights.",
          },
        },
        {
          kind: "lab",
          id: "neuron-boundary",
        },
        {
          kind: "predict",
          prompt: {
            zh: "把偏置 b 从 −18 改成 −10，权重不动。新的分界线相对原来会怎样？",
            en: "Change the bias b from −18 to −10 and leave the weights alone. What happens to the new dividing line?",
          },
          options: {
            zh: ["平行移动", "绕原点旋转", "完全不动"],
            en: ["It slides sideways, staying parallel", "It rotates about the origin", "It does not move at all"],
          },
          answerIndex: 0,
          why: {
            zh: "分界线的方向由权重决定，偏置只决定它离原点多远，所以整条线平行移动。想让线转起来，必须改变权重——这就是「权重决定方向，偏置决定位置」。",
            en: "The weights set the direction of the line and the bias only sets how far it sits from the origin, so the whole line slides sideways. To rotate it you must change the weights: weights decide direction, the bias decides position.",
          },
        },
        {
          kind: "callout",
          tone: "analogy",
          title: { zh: "只举两块牌子的评委", en: "A judge with only two cards" },
          body: {
            zh: "感知机的输出只有 0 和 1，就像一位只举「过」和「不过」两块牌子的评委——他不会说「大概 70% 过」。如果想要一个 0 到 1 之间的分数，就在加权和后面接一个 sigmoid；但那只是把分数读得更细，判定的方向仍然是同一条直线。",
            en: "A perceptron outputs only 0 or 1, like a judge holding just two cards: pass and fail. He never says \"about 70% pass\". If we want a number between 0 and 1 we attach a sigmoid to the weighted sum — yet that only reads the score more finely; the direction of the decision is still the same line.",
          },
        },
      ],
    },
    {
      label: { zh: "阈值", en: "THRESHOLD" },
      title: { zh: "加权和、sigmoid 与阈值规则", en: "The weighted sum, the sigmoid, and the threshold rule" },
      blocks: [
        {
          kind: "prose",
          paragraphs: {
            zh: [
              "把两个特征推广到 d 个，加权和就写成矩阵形式：W 装权重，b 装偏置，z = Wx + b。整套课程里，大写 W 表示一层的权重，小写 b 表示这一层的偏置。",
              "感知机的判定只看 z 的符号。若想在 z 上读出一个平滑的 0 到 1 的分数，就接上 sigmoid（S 型函数）：ŷ = σ(Wx + b)。",
              "注意 ŷ 有两种读法：接上 sigmoid 时它落在 0 到 1 之间，是一个分数；用阈值规则时它只能是 0 或 1，是一个判定。感知机用的是第二种。",
            ],
            en: [
              "Generalise from two features to d and the weighted sum becomes a matrix expression: W holds the weights, b holds the bias, and z = Wx + b. Throughout this course a capital W is the weight of a whole layer and a lowercase b is its bias.",
              "The perceptron's decision looks only at the sign of z. To read a smooth score between 0 and 1 from z, attach a sigmoid: ŷ = σ(Wx + b).",
              "Notice that ŷ has two readings: attached to a sigmoid it lies between 0 and 1 and is a score, while under the threshold rule it can only be 0 or 1 and is a decision. A perceptron uses the second.",
            ],
          },
        },
        {
          kind: "formula",
          tex: String.raw`\hat{y} = \sigma(Wx + b)`,
          reveal: true,
          caption: {
            zh: "这一行是整个深度学习的原子：加权和，加偏置，过一层激活。剩下的都是它的重复和堆叠。",
            en: "This one line is the atom of deep learning: a weighted sum, a bias, and one activation. Everything else is repetition and stacking.",
          },
        },
        {
          kind: "formula",
          tex: String.raw`s(x) = \frac{1}{1 + e^{-ax}}`,
          reveal: true,
          caption: {
            zh: "a 叫做斜率参数（slope parameter）。a 越大，曲线在 0 附近越陡；a 变得很大时，它就退化成一条台阶，也就是阈值规则。",
            en: "The number a is the slope parameter. The larger a is, the steeper the curve near 0; as a grows, it degenerates into a step, which is exactly the threshold rule.",
          },
        },
        {
          kind: "formula",
          tex: String.raw`\hat{y} = \begin{cases} 1 & \text{if } Wx + b \ge 0 \\ 0 & \text{otherwise} \end{cases}`,
          reveal: true,
          caption: {
            zh: "「Wx + b ≥ 0」也可以读成「加权和 ≥ −b」：偏置就是被搬到左边去的那个阈值。",
            en: "\"Wx + b ≥ 0\" can also be read as \"the weighted sum ≥ −b\": the bias is simply the threshold moved to the other side.",
          },
        },
        {
          kind: "example",
          title: { zh: "录取例子：Score = 2·Test + Grades − 18", en: "The admission example: Score = 2·Test + Grades − 18" },
          steps: {
            zh: [
              "两个特征：入学考试 Test（x₁）和平时成绩 Grades（x₂）。权重 w₁ = 2、w₂ = 1，偏置 b = −18。",
              "加权和：Score = 2·Test + Grades − 18。",
              "同学甲：Test = 8、Grades = 6 → 16 + 6 − 18 = 4 ≥ 0，输出 1，录取。",
              "同学乙：Test = 4、Grades = 5 → 8 + 5 − 18 = −5 < 0，输出 0，不录取。",
              "权重 2 与 1 的含义：Test 多 1 分，等于 Grades 多 2 分。",
            ],
            en: [
              "Two features: an entrance Test (x₁) and Grades (x₂). The weights are w₁ = 2 and w₂ = 1, and the bias is b = −18.",
              "The weighted sum: Score = 2·Test + Grades − 18.",
              "Student A: Test = 8, Grades = 6 → 16 + 6 − 18 = 4 ≥ 0, so the output is 1 and the student is admitted.",
              "Student B: Test = 4, Grades = 5 → 8 + 5 − 18 = −5 < 0, so the output is 0 and the student is rejected.",
              "The weights 2 and 1 mean that one extra mark on the Test is worth two extra marks in Grades.",
            ],
          },
          result: {
            zh: "同一条规则有两种写法：一句「Score ≥ 0」，或者 Test–Grades 平面上的一条直线 Grades = 18 − 2·Test。规则和直线是同一件事的两种写法。",
            en: "The same rule has two spellings: the sentence \"Score ≥ 0\", or the line Grades = 18 − 2·Test in the Test–Grades plane. The rule and the line are two spellings of one thing.",
          },
        },
        {
          kind: "callout",
          tone: "warning",
          title: { zh: "sigmoid 不改变判定", en: "A sigmoid does not change the decision" },
          body: {
            zh: "设 a > 0，sigmoid 是单调递增的，所以 s(z) ≥ 0.5 与 z ≥ 0 完全等价：接上它只是把加权和翻译成 0 到 1 之间的分数，判定方向一个字都没变。也要记住边界情形——规则写的是 ≥ 0，所以 z 正好等于 0 时输出 1。",
            en: "With a > 0 the sigmoid increases monotonically, so s(z) ≥ 0.5 is exactly equivalent to z ≥ 0: attaching it translates the weighted sum into a score between 0 and 1 and changes nothing about the decision. Remember the boundary case too — the rule says ≥ 0, so z exactly 0 outputs 1.",
          },
        },
      ],
    },
    {
      label: { zh: "边界", en: "BOUNDARY" },
      title: { zh: "一条直线能分开什么，不能分开什么", en: "What one straight line can and cannot separate" },
      blocks: [
        {
          kind: "prose",
          paragraphs: {
            zh: [
              "满足 Wx + b = 0 的那些点，就是决策边界（decision boundary）：w₁x₁ + w₂x₂ + b = 0。在二维里这是一条直线，维数更高时它是一个超平面。",
              "直线的一侧 Wx + b ≥ 0 输出 1，另一侧输出 0。权重向量 w = [w₁, w₂]ᵀ 垂直于这条直线，并指向输出 1 的那一侧；偏置只把它平行推开。",
            ],
            en: [
              "The points that satisfy Wx + b = 0 form the decision boundary: w₁x₁ + w₂x₂ + b = 0. In two dimensions that is a straight line; in higher dimensions it is a hyperplane.",
              "One side of the line has Wx + b ≥ 0 and outputs 1; the other side outputs 0. The weight vector w = [w₁, w₂]ᵀ is perpendicular to the line and points towards the 1 side, while the bias only pushes it sideways.",
            ],
          },
        },
        {
          kind: "formula",
          tex: String.raw`w_1 x_1 + w_2 x_2 + b = 0`,
          reveal: true,
          caption: {
            zh: "直线本身属于 ≥ 0 的一侧，所以边界上的点被判为 1。只调 w 和 b，能改变的永远只有这条线的方向和平移。",
            en: "The line itself belongs to the ≥ 0 side, so points on the boundary are classified 1. Tuning w and b can only ever change the direction and the offset of this one line.",
          },
        },
        {
          kind: "lab",
          id: "perceptron-limit",
        },
        {
          kind: "predict",
          prompt: {
            zh: "把 W 和 b 同时乘以正数 2（例如 w₁ = 4、w₂ = 2、b = −36），判定会怎样？",
            en: "Multiply W and b by the positive number 2 together (say w₁ = 4, w₂ = 2, b = −36). What happens to the decision?",
          },
          options: {
            zh: ["判定完全不变", "边界线整体平移", "所有样本都改判为 1"],
            en: ["Nothing changes at all", "The boundary slides sideways", "Every example flips to 1"],
          },
          answerIndex: 0,
          why: {
            zh: "判定只关心 Wx + b 的符号，而正数缩放不改变符号：Wx + b ≥ 0 与 2(Wx + b) ≥ 0 是同一句话，直线 2x₁ + x₂ − 18 = 0 与 4x₁ + 2x₂ − 36 = 0 也是同一条线（两边同时除以 2）。所以参数可以整体缩放，边界纹丝不动。",
            en: "The decision only looks at the sign of Wx + b, and scaling by a positive number does not change a sign: Wx + b ≥ 0 says the same thing as 2(Wx + b) ≥ 0, and the line 2x₁ + x₂ − 18 = 0 is the same line as 4x₁ + 2x₂ − 36 = 0 (divide both sides by 2). Parameters may be rescaled freely; the boundary does not move.",
          },
        },
        {
          kind: "prose",
          paragraphs: {
            zh: [
              "有些区域，一条直线怎么也分不开。看单位正方形的四个角：(0, 0) 和 (1, 1) 要输出 0，(1, 0) 和 (0, 1) 要输出 1。这就是异或（XOR）问题。",
              "一条直线只切一刀，把平面分成两半。两个 1 位于一条对角线上，两个 0 位于另一条对角线上，而两条对角线是相交的：想把两个 1 留在同一侧、两个 0 留在另一侧，直线做不到。这就是「线性不可分（not linearly separable）」。",
            ],
            en: [
              "Some regions no straight line can separate. Take the four corners of the unit square: (0, 0) and (1, 1) should output 0, while (1, 0) and (0, 1) should output 1. This is the XOR problem.",
              "A line makes a single cut and divides the plane in two. The two 1s lie on one diagonal and the two 0s on the other, and the diagonals cross: keeping both 1s on one side and both 0s on the other is beyond a single line. That is what not linearly separable means.",
            ],
          },
        },
        {
          kind: "formula",
          tex: String.raw`h_j = \theta_{1j} x_1 + \theta_{2j} x_2 + \theta_{0j}, \qquad j = 1, 2`,
          reveal: true,
          caption: {
            zh: "隐藏层（hidden layer）的记号：θ_ij 是「输入 i 到隐藏单元 j」的权重，θ_0j 是隐藏单元 j 的偏置。隐藏层之外，我们照旧用 W 和 b。",
            en: "Hidden-layer notation: θ_ij is the weight from input i to hidden unit j, and θ_0j is the bias of hidden unit j. Outside the hidden layer we keep using W and b.",
          },
        },
        {
          kind: "example",
          title: { zh: "两个感知机加一个输出，算出 XOR", en: "Two perceptrons plus an output compute XOR" },
          steps: {
            zh: [
              "隐藏单元 1 回答「至少有一个输入是 1 吗」：θ₁₁ = 1、θ₂₁ = 1、θ₀₁ = −0.5。",
              "隐藏单元 2 回答「两个输入都是 1 吗」：θ₁₂ = 1、θ₂₂ = 1、θ₀₂ = −1.5。",
              "两个隐藏单元的权重方向相同、偏置不同，所以它们画出两条平行线：h₁ 取较近的一侧，h₂ 取更远的一侧。",
              "输出感知机回答「h₁ 是 1，而且 h₂ 不是 1」：w₁ = 1、w₂ = −1、b = −0.5，得分 h₁ − h₂ − 0.5。",
              "四个角依次输出 0、1、1、0——正是 XOR。",
            ],
            en: [
              "Hidden unit 1 answers \"is at least one input 1?\": θ₁₁ = 1, θ₂₁ = 1, θ₀₁ = −0.5.",
              "Hidden unit 2 answers \"are both inputs 1?\": θ₁₂ = 1, θ₂₂ = 1, θ₀₂ = −1.5.",
              "Both hidden units share the same weight direction and differ only in bias, so they draw two parallel lines: h₁ takes the nearer side and h₂ the farther side.",
              "The output perceptron answers \"is h₁ 1 and h₂ not 1?\": w₁ = 1, w₂ = −1, b = −0.5, scoring h₁ − h₂ − 0.5.",
              "The four corners output 0, 1, 1, 0 in turn — exactly XOR.",
            ],
          },
          result: {
            zh: "关键在于两条平行线夹出的那条「带」：XOR 的两个 1 都落在带子里，两个 0 都在带子外面。一条直线给不出这样的区域，两条可以。每一层都在重写上一层的空间，这就是深度网络比单个感知机强的地方。",
            en: "The point is the strip between the two parallel lines: both 1s of XOR fall inside it and both 0s outside. One line cannot produce such a region; two can. Each layer rewrites the space of the layer before it, and that is where a deep network beats a single perceptron.",
          },
        },
        {
          kind: "table",
          headers: {
            zh: ["x₁", "x₂", "h₁（至少一个是 1）", "h₂（两个都是 1）", "输出 h₁ − h₂ − 0.5 ≥ 0"],
            en: ["x₁", "x₂", "h₁ (at least one 1)", "h₂ (both are 1)", "output h₁ − h₂ − 0.5 ≥ 0"],
          },
          rows: {
            zh: [
              ["0", "0", "0", "0", "0"],
              ["1", "0", "1", "0", "1"],
              ["0", "1", "1", "0", "1"],
              ["1", "1", "1", "1", "0"],
            ],
            en: [
              ["0", "0", "0", "0", "0"],
              ["1", "0", "1", "0", "1"],
              ["0", "1", "1", "0", "1"],
              ["1", "1", "1", "1", "0"],
            ],
          },
          caption: {
            zh: "第二层用 w₁ = 1、w₂ = −1、b = −0.5 组合这两个隐藏单元，输出的正是输入的异或。",
            en: "The second layer combines the two hidden units with w₁ = 1, w₂ = −1, b = −0.5, and the output column is exactly the XOR of the inputs.",
          },
        },
        {
          kind: "callout",
          tone: "takeaway",
          title: { zh: "一条线，一个半平面", en: "One line, one half-plane" },
          body: {
            zh: "一个感知机能表示的区域，永远是直线的一侧，也就是一个半平面。想要交界、带状、环状这些形状，就把多个感知机组合起来：每一个各切一刀，合起来就有了折线、多边形和更复杂的区域。",
            en: "The region a single perceptron can represent is always one side of a line — a half-plane. For intersections, strips, and rings, combine several perceptrons: each makes one cut, and together they carve out polygons and far more complex regions.",
          },
        },
      ],
    },
    {
      label: { zh: "记号", en: "NOTATION" },
      title: { zh: "写成矩阵，然后训练它", en: "Write it with matrices, then train it" },
      blocks: [
        {
          kind: "prose",
          paragraphs: {
            zh: [
              "课程里所有向量都按列向量（column vector）来写。为了排版方便，我们把它写成一行再转置（transpose），例如 w = [w₁, w₂]ᵀ 或 x = [3, 2, 1]ᵀ。这正是矩阵乘法要的形状：列向量 [3, 2, 1]ᵀ 就是一个 3 × 1 的矩阵。",
              "权重也写成列向量，于是加权和变成「向量乘矩阵」：wᵀx 得到一个 1 × 1 的矩阵，也就是那个数字。",
              "把一批样本按行叠起来就得到矩阵 X，第 i 个样本是第 i 行的转置 x^(i)；一次矩阵乘法就能同时为整批样本算出分数。",
            ],
            en: [
              "Every vector in this course is a column vector. For convenience we write one as a row and transpose it, for example w = [w₁, w₂]ᵀ or x = [3, 2, 1]ᵀ. That is the shape matrix multiplication wants: the column vector [3, 2, 1]ᵀ is a 3 × 1 matrix.",
              "Weights are column vectors too, so the weighted sum becomes a vector times matrix product: wᵀx returns a 1 × 1 matrix, which is just that number.",
              "Stacking a batch of samples as rows gives the matrix X, where sample i is the transpose x^(i) of row i; a single matrix product then scores the whole batch at once.",
            ],
          },
        },
        {
          kind: "formula",
          tex: String.raw`x = \begin{bmatrix} 3 \\ 2 \\ 1 \end{bmatrix} = [3,\ 2,\ 1]^{\mathsf{T}} \in \mathbb{R}^{3}, \qquad z = w^{\mathsf{T}} x + b`,
          reveal: true,
          caption: {
            zh: "「向量乘矩阵」：wᵀ 是 1 × 3 的行向量，x 是 3 × 1 的列向量，乘出来是 1 × 1 的矩阵，也就是加权和。",
            en: "Vector times matrix: wᵀ is a 1 × 3 row, x is a 3 × 1 column, and the product is a 1 × 1 matrix — the weighted sum.",
          },
        },
        {
          kind: "formula",
          tex: String.raw`\hat{y} = \sigma(XW + b), \qquad \hat{y}^{(i)} = \sigma\left(w^{\mathsf{T}} x^{(i)} + b\right)`,
          reveal: true,
          caption: {
            zh: "整批样本一起算：X 的每一行是一个样本的转置 x^(i)ᵀ，W 是 2 × 1 的权重列向量，b 加到每一行上；第 i 个样本仍然按 x^(i) 单独写一遍。",
            en: "The whole batch at once: each row of X is one sample written transposed as x^(i)ᵀ, W is the 2 × 1 weight column, and b is added to every row; sample i is still written out on its own as x^(i).",
          },
        },
        {
          kind: "prose",
          paragraphs: {
            zh: [
              "训练需要一个衡量「错得多厉害」的数字。课程里叫它 Error，写成 E(W, b)：名字和字母都不要换。",
              "对一个样本，Error 用 cross entropy（交叉熵）写出来最自然；对整批样本求平均，就得到这批数据的 Error。",
              "学习率（learning rate）记作 α，它决定每一步走多大；梯度用偏导数的记号 ∂E / ∂w_i 写。把「算 Error → 求梯度 → 按 α 更新」这套循环从最后一层往前做完，就是 backpropagation（反向传播）。",
            ],
            en: [
              "Training needs one number that says how wrong the model is. In this course it is called the Error and written E(W, b): keep that name and those letters.",
              "For a single sample the Error is written most naturally with cross entropy; averaging over the batch gives the Error of the whole dataset.",
              "The learning rate is written α and sets the size of each step, and gradients are written with partial derivatives, ∂E / ∂w_i. Running the loop — compute the Error, take gradients, update by α — from the last layer back to the first is backpropagation.",
            ],
          },
        },
        {
          kind: "formula",
          tex: String.raw`E(W, b) = -\frac{1}{n} \sum_{i=1}^{n} \left[ y^{(i)} \ln \hat{y}^{(i)} + \left(1 - y^{(i)}\right) \ln\left(1 - \hat{y}^{(i)}\right) \right]`,
          reveal: true,
          caption: {
            zh: "这就是 cross entropy：真实标签 y^(i) 是 1 时只有第一项起作用，模型给的概率 ŷ^(i) 越接近正确答案，Error 越小。自然对数一律用 \\ln 写。",
            en: "This is cross entropy: when the true label y^(i) is 1 only the first term survives, and the closer the predicted probability ŷ^(i) is to the right answer, the smaller the Error. The natural logarithm is always written \\ln.",
          },
        },
        {
          kind: "formula",
          tex: String.raw`w_i \leftarrow w_i - \alpha \frac{\partial E}{\partial w_i}, \qquad b \leftarrow b - \alpha \frac{\partial E}{\partial b}`,
          reveal: true,
          caption: {
            zh: "一次更新：沿梯度的反方向走 α 那么远。注意减号——梯度指向 Error 上升的方向，我们要往下走。",
            en: "One update: step α in the direction opposite the gradient. Mind the minus sign — the gradient points towards rising Error and we want to go down.",
          },
        },
        {
          kind: "table",
          headers: { zh: ["记号", "读作", "意思"], en: ["Symbol", "Read as", "Meaning"] },
          rows: {
            zh: [
              ["W、b", "权重矩阵、偏置", "一层的参数；一维时写成 [3, 2, 1]ᵀ 这样的转置列向量"],
              ["x^(i)", "第 i 个样本", "带括号的上标表示样本编号"],
              ["E(W, b)", "Error", "衡量错得多厉害的那个数，训练要把它变小"],
              ["α", "alpha", "学习率，控制每一步走多大"],
              ["∂E / ∂w_i", "偏导数", "Error 对第 i 个权重的梯度"],
              ["θ_ij、θ_0j", "theta", "隐藏层的权重与偏置；其余地方用 W 和 b"],
            ],
            en: [
              ["W, b", "weight matrix, bias", "The parameters of one layer; in one dimension a transposed column such as [3, 2, 1]ᵀ"],
              ["x^(i)", "sample i", "A parenthesised superscript numbers the sample"],
              ["E(W, b)", "the Error", "The number that says how wrong the model is; training shrinks it"],
              ["α", "alpha", "The learning rate, the size of each step"],
              ["∂E / ∂w_i", "partial derivative", "The gradient of the Error with respect to weight i"],
              ["θ_ij, θ_0j", "theta", "Hidden-layer weights and biases; elsewhere we write W and b"],
            ],
          },
          caption: {
            zh: "考试会考记号，所以这张表值得多看几遍。",
            en: "The notation is examinable, so this table is worth a second look.",
          },
        },
        {
          kind: "callout",
          tone: "tip",
          title: { zh: "记号检查清单", en: "Notation checklist" },
          body: {
            zh: "Error 写成 E(W, b)；学习率是 α；梯度写成 ∂E / ∂w_i；样本编号用括号上标 x^(i)；sigmoid 是 s(x) = 1/(1 + e^(−ax))，其中的 a 叫斜率参数；自然对数用 \\ln 写；backpropagation 是一个词，cross entropy 也不加连字符。",
            en: "The Error is E(W, b); the learning rate is α; gradients are ∂E / ∂w_i; a sample index is a parenthesised superscript x^(i); the sigmoid is s(x) = 1/(1 + e^(−ax)) with a as its slope parameter; the natural logarithm is written \\ln; backpropagation is one word, and cross entropy takes no hyphen.",
          },
        },
      ],
    },
  ],
  lab: "perceptron-score",
  code: {
    id: "module_07.py",
    title: { zh: "一个感知机做一次录取判定", en: "One perceptron makes an admission decision" },
    intro: {
      zh: "加权和、sigmoid、阈值规则各算一次。学生按行叠成矩阵，一次矩阵乘法就得到两个人的分数。",
      en: "Compute the weighted sum, the sigmoid, and the threshold rule once each. The students are stacked as rows, so one matrix product scores both of them.",
    },
    source: `import numpy as np

# One perceptron: weighted sum + bias, then a sigmoid, then the threshold rule.
w = np.array([2.0, 1.0])   # weight on Test, weight on Grades
b = -18.0                  # bias: the admission bar

students = np.array([[8.0, 6.0],   # Test, Grades
                     [4.0, 5.0]])

z = students @ w + b              # weighted sum, one row per student
y_hat = 1 / (1 + np.exp(-z))      # sigmoid
decision = (z >= 0).astype(int)   # threshold rule

for i in range(len(students)):
    print(f"student {i + 1}: score={z[i]:.1f} sigmoid={y_hat[i]:.3f} admit={decision[i]}")`,
    challenge: {
      zh: "把第一位同学的 Test 从 8.0 改成 6.0。他会正好落在分界线上——先写下你猜的 admit，再运行。",
      en: "Change the first student's Test from 8.0 to 6.0. He lands exactly on the boundary — write down your guess for admit before you run it.",
    },
    expectedOutput:
      "student 1: score=4.0 sigmoid=0.982 admit=1\nstudent 2: score=-5.0 sigmoid=0.007 admit=0",
    expectedNote: {
      zh: "两人的分数是 4.0 和 −5.0，sigmoid 把它们压成 0.982 和 0.007，判定只看符号：≥ 0 就是 1。偏置 −18 就是那句「Score ≥ 0」里的及格线。把 Test 改成 6.0 后第一位同学的 Score 正好是 0.0，sigmoid 正好是 0.500——因为规则写的是 ≥ 0，他仍然被判为 1。",
      en: "The two scores are 4.0 and −5.0, the sigmoid squeezes them to 0.982 and 0.007, and the decision only reads the sign: ≥ 0 means 1. The bias −18 is the pass mark inside the sentence \"Score ≥ 0\". With Test set to 6.0 the first student's Score becomes exactly 0.0 and the sigmoid exactly 0.500 — and because the rule says ≥ 0, he is still admitted.",
    },
  },
  quiz: [
    {
      question: {
        zh: "加权和 Wx + b 正好等于 0 时，阈值规则输出什么？",
        en: "The weighted sum Wx + b is exactly 0. What does the threshold rule output?",
      },
      options: { zh: ["0", "1", "无法确定"], en: ["0", "1", "It cannot be decided"] },
      correct: 1,
      explanation: {
        zh: "规则写的是 Wx + b ≥ 0，所以边界线上的点属于正类，输出 1；只有严格小于 0 才输出 0。",
        en: "The rule reads Wx + b ≥ 0, so points on the boundary belong to the positive class and output 1; only a strictly negative value outputs 0.",
      },
    },
    {
      question: {
        zh: "一个感知机能把输入空间分成什么形状？",
        en: "What shape can a single perceptron carve out of the input space?",
      },
      options: {
        zh: ["任意弯曲的区域", "直线的一侧，也就是一个半平面", "两个互不相连的区间"],
        en: ["An arbitrarily curved region", "One side of a line, a half-plane", "Two disconnected intervals"],
      },
      correct: 1,
      explanation: {
        zh: "它只有一条直线，所以只能给出一个半平面。想要带状、环状或分段的区域，就要把多个感知机组合起来。",
        en: "It owns exactly one line, so it can only return a half-plane. Strips, rings, and disconnected regions need several perceptrons combined.",
      },
    },
    {
      question: {
        zh: "一个感知机分不开 XOR。加一层隐藏单元之后为什么就可以了？",
        en: "One perceptron cannot separate XOR. Why does adding a hidden layer fix that?",
      },
      options: {
        zh: [
          "两个隐藏单元各画一条直线，组合起来得到一条带状区域",
          "隐藏层复制了更多训练数据",
          "隐藏层使用了更大的权重，所以直线能弯曲",
        ],
        en: [
          "Two hidden units draw two lines, and combining them yields a strip",
          "The hidden layer duplicates the training data",
          "The hidden layer uses larger weights, so the line can bend",
        ],
      },
      correct: 0,
      explanation: {
        zh: "两个隐藏单元的权重方向相同、偏置不同，所以画出两条平行线，XOR 的两个 1 正好夹在中间的那条带里。权重再大，一条直线也不会弯——层数带来的新直线才是关键。",
        en: "The two hidden units share a weight direction and differ in bias, so they draw parallel lines and the two 1s of XOR sit in the strip between them. No weight is large enough to bend a single line — what matters is the extra line a new layer brings.",
      },
    },
  ],
};

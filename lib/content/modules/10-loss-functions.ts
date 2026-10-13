import type { CourseModule } from "../types";

export const lossFunctions: CourseModule = {
  slug: "loss-functions",
  number: "10",
  track: "ai",
  durationMinutes: 50,
  level: { zh: "AI 核心", en: "AI core" },
  title: {
    zh: "损失函数：把「错得多离谱」量成一个数",
    en: "Loss functions: measuring how wrong a model is",
  },
  shortTitle: { zh: "损失函数", en: "Loss functions" },
  subtitle: { zh: "从 0/1 错误到交叉熵", en: "From 0/1 error to cross entropy" },
  description: {
    zh: "这一章的数字最常出现在考卷上：0/1 错误为什么不能训练、二分类与多分类交叉熵各自长什么样、ln 为什么把自信的错误答案罚得那么重、回归为什么换成 MSE，以及训练的目标就是找到最优参数 (W, b)。",
    en: "The numbers in this chapter turn up on exam papers more than any others: why a 0/1 error cannot train anything, what the binary and multiclass cross entropy forms look like, why ln punishes a confident wrong answer so hard, why regression switches to MSE, and how the goal of training is to find the optimal parameters (W, b).",
  },
  plainIdea: {
    zh: "要让模型学得动，误差不能只说「错了」，必须说出「错了多少」。交叉熵（cross entropy）就是那把尺子。",
    en: "For a model to learn, its error cannot merely say wrong — it has to say how wrong. Cross entropy is the ruler that does it.",
  },
  analogy: {
    zh: "像改卷子：只盖一个「不及格」印章的卷子没法告诉你该补哪里，打上分数的卷子才会告诉你差多远。交叉熵给的就是分数，而且对「自信地答错」扣得特别狠。",
    en: "It is like marking an exam: a script stamped only with fail tells you nothing about what to fix, while a script with a score tells you how far off you are. Cross entropy gives the score, and it docks a great deal for a confidently wrong answer.",
  },
  beforeMath: {
    zh: "只需要认得加权和 Wx + b、sigmoid 函数 σ，以及自然对数 ln。",
    en: "You only need the weighted sum Wx + b, the sigmoid σ, and the natural logarithm ln.",
  },
  aiConnection: {
    zh: "训练的每一步都先算 E(W, b)，再用反向传播（backpropagation）求它的梯度，然后按学习率 α 更新 W 和 b。任务变了，改的就是这个 E。",
    en: "Every training step computes E(W, b) first, uses backpropagation to differentiate it, and then updates W and b by the learning rate α. When the task changes, E is the thing that changes.",
  },
  outcomes: {
    zh: [
      "解释 0/1 错误为什么不能当训练信号",
      "写出本课程的二分类与多分类交叉熵",
      "说明 −ln p 为什么重罚自信的错误答案",
      "手算一个神经元的交叉熵",
      "为回归任务选对 MSE，并说出训练的目标",
    ],
    en: [
      "Explain why a 0/1 error cannot be a training signal",
      "Write the course's binary and multiclass cross entropy",
      "Explain why −ln p punishes a confident wrong answer",
      "Work out the cross entropy of one neuron by hand",
      "Choose MSE for regression and state the goal of training",
    ],
  },
  figure: "optimization",
  figureCaption: {
    zh: "再看一眼优化那一章的误差曲面：交叉熵把「错得多离谱」变成一张光滑的曲面，梯度下降才有坡可下。0/1 错误画出来是一排台阶，站在台阶上往哪边都下不去。",
    en: "Look again at the error surface from the optimization chapter: cross entropy turns how wrong into a smooth surface that gradient descent can walk down. A 0/1 error draws a staircase, and from anywhere on a staircase there is nowhere to go down.",
  },
  sections: [
    {
      label: { zh: "为什么", en: "WHY" },
      title: {
        zh: "0/1 错误太平了，给不出方向",
        en: "A 0/1 error is flat, so it gives no direction",
      },
      blocks: [
        {
          kind: "prose",
          paragraphs: {
            zh: [
              "最直觉的「错得多离谱」是数错误个数：预测对了记 0，预测错了记 1，再对所有样本取平均。这个量叫离散错误（discrete error），也叫 0/1 错误（0/1 error）。拿它做评估非常合适——准确率（accuracy）就是 1 减去它。",
              "但它当不了训练信号，原因是它几乎处处平坦。把某个权重挪动一点点，只要没有刚好跨过「判对」的那条边界，E(W, b) 的值一点都不会变，于是它的导数处处是 0。而反向传播（backpropagation）算出来的每一个梯度都带着这个因子：乘上 0，参数就一步也不会动。",
              "更糟的是它不区分程度：把一张猫图判成「51% 是狗」和判成「99% 是狗」，在 0/1 错误里都只算错了一个。训练需要的是一个有坡度、而且越错越大的信号，这正是交叉熵（cross entropy）要解决的问题。",
            ],
            en: [
              "The most intuitive way to say how wrong a model is would be to count mistakes: score 0 when the prediction is right, 1 when it is wrong, and average over all samples. That quantity is the discrete error, also called the 0/1 error. As an evaluation it is perfectly good — accuracy is just 1 minus it.",
              "It cannot serve as a training signal, because it is flat almost everywhere. Nudge a weight a little and, as long as nothing crosses the boundary between right and wrong, E(W, b) does not change at all, so its derivative is 0 everywhere. Every gradient backpropagation computes carries that factor, and multiplying by 0 leaves the parameters exactly where they were.",
              "Worse, it does not measure degree: calling a cat photo \"51% dog\" and calling it \"99% dog\" both count as one mistake. Training needs a signal that has a slope and grows with the size of the mistake, which is precisely the problem cross entropy solves.",
            ],
          },
        },
        {
          kind: "formula",
          tex: String.raw`E(W, b) = \frac{1}{m}\sum_{i=1}^{m} e_i, \qquad e_i = \begin{cases} 0, & \hat{y}^{(i)} = y^{(i)} \\ 1, & \hat{y}^{(i)} \ne y^{(i)} \end{cases}`,
          reveal: true,
          caption: {
            zh: "0/1 错误的定义：每个样本记 0 或 1，再取平均。它只能取 0、1/m、…、1 这几个值，曲线是一排台阶——台阶上是平的，台阶之间是跳变，没有任何地方能给出「往哪边挪」的斜率。",
            en: "The 0/1 error: score each sample 0 or 1 and average. It can only take the values 0, 1/m, …, 1, so its curve is a staircase — flat along each step and jumping between them, with nowhere that gives a slope saying which way to move.",
          },
        },
        {
          kind: "callout",
          tone: "warning",
          title: { zh: "平坦就是学不动", en: "Flat means nothing is learned" },
          body: {
            zh: "把 0/1 错误放进梯度下降，梯度几乎处处等于 0，参数一步都不会动——不是学得慢，是完全不动。就算正好落在台阶的跳变点上，那里的导数要么不存在、要么是无穷大，也给不出任何可用的大小信息。「错了多少」这件事，0/1 错误根本没有记录。",
            en: "Put the 0/1 error into gradient descent and the gradient is 0 almost everywhere, so the parameters never move: not slowly, but not at all. Even landing exactly on a jump gives a derivative that either does not exist or is infinite, which is no usable magnitude either. How wrong the model was is simply not recorded anywhere in a 0/1 error.",
          },
        },
        {
          kind: "callout",
          tone: "tip",
          title: { zh: "名字对照：本课程叫它 Error", en: "Two names for one thing" },
          body: {
            zh: "本课程把这个量叫做误差（Error），并且一律写成 E(W, b)：E 是参数 W 和 b 的函数。你在别的地方——包括前面「优化」那一章——会看到同一个东西被叫做损失（loss），并且换了一个大写字母。名字和字母不同，含义完全一样：一个把参数映射成「错得多离谱」的单一数字的函数。考试请写 E(W, b)。",
            en: "This course calls the quantity the Error and always writes E(W, b): E is a function of the parameters W and b. Elsewhere — including the earlier optimization chapter — you will meet the same object called the loss and written with a different capital letter. The name and the letter differ; the meaning is identical: one function that maps the parameters to a single number saying how wrong the model is. In the exam, write E(W, b).",
          },
        },
        {
          kind: "formula",
          tex: String.raw`E(W, b) = -\frac{1}{m}\sum_{i=1}^{m}\left[(1-y_i)\ln(1-\sigma(Wx^{(i)}+b)) + y_i\ln(\sigma(Wx^{(i)}+b))\right]`,
          reveal: true,
          caption: {
            zh: "二分类交叉熵（binary cross entropy），本课程使用的形式。m 是样本个数；yᵢ 是第 i 个样本的真标签，只能是 0 或 1；σ(Wx^{(i)} + b) 是神经元给出的「属于第 1 类」的概率。注意三件事：样本编号写成带括号的上标 x^{(i)}；对数一律是自然对数 ln；整个式子前面有一个负号。",
            en: "Binary cross entropy, in the form this course uses. m is the number of samples; yᵢ is the true label of sample i and is either 0 or 1; σ(Wx^{(i)} + b) is the probability the neuron gives to class 1. Notice three things: the sample index is a parenthesised superscript, x^{(i)}; the logarithm is always the natural log ln; and the whole expression carries a leading minus sign.",
          },
        },
        {
          kind: "predict",
          prompt: {
            zh: "如果把 0/1 错误直接当作误差函数去训练，一个错得很离谱的模型会怎样？",
            en: "If the 0/1 error were used directly as the error function, what would happen to a model that is badly wrong?",
          },
          options: {
            zh: [
              "错得越离谱，参数调整得越大",
              "几乎不会有任何调整，因为梯度几乎处处为 0",
              "参数会一步跳到最优解",
            ],
            en: [
              "The worse the mistake, the larger the parameter update",
              "Almost no update at all, because the gradient is 0 almost everywhere",
              "The parameters would jump straight to the optimum",
            ],
          },
          answerIndex: 1,
          why: {
            zh: "0/1 错误几乎处处是平的，导数恒为 0，反向传播乘上这个 0 之后参数一动不动。它也不会因为「错得多离谱」而变大：把所有猫都判成 99% 是狗，和判成 51% 是狗，得到的值完全一样。这就是它只能当评估指标、不能当训练信号的原因。",
            en: "The 0/1 error is flat almost everywhere, so its derivative is 0 and backpropagation multiplies the gradient by that 0: nothing moves. It does not grow with the size of the mistake either — calling every cat 99% dog gives exactly the same value as calling it 51% dog. That is why it can be an evaluation metric but never a training signal.",
          },
        },
        {
          kind: "example",
          title: {
            zh: "考试题：单个神经元的交叉熵",
            en: "Exam-style: the cross entropy of one neuron",
          },
          steps: {
            zh: [
              "一个神经元的权重是 w = [3, 2, 1]^T，偏置 b = 2，输入是 x = [0.2, 0.4, 0.6]^T。先算加权和 z = Wx + b。",
              "逐项相乘再相加：z = 3 × 0.2 + 2 × 0.4 + 1 × 0.6 + 2 = 0.6 + 0.8 + 0.6 + 2.0 = 4.0。",
              "过 sigmoid：σ(4.0) = 1 / (1 + e^(−4)) = 1 / (1 + 0.0183) ≈ 0.9817，写成两位小数就是 0.98。",
              "如果真实标签 y = 1，只有括号里第二项留下来：E = −ln(0.9817) ≈ 0.018。",
              "如果真实标签 y = 0，留下来的换成第一项，用未取整的 σ：E = −ln(1 − 0.9817) ≈ 4.02。",
            ],
            en: [
              "A neuron has weights w = [3, 2, 1]^T, bias b = 2, and input x = [0.2, 0.4, 0.6]^T. Start with the weighted sum z = Wx + b.",
              "Multiply term by term and add: z = 3 × 0.2 + 2 × 0.4 + 1 × 0.6 + 2 = 0.6 + 0.8 + 0.6 + 2.0 = 4.0.",
              "Push it through the sigmoid: σ(4.0) = 1 / (1 + e^(−4)) = 1 / (1 + 0.0183) ≈ 0.9817, which is 0.98 to two decimal places.",
              "If the true label is y = 1, only the second term in the brackets survives: E = −ln(0.9817) ≈ 0.018.",
              "If the true label is y = 0, the first term survives instead, using the unrounded σ: E = −ln(1 − 0.9817) ≈ 4.02.",
            ],
          },
          result: {
            zh: "同一个 z = 4.0，答案对的时候误差只有 0.018，答案错的时候是 4.02——差了二百多倍。交叉熵问的不是「对不对」，而是「你把多少概率给了真相」。手算固定按这个顺序走：先算 z = Wx + b，再算 σ(z)，最后只保留真标签对应的那一项。",
            en: "For the same z = 4.0 the error is only 0.018 when the answer is right and 4.02 when it is wrong — more than two hundred times larger. Cross entropy does not ask whether the answer was right; it asks how much probability you gave to the truth. Do the hand calculation in this order every time: first z = Wx + b, then σ(z), then keep only the term belonging to the true label.",
          },
        },
        {
          kind: "callout",
          tone: "tip",
          title: { zh: "这一节的图在练习区", en: "This section's figure is in the practice area" },
          body: {
            zh: "往下走到练习区（practice），那里有一张可以拖动的图：拖动模型给真实类别的概率 p，看 −ln p 在 p 靠近 0 的地方怎样炸开。那是这一整节最该记住的形状。",
            en: "Scroll down to the practice area, where a draggable figure waits: drag the probability p the model gives to the true class and watch −ln p explode as p approaches 0. That shape is the one thing to remember from this section.",
          },
        },
      ],
    },
    {
      label: { zh: "对比", en: "COMPARE" },
      title: {
        zh: "0/1 错误、交叉熵与 MSE 放在一起看",
        en: "0/1 error, cross entropy, and MSE side by side",
      },
      blocks: [
        {
          kind: "prose",
          paragraphs: {
            zh: [
              "把预测概率 p 当横轴、误差当纵轴，三个候选的形状完全不同。0/1 错误是台阶：p 大的一边是 0，p 小的一边是 1，中间一跳。MSE 是一条抛物线 (1 − p)²，处处有斜率，但坡度有限——p = 0 处它的斜率也只有 −2。交叉熵是 −ln p，越靠近 p = 0 越陡，到 p → 0 时直接冲向无穷大。",
              "这就是交叉熵「重罚自信的错误答案」的机制。把真相的概率压到 0.01，罚金是 −ln(0.01) = 4.605；压到 0.001，罚金是 6.908。增长方式是：概率每缩小 10 倍，罚金只增加 ln 10 ≈ 2.303，但永远没有上界——所以一个自信地答错的样本，可以单独把整个 E(W, b) 拉得很高。",
              "反过来，答对而且自信时罚金几乎为 0：p = 0.9 时只有 0.105。交叉熵因此天然地奖励「把高概率给真相」，而不是「给个 0.5 蒙过去」。",
            ],
            en: [
              "Put the predicted probability p on the horizontal axis and the error on the vertical one, and the three candidates look nothing alike. The 0/1 error is a step: 0 on the confident side, 1 on the other, and a jump in between. MSE is the parabola (1 − p)², which has a slope everywhere but a bounded one — even at p = 0 the slope is only −2. Cross entropy is −ln p, steeper and steeper as p approaches 0, and racing to infinity when p → 0.",
              "That is the mechanism behind its heavy punishment of a confident wrong answer. Squeeze the probability of the truth down to 0.01 and the penalty is −ln(0.01) = 4.605; down to 0.001 and it is 6.908. The growth pattern is that every tenfold reduction of the probability adds just ln 10 ≈ 2.303 — but there is no upper bound, so one confidently wrong sample can single-handedly pull all of E(W, b) up.",
              "Conversely, a right and confident answer is almost free: at p = 0.9 the penalty is only 0.105. Cross entropy therefore rewards putting high probability on the truth rather than hedging at 0.5.",
            ],
          },
        },
        {
          kind: "formula",
          tex: String.raw`\lim_{p \to 0^{+}} \left(-\ln p\right) = +\infty`,
          reveal: true,
          caption: {
            zh: "p 是模型给真实类别的概率。p 越小罚得越重，而且没有上限：−ln p 衡量的是「模型对真相有多意外」。p = 1 时罚金是 0，p = 0.5 时是 0.693，p → 0 时发散。",
            en: "p is the probability the model gives to the true class. The smaller p is, the heavier the penalty, with no ceiling: −ln p measures how surprised the model is by the truth. At p = 1 the penalty is 0, at p = 0.5 it is 0.693, and as p → 0 it diverges.",
          },
        },
        {
          kind: "table",
          headers: {
            zh: ["模型给真实类别的概率 p", "−ln p", "怎么读"],
            en: ["Probability p given to the true class", "−ln p", "How to read it"],
          },
          rows: {
            zh: [
              ["0.900", "0.105", "答对且自信，几乎不罚"],
              ["0.500", "0.693", "完全没主意，罚金正好是 ln 2"],
              ["0.100", "2.303", "已经在明显受罚"],
              ["0.010", "4.605", "自信地答错，重罚"],
              ["0.001", "6.908", "几乎把全部概率给了错的类别"],
            ],
            en: [
              ["0.900", "0.105", "Right and confident: almost free"],
              ["0.500", "0.693", "No idea at all: the penalty is exactly ln 2"],
              ["0.100", "2.303", "Visibly punished already"],
              ["0.010", "4.605", "Confidently wrong: heavily punished"],
              ["0.001", "6.908", "Nearly all the probability went to the wrong class"],
            ],
          },
          caption: {
            zh: "概率每缩小 10 倍，罚金增加 ln 10 ≈ 2.303。这个「越靠近 0 涨得越快」的形状，就是交叉熵能训练的根源——也正是这一段数字最常出现在考卷上。",
            en: "Every tenfold reduction in probability adds ln 10 ≈ 2.303 to the penalty. That shape — accelerating as p approaches 0 — is what makes cross entropy trainable, and these are the numbers exam papers ask for most often.",
          },
        },
        {
          kind: "lab",
          id: "loss-compare",
        },
        {
          kind: "formula",
          tex: String.raw`E(W, b) = -\frac{1}{m}\sum_{i=1}^{m}\sum_{j=1}^{n} y_{ij}\ln(\sigma(Wx^{(ij)}+b))`,
          reveal: true,
          caption: {
            zh: "多分类交叉熵（multiclass cross entropy）。n 是类别个数；y_{ij} 是第 i 个样本在第 j 个类别上的标签，真实类别为 1、其余为 0；x^{(ij)} 指「第 i 个样本、第 j 个类别」这一对输入。外层对 m 个样本求和，内层对 n 个类别求和。",
            en: "Multiclass cross entropy. n is the number of classes; y_{ij} is the label of sample i on class j, equal to 1 for the true class and 0 for the rest; x^{(ij)} names the sample-and-class pair. The outer sum runs over the m samples and the inner sum over the n classes.",
          },
        },
        {
          kind: "callout",
          tone: "takeaway",
          title: { zh: "内层求和里只有一项活下来", en: "Only one inner term survives" },
          body: {
            zh: "因为 y_{ij} 只会是 0 或 1，内层求和里几乎每一项都被乘成 0，只有真实类别那一项留下来。于是多分类交叉熵可以读成一句话：对每个样本，取出模型给真实类别的概率 p，罚它 −ln p，再对 m 个样本取平均。写代码时不需要真的做两层求和，取对数之后用标签把那一项索引出来就行。",
            en: "Because y_{ij} is only ever 0 or 1, the inner sum is multiplied down to a single surviving term, the one belonging to the true class. So multiclass cross entropy reads as one sentence: for each sample take the probability p the model gives to the true class, charge it −ln p, and average over the m samples. In code there is no need to write two nested sums — take the logarithm and index the surviving term with the label.",
          },
        },
        {
          kind: "predict",
          prompt: {
            zh: "一个十分类的手写数字模型，某个样本的真实类别是 3，而模型给类别 3 的概率只有 0.1。这个样本贡献多少误差？",
            en: "A ten-class digit model sees a sample whose true class is 3, but gives class 3 a probability of only 0.1. How much error does this sample contribute?",
          },
          options: {
            zh: ["−ln(0.1) ≈ 2.303", "−ln(0.9) ≈ 0.105", "9 × (−ln 0.1)", "0，因为其他九类都还有概率"],
            en: [
              "−ln(0.1) ≈ 2.303",
              "−ln(0.9) ≈ 0.105",
              "9 × (−ln 0.1)",
              "0, because the other nine classes still have probability",
            ],
          },
          answerIndex: 0,
          why: {
            zh: "内层求和里的十个 y_{ij} 中，只有真实类别 3 那个等于 1，其余九个都被乘成 0，所以贡献就是 −ln(0.1) = 2.303。注意它不是 9 倍：错的类别不会各罚一次，罚的是「给真相的概率有多低」。",
            en: "Of the ten y_{ij} values in the inner sum only the one for true class 3 equals 1; the other nine are multiplied away, so the contribution is −ln(0.1) = 2.303. Note that it is not nine times as large: the wrong classes are not each charged, the charge is for how little probability the truth received.",
          },
        },
        {
          kind: "formula",
          tex: String.raw`E(W, b) = \frac{1}{m}\sum_{i=1}^{m}\left(y^{(i)} - (Wx^{(i)} + b)\right)^{2}`,
          reveal: true,
          caption: {
            zh: "回归（regression）要预测的是连续数值，不是概率，所以换成均方误差（mean squared error, MSE）：m 个样本上「预测值减真值」的平方的平均。它同样处处可导，同样「错了就有坡度」，但没有对数——一个错得很远的预测是被平方放大，而不是被 ln 炸开。选哪个只看一件事：输出是概率就用交叉熵，输出是数值就用 MSE。",
            en: "Regression predicts a continuous number rather than a probability, so the error becomes the mean squared error, MSE: the average of the squared difference between prediction and truth over the m samples. It too is differentiable everywhere and gives a slope whenever the model is wrong, but it has no logarithm — a prediction that is far off is amplified by squaring rather than blown up by ln. The choice comes down to one question: a probability output takes cross entropy, a numeric output takes MSE.",
          },
        },
      ],
    },
    {
      label: { zh: "曲面", en: "SURFACE" },
      title: {
        zh: "E(W, b) 是一张曲面，训练就是找最低点",
        en: "E(W, b) is a surface, and training looks for its lowest point",
      },
      blocks: [
        {
          kind: "prose",
          paragraphs: {
            zh: [
              "现在把 E 看成参数 W 和 b 的函数：每给一组参数，就有一个确定的误差值；把所有参数取值铺开，就得到一张误差曲面（error surface）。训练的目标就写在这张曲面上——训练的目标就是找到最优参数 (W, b)，让 E(W, b) 取到最小值。",
              "交叉熵曲面是光滑的：w 或 b 挪动一点点，每个 σ(Wx^{(i)} + b) 只挪动一点点，−ln p 也只挪动一点点，于是 E 平滑地变化。光滑就意味着处处有斜率、处处有梯度，梯度下降（gradient descent）才有方向可走——0/1 错误缺的正是这一点。",
              "学习率（learning rate）在本课程里记作 α，它决定每次往低处走多大一步：太大可能跨过谷底，太小则学得慢。每次更新要用到的偏导数值由反向传播（backpropagation）算出来，形状一定和参数本身相同。",
            ],
            en: [
              "Now read E as a function of the parameters W and b: give it one parameter setting and it returns one definite error value, and spreading out every possible setting produces the error surface. The goal of training is written on that surface: the goal of training is to find the optimal parameters (W, b) that make E(W, b) as small as it can be.",
              "The cross entropy surface is smooth. Move w or b a little and each σ(Wx^{(i)} + b) moves a little, so −ln p moves a little and E changes smoothly. Smoothness means a slope everywhere and therefore a gradient everywhere, which is what gives gradient descent a direction to walk in — exactly what the 0/1 error lacks.",
              "The learning rate is written α in this course, and it sets how large each step downhill is: too large may overshoot the valley, too small learns slowly. The partial derivatives each update needs come from backpropagation, and they always have the same shape as the parameters themselves.",
            ],
          },
        },
        {
          kind: "formula",
          tex: String.raw`(W^{*}, b^{*}) = \arg\min_{W, b} E(W, b)`,
          reveal: true,
          caption: {
            zh: "训练的目标：在所有可能的 (W, b) 中，找出让 E(W, b) 最小的那一组，记作 (W*, b*)。注意 E 是 m 个样本的平均，所以它衡量的是模型在整个数据集上的表现，而不是某一个样本。",
            en: "The goal of training: among all possible (W, b), find the setting that makes E(W, b) smallest, written (W*, b*). Note that E averages over the m samples, so it measures the model across the whole dataset rather than on any single sample.",
          },
        },
        {
          kind: "lab",
          id: "loss-surface",
        },
        {
          kind: "predict",
          prompt: {
            zh: "一个样本的真实标签是 1，模型给它 0.5 的概率。这个样本的交叉熵是多少？",
            en: "A sample has true label 1, and the model gives it probability 0.5. What is this sample's cross entropy?",
          },
          options: {
            zh: ["0", "ln 2 ≈ 0.693", "1", "0.5"],
            en: ["0", "ln 2 ≈ 0.693", "1", "0.5"],
          },
          answerIndex: 1,
          why: {
            zh: "E = −ln(0.5) = ln 2 ≈ 0.693。这就是「完全没主意」的价格：把概率平均分给两类，每个样本都罚 ln 2。参数取 w = 0、b = 0 时，模型对每个输入都给出 0.5，整张曲面的高度就停在 0.693——训练要做的就是从这个值往下走。",
            en: "E = −ln(0.5) = ln 2 ≈ 0.693. That is the price of having no idea at all: split the probability evenly and every sample is charged ln 2. At w = 0 and b = 0 the model answers 0.5 for every input, so the whole surface sits at height 0.693 — and training is the walk down from there.",
          },
        },
        {
          kind: "example",
          title: {
            zh: "练习区那组小数据：E 从 2.259 掉到 0.026",
            en: "The practice figure's tiny dataset: E falls from 2.259 to 0.026",
          },
          steps: {
            zh: [
              "练习区的图用的就是这组数据：只有一个特征，m = 4，四个样本是 (−2, 0)、(−1, 0)、(1, 1)、(2, 1)。模型是 p = σ(wx + b)，E(w, b) 就是四个样本的 −ln p 的平均。",
              "先看「什么都不知道」：w = 0、b = 0 时四个 z 都是 0，σ(0) = 0.5，每个样本都罚 −ln 0.5 = ln 2 ≈ 0.693，所以 E = 0.693。",
              "先试一组糟糕的参数：w = −1.4、b = −0.6。四个 z 是 2.2、0.8、−2.0、−3.4，对应的 p 是 0.900、0.690、0.119、0.032，四个样本分别罚 2.305、1.171、2.127、3.433，平均 E = 2.259——比「什么都不知道」还高三倍以上。",
              "把点拖到 w = 3、b = 0：四个 z 变成 −6、−3、3、6，p 是 0.0025、0.0474、0.9526、0.9975。前两个样本真标签是 0，罚 −ln(1 − p) = 0.0025 和 0.0486；后两个真标签是 1，罚 −ln p = 0.0486 和 0.0025。",
              "四个数取平均：E = (0.0025 + 0.0486 + 0.0486 + 0.0025) / 4 ≈ 0.026。",
            ],
            en: [
              "The practice figure plots exactly this dataset: one feature, m = 4, with samples (−2, 0), (−1, 0), (1, 1), and (2, 1). The model is p = σ(wx + b), and E(w, b) is the average of the four samples' −ln p.",
              "Start from knowing nothing: at w = 0 and b = 0 all four z values are 0 and σ(0) = 0.5, so every sample is charged −ln 0.5 = ln 2 ≈ 0.693 and E = 0.693.",
              "Now try a poor setting: w = −1.4 and b = −0.6. The four z values are 2.2, 0.8, −2.0, −3.4, giving p = 0.900, 0.690, 0.119, 0.032 and charges of 2.305, 1.171, 2.127, 3.433, so the average is E = 2.259 — more than three times the know-nothing baseline.",
              "Drag the point to w = 3 and b = 0: the four z values become −6, −3, 3, 6 and p becomes 0.0025, 0.0474, 0.9526, 0.9975. The first two samples carry true label 0 and are charged −ln(1 − p) = 0.0025 and 0.0486; the last two carry true label 1 and are charged −ln p = 0.0486 and 0.0025.",
              "Average the four: E = (0.0025 + 0.0486 + 0.0486 + 0.0025) / 4 ≈ 0.026.",
            ],
          },
          result: {
            zh: "同一组数据，参数从 (−1.4, −0.6) 走到 (3, 0)，E 从 2.259 掉到 0.026，中间路过 0.693 这个「什么都不知道」的高度。练习区的图就是这张曲面：拖动那个点，读数就是这里的 E。每一步的顺序都一样：先算 z = wx + b，再取 σ，只罚真标签对应的那一项，最后对 m 个样本取平均。",
            en: "On the same data, walking the parameters from (−1.4, −0.6) to (3, 0) takes E from 2.259 down to 0.026, passing the 0.693 height of knowing nothing on the way. The practice figure is that surface: drag the point and its readout is this E. The order never changes — compute z = wx + b, apply σ, charge only the term belonging to the true label, and average over the m samples.",
          },
        },
        {
          kind: "formula",
          tex: String.raw`W \leftarrow W - \alpha\,\frac{\partial E}{\partial W}, \qquad b \leftarrow b - \alpha\,\frac{\partial E}{\partial b}`,
          reveal: true,
          caption: {
            zh: "一条更新规则：α 是学习率，∂E/∂W 和 ∂E/∂b 是误差对参数的偏导。因为交叉熵处处光滑，这两个偏导处处有定义，反向传播负责把它们算出来。",
            en: "One update rule: α is the learning rate, and ∂E/∂W and ∂E/∂b are the error's partial derivatives with respect to the parameters. Because cross entropy is smooth everywhere those derivatives always exist, and backpropagation is what computes them.",
          },
        },
        {
          kind: "callout",
          tone: "takeaway",
          title: { zh: "这一章的考试清单", en: "The exam checklist for this chapter" },
          body: {
            zh: "误差写作 E(W, b)；二分类用交叉熵，多分类用它对类别求和的版本，回归用 MSE；对数一律是 ln；−ln p 在 p → 0 时炸开，所以自信地答错会被重罚；训练的目标就是找到最优参数 (W, b)。手算固定四步：z = Wx + b → σ(z) → 只取真标签那一项 → 对 m 个样本取平均。",
            en: "Write the error as E(W, b); use cross entropy for binary classification, its class-summed version for multiclass, and MSE for regression; the logarithm is always ln; −ln p explodes as p → 0, which is why a confident wrong answer is punished so hard; and the goal of training is to find the optimal parameters (W, b). Hand calculations follow four fixed steps: z = Wx + b, then σ(z), then keep the term for the true label, then average over the m samples.",
          },
        },
      ],
    },
  ],
  lab: "loss-cross-entropy",
  code: {
    id: "module_10.py",
    title: { zh: "用 NumPy 算交叉熵，并看罚金怎么涨", en: "Compute cross entropy in NumPy and watch the penalty grow" },
    intro: {
      zh: "同一组真标签、两组预测：一组接近正确，一组自信地答错。分别算出 E(W, b)，再看 −ln p 在 p 接近 0 时怎么涨。",
      en: "One set of true labels and two sets of predictions: one nearly right, one confidently wrong. Compute E(W, b) for each, then watch −ln p grow as p approaches 0.",
    },
    source: `import numpy as np

y = np.array([1.0, 0.0, 1.0, 0.0])
good = np.array([0.90, 0.80, 0.60, 0.30])
bad = np.array([0.99, 0.99, 0.01, 0.01])


def cross_entropy(y, p):
    return -np.mean((1 - y) * np.log(1 - p) + y * np.log(p))


print(f"{'true labels':<14}{y}")
print(f"{'predictions':<14}{good}")
print(f"{'E(W, b)':<14}{cross_entropy(y, good):.4f}")
print(f"{'predictions':<14}{bad}")
print(f"{'E(W, b)':<14}{cross_entropy(y, bad):.4f}")

for prob in [0.9, 0.5, 0.1, 0.01, 0.001]:
    print(f"p = {prob:.3f}   -ln(p) = {-np.log(prob):.3f}")`,
    challenge: {
      zh: "把 bad 里的 0.99 改成 0.999、0.01 改成 0.001，再跑一次。E 会涨到多少？它和单行的 −ln(0.001) = 6.908 是什么关系？",
      en: "Change the 0.99s in bad to 0.999 and the 0.01s to 0.001, then run it again. How large does E become, and how does that relate to the single value −ln(0.001) = 6.908 printed below?",
    },
    expectedOutput: `true labels   [1. 0. 1. 0.]
predictions   [0.9 0.8 0.6 0.3]
E(W, b)       0.6456
predictions   [0.99 0.99 0.01 0.01]
E(W, b)       2.3076
p = 0.900   -ln(p) = 0.105
p = 0.500   -ln(p) = 0.693
p = 0.100   -ln(p) = 2.303
p = 0.010   -ln(p) = 4.605
p = 0.001   -ln(p) = 6.908`,
    expectedNote: {
      zh: "第一组预测错了两个样本，0/1 错误是 0.25，交叉熵是 0.6456；第二组自信地答错，0/1 错误是 0.5（只翻了一倍），交叉熵却涨到 2.3076（3.6 倍）。差别全在两个错样本各自的 −ln p：第一组是 1.609 和 0.357，第二组是两个 4.605。最后五行是 −ln p 本身：概率每缩小 10 倍，罚金加 ln 10 ≈ 2.303，而且永远不封顶——挑战里把概率压到 0.001 时，E 会到大约 3.45。",
      en: "The first set of predictions gets two samples wrong: its 0/1 error is 0.25 and its cross entropy is 0.6456. The second set is confidently wrong: the 0/1 error only doubles to 0.5, but the cross entropy climbs to 2.3076, a factor of 3.6. The whole difference lies in each wrong sample's −ln p: 1.609 and 0.357 in the first set, two 4.605s in the second. The last five lines print −ln p itself: every tenfold reduction in probability adds ln 10 ≈ 2.303 and the penalty never caps, so pushing the probabilities to 0.001 in the challenge takes E to roughly 3.45.",
    },
  },
  quiz: [
    {
      question: {
        zh: "为什么 0/1 错误（离散错误）不能当训练信号？",
        en: "Why can the 0/1 error (the discrete error) not be a training signal?",
      },
      options: {
        zh: [
          "因为它几乎处处平坦，导数几乎处处为 0，给不出移动方向",
          "因为它对每个样本的取值都太大",
          "因为它只对二分类有定义",
          "因为它需要先算 sigmoid，太慢",
        ],
        en: [
          "Because it is flat almost everywhere, so its derivative is 0 almost everywhere and gives no direction to move",
          "Because its value on every sample is too large",
          "Because it is defined only for binary classification",
          "Because it needs a sigmoid first, which is too slow",
        ],
      },
      correct: 0,
      explanation: {
        zh: "0/1 错误是一排台阶：台阶上平坦、台阶之间跳变，梯度几乎处处是 0，参数一动不动。它也不记录「错得多离谱」。",
        en: "The 0/1 error is a staircase: flat along each step and jumping between them, so the gradient is 0 almost everywhere and nothing moves. It does not record how wrong the model was either.",
      },
    },
    {
      question: {
        zh: "模型给真实类别的概率只有 0.01 时，这个样本的罚金 −ln p 约是多少？",
        en: "When the model gives the true class a probability of only 0.01, what is the penalty −ln p for that sample?",
      },
      options: {
        zh: ["0.01", "4.605", "0.99", "2.303"],
        en: ["0.01", "4.605", "0.99", "2.303"],
      },
      correct: 1,
      explanation: {
        zh: "−ln(0.01) = 4.605。概率每缩小 10 倍，罚金增加 ln 10 ≈ 2.303，所以 0.001 时是 6.908——这就是「自信地答错」被重罚的原因。",
        en: "−ln(0.01) = 4.605. Every tenfold reduction in probability adds ln 10 ≈ 2.303, so 0.001 gives 6.908 — that is why a confident wrong answer is punished so hard.",
      },
    },
    {
      question: {
        zh: "回归（regression）任务通常用哪个误差函数？",
        en: "Which error function does a regression task normally use?",
      },
      options: {
        zh: ["MSE（均方误差）", "二分类交叉熵", "0/1 错误", "多分类交叉熵"],
        en: ["MSE (mean squared error)", "Binary cross entropy", "The 0/1 error", "Multiclass cross entropy"],
      },
      correct: 0,
      explanation: {
        zh: "回归的输出是连续数值而不是概率，用不了 ln，所以用 MSE。分类任务才用交叉熵：二分类用两项相加的形式，多分类再加上对类别的求和。",
        en: "A regression output is a continuous number rather than a probability, so ln does not apply and MSE is used instead. Classification tasks use cross entropy: the two-term form for binary, plus a sum over classes for multiclass.",
      },
    },
  ],
};

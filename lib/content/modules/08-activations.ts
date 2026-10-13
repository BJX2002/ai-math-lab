import type { CourseModule } from "../types";

export const activations: CourseModule = {
  slug: "activations",
  number: "08",
  track: "ai",
  durationMinutes: 40,
  level: { zh: "AI 核心", en: "AI core" },
  title: {
    zh: "激活函数：让网络能弯曲",
    en: "Activation functions: giving the network a bend",
  },
  shortTitle: { zh: "激活函数", en: "Activations" },
  subtitle: { zh: "从阶跃到 ReLU", en: "From step to ReLU" },
  description: {
    zh: "加权和只会画直线，激活函数（activation function）负责把它掰弯。这一章从阶跃函数（step function）走到 sigmoid 和 ReLU，并说清导数为什么决定了网络能不能学。",
    en: "A weighted sum can only draw a line, and an activation function is what bends it. This chapter moves from the step function to sigmoid and ReLU, and explains why the derivative decides whether a network can learn at all.",
  },
  plainIdea: {
    zh: "如果每个神经元只会做加权求和（weighted sum），那么堆多少层都等于只有一层；激活函数（activation function）才是那个把网络掰弯的小零件。",
    en: "If every neuron only took a weighted sum, then however many layers you stacked you would still have one layer. The activation function is the small part that bends it.",
  },
  analogy: {
    zh: "像折弯一根直铁丝：加权和是那根直铁丝，激活函数是那只手。手不使劲，铁丝堆得再多也还是直的。",
    en: "It is like bending a straight wire: the weighted sum is the wire and the activation function is the hand. Without the hand, no pile of straight wires ever becomes a curve.",
  },
  beforeMath: {
    zh: "只需要认得 y = ax + b 这条直线。其余的都是在这条直线上做文章。",
    en: "You only need to recognise the straight line y = ax + b. Everything else in this chapter is built on top of it.",
  },
  aiConnection: {
    zh: "每个神经元的输出都是「先加权求和，再过一个激活函数」：ŷ = σ(Wx + b)。隐藏层用 ReLU，输出层按任务选 sigmoid 或 softmax。",
    en: "Every neuron's output is a weighted sum followed by an activation: ŷ = σ(Wx + b). Hidden layers use ReLU, and the output layer picks sigmoid or softmax to match the task.",
  },
  outcomes: {
    zh: [
      "解释为什么纯线性层堆叠会塌成一层",
      "写出阶跃函数与 sigmoid 的定义",
      "说明斜率参数 a 在改变什么",
      "判断隐藏层与输出层各该用哪种激活函数",
    ],
    en: [
      "Explain why stacked linear layers collapse into one",
      "Write the step and sigmoid definitions",
      "Describe what the slope parameter a changes",
      "Choose the right activation for a hidden layer and for an output layer",
    ],
  },
  figure: "optimization",
  figureCaption: {
    zh: "再看一眼优化那一章的误差曲面：梯度下降之所以走得动，是因为曲面处处有斜率。激活函数决定了这件事成不成立——阶跃函数的导数处处为 0，梯度就再也传不回去。",
    en: "Look again at the error surface from the optimization chapter: gradient descent can walk because the surface has a slope everywhere. Activations decide whether that holds — the step function's derivative is zero everywhere, so no gradient ever travels back.",
  },
  sections: [
    {
      label: { zh: "为什么", en: "WHY" },
      title: { zh: "只有加权和是不够的", en: "A weighted sum is not enough" },
      blocks: [
        {
          kind: "prose",
          paragraphs: {
            zh: [
              "一个神经元最基本的动作是加权求和：把每个输入乘上对应的权重、全部加起来，再加上偏置 b，得到 z = Wx + b。如果就停在这里，它画出来的只有一条直线（输入更多时是一个平面）。",
              "直线套直线还是直线。把两个没有激活函数的线性层接在一起，第二层的输出是 W₂(W₁x + b₁) + b₂，展开后等于 (W₂W₁)x + (W₂b₁ + b₂)——它仍然是一个线性层，只是权重矩阵换成了 W₂W₁。所以不管堆多少层，整个网络都等价于一层，多出来的参数一个也没增加表达能力。",
              "激活函数（activation function）就是插在加权和之后的那个非线性小零件。它把 z 掰弯之后才交给下一层，网络才真正有了「深度」。",
            ],
            en: [
              "The basic move of a neuron is a weighted sum: multiply each input by its weight, add everything up, and add the bias b to get z = Wx + b. If the story stopped there, the neuron could only draw a straight line — a flat plane when there are more inputs.",
              "A line through a line is still a line. Stack two layers with no activation between them and the second one computes W₂(W₁x + b₁) + b₂, which expands to (W₂W₁)x + (W₂b₁ + b₂) — still one linear layer, just with weight matrix W₂W₁. However many layers you stack, the whole network collapses into a single layer and the extra parameters buy nothing.",
              "An activation function is the small nonlinear part inserted after the weighted sum. It bends z before passing it on, and that bend is what gives a network its depth.",
            ],
          },
        },
        {
          kind: "formula",
          tex: String.raw`W_2\,(W_1 x + b_1) + b_2 = (W_2 W_1)\,x + (W_2 b_1 + b_2)`,
          reveal: true,
          caption: {
            zh: "没有激活函数时，两个线性层复合的结果仍然是一个线性层：新的权重矩阵是 W₂W₁，新的偏置是 W₂b₁ + b₂。",
            en: "With no activation, two linear layers compose into one: the new weight matrix is W₂W₁ and the new bias is W₂b₁ + b₂.",
          },
        },
        {
          kind: "predict",
          prompt: {
            zh: "把两个没有任何激活函数的线性层接起来，这个网络等价于什么？",
            en: "Stack two linear layers with no activation function between them. What is the network equivalent to?",
          },
          options: {
            zh: [
              "一个表达能力更强的非线性模型",
              "一个单独的线性层",
              "一个阶跃函数",
              "一个 sigmoid 层",
            ],
            en: [
              "A more expressive nonlinear model",
              "A single linear layer",
              "A step function",
              "A sigmoid layer",
            ],
          },
          answerIndex: 1,
          why: {
            zh: "复合之后的权重矩阵是 W₂W₁，仍然是一个矩阵；偏置也仍然只是相加。所以这个「深层」网络和一层完全没有区别。非线性必须由激活函数带进来，堆层本身做不到。",
            en: "The composition has weight matrix W₂W₁, which is still a matrix, and the biases still just add. The \"deep\" network is therefore exactly one layer. Nonlinearity has to come from the activation; stacking layers cannot supply it.",
          },
        },
        {
          kind: "formula",
          tex: String.raw`H(x) = \begin{cases} 0, & x < 0 \\ 1, & x \ge 0 \end{cases}`,
          reveal: true,
          caption: {
            zh: "阶跃函数（step function，也叫 Heaviside 函数）：以 0 为界，一边全关、一边全开。它是最早的激活函数，也是最早被放弃的那一个。",
            en: "The step function (also called the Heaviside function): fully off on one side of zero, fully on the other. It was the first activation function and also the first to be abandoned.",
          },
        },
        {
          kind: "formula",
          tex: String.raw`s(x) = \frac{1}{1 + e^{-ax}}`,
          reveal: true,
          caption: {
            zh: "sigmoid：同样是 S 形，但处处平滑。这里的 a 叫做斜率参数（slope parameter），它控制 S 形有多陡。",
            en: "Sigmoid: an S-shape again, but smooth everywhere. The number a is called the slope parameter, and it controls how steep the S is.",
          },
        },
        {
          kind: "callout",
          tone: "tip",
          title: { zh: "斜率参数 a 在做什么", en: "What the slope parameter a does" },
          body: {
            zh: "a 越大，曲线在 x = 0 附近越陡：a = 1 时很温和，a = 4 时已经明显像开关，a → ∞ 就变成了阶跃函数。a 越小，曲线越平，行为越接近一条直线。要把输出推到 0.99，需要 ax = ln 99 ≈ 4.6，所以 a 越大，所需的 x 越小。一个 a 就把「像开关」和「像直线」两个极端连成了一条连续的谱——这正是它优雅的地方。",
            en: "A larger a makes the curve steeper near x = 0: gentle at a = 1, visibly switch-like at a = 4, and a step function in the limit a → ∞. A smaller a flattens the curve until it behaves almost like a straight line. Reaching an output of 0.99 needs ax = ln 99 ≈ 4.6, so a larger a gets there at a smaller x. One knob therefore spans a continuous range from switch to straight line, which is exactly what makes it graceful.",
          },
        },
      ],
    },
    {
      label: { zh: "对比", en: "COMPARE" },
      title: { zh: "阶跃、sigmoid、tanh 与 ReLU", en: "Step, sigmoid, tanh, and ReLU" },
      blocks: [
        {
          kind: "prose",
          paragraphs: {
            zh: [
              "sigmoid 之所以取代阶跃，是因为它同时满足四件事：连续、处处可导、S 形、严格递增。严格递增意味着输入变大时输出一定变大——不会出现「更大的输入反而被关掉」这种跳跃。",
              "它还有一种两面性：在 x = 0 附近曲线近似直线，信号可以顺畅通过；在两端它饱和（saturation），输出贴着 0 或 1，行为更像开关。讲义把这种两面性称为「线性与非线性之间的优雅平衡」（a graceful balance between linear and nonlinear behaviour）。",
            ],
            en: [
              "Sigmoid replaced the step because it is at once continuous, differentiable everywhere, S-shaped, and strictly increasing. Strictly increasing means a larger input always gives a larger output: there is no jump where a bigger input suddenly switches off.",
              "It also has two faces. Near x = 0 the curve is almost a straight line, so a signal passes through easily; at the two ends it saturates, hugging 0 or 1 and behaving more like a switch. The lecture calls this a graceful balance between linear and nonlinear behaviour.",
            ],
          },
        },
        {
          kind: "table",
          headers: {
            zh: ["激活函数", "公式", "连续且可导", "输出范围"],
            en: ["Activation", "Formula", "Continuous and differentiable", "Output range"],
          },
          rows: {
            zh: [
              ["阶跃 H(x)", "x < 0 时为 0，否则为 1", "否，在 x = 0 处有跳跃", "{0, 1}"],
              ["sigmoid s(x)", "1 / (1 + e^(−ax))", "是", "(0, 1)"],
              ["tanh(x)", "(e^x − e^(−x)) / (e^x + e^(−x))", "是", "(−1, 1)"],
              ["ReLU", "max(0, x)", "是，除了 x = 0 处不可导", "[0, +∞)"],
            ],
            en: [
              ["Step H(x)", "0 when x < 0, otherwise 1", "No, it jumps at x = 0", "{0, 1}"],
              ["Sigmoid s(x)", "1 / (1 + e^(−ax))", "Yes", "(0, 1)"],
              ["tanh(x)", "(e^x − e^(−x)) / (e^x + e^(−x))", "Yes", "(−1, 1)"],
              ["ReLU", "max(0, x)", "Yes, except at x = 0", "[0, +∞)"],
            ],
          },
          caption: {
            zh: "输出范围的差别很关键：ReLU 没有上界，所以大的正数可以原样传下去；sigmoid 和 tanh 被压在固定区间里，越靠近两端越不敏感。",
            en: "The output range matters: ReLU has no upper bound, so large positive values pass through unchanged, while sigmoid and tanh are squeezed into a fixed interval and grow insensitive near its ends.",
          },
        },
        {
          kind: "callout",
          tone: "takeaway",
          body: {
            zh: "讲义的总结是：sigmoid 在「线性」与「非线性」之间给出了一个优雅的平衡——靠近原点时它近似线性，可以传递信号；远离原点时它饱和，可以当作开关。阶跃函数只剩开关这一面，所以它没法让网络做任何细微的调整。",
            en: "The lecture's summary: sigmoid offers a graceful balance between linear and nonlinear behaviour — near the origin it is nearly linear and passes a signal, far from the origin it saturates and acts as a switch. The step function has only the switch, so it cannot let a network make a small adjustment.",
          },
        },
        {
          kind: "lab",
          id: "activation-compare",
        },
        {
          kind: "example",
          title: {
            zh: "两个 sigmoid 神经元拼出一段区间",
            en: "Two sigmoid neurons carve out an interval",
          },
          steps: {
            zh: [
              "取 a = 4，看两个 sigmoid：s(4(x − 1)) 在 x > 1 之后迅速接近 1；s(4(x − 3)) 在 x > 3 之后迅速接近 1。",
              "把第一个的输出减去第二个的输出。",
              "x 落在 1 与 3 之间时，第一项接近 1、第二项接近 0，差接近 1。",
              "x < 1 时两项都接近 0，差接近 0；x > 3 时两项都接近 1，差也接近 0。",
              "于是这个组合只对一段区间有反应——一条直线永远做不到这件事。",
            ],
            en: [
              "Take a = 4 and look at two sigmoids: s(4(x − 1)) rises quickly to 1 once x > 1, and s(4(x − 3)) rises quickly to 1 once x > 3.",
              "Subtract the second output from the first.",
              "Between x = 1 and x = 3 the first term is near 1 and the second near 0, so the difference is near 1.",
              "For x < 1 both terms are near 0, and for x > 3 both are near 1: in both cases the difference is near 0.",
              "The combination therefore responds to one interval only — something no straight line can do.",
            ],
          },
          result: {
            zh: "每多一个非线性神经元，网络就多一次弯折的机会。层数加上非线性，才让决策边界（decision boundary）从一条直线变成任意弯曲的曲线，这也是深度网络能分开「线性不可分」数据的原因。",
            en: "Every extra nonlinear neuron buys one more bend. Depth plus nonlinearity is what turns a decision boundary from a straight line into an arbitrary curve, and that is how a deep network separates data that no single line can split.",
          },
        },
        {
          kind: "callout",
          tone: "tip",
          title: { zh: "工程上的一句话", en: "The engineering one-liner" },
          body: {
            zh: "实践中，隐藏层（hidden layer）几乎只用 ReLU（max(0, x)）作为激活函数。它足够非线性，计算只要一次比较，而且 x > 0 时导数恒为 1，梯度不会被压小。只有在需要输出「概率」的地方人们才换回 sigmoid，那是输出层的事。",
            en: "In practice, ReLU (max(0, x)) is used almost exclusively as the activation function for hidden layers. It is nonlinear enough, it needs only one comparison, and for x > 0 its derivative is exactly 1, so gradients are not squeezed. Only where a probability is needed does the choice change, and that is a question about the output layer.",
          },
        },
      ],
    },
    {
      label: { zh: "梯度", en: "GRADIENT" },
      title: {
        zh: "导数决定梯度能不能传回去",
        en: "The derivative decides what flows back",
      },
      blocks: [
        {
          kind: "prose",
          paragraphs: {
            zh: [
              "训练要用的梯度是 ∂E/∂wᵢ，其中 E(W, b) 是误差（error）。反向传播（backpropagation）用链式法则把这个偏导拆成一串相乘的因子，而激活函数的导数一定是其中一个因子。",
              "这意味着一件很硬的事：如果激活函数的导数是 0，乘积就是 0，这个权重的梯度也就是 0，无论它错得多离谱都不会被更新。非线性给了网络弯曲的能力，导数决定这份能力能不能被训练出来。",
            ],
            en: [
              "Training needs the gradient ∂E/∂wᵢ, where E(W, b) is the error. Backpropagation uses the chain rule to split that partial derivative into a product of factors, and the derivative of the activation is always one of them.",
              "That implies something rigid: if the activation's derivative is 0, the product is 0, so the gradient of that weight is 0 and the weight is never updated, however wrong it is. Nonlinearity gives the network its ability to bend; the derivative decides whether that ability can be trained at all.",
            ],
          },
        },
        {
          kind: "formula",
          tex: String.raw`w_i \leftarrow w_i - \alpha\,\frac{\partial E}{\partial w_i}`,
          reveal: true,
          caption: {
            zh: "一次更新：α 是学习率，∂E/∂wᵢ 是误差对这个权重的偏导。如果这个偏导是 0，等号右边什么也不会改变。",
            en: "One update: α is the learning rate and ∂E/∂wᵢ is the error's partial derivative with respect to that weight. If that partial derivative is 0, nothing on the right-hand side changes anything.",
          },
        },
        {
          kind: "formula",
          tex: String.raw`s'(x) = a\,s(x)\,(1 - s(x))`,
          reveal: true,
          caption: {
            zh: "sigmoid 的导数可以只用它自己表示，并且在 x = 0 处取到最大值 a/4。a = 1 时这个最大值也只有 0.25；|x| 变大时 s(x) 贴近 0 或 1，导数迅速趋于 0——这就是饱和（saturation），严重时就是梯度消失（vanishing gradient）。",
            en: "The derivative of sigmoid can be written using the sigmoid itself, and it peaks at a/4 when x = 0. At a = 1 that peak is only 0.25, and as |x| grows s(x) hugs 0 or 1 and the derivative rushes to 0: that is saturation, and in the extreme it is the vanishing gradient.",
          },
        },
        {
          kind: "formula",
          tex: String.raw`\frac{dH}{dx} = 0 \quad (x \ne 0) \qquad \frac{d}{dx}\max(0, x) = \begin{cases} 0, & x < 0 \\ 1, & x > 0 \end{cases}`,
          reveal: true,
          caption: {
            zh: "阶跃函数在几乎所有位置的导数都是 0——梯度传到这里就断了。ReLU 则把导数做成 0 或 1 的开关，正半轴完全不衰减。",
            en: "The step function has derivative 0 almost everywhere, so a gradient that reaches it stops dead. ReLU instead makes the derivative a 0-or-1 switch, and on the positive side it does not shrink the gradient at all.",
          },
        },
        {
          kind: "lab",
          id: "activation-gradient",
        },
        {
          kind: "callout",
          tone: "warning",
          title: { zh: "零梯度就是学不到东西", en: "A zero gradient means nothing is learned" },
          body: {
            zh: "一个用阶跃函数激活的神经元，对任何输入都返回导数 0。反向传播乘上这个 0，误差信号就再也回不去了：不管输出错得多远，它的权重和偏置都不会移动一步。这就是「不可导的激活函数学不动」的准确含义——不是学得慢，而是完全不动。",
            en: "A neuron activated by the step function hands back a derivative of 0 for every input. Backpropagation multiplies by that 0 and the error signal never travels back: however wrong the output, its weights and bias do not move one step. That is the precise meaning of \"a non-differentiable activation cannot learn\" — not slowly, but not at all.",
          },
        },
        {
          kind: "example",
          title: { zh: "一次具体的链式法则", en: "One concrete chain-rule walk-through" },
          steps: {
            zh: [
              "某个隐藏神经元的加权和是 z = w x + b，激活后的输出是 ŷ = s(z)。",
              "误差对这个权重的偏导被链式法则拆成三个因子相乘：∂E/∂w = (∂E/∂ŷ)(∂ŷ/∂z)(∂z/∂w)。",
              "取 a = 1、z = 6：s(6) ≈ 0.9975，所以 s′(6) = s(6)(1 − s(6)) ≈ 0.0025。",
              "中间这个因子几乎为 0，整个梯度也几乎为 0，这个权重几乎不动。",
              "换成阶跃函数，中间这个因子永远等于 0，权重一步都不会动。",
            ],
            en: [
              "A hidden neuron has weighted sum z = w x + b and activated output ŷ = s(z).",
              "The chain rule splits the error's derivative with respect to that weight into three factors: ∂E/∂w = (∂E/∂ŷ)(∂ŷ/∂z)(∂z/∂w).",
              "With a = 1 and z = 6: s(6) ≈ 0.9975, so s′(6) = s(6)(1 − s(6)) ≈ 0.0025.",
              "That middle factor is nearly 0, so the whole gradient is nearly 0 and the weight barely moves.",
              "Swap in the step function and the middle factor is exactly 0: the weight never moves at all.",
            ],
          },
          result: {
            zh: "ReLU 在 x > 0 时导数恒为 1，所以正半轴上的梯度原样通过，只有负半轴会被截断。正是这个「不衰减」让它成为隐藏层的默认选择。",
            en: "ReLU has derivative exactly 1 for x > 0, so a gradient on the positive side passes through unchanged and only the negative side is cut off. That lack of shrinkage is what makes it the default for hidden layers.",
          },
        },
      ],
    },
    {
      label: { zh: "输出", en: "OUTPUT" },
      title: { zh: "输出层的选择不一样", en: "The output layer chooses differently" },
      blocks: [
        {
          kind: "prose",
          paragraphs: {
            zh: [
              "隐藏层和输出层要回答的问题不一样，所以激活函数也不一样。隐藏层的任务是制造有用的中间特征，工程上几乎只用 ReLU；输出层的任务是给出答案，函数必须和答案的形式匹配。",
              "二分类（binary classification）只有一个「是 / 否」，所以输出层用 sigmoid，把加权和压成 (0, 1) 之间的一个数，读作概率。多分类（multiclass）要同时给出每个类别的分数，输出层用 softmax：它把一整排分数变成一组加起来等于 1 的概率。softmax 的细节属于后面的模块，这里只要记住两者的分工。",
            ],
            en: [
              "Hidden layers and the output layer answer different questions, so they use different activations. A hidden layer exists to build useful intermediate features, and in practice it uses ReLU almost exclusively; the output layer has to produce the answer, so its function must match the shape of that answer.",
              "Binary classification is a single yes-or-no, so the output layer uses sigmoid and squeezes the weighted sum into one number in (0, 1) that reads as a probability. A multiclass problem needs a score for every class at once, so the output layer uses softmax, which turns a whole row of scores into probabilities that add up to 1. The details of softmax belong to a later module; for now it is enough to remember the division of labour.",
            ],
          },
        },
        {
          kind: "formula",
          tex: String.raw`\hat{y} = \sigma(Wx + b)`,
          reveal: true,
          caption: {
            zh: "这是应用形式：先做加权和 Wx + b，再过一次激活函数 σ。训练时要的梯度是 ∂E/∂wᵢ，而 σ 的导数会被链式法则乘进每一个这样的偏导里。",
            en: "This is the applied form: take the weighted sum Wx + b, then pass it through the activation σ. The gradient we need is ∂E/∂wᵢ, and the derivative of σ is multiplied into every one of those partial derivatives by the chain rule.",
          },
        },
        {
          kind: "formula",
          tex: String.raw`s^{-1}(y) = \frac{1}{a}\,\ln\frac{y}{1 - y}`,
          reveal: true,
          caption: {
            zh: "顺手看一眼 sigmoid 的反函数：它把 (0, 1) 里的一个概率换回整条实数轴，自然对数写作 ln。这也是输出层的 sigmoid 值可以当作概率来读的原因之一。",
            en: "One useful companion: the inverse of sigmoid maps a probability in (0, 1) back onto the whole real line, with the natural logarithm written ln. It is part of why a sigmoid output at the output layer can be read as a probability.",
          },
        },
        {
          kind: "callout",
          tone: "takeaway",
          body: {
            zh: "同一个网络里可以，而且通常应该使用不同的激活函数：隐藏层用 ReLU 负责弯曲，输出层用 sigmoid 或 softmax 负责给出符合任务形式的答案。",
            en: "One network can, and usually should, use different activations: ReLU in the hidden layers does the bending, while sigmoid or softmax at the output produces an answer in the form the task requires.",
          },
        },
      ],
    },
  ],
  lab: "activation-shape",
  code: {
    id: "module_08.py",
    title: { zh: "比较几种激活函数的输出", en: "Compare the outputs of several activations" },
    intro: {
      zh: "同一组输入，分别过一遍阶跃函数、a = 1 的 sigmoid、a = 4 的 sigmoid 和 ReLU，看它们的取值差在哪里。",
      en: "Push the same inputs through the step function, sigmoid at a = 1, sigmoid at a = 4, and ReLU, and compare the values they return.",
    },
    source: `import numpy as np

x = np.array([-2.0, -1.0, 0.0, 1.0, 2.0])

step = (x >= 0).astype(float)
sigmoid_1 = 1 / (1 + np.exp(-1.0 * x))
sigmoid_4 = 1 / (1 + np.exp(-4.0 * x))
relu = np.maximum(0.0, x)

for label, row in [
    ("x", x),
    ("step", step),
    ("sigmoid a=1", sigmoid_1),
    ("sigmoid a=4", sigmoid_4),
    ("relu", relu),
]:
    print(f"{label:<12}" + " ".join(f"{value:7.3f}" for value in row))`,
    challenge: {
      zh: "把 x 改成 [-6, -3, 0, 3, 6]，再看 a = 4 的 sigmoid 是不是几乎变成了阶跃函数。",
      en: "Change x to [-6, -3, 0, 3, 6] and check whether sigmoid at a = 4 has almost become a step function.",
    },
    expectedOutput: `x            -2.000  -1.000   0.000   1.000   2.000
step          0.000   0.000   1.000   1.000   1.000
sigmoid a=1   0.119   0.269   0.500   0.731   0.881
sigmoid a=4   0.000   0.018   0.500   0.982   1.000
relu          0.000   0.000   0.000   1.000   2.000`,
    expectedNote: {
      zh: "阶跃函数只有 0 和 1 两个值，输入在中间怎么变它都没有反应。a = 1 的 sigmoid 给出连续的过渡值，a = 4 时已经明显变陡：x = 1 处就到了 0.982。ReLU 在负半轴全是 0，正半轴原样通过。注意 a = 1 时导数最大只有 0.25，a = 4 时更陡但饱和得更快——这正是「梯度」那一节的取舍。",
      en: "The step function only ever returns 0 or 1 and shows no reaction in between. Sigmoid at a = 1 gives a gradual transition, and at a = 4 it is visibly steeper: 0.982 already at x = 1. ReLU is 0 across the whole negative half and passes positive values through unchanged. Note that at a = 1 the derivative peaks at only 0.25, and at a = 4 the curve is steeper but saturates sooner — exactly the trade-off from the gradient section.",
    },
  },
  quiz: [
    {
      question: {
        zh: "为什么把两个纯线性层堆在一起没有意义？",
        en: "Why is stacking two purely linear layers pointless?",
      },
      options: {
        zh: [
          "因为参数太多会过拟合",
          "因为它们的复合仍然是一个线性层",
          "因为梯度一定是 0",
          "因为偏置不能再相加",
        ],
        en: [
          "Because too many parameters overfit",
          "Because their composition is still one linear layer",
          "Because the gradient is always 0",
          "Because the biases can no longer be added",
        ],
      },
      correct: 1,
      explanation: {
        zh: "复合之后的权重矩阵是 W₂W₁，仍然是一个线性层。没有激活函数，深度换不来任何表达能力。",
        en: "The composition has weight matrix W₂W₁, which is still a linear layer. Without an activation, depth buys no extra expressiveness.",
      },
    },
    {
      question: {
        zh: "sigmoid 里的斜率参数 a 变大时，曲线会怎样？",
        en: "What happens to the sigmoid when the slope parameter a grows?",
      },
      options: {
        zh: ["在 x = 0 附近变得更陡", "变成一条水平线", "整体向右平移", "输出范围变成 (−1, 1)"],
        en: [
          "It becomes steeper near x = 0",
          "It becomes a horizontal line",
          "It shifts to the right",
          "Its output range becomes (−1, 1)",
        ],
      },
      correct: 0,
      explanation: {
        zh: "a 是斜率参数：a 越大越陡，a → ∞ 时逼近阶跃函数；输出范围始终是 (0, 1)。",
        en: "a is the slope parameter: a larger a is steeper, and as a → ∞ the curve approaches a step function. The output range stays (0, 1).",
      },
    },
    {
      question: {
        zh: "关于隐藏层的激活函数，讲义怎么说？",
        en: "What does the lecture say about activations in hidden layers?",
      },
      options: {
        zh: [
          "隐藏层几乎只用 ReLU",
          "隐藏层几乎只用阶跃函数",
          "隐藏层几乎只用 softmax",
          "隐藏层不需要激活函数",
        ],
        en: [
          "Hidden layers use ReLU almost exclusively",
          "Hidden layers use the step function almost exclusively",
          "Hidden layers use softmax almost exclusively",
          "Hidden layers need no activation function",
        ],
      },
      correct: 0,
      explanation: {
        zh: "ReLU 计算便宜，x > 0 时导数恒为 1，梯度不会被压小，因此成为隐藏层的默认选择。softmax 属于输出层。",
        en: "ReLU is cheap to compute and has derivative exactly 1 for x > 0, so it does not shrink gradients; that is why it is the default for hidden layers. Softmax belongs to the output layer.",
      },
    },
  ],
};

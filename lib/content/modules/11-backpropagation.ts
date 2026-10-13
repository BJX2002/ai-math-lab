import type { CourseModule } from "../types";

export const backpropagation: CourseModule = {
  slug: "backpropagation",
  number: "11",
  track: "ai",
  durationMinutes: 55,
  level: { zh: "AI 核心", en: "AI core" },
  title: {
    zh: "反向传播：把误差摊回每一个权重",
    en: "Backpropagation: spreading the error into every weight",
  },
  shortTitle: { zh: "反向传播", en: "Backpropagation" },
  subtitle: { zh: "六步训练循环与梯度下降", en: "The six-step training loop and gradient descent" },
  description: {
    zh: "这一章把整门课拼起来：六步训练循环、链式法则（chain rule）怎样把误差摊回每一个权重、更新规则 w'_i = w_i − α ∂E/∂w_i 与 b' = b − α ∂E/∂b、学习率 α 太大和太小各自的后果，以及一句必须记牢的话——反向传播只负责算梯度，往下走的那一步是另一回事。",
    en: "This chapter joins the whole course together: the six-step training loop, how the chain rule spreads the Error into every weight, the update rules w'_i = w_i − α ∂E/∂w_i and b' = b − α ∂E/∂b, what happens when the learning rate α is too large or too small, and one sentence worth memorising — backpropagation only computes the gradient, and the step downhill is a separate thing.",
  },
  plainIdea: {
    zh: "训练就是反复做同一件小事：往前算一遍，看看错了多少，算出每个权重该负多少责任，然后每个权重往「少错一点」的方向挪一小步。",
    en: "Training repeats one small routine: run the input forward, see how wrong the answer is, work out how much each weight is to blame, and nudge every weight a little in the direction that makes the Error smaller.",
  },
  analogy: {
    zh: "像一条流水线出了次品，要一路倒查回去：最后一道工序先认领自己的那份责任，然后把剩下的责任按比例交回给上一道，一直退到第一道。谁在次品上「出力」最多，谁就被改得最多。",
    en: "It is like tracing a faulty product back along an assembly line. The last station claims its share of the blame first, then hands the remaining blame back to the station before it, all the way to the first. Whoever contributed most to the fault gets adjusted most.",
  },
  beforeMath: {
    zh: "需要认得加权和 Wx + b、sigmoid 的输出 σ、误差 E(W, b)、自然对数 ln，以及导数就是「输入挪一点点，输出跟着挪多少」。",
    en: "You need the weighted sum Wx + b, the sigmoid output σ, the Error E(W, b), the natural logarithm ln, and the idea that a derivative is how much the output moves when the input moves a little.",
  },
  aiConnection: {
    zh: "训练一个神经网络就是这两句话：反向传播（backpropagation）顺着链式法则把 ∂E/∂w 和 ∂E/∂b 算出来，梯度下降拿这些偏导按 w'_i = w_i − α ∂E/∂w_i 把权重更新一遍。PyTorch 的 loss.backward() 做前一件事，optimizer.step() 做后一件事——两个函数，两个概念。",
    en: "Training a network is these two sentences: backpropagation walks the chain rule back through the network to compute ∂E/∂w and ∂E/∂b, and gradient descent uses those partial derivatives to update the weights by w'_i = w_i − α ∂E/∂w_i. In PyTorch, loss.backward() does the first job and optimizer.step() does the second — two functions, two concepts.",
  },
  outcomes: {
    zh: [
      "按顺序说出六步训练循环，并指出每一步在算什么",
      "解释链式法则为什么把 ∂E/∂w 写成一串局部导数相乘",
      "写出更新规则 w'_i = w_i − α ∂E/∂w_i 与 b' = b − α ∂E/∂b",
      "判断学习率 α 太大或太小时训练会怎样",
      "说明反向传播只负责算梯度、不包括更新那一步",
    ],
    en: [
      "State the six-step training loop in order and say what each step computes",
      "Explain why the chain rule writes ∂E/∂w as a product of local derivatives",
      "Write the update rules w'_i = w_i − α ∂E/∂w_i and b' = b − α ∂E/∂b",
      "Predict what training does when the learning rate α is too large or too small",
      "Explain that backpropagation computes the gradient and nothing else",
    ],
  },
  figure: "optimization",
  figureCaption: {
    zh: "这一章的图还是那张误差曲面 E(W, b)。反向传播负责回答「此刻脚下哪个方向最陡」，更新规则负责回答「顺着这个方向迈多远」。两件事各管一半，图上的一条下坡路就是它们合作的结果。",
    en: "The figure is the error surface E(W, b) again. Backpropagation answers which way is steepest right here, and the update rule answers how far to walk that way. Each handles half the job, and the downhill path on the picture is the two of them working together.",
  },
  sections: [
    {
      label: { zh: "循环", en: "LOOP" },
      title: {
        zh: "训练的六步循环",
        en: "The six-step training loop",
      },
      blocks: [
        {
          kind: "prose",
          paragraphs: {
            zh: [
              "到这一步，训练一个神经网络可以说得非常朴素：我们有一堆权重和一个误差 E(W, b)，想让这个数字变小。做法就是六步，然后转圈。",
              "第一步是随机初始化（random initialisation）：把所有权重和偏置取成小的随机数。为什么要随机？因为如果每个权重都从同一个值出发，同一个隐藏层里的所有神经元就永远算出同一个结果，也永远收到同一个梯度，它们会一辈子保持一模一样——几十个神经元等于一个。随机的作用就是先把它们错开。",
              "然后是「前向」（feed forward）算出预测、「算误差」得到 E(W, b)、「反向传播」算出梯度、「更新」按学习率挪一小步，再回到第二步。第六步「重复直到误差变得足够小」同时是循环，也是停止规则（stopping rule）：没有人规定要跑到什么时候，是 E(W, b) 小到可以接受，我们才停下来。",
            ],
            en: [
              "By now, training a neural network can be said very plainly: we have a pile of weights and an Error E(W, b), and we want that number to shrink. The recipe has six steps, and then it goes round again.",
              "Step one is random initialisation: set every weight and bias to a small random number. Why random? Because if every weight started at the same value, all the neurons in one hidden layer would compute the same output, receive the same gradient, and stay identical forever — dozens of neurons behaving as one. Randomness is what knocks them out of step.",
              "Then feed the input forward to get a prediction, compute the Error E(W, b), run backpropagation to get the gradient, update by the learning rate, and go back to step two. Step six — repeat until the Error becomes small — is both the loop and the stopping rule: nothing dictates a finishing time, and we stop because E(W, b) has become small enough to accept.",
            ],
          },
        },
        {
          kind: "formula",
          tex: String.raw`E(W, b) = \frac{1}{m}\sum_{i=1}^{m} e_i, \qquad (W^{*}, b^{*}) = \arg\min_{W, b} E(W, b)`,
          reveal: true,
          caption: {
            zh: "循环一开始就把整件事说清了：m 个样本上的误差 E(W, b) 是要被压小的那个数字，训练要的是让它最小的那一组参数 (W*, b*)。六步循环就是为这一行服务的。",
            en: "The loop can be stated in one line: E(W, b) is the number to be pushed down over the m samples, and training wants the parameter setting (W*, b*) that makes it smallest. The six-step loop exists to serve this formula.",
          },
        },
        {
          kind: "table",
          headers: {
            zh: ["#", "这一步做什么", "实际在算的东西", "一句话说法"],
            en: ["#", "What the step does", "What is actually computed", "In one phrase"],
          },
          rows: {
            zh: [
              ["1", "随机初始化权重和偏置", "w_i、b、θ_{ij}、θ_{0j} 取小的随机数", "先随便猜一个"],
              ["2", "把输入前向送进去", "每个神经元的加权和与激活值，最后得到预测 ŷ", "算一遍答案"],
              ["3", "算误差", "E(W, b)：预测离真标签有多远", "量一下错了多少"],
              ["4", "算梯度", "∂E/∂w_i 与 ∂E/∂b，由反向传播沿链式法则逐层算出", "查每个权重的责任"],
              ["5", "更新权重", "w'_i = w_i − α ∂E/∂w_i，b' = b − α ∂E/∂b", "各挪一小步"],
              ["6", "重复直到误差变小", "回到第 2 步，直到 E(W, b) 足够小才停", "转圈，直到够好"],
            ],
            en: [
              ["1", "Initialise the weights randomly", "w_i, b, θ_{ij}, θ_{0j} start as small random numbers", "Make a random first guess"],
              ["2", "Feed the input forward", "Each neuron's weighted sum and activation, ending in the prediction ŷ", "Work out an answer"],
              ["3", "Compute the Error", "E(W, b): how far the prediction is from the true label", "Measure how wrong it is"],
              ["4", "Compute the gradient", "∂E/∂w_i and ∂E/∂b, produced layer by layer by backpropagation along the chain rule", "Find each weight's share of the blame"],
              ["5", "Update the weights", "w'_i = w_i − α ∂E/∂w_i and b' = b − α ∂E/∂b", "Nudge each one a little"],
              ["6", "Repeat until the Error is small", "Go back to step 2 and keep going while E(W, b) is still too large", "Go round until it is good enough"],
            ],
          },
          caption: {
            zh: "第 2 步到第 5 步是循环体，第 6 步是那个「转回去」。六步里只有第 4 步叫反向传播；第 5 步属于梯度下降，是另一件事——这一点是这一章最容易被含糊过去、也最该分清的地方。",
            en: "Steps 2 to 5 are the body of the loop and step 6 is the jump back to the top. Of the six, only step 4 is backpropagation; step 5 belongs to gradient descent and is a separate thing — the distinction this chapter cares about most, and the one most easily blurred.",
          },
        },
        {
          kind: "formula",
          tex: String.raw`\frac{\partial E}{\partial w_i} = \lim_{\varepsilon \to 0} \frac{E(w_i + \varepsilon) - E(w_i - \varepsilon)}{2\varepsilon}`,
          reveal: true,
          caption: {
            zh: "偏导的定义就是「摊责任」的准确说法：把 w_i 挪一点点，看 E(W, b) 跟着动多少，比值就是 ∂E/∂w_i。这个定义还给了一个检查方法——取一个很小的 ε 直接算右边的差商，再和反向传播的结果对一遍，两者必须一致。",
            en: "The definition of the partial derivative is the precise version of sharing out blame: move w_i by a little, see how far E(W, b) moves, and the ratio is ∂E/∂w_i. That definition also hands you a check — take a tiny ε, evaluate the difference quotient on the right, and compare it with what backpropagation produced; the two must agree.",
          },
        },
        {
          kind: "callout",
          tone: "analogy",
          title: { zh: "把误差摊回每一个权重", en: "Spreading the Error into every weight" },
          body: {
            zh: "第 4 步的直觉是「分摊责任」。输出错了，这个错不是某一个权重单独造成的：它经过了许多次相乘和相加才变成最后那个数字。反向传播做的事，就是把这个错按各人的贡献摊回去——谁对最后那个错贡献得多，谁分到的 ∂E/∂w_i 就大，第 5 步里它就被改得多；某个权重对输出几乎没影响，它的偏导就接近 0，几乎不动。整个过程不需要谁去「判断」哪个权重重要，偏导的大小自己就把话说清楚了。",
            en: "The intuition behind step 4 is sharing out the blame. A wrong output is not caused by one weight on its own: it became that final number only after many multiplications and additions. What backpropagation does is hand that blame back in proportion to each weight's contribution — the more a weight contributed to the mistake, the larger its ∂E/∂w_i and the more step 5 changes it, while a weight that barely influenced the output gets a partial derivative near 0 and hardly moves. Nobody has to decide which weight matters; the size of the partial derivative says it.",
          },
        },
        {
          kind: "predict",
          prompt: {
            zh: "如果把所有神经元的权重都初始化成完全相同的值（比如全是 0.5），会发生什么？",
            en: "What happens if every neuron's weights are initialised to exactly the same value, say 0.5 everywhere?",
          },
          options: {
            zh: [
              "同一个隐藏层里的神经元永远算得一模一样，等于只有一个神经元",
              "训练会收敛得更快，因为起点已经对齐了",
              "只有输出层会受影响，隐藏层不受影响",
            ],
            en: [
              "The neurons in a hidden layer stay identical forever, so the layer behaves like a single neuron",
              "Training converges faster, because the starting point is already aligned",
              "Only the output layer is affected; hidden layers are unaffected",
            ],
          },
          answerIndex: 0,
          why: {
            zh: "起点的对称性不会自己破掉。同一个隐藏层的每个神经元收到同样的输入、同样的权重，算出的激活值一样，得到的梯度也一样，更新之后还是一样——它们永远同步。所以第一步必须是随机初始化，用随机数把这份对称性打破。",
            en: "Symmetry does not break itself. Neurons in one hidden layer receive the same input and hold the same weights, so they produce the same activation, receive the same gradient, and remain identical after the update — forever in step. That is why step one must initialise randomly: the randomness is what breaks the symmetry.",
          },
        },
      ],
    },
    {
      label: { zh: "链式法则", en: "CHAIN RULE" },
      title: {
        zh: "代价最深的那个权重，靠链式法则算出来",
        en: "The deepest weight is reached by the chain rule",
      },
      blocks: [
        {
          kind: "prose",
          paragraphs: {
            zh: [
              "要问的问题是：把某个权重 θ_{ij} 挪动一点点，E(W, b) 会跟着变多少？答案就是偏导 ∂E/∂θ_{ij}。可是 θ_{ij} 藏在网络深处，到 E 之间隔着好几层运算，直接算不出来。",
              "链式法则（chain rule）把这条路切成一小段一小段。第 j 个隐藏神经元的输出是 θ_{ij} 直接决定的，所以 ∂E/∂θ_{ij} = (∂E/∂ŷ_j)(∂ŷ_j/∂θ_{ij})：先要知道误差对这个神经元输出的敏感度，再乘上这个神经元的输出对它自己权重的敏感度（对 sigmoid 来说就是 σ(1 − σ)，再乘上输入）。这两个因子都是「局部」的，各自只看眼前那一步，都不需要知道整个网络长什么样。",
              "层数再多，逻辑也一样：从 E 出发往回走，每经过一个运算就乘上它那一步的局部导数。所以「网络深处某个权重的偏导」就是一条路径上所有局部导数的连乘——这就是反向传播（backpropagation）的全部机制。链式法则负责把长长的依赖关系拆成一串好算的小因子，逐层往回乘，一个权重也不漏。",
            ],
            en: [
              "The question is: nudge one weight θ_{ij} a little, and how much does E(W, b) move? The answer is the partial derivative ∂E/∂θ_{ij}. But θ_{ij} sits deep inside the network, with several layers of arithmetic between it and E, so it cannot be written down directly.",
              "The chain rule cuts that path into short segments. The output of hidden neuron j is decided directly by θ_{ij}, so ∂E/∂θ_{ij} = (∂E/∂ŷ_j)(∂ŷ_j/∂θ_{ij}): first how sensitive the Error is to that neuron's output, then how sensitive that output is to its own weight — for a sigmoid, σ(1 − σ) multiplied by the input. Both factors are local: each looks only at the step in front of it and neither needs to know the shape of the whole network.",
              "More layers change nothing in the logic. Walk back from E and, at every operation you pass, multiply in that operation's local derivative. The partial derivative of a weight deep in the network is therefore the product of all the local derivatives along its path — and that is the entire mechanism of backpropagation. The chain rule turns a long chain of dependence into a row of small, computable factors, multiplied back layer by layer until no weight is missed.",
            ],
          },
        },
        {
          kind: "formula",
          tex: String.raw`\frac{\partial E}{\partial \theta_{ij}} = \frac{\partial E}{\partial \hat{y}_j} \cdot \frac{\partial \hat{y}_j}{\partial \theta_{ij}} \qquad \frac{\partial E}{\partial \theta_{0j}} = \frac{\partial E}{\partial \hat{y}_j} \cdot \frac{\partial \hat{y}_j}{\partial \theta_{0j}}`,
          reveal: true,
          caption: {
            zh: "第 j 个隐藏神经元的两种参数各写一遍：θ_{ij} 是它从第 i 个输入接过来的权重，θ_{0j} 是它自己的偏置。两者的形式完全一样——都是「误差对输出的敏感度」乘上「输出对这个参数的敏感度」，区别只在第二个因子：对 θ_{ij} 它带着输入 x_i，对 θ_{0j} 它不带。这也解释了为什么偏置的梯度永远等于这一层局部导数的和。",
            en: "The two parameters of hidden neuron j, each written out: θ_{ij} is the weight it takes from input i, and θ_{0j} is its own bias. The two have exactly the same form — the sensitivity of the Error to the output, times the sensitivity of the output to that parameter — and differ only in the second factor, which carries the input x_i for θ_{ij} and nothing for θ_{0j}. That also explains why a bias gradient is always the sum of the local derivatives in its layer.",
          },
        },
        {
          kind: "formula",
          tex: String.raw`\frac{\partial E}{\partial \theta_{ij}} = \prod_{\text{steps back}} \frac{\partial(\text{local output})}{\partial(\text{local input})}`,
          reveal: true,
          caption: {
            zh: "一般形式：往回走的每一步各贡献一个局部导数做因子，整条路径上所有因子连乘起来才是 ∂E/∂θ_{ij}。层数越深，因子越多——这也是深网络里梯度容易变得极小或极大的原因。",
            en: "The general form: every step back contributes one local derivative as a factor, and the product of all the factors along the path is ∂E/∂θ_{ij}. The deeper the network, the more factors — which is why gradients in deep networks tend to become either tiny or huge.",
          },
        },
        {
          kind: "formula",
          tex: String.raw`\frac{\partial E}{\partial w_i} = \frac{\partial E}{\partial \hat{y}} \cdot \frac{\partial \hat{y}}{\partial z} \cdot \frac{\partial z}{\partial w_i} \qquad \frac{\partial \hat{y}}{\partial z} = \sigma(1 - \sigma)`,
          reveal: true,
          caption: {
            zh: "一个神经元上真的会乘到的三个因子：z = wx + b 是加权和，ŷ = σ(z) 是激活后的输出。∂E/∂ŷ 说误差对这个输出多敏感，∂ŷ/∂z = σ(1 − σ) 是 sigmoid 自己的斜率，∂z/∂w_i 是加权和对权重的斜率，也就是输入 x_i。三个都只看眼前一步。",
            en: "The three factors that really do get multiplied for one neuron: z = wx + b is the weighted sum and ŷ = σ(z) is the activated output. ∂E/∂ŷ says how sensitive the Error is to that output, ∂ŷ/∂z = σ(1 − σ) is the sigmoid's own slope, and ∂z/∂w_i is the slope of the weighted sum with respect to the weight — which is just the input x_i. Every one of them looks only at the step in front of it.",
          },
        },
        {
          kind: "predict",
          prompt: {
            zh: "沿回传路径上的某个局部导数是 0，那个权重的 ∂E/∂w 会是多少？",
            en: "If one local derivative along the path back is 0, what is ∂E/∂w for that weight?",
          },
          options: {
            zh: [
              "0——整条路径的乘积里有一个 0，乘积就是 0，这个权重一步也不会动",
              "仍然是原来的值，因为其他因子不为 0",
              "变成无穷大，因为 0 让链条断掉了",
            ],
            en: [
              "0 — a single 0 in the product makes the whole product 0, so the weight never moves",
              "It keeps its old value, because the other factors are not 0",
              "It becomes infinite, because 0 breaks the chain",
            ],
          },
          answerIndex: 0,
          why: {
            zh: "偏导是一串因子相乘：其中一个为 0，整个乘积就是 0，更新规则里 α 乘上 0 得到 0，权重原地不动。这正是上一章说的「梯度消失」在公式上的样子，也是深网络里某一层一旦饱和，它前面的权重就再也收不到任何信号的准确原因。",
            en: "The partial derivative is a product of factors: if one of them is 0 the whole product is 0, and in the update rule α times 0 is 0, so the weight does not move. That is exactly what vanishing gradients look like in the formula, and it is the precise reason a weight in front of a saturated layer stops receiving any signal at all.",
          },
        },
        {
          kind: "callout",
          tone: "tip",
          title: {
            zh: "这一节的图在练习区",
            en: "This section's figure is in the practice area",
          },
          body: {
            zh: "练习区那张计算图（computational graph）画的就是这一节说的事：拖动任何一个节点的值，看它的局部导数怎样沿链条一段一段往回乘。盯着最后那个乘积，那就是 ∂E/∂w。",
            en: "The computational graph in the practice area draws exactly what this section describes: drag the value at any node and watch its local derivative get multiplied back along the chain. Keep an eye on the final product — that is ∂E/∂w.",
          },
        },
      ],
    },
    {
      label: { zh: "更新", en: "UPDATE" },
      title: {
        zh: "拿到梯度之后：更新规则与学习率 α",
        en: "Once you have the gradient: the update rules and the learning rate α",
      },
      blocks: [
        {
          kind: "prose",
          paragraphs: {
            zh: [
              "梯度算出来了，第 5 步要做的就是照讲义写的那两条规则各挪一步。梯度指向上坡，所以减号朝下坡走；α 决定这一步有多远。",
              "α 是学习率（learning rate），它回答的只有一个问题：往这个方向走多大一步，也就是「走多远」。这里要多说一句上一章的记号：模块 06 讲通用优化时用 η 表示学习率，这一章的讲义用 α，含义完全相同，考试按 α 写。",
              "α 太大，步子会一步跨过谷底，落到对面更高的坡上；下一步再从那里往回跨，落得更高。于是 E(W, b) 一次比一次大，训练发散（diverge）。α 太小，方向完全正确，但每一步只挪动一丁点，跑完十轮 E(W, b) 几乎没变，进度慢得让人怀疑代码写错了。讲义在代码里用的是 lr = 0.003、epochs = 10，这就是实践里常见的那种数字：量级很小，配上不多的轮数就能看出误差在下降。真实训练里 0.001 到 0.01 这个量级很常见，靠试出来而不是算出来。",
            ],
            en: [
              "With the gradient in hand, step 5 does nothing more than take one step by each of the two rules the lecture writes down. The gradient points uphill, so the minus sign walks downhill; α decides how far the step goes.",
              "α is the learning rate, and it answers exactly one question: how big a step to take in that direction — how far. One note on notation from the previous chapter: module 06 writes η for the learning rate in the generic optimization setting, while this chapter's lecture writes α; the meaning is identical, and in the exam write α.",
              "If α is too large, a step can overshoot the bottom of the valley and land higher up the far side; the next step overshoots from there and lands higher still, so E(W, b) grows every round and the run diverges. If α is too small, the direction is perfectly right, but each step moves the weights by a sliver: ten rounds of training leave E(W, b) almost unchanged and the progress is slow enough to make you suspect a bug. The lecture uses lr = 0.003 with epochs = 10 in its code, and that is the kind of number practice uses: small, and with only a few rounds it already shows the Error coming down. In real training the range 0.001 to 0.01 is common, and the value is found by trying rather than by calculating.",
            ],
          },
        },
        {
          kind: "formula",
          tex: String.raw`w'_i = w_i - \alpha \frac{\partial E}{\partial w_i} \qquad b' = b - \alpha \frac{\partial E}{\partial b}`,
          reveal: true,
          caption: {
            zh: "讲义的更新规则。带撇的 w'_i、b' 是更新之后的值，右边的 w_i、b 是更新之前的。α 是学习率，两个偏导由反向传播提供——这一行只需要做乘法和减法，不需要再求导。",
            en: "The lecture's update rules. The primed w'_i and b' are the values after the update, and the w_i and b on the right are the values before it. α is the learning rate and the two partial derivatives come from backpropagation — this line only has to multiply and subtract, with no differentiation left to do.",
          },
        },
        {
          kind: "example",
          title: {
            zh: "一次完整的手算：sigmoid 神经元，两个样本",
            en: "One full hand calculation: a sigmoid neuron and two samples",
          },
          steps: {
            zh: [
              "数据是两个样本 x⁽¹⁾ = −1（真标签 0）和 x⁽²⁾ = 1（真标签 1），模型是 ŷ = σ(wx + b)，误差取 E(W, b) = (1/m)Σ(ŷ − y)²。",
              "第 2 步前向：取 w = 0.5、b = 0.1，两个加权和是 z = 0.5 × (−1) + 0.1 = −0.4 和 z = 0.5 × 1 + 0.1 = 0.6，于是 ŷ = 0.401312 和 0.645656。",
              "第 3 步误差：E(W, b) = ((0.401312 − 0)² + (0.645656 − 1)²) / 2 = 0.143306。",
              "第 4 步梯度：局部导数各算一份，∂E/∂ŷ = 2(ŷ − y)/m = 0.401312 与 −0.354344，dŷ/dz = ŷ(1 − ŷ) = 0.240261 与 0.228784；乘起来再乘 x 求和得 ∂E/∂w = −0.177488，直接把两项加起来得 ∂E/∂b = 0.015351。",
              "第 5 步更新：取 α = 1.0，w' = 0.5 − 1.0 × (−0.177488) = 0.677488，b' = 0.1 − 1.0 × 0.015351 = 0.084649。",
              "再看一眼误差：同一组数据在新参数下的 E(W, b) = 0.113982，比 0.143306 小了。一步就下降，这就是整个循环在做的事。",
            ],
            en: [
              "The data is two samples, x⁽¹⁾ = −1 with true label 0 and x⁽²⁾ = 1 with true label 1. The model is ŷ = σ(wx + b) and the Error is E(W, b) = (1/m)Σ(ŷ − y)².",
              "Step 2, forward: with w = 0.5 and b = 0.1 the weighted sums are z = 0.5 × (−1) + 0.1 = −0.4 and z = 0.5 × 1 + 0.1 = 0.6, so ŷ = 0.401312 and 0.645656.",
              "Step 3, the Error: E(W, b) = ((0.401312 − 0)² + (0.645656 − 1)²) / 2 = 0.143306.",
              "Step 4, the gradient: each local derivative gets its own value, ∂E/∂ŷ = 2(ŷ − y)/m = 0.401312 and −0.354344, and dŷ/dz = ŷ(1 − ŷ) = 0.240261 and 0.228784. Multiply them through, weight by x and add to get ∂E/∂w = −0.177488, or add them directly to get ∂E/∂b = 0.015351.",
              "Step 5, the update: with α = 1.0, w' = 0.5 − 1.0 × (−0.177488) = 0.677488 and b' = 0.1 − 1.0 × 0.015351 = 0.084649.",
              "Look at the Error again: on the same data, the new parameters give E(W, b) = 0.113982, down from 0.143306. One step, one decrease — and that is the whole loop.",
            ],
          },
          result: {
            zh: "注意 ∂E/∂w 是负的，减号让它变成加法：w 变大。这不是巧合——x⁽²⁾ = 1 的预测 0.645656 低于真标签 1，把 w 调大正好把这个预测推高。偏导的符号本身就是方向说明：负的说明「现在这个权重偏小」。",
            en: "Note that ∂E/∂w is negative, so the minus sign turns it into an addition and w grows. That is no accident: the prediction 0.645656 for x⁽²⁾ = 1 falls short of the true label 1, and a larger w pushes it up. The sign of the partial derivative is the direction instruction — negative means this weight is currently too small.",
          },
        },
        {
          kind: "lab",
          id: "gradient-check",
        },
        {
          kind: "callout",
          tone: "tip",
          title: { zh: "梯度检查是标准动作", en: "The gradient check is standard practice" },
          body: {
            zh: "公式推完之后，用有限差分验一遍是标准做法：把 w 挪动一个很小的量 ε，用 (E(w + ε) − E(w − ε)) / (2ε) 估一个斜率，再和反向传播算出的 ∂E/∂w 比。两者应该在打印出来的精度内一致。不一致就说明解析推导写错了。上面那张图就是这件事：拖动 w，两条曲线必须贴着走。",
            en: "After deriving the formula by hand, checking it against a finite difference is standard practice: move w by a tiny ε, estimate the slope with (E(w + ε) − E(w − ε)) / (2ε), and compare it with the ∂E/∂w that backpropagation produced. The two should agree to the precision you print. If they do not, the analytic derivation is wrong. That is exactly what the figure above shows: drag w and the two curves have to stay on top of each other.",
          },
        },
        {
          kind: "formula",
          tex: String.raw`w_i^{(t+1)} = w_i^{(t)} - \alpha \left. \frac{\partial E}{\partial w_i} \right|_{W^{(t)}, b^{(t)}}`,
          reveal: true,
          caption: {
            zh: "同样的规则写成「第几轮」的样子：右上角的 (t) 表示第 t 轮，偏导必须在当前这组参数上取值，而不是在上一轮的地方。这一点决定了整个循环的顺序——先有第 2、3、4 步给出的偏导，才有第 5 步的更新，顺序颠倒过来算的就是别处的斜率。",
            en: "The same rule written round by round: the superscript (t) marks round t, and the partial derivative has to be evaluated at the current parameters, not where they were last round. That fixes the order of the loop — the update of step 5 can only happen after steps 2, 3 and 4 have produced a partial derivative, and reversing the order would compute a slope somewhere else.",
          },
        },
        {
          kind: "lab",
          id: "weight-update",
        },
        {
          kind: "callout",
          tone: "warning",
          title: { zh: "学习率不是越大越快地学", en: "A larger learning rate is not faster learning" },
          body: {
            zh: "把 α 调大看起来像是「学得更快」，但过了某个界限，它就不再是学得快，而是根本不学：一步跨过谷底落到更高的地方，下一步跨得更远，E(W, b) 一路涨上去。判断方法很朴素——看每一轮的误差：一直在变小就是好的，开始来回跳或者变大就是 α 太大了，几乎不动则是 α 太小了。",
            en: "Turning α up looks like learning faster, but past a certain point it is not fast learning at all — it is no learning: one step clears the bottom of the valley and lands higher up, the next step goes further still, and E(W, b) climbs. The diagnostic is plain: watch the Error each round. Always falling is good, jumping back and forth or growing means α is too large, and barely moving means α is too small.",
          },
        },
      ],
    },
    {
      label: { zh: "分清", en: "DISTINGUISH" },
      title: {
        zh: "反向传播只算梯度，下降是另一回事",
        en: "Backpropagation computes the gradient; descent is a separate thing",
      },
      blocks: [
        {
          kind: "prose",
          paragraphs: {
            zh: [
              "这一章最容易被混在一起的两个词，是「反向传播」和「梯度下降」。它们在一次训练里前后发生，但回答的是两个不同的问题：反向传播回答「∂E/∂w_i 是多少」，也就是此刻这个权重的偏导等于多少；梯度下降（更新那一步）回答「知道了偏导，我该走多远」，也就是 α 该取多少。",
              "把这条界线划清楚有三个好处。第一，反向传播本身不改变任何东西：它只把 ∂E/∂w 和 ∂E/∂b 算出来交给你，权重一个都没动；真正让数字变化的是 w'_i = w_i − α ∂E/∂w_i 这一步。第二，算梯度和怎么走可以分开换：α 太大会发散，这跟反向传播算得对不对完全无关——梯度可以精确到小数点后六位，步子太大照样炸。第三，排错时这条界线直接告诉你去看哪里：梯度检查不过关，是反向传播（链式法则）写错了；梯度检查过关但训练不下降，是 α 或是循环本身的问题，再调反向传播也没用。",
              "换个说法：反向传播是「测量」，更新是「行动」。测量再准，行动迈得太远也一样摔下去。",
            ],
            en: [
              "The two words most easily muddled in this chapter are backpropagation and gradient descent. They happen one after the other inside a training step, but they answer different questions: backpropagation answers what is ∂E/∂w_i, the partial derivative of this weight right now, while gradient descent — the update step — answers how far to walk once you know it, which is the question of what α should be.",
              "Drawing that line clearly pays three times. First, backpropagation itself changes nothing: it computes ∂E/∂w and ∂E/∂b and hands them over, without moving a single weight; what actually changes the numbers is the step w'_i = w_i − α ∂E/∂w_i. Second, computing the gradient and choosing the walk can be swapped independently: an α that is too large diverges, and that has nothing to do with whether backpropagation was right — gradients can be accurate to six decimals and the run still blows up. Third, the line tells you where to look when debugging: if the gradient check fails, backpropagation — the chain rule — is wrong; if the gradient check passes but training does not descend, the problem is α or the loop itself, and reworking backpropagation will not help.",
              "Put another way: backpropagation is measurement, and the update is the action. However precise the measurement, an action that strides too far still ends in a fall.",
            ],
          },
        },
        {
          kind: "formula",
          tex: String.raw`\underbrace{\frac{\partial E}{\partial w_i}}_{\text{backpropagation}} \qquad \underbrace{w'_i = w_i - \alpha \frac{\partial E}{\partial w_i}}_{\text{gradient descent}}`,
          reveal: true,
          caption: {
            zh: "同一个偏导出现在两个地方，但出现在两个不同的角色里：左边它是被算出来的结果，右边它只是被拿来乘 α 的输入。这两件事合起来才是完整的一步训练。",
            en: "The same partial derivative appears in both halves, in two different roles: on the left it is the result being computed, on the right it is merely an input multiplied by α. Only the two together make one complete training step.",
          },
        },
        {
          kind: "formula",
          tex: String.raw`w_i \leftarrow w_i - \alpha \frac{\partial E}{\partial w_i} \quad \text{for every } i, \qquad b \leftarrow b - \alpha \frac{\partial E}{\partial b}`,
          reveal: true,
          caption: {
            zh: "把更新写成箭头形式，是为了强调一件事：这只是「赋值」，不是方程。右边的 w_i 是更新前的值，箭头左边是更新后的值，所有参数都要用同一批梯度一起换掉——不是一边改一边用新值接着算。",
            en: "Writing the update with an arrow makes one thing clear: it is an assignment, not an equation. The w_i on the right is the value before the update and the w_i on the left is the value after it, and every parameter is replaced together using the same batch of gradients — not updated one at a time and then used to compute the rest.",
          },
        },
        {
          kind: "callout",
          tone: "takeaway",
          title: { zh: "这一章的考试清单", en: "The exam checklist for this chapter" },
          body: {
            zh: "六步：随机初始化 → 前向 → 算误差 E(W, b) → 反向传播算梯度 → 更新 w'_i = w_i − α ∂E/∂w_i、b' = b − α ∂E/∂b → 重复直到误差变小。偏导靠链式法则写成一串局部导数相乘；学习率 α 决定走多远，太大发散、太小几乎不动，讲义用 lr = 0.003、epochs = 10；误差一律写 E(W, b)，学习率写 α；最后一句要能背出来——反向传播只负责算梯度，往下走的那一步是梯度下降。",
            en: "Six steps: random initialisation, forward pass, compute the Error E(W, b), backpropagation for the gradient, update by w'_i = w_i − α ∂E/∂w_i and b' = b − α ∂E/∂b, repeat until the Error becomes small. The partial derivatives are written by the chain rule as a product of local derivatives; the learning rate α sets how far to step, with too large diverging and too small barely moving, and the lecture uses lr = 0.003 with epochs = 10; write the Error as E(W, b) and the learning rate as α; and be able to recite the last sentence — backpropagation only computes the gradient, and the step downhill is gradient descent.",
          },
        },
      ],
    },
  ],
  lab: "backprop-chain",
  code: {
    id: "module_11.py",
    title: {
      zh: "一个 sigmoid 神经元的一步训练",
      en: "One training step on a single sigmoid neuron",
    },
    intro: {
      zh: "两个样本、一个 sigmoid 神经元、误差取 E(W, b) = (1/m)Σ(ŷ − y)²。先算前向，再让 NumPy 把两个局部导数乘起来得到 ∂E/∂ŷ、dŷ/dz，然后算出 ∂E/∂w 和 ∂E/∂b，最后按 w' = w − α ∂E/∂w 走一步。末尾用有限差分把解析梯度验一遍。",
      en: "Two samples, one sigmoid neuron, and the Error E(W, b) = (1/m)Σ(ŷ − y)². Run the forward pass, let NumPy multiply the two local derivatives into ∂E/∂ŷ and dŷ/dz, turn those into ∂E/∂w and ∂E/∂b, and then take one step by w' = w − α ∂E/∂w. The last two lines check the analytic gradient against a finite difference.",
    },
    source: `import numpy as np

# One sigmoid neuron, two samples, squared Error: E(W, b) = mean((y - yhat) ** 2)
x = np.array([-1.0, 1.0])
y = np.array([0.0, 1.0])
w, b = 0.5, 0.1

def forward(w, b):
    z = w * x + b
    return z, 1.0 / (1.0 + np.exp(-z))

def error(w, b):
    return float(np.mean((y - forward(w, b)[1]) ** 2))

z, yhat = forward(w, b)
E = error(w, b)
print(f"forward      z = {z}   yhat = {np.round(yhat, 6)}")
print(f"Error        E(W, b) = {E:.6f}")

# Two local derivatives, multiplied back along the chain rule.
dE_dyhat = 2.0 * (yhat - y) / len(x)
dyhat_dz = yhat * (1.0 - yhat)
print(f"local        dE/dyhat = {np.round(dE_dyhat, 6)}   dyhat/dz = {np.round(dyhat_dz, 6)}")

grad_w = float(np.sum(dE_dyhat * dyhat_dz * x))
grad_b = float(np.sum(dE_dyhat * dyhat_dz))
print(f"analytic     dE/dw = {grad_w:.6f}   dE/db = {grad_b:.6f}")

alpha = 1.0
w_new, b_new = w - alpha * grad_w, b - alpha * grad_b
print(f"step         w' = {w_new:.6f}   b' = {b_new:.6f}")
print(f"Error after  E(W, b) = {error(w_new, b_new):.6f}")

eps = 1e-6
numeric = (error(w + eps, b) - error(w - eps, b)) / (2 * eps)
print(f"numeric      dE/dw = {numeric:.6f}")
print(f"difference   {abs(grad_w - numeric):.6f}")`,
    challenge: {
      zh: "把 alpha 改成 0.003、再把这个「先算梯度再更新」的循环跑 10 轮（epochs = 10），看误差从 0.143306 降到多少。再分别试 alpha = 8.0 和 alpha = 1e-6：哪一个让 E(W, b) 一路涨上去，哪一个让它几乎不动？",
      en: "Change alpha to 0.003 and run the compute-gradient-then-update loop for 10 epochs; watch how far the Error falls from 0.143306. Then try alpha = 8.0 and alpha = 1e-6: which one sends E(W, b) climbing, and which one leaves it almost unchanged?",
    },
    expectedOutput: `forward      z = [-0.4  0.6]   yhat = [0.401312 0.645656]
Error        E(W, b) = 0.143306
local        dE/dyhat = [ 0.401312 -0.354344]   dyhat/dz = [0.240261 0.228784]
analytic     dE/dw = -0.177488   dE/db = 0.015351
step         w' = 0.677488   b' = 0.084649
Error after  E(W, b) = 0.113982
numeric      dE/dw = -0.177488
difference   0.000000`,
    expectedNote: {
      zh: "两行 local 就是链式法则的两个因子：∂E/∂ŷ 和 dŷ/dz。把它们和 x 乘起来求和得到 ∂E/∂w = −0.177488，直接相加得到 ∂E/∂b = 0.015351——注意 ∂E/∂w 是负的，所以减号让它变成加法，w 从 0.5 涨到 0.677488，误差随即从 0.143306 降到 0.113982。最后两行是最重要的一行对照：有限差分估出来的斜率 −0.177488 和解析梯度打印出来完全一样，difference 小到显示为 0.000000，说明反向传播那条链乘对了。真正的差别在挑战里：alpha = 1e-6 时每一步几乎不动，误差十轮之后还在 0.14 附近；alpha = 8.0 时步子太大，误差会一路涨上去——梯度算得再准也救不了它，因为梯度没错，是步子错了。",
      en: "The two local lines are the chain rule's two factors, ∂E/∂ŷ and dŷ/dz. Multiplied by x and summed they give ∂E/∂w = −0.177488; added directly they give ∂E/∂b = 0.015351. Note that ∂E/∂w is negative, so the minus sign makes it an addition: w rises from 0.5 to 0.677488 and the Error drops from 0.143306 to 0.113982. The last two lines are the comparison that matters most: the slope estimated by finite differences, −0.177488, is identical to the analytic gradient at the printed precision, with a difference small enough to print as 0.000000 — the chain was multiplied correctly. The real difference shows up in the challenge: at alpha = 1e-6 each step does almost nothing and the Error is still near 0.14 after ten epochs, while at alpha = 8.0 the steps are so long that the Error climbs. An accurate gradient cannot save that run, because the gradient is not what is wrong — the step is.",
    },
  },
  quiz: [
    {
      question: {
        zh: "下面哪一项准确描述了反向传播在一步训练里做了什么？",
        en: "Which of these accurately describes what backpropagation does inside one training step?",
      },
      options: {
        zh: [
          "算出 ∂E/∂w_i 和 ∂E/∂b，但不改变任何权重",
          "按学习率 α 更新权重和偏置",
          "重新随机初始化权重，避免卡住",
          "计算前向的输出 ŷ 并给出误差 E(W, b)",
        ],
        en: [
          "It computes ∂E/∂w_i and ∂E/∂b, and changes no weight",
          "It updates the weights and biases by the learning rate α",
          "It re-initialises the weights randomly to avoid getting stuck",
          "It computes the forward output ŷ and reports the Error E(W, b)",
        ],
      },
      correct: 0,
      explanation: {
        zh: "反向传播只负责算梯度，靠链式法则把 ∂E/∂w_i 和 ∂E/∂b 从后往前乘出来，一个权重也不动。真正改变数值的是更新那一步 w'_i = w_i − α ∂E/∂w_i，那属于梯度下降。",
        en: "Backpropagation only computes the gradient, multiplying ∂E/∂w_i and ∂E/∂b back through the chain rule without touching a single weight. What changes the numbers is the update step w'_i = w_i − α ∂E/∂w_i, which belongs to gradient descent.",
      },
    },
    {
      question: {
        zh: "学习率 α 太大时，训练会怎样？",
        en: "What happens to training when the learning rate α is too large?",
      },
      options: {
        zh: [
          "每步跨过谷底，E(W, b) 一次比一次大，训练发散",
          "梯度会被算错，链式法则失效",
          "收敛更快，因为步子大所以走得远",
          "权重全部变成 0",
        ],
        en: [
          "Each step clears the bottom of the valley, E(W, b) grows every round, and the run diverges",
          "The gradient is computed wrongly and the chain rule stops working",
          "It converges faster, because large steps cover more ground",
          "Every weight becomes 0",
        ],
      },
      correct: 0,
      explanation: {
        zh: "步子太大就会跨过最低点落到对面更高的坡上，下一步从那里跨得更远，E(W, b) 一步步涨上去。注意梯度本身没有算错——发散是步子的问题，不是反向传播的问题。",
        en: "A step that is too long clears the minimum and lands higher up the far side; the next step goes further still and E(W, b) climbs. Note that the gradient itself is not wrong — divergence is a problem with the step, not with backpropagation.",
      },
    },
    {
      question: {
        zh: "按链式法则，网络深处一个权重的 ∂E/∂w 是什么？",
        en: "By the chain rule, what is ∂E/∂w for a weight deep inside the network?",
      },
      options: {
        zh: [
          "从 E 回到这个权重的路径上，所有局部导数的乘积",
          "误差 E(W, b) 除以这个权重",
          "这个权重的值乘以学习率 α",
          "最后一层误差的绝对值",
        ],
        en: [
          "The product of all the local derivatives along the path from E back to that weight",
          "The Error E(W, b) divided by that weight",
          "That weight's value multiplied by the learning rate α",
          "The absolute value of the last layer's error",
        ],
      },
      correct: 0,
      explanation: {
        zh: "从 E 往回走，每经过一个运算就乘上它那一步的局部导数，整条路径上的因子连乘起来才是 ∂E/∂w。其中一个因子为 0，乘积就是 0，这个权重就一步也不会动——这正是梯度消失的来历。",
        en: "Walk back from E and multiply in each operation's local derivative; the product along the whole path is ∂E/∂w. If one factor is 0 the product is 0 and the weight never moves — which is exactly where vanishing gradients come from.",
      },
    },
  ],
};

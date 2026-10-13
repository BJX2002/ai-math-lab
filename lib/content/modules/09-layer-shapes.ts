import type { CourseModule } from "../types";

export const layerShapes: CourseModule = {
  slug: "layer-shapes",
  number: "09",
  track: "ai",
  durationMinutes: 45,
  level: { zh: "通往 AI", en: "AI bridge" },
  title: {
    zh: "层与张量形状：网络是怎么搭起来的",
    en: "Layers and tensor shapes: how a network is wired",
  },
  shortTitle: { zh: "层与形状", en: "Layers & shapes" },
  subtitle: {
    zh: "从 θ_ij 一路写到 nn.Linear(784, 256)",
    en: "From θ_ij all the way to nn.Linear(784, 256)",
  },
  description: {
    zh: "网络由输入层、隐藏层、输出层叠成，连线只从一层指向下一层。这一章用讲义自己的记号 θ_ij 与 θ_0j 写出隐藏单元的输出，说明二分类只要 1 个输出节点而识别 0–9 要 10 个，把标签写成独热编码（one-hot encoding），最后落到张量形状：批量维永远在最前面，(64, 1, 28, 28) 展平成 (64, 784)，nn.Linear(784, 256) 接 nn.Linear(256, 10)，参数量就是 in × out + out。",
    en: "A network is stacked from an input layer, hidden layers, and an output layer, and every link points from one layer to the next. This chapter writes a hidden unit's output with the lecture's own notation θ_ij and θ_0j, shows why binary classification needs 1 output node while recognising 0–9 needs 10, turns the label into a one-hot vector, and lands on tensor shapes: the batch dimension comes first, (64, 1, 28, 28) flattens to (64, 784), nn.Linear(784, 256) feeds nn.Linear(256, 10), and the parameter count is in × out + out.",
  },
  plainIdea: {
    zh: "一个网络就是三排节点：输入层装数据，隐藏层做中间计算，输出层给答案；所有连线都只从一排指向下一排。",
    en: "A network is three rows of nodes: the input layer holds the data, the hidden layers do the middle work, and the output layer gives the answer, with every connection pointing from one row to the next.",
  },
  analogy: {
    zh: "像一条单向流水线：每一站只看上一站送来的东西，做完自己的加工就交给下一站。工人之间不互相传话，也不能把半成品送回上一站——这就是「只向前连」的日常版本。",
    en: "It is a one-way production line: each station only looks at what the previous station sent, does its own work, and passes the result on. The workers never talk to each other, and nothing travels back to an earlier station — that is the everyday version of the forward-only rule.",
  },
  beforeMath: {
    zh: "只需要认得 (64, 1, 28, 28) 这样的括号列表。数一数括号里有几个数字，就知道这个张量（tensor）有几个维度；把里面的数字乘起来，就是它一共装了多少个数。",
    en: "All you need is to read a bracketed list like (64, 1, 28, 28). Count the numbers inside the brackets to get the tensor's number of dimensions, and multiply them to get how many numbers it holds in total.",
  },
  aiConnection: {
    zh: "在 PyTorch 里搭出这一章的网络只要两行：nn.Linear(784, 256) 接 nn.Linear(256, 10)。每个 nn.Linear 就是一个 dense layer（全连接层），参数量永远是 in × out + out。形状写错一位，矩阵乘法会立刻报错——这就是形状约定值得背下来的原因。",
    en: "Building the network of this chapter in PyTorch takes two lines: nn.Linear(784, 256) followed by nn.Linear(256, 10). Each nn.Linear is one dense layer, and its parameter count is always in × out + out. Get one shape wrong and the matrix product fails immediately, which is why the shape conventions are worth memorising.",
  },
  outcomes: {
    zh: [
      "说出输入层、隐藏层、输出层各装什么，并复述「只向前连」的规则",
      "用 θ_ij 与 θ_0j 写出第 j 个隐藏单元的输出 a^(j)，并说明偏置为什么可以看成权重",
      "按任务决定输出节点数：二分类 1 个，识别 0–9 要 10 个",
      "把标签写成独热向量，并解释多分类为什么必须这样做",
      "读懂 (64, 1, 28, 28) 到 (64, 784) 的形状变化，并算出 dense layer 的参数量 in × out + out",
    ],
    en: [
      "Say what the input, hidden, and output layers hold, and restate the forward-only rule",
      "Write hidden unit j's output a^(j) with θ_ij and θ_0j, and explain why a bias can be read as a weight",
      "Pick the number of output nodes from the task: 1 for binary, 10 for recognising 0–9",
      "Turn a label into a one-hot vector and explain why multiclass problems demand it",
      "Read the shape change from (64, 1, 28, 28) to (64, 784), and count a dense layer's parameters as in × out + out",
    ],
  },
  figure: "matrices",
  figureCaption: {
    zh: "矩阵就是「一批样本」的写法：一行一个样本，一列一个特征。一层网络做的事，就是把这张表乘上一个权重矩阵，换成另一张表——例如从 (64, 784) 变成 (64, 256)。",
    en: "A matrix is how a batch of samples is written down: one sample per row, one feature per column. One layer of a network multiplies that table by a weight matrix and returns another table — from (64, 784) to (64, 256), for example.",
  },
  sections: [
    {
      label: { zh: "层", en: "LAYERS" },
      title: { zh: "输入层、隐藏层、输出层", en: "Input, hidden, and output layers" },
      blocks: [
        {
          kind: "prose",
          paragraphs: {
            zh: [
              "一个网络由三排节点（node）组成。输入层（input layer）装数据：一个样本有几个特征，它就有几个节点——MNIST 的每张图展平后是 784 个数，所以输入层是 784 个节点。隐藏层（hidden layer）夹在中间，它的宽度由我们自己挑，讲义里的例子常用 256。输出层（output layer）给出答案，宽度由任务决定。",
              "讲义用一句话定下连接规则：No links to nodes of same or previous layers。连线只从某一层指向它的下一层——同一层内部的节点之间没有连线，也不允许连回上一层或更早的层。每个隐藏单元只看得见上一层送来的数字。",
              "这条规则带来两个直接后果。第一，同一层的所有节点互不干扰，可以同时算完，写成矩阵乘法就只要一步。第二，第 l 层只需要知道第 l − 1 层的输出形状，整条信息流是一条直线：从前向后，绝不回头。",
            ],
            en: [
              "A network is three rows of nodes. The input layer holds the data: one node per feature, so an MNIST image flattened into 784 numbers gives an input layer of 784 nodes. The hidden layer sits in the middle and its width is ours to choose — 256 in the lecture's examples. The output layer gives the answer, and the task sets its width.",
              "The lecture settles the wiring in one sentence: No links to nodes of same or previous layers. Every connection points from one layer to the next — there are no links between nodes of the same layer, and none back to a previous or earlier layer. Each hidden unit only ever sees the numbers handed down by the layer before it.",
              "Two consequences follow at once. First, the nodes of one layer are independent, so they can all be computed at the same time; written as a matrix product that is a single step. Second, layer l only needs to know the output shape of layer l − 1, so the whole flow of information is a straight line: forwards, never back.",
            ],
          },
        },
        {
          kind: "formula",
          tex: String.raw`a^{(j)} = g\left(\theta_{0j} + \sum_i \theta_{ij} x_i\right)`,
          reveal: true,
          caption: {
            zh: "第 j 个隐藏单元的输出。θ_ij 是「输入 i 连到隐藏单元 j」的权重，θ_0j 是这个单元的偏置，g 是激活函数（activation function）。看清两个下标的分工：第一个下标指向来源，第二个下标指向目标。",
            en: "The output of hidden unit j. θ_ij is the weight from input i to hidden unit j, θ_0j is that unit's bias, and g is the activation function that bends the weighted sum. Note how the two indices divide the work: the first names the source, the second names the target.",
          },
        },
        {
          kind: "formula",
          tex: String.raw`z_j = \sum_{i=0}^{d} \theta_{ij} x_i, \qquad x_0 = 1`,
          reveal: true,
          caption: {
            zh: "把偏置写成权重的最干净方式：给每个单元补一个恒等于 1 的输入 x_0，它的权重就是偏置 θ_0j。于是「加权和再加偏置」变成一次普通的加权和——这就是讲义说偏置也是权重的意思。d 是输入层的节点数。",
            en: "The cleanest way to read a bias as a weight: give every unit one extra input x_0 that is always 1, and its weight is the bias θ_0j. \"A weighted sum plus a bias\" then becomes one ordinary weighted sum, which is what the lecture means by calling the bias a weight too. Here d is the number of input nodes.",
          },
        },
        {
          kind: "figure",
          id: "dot-products",
          caption: {
            zh: "每个隐藏单元都在做这张图里的事：把输入逐个乘上自己的权重，再全部加起来。输入向量与「这个单元那一列权重」的点积，就是它的加权和。",
            en: "Every hidden unit does exactly what this picture shows: multiply each input by its own weight and add the parts up. The dot product of the input vector with that unit's own column of weights is its weighted sum.",
          },
        },
        {
          kind: "table",
          headers: {
            zh: ["层", "它装什么", "宽度由谁决定", "MNIST 的例子"],
            en: ["Layer", "What it holds", "What sets its width", "MNIST example"],
          },
          rows: {
            zh: [
              ["输入层 input layer", "一个样本的特征", "特征个数 d", "784 个（28 × 28 像素）"],
              ["隐藏层 hidden layer", "自己学出来的中间特征", "我们挑的超参数", "256 个"],
              ["输出层 output layer", "答案", "任务的类别数", "10 个（数字 0–9）"],
            ],
            en: [
              ["Input layer", "The features of one sample", "The number of features d", "784 (28 × 28 pixels)"],
              ["Hidden layer", "Intermediate features it invents itself", "A hyperparameter we choose", "256"],
              ["Output layer", "The answer", "The number of classes in the task", "10 (the digits 0–9)"],
            ],
          },
          caption: {
            zh: "数据决定输入层的宽度，任务决定输出层的宽度，只有隐藏层的宽度是我们自己挑的——这也是唯一需要凭经验调的那个。",
            en: "The data fixes the width of the input layer and the task fixes the width of the output layer; only the hidden width is ours to choose, and it is the one worth tuning by experience.",
          },
        },
        {
          kind: "example",
          title: { zh: "两个隐藏单元，同一组输入，各算各的", en: "Two hidden units, one input vector, computed separately" },
          steps: {
            zh: [
              "输入 x₁ = 1、x₂ = 2，激活函数取 ReLU，也就是 max(0, z)。",
              "隐藏单元 1：θ₀₁ = −0.5、θ₁₁ = 1、θ₂₁ = 1，所以 z₁ = −0.5 + 1·1 + 1·2 = 2.5，a^(1) = 2.5。",
              "隐藏单元 2：θ₀₂ = −3、θ₁₂ = 1、θ₂₂ = 1，所以 z₂ = −3 + 1 + 2 = 0，a^(2) = 0。",
              "两个单元读到的是同一组 x，但各自的 θ 不同，所以答案不同——它们的下标里只有 j 不一样，i 是一样的。",
              "输出层再拿 (a^(1), a^(2)) = (2.5, 0) 当输入，用 w₁ = 1、w₂ = 1、b = −1 算出 z = 2.5 + 0 − 1 = 1.5 ≥ 0，输出 1。",
            ],
            en: [
              "The inputs are x₁ = 1 and x₂ = 2, and the activation is ReLU, that is max(0, z).",
              "Hidden unit 1: θ₀₁ = −0.5, θ₁₁ = 1, θ₂₁ = 1, so z₁ = −0.5 + 1·1 + 1·2 = 2.5 and a^(1) = 2.5.",
              "Hidden unit 2: θ₀₂ = −3, θ₁₂ = 1, θ₂₂ = 1, so z₂ = −3 + 1 + 2 = 0 and a^(2) = 0.",
              "Both units read the same x but own different θ, so they answer differently: only j differs between them, while i runs over the same inputs.",
              "The output layer then takes (a^(1), a^(2)) = (2.5, 0) as its input and, with w₁ = 1, w₂ = 1, b = −1, computes z = 2.5 + 0 − 1 = 1.5 ≥ 0 and outputs 1.",
            ],
          },
          result: {
            zh: "整层的计算就是一次矩阵乘法：2 个输入排成一行，权重按「一列属于一个隐藏单元」排好，两个隐藏单元的值同时算出来。这也是「同一层之间没有连线」的好处——它们本来就不需要互相看一眼。",
            en: "The whole layer is one matrix product: the 2 inputs as a row, the weights arranged so that one column belongs to one hidden unit, and both values come out together. That is the benefit of having no links inside a layer — the units never need to look at each other.",
          },
        },
        {
          kind: "predict",
          prompt: {
            zh: "要识别手写数字 0–9，输出层需要几个节点？",
            en: "How many nodes does the output layer need to recognise the handwritten digits 0–9?",
          },
          options: {
            zh: ["1 个", "9 个", "10 个", "784 个"],
            en: ["1", "9", "10", "784"],
          },
          answerIndex: 2,
          why: {
            zh: "二分类（是 / 否）只要 1 个输出节点，一个 0 到 1 之间的概率就够了。多分类不一样：0–9 一共 10 个类别，网络必须为每个类别各留一个节点，所以是 10 个——不是 9 个，因为「0」也是一个类别；也不是 784 个，那是输入层的宽度。",
            en: "Binary classification is a single yes-or-no, so 1 output node and one probability between 0 and 1 are enough. Multiclass is different: 0–9 is 10 classes, and the network must keep one node for each of them, so the answer is 10 — not 9, because 0 is a class too, and not 784, which is the width of the input layer.",
          },
        },
        {
          kind: "prose",
          paragraphs: {
            zh: [
              "十个输出节点意味着答案也必须是十个数字：标签不能写成「3」这样一个整数，而要写成独热编码（one-hot encoding）——一个 10 维向量，只有真实类别那一格是 1，其余全是 0。",
              "为什么非换成向量不可？因为类别之间没有大小关系。标签若留成整数 0–9，模型会以为「9 比 1 大」是有意义的信息，于是把分类当成回归来做。独热向量把每个类别放在自己的一维上，类别之间彼此平等；输出层每个节点给出的分数也与标签的每一维一一对应，Error 才能逐格比较这两组 10 个数。",
            ],
            en: [
              "Ten output nodes mean the answer has to be ten numbers too: the label cannot stay an integer such as \"3\", it has to become a one-hot vector — a 10-dimensional vector with a 1 in the true class and 0 everywhere else.",
              "Why insist on a vector? Because classes have no order or distance between them. Left as the integer 0–9, the label tells the model that \"9 is bigger than 1\" is meaningful information, and the task turns into regression. A one-hot vector puts each class on its own dimension, so the classes are equals; it also lines up one-to-one with the scores of the output nodes, which is what lets the Error compare the two sets of ten numbers entry by entry.",
            ],
          },
        },
        {
          kind: "formula",
          tex: String.raw`y = \begin{bmatrix} 0 \\ 0 \\ 0 \\ 1 \\ 0 \\ 0 \\ 0 \\ 0 \\ 0 \\ 0 \end{bmatrix}, \qquad y_c = \begin{cases} 1, & c = k \\ 0, & c \ne k \end{cases}`,
          reveal: true,
          caption: {
            zh: "左：数字 3 的独热标签（类别从 0 开始编号，所以 1 落在第 4 行）。右：同一件事的一般写法，k 是这个样本的真实类别，只有第 k 维是 1。整批样本的标签因此是一个 (n, 10) 的矩阵，n 是样本数。",
            en: "Left: the one-hot label of the digit 3 (classes are numbered from 0, so the 1 sits in the fourth row). Right: the same thing in general, where k is the true class of that sample and only dimension k is 1. A whole batch of labels is therefore an (n, 10) matrix, with n the number of samples.",
          },
        },
        {
          kind: "callout",
          tone: "warning",
          title: { zh: "标签是向量，不是一个数字", en: "A label is a vector, not a number" },
          body: {
            zh: "把 0–9 的标签当成一个整数去训练，等于告诉网络类别之间有顺序、有距离：练出来的模型会把「像 8 的 3」罚得比「像 0 的 3」更重，这不是我们想要的效果。多分类一律先把标签写成独热向量，而输出层的宽度必须等于这个向量的长度——10 个类别配 10 个输出节点。",
            en: "Training on the integer 0–9 tells the network that classes have an order and a distance: the fitted model then punishes a 3 that looks like an 8 more heavily than a 3 that looks like a 0, which is not what we want. In multiclass problems the label is always turned into a one-hot vector first, and the width of the output layer must equal the length of that vector — 10 classes, 10 output nodes.",
          },
        },
      ],
    },
    {
      label: { zh: "形状", en: "SHAPES" },
      title: {
        zh: "批量维排在最前，形状一路对齐",
        en: "Batch first, shapes aligned all the way",
      },
      blocks: [
        {
          kind: "prose",
          paragraphs: {
            zh: [
              "网络里的每一批数据都是一个张量（tensor）：按维度排好的一堆数字。形状（shape）是每个维度的大小，例如 (64, 1, 28, 28)；阶（rank）是维度的个数，这里是 4；元素总数是 64 × 1 × 28 × 28 = 50,176。",
              "有一个必须背下来的约定：第一维永远是批量维（batch dimension），也就是样本数 64。后面的维度依次是通道、高、宽，合起来读作 (batch, channels, height, width)。把样本数放在最前面，框架才能一次处理任意多个样本：换成 128 张图，形状变成 (128, 1, 28, 28)，其余部分一个字都不用改。",
              "dense layer 只接受「一行一个样本」的二维表，所以 28 × 28 的图像要先展平（flatten）：把每张图的 1 × 28 × 28 = 784 个数拉成一行，(64, 1, 28, 28) 就变成 (64, 784)。批量维 64 从头到尾不动，变的只是「每个样本被写成了多少个数」。",
            ],
            en: [
              "Every batch inside a network is a tensor: numbers arranged along dimensions. The shape is the size of each dimension, for example (64, 1, 28, 28); the rank is the number of dimensions, here 4; and the total number of elements is 64 × 1 × 28 × 28 = 50,176.",
              "One convention has to be memorised: the first dimension is always the batch dimension, the number of samples, 64. The dimensions after it are channels, height, and width, read together as (batch, channels, height, width). Putting the sample count in front is what lets a framework handle any number of samples at once: switch to 128 images and the shape becomes (128, 1, 28, 28) with nothing else changed.",
              "A dense layer accepts only a two-dimensional table with one sample per row, so a 28 × 28 image is flattened first: the 1 × 28 × 28 = 784 numbers of each image are pulled into one row, and (64, 1, 28, 28) becomes (64, 784). The batch dimension 64 never moves; what changes is only how many numbers one sample is written as.",
            ],
          },
        },
        {
          kind: "formula",
          tex: String.raw`(64,\, 1,\, 28,\, 28) \;\longrightarrow\; (64,\, 784) \;\longrightarrow\; (64,\, 256) \;\longrightarrow\; (64,\, 10)`,
          reveal: true,
          caption: {
            zh: "一批 64 张图的完整旅程：原始图像 → 展平 → 第一个隐藏层 → 输出层。每一步只有最后一维在变，批量维 64 始终待在最前面。",
            en: "The whole journey of one batch of 64 images: raw images, flattened, first hidden layer, output layer. Only the last dimension changes at each step, and the batch dimension 64 stays in front throughout.",
          },
        },
        {
          kind: "table",
          headers: {
            zh: ["阶段", "shape", "阶 rank", "元素总数"],
            en: ["Stage", "shape", "rank", "total elements"],
          },
          rows: {
            zh: [
              ["图像批", "(64, 1, 28, 28)", "4", "50,176"],
              ["展平之后", "(64, 784)", "2", "50,176"],
              ["第一个隐藏层", "(64, 256)", "2", "16,384"],
              ["输出层", "(64, 10)", "2", "640"],
              ["独热标签", "(64, 10)", "2", "640"],
            ],
            en: [
              ["Image batch", "(64, 1, 28, 28)", "4", "50,176"],
              ["After flattening", "(64, 784)", "2", "50,176"],
              ["First hidden layer", "(64, 256)", "2", "16,384"],
              ["Output layer", "(64, 10)", "2", "640"],
              ["One-hot labels", "(64, 10)", "2", "640"],
            ],
          },
          caption: {
            zh: "展平改变形状但不改变元素总数；标签与输出层必须是同一个形状 (64, 10)，E(W, b) 才能把预测和答案逐格相减。",
            en: "Flattening changes the shape but not the number of elements, and the labels and the output layer must share the shape (64, 10) so that E(W, b) can subtract prediction from answer entry by entry.",
          },
        },
        {
          kind: "prose",
          paragraphs: {
            zh: [
              "偏置 b 只有 256 个数，却要加到 (64, 256) 这张表的每一行上。这一步靠广播（broadcasting）完成，规则是：从最后一维往前对齐，每一维要么两边相等，要么其中一边是 1，否则直接报错。",
              "加法本身并不需要把 b 真的复制 64 份，框架只是让每一行都用同一份 b——所以偏置永远只花 256 个参数，而不是 64 × 256 个。这也是上一节「批量维在最前面」的回报：往后的每一层都可以用一个向量直接作用在整批数据上。",
            ],
            en: [
              "The bias b holds only 256 numbers, yet it has to be added to every row of a (64, 256) table. Broadcasting does that, and its rule is: align the shapes from the last dimension backwards, and at each dimension the two must either be equal or have one of them equal to 1, or the operation fails.",
              "The addition never really copies b 64 times; the framework simply lets every row use the same b, which is why the bias costs 256 parameters and not 64 × 256. This is the payoff of putting the batch dimension first: every later layer can act on the whole batch with one vector.",
            ],
          },
        },
        {
          kind: "lab",
          id: "tensor-broadcast",
        },
        {
          kind: "predict",
          prompt: {
            zh: "把形状为 (64, 784) 的一批数据与形状为 (784,) 的偏置相加，结果是什么形状？",
            en: "Add a batch of shape (64, 784) to a bias of shape (784,). What shape comes out?",
          },
          options: {
            zh: ["(784,)", "(64, 784)", "(64, 1)", "形状不匹配，直接报错"],
            en: ["(784,)", "(64, 784)", "(64, 1)", "Shape mismatch: an error"],
          },
          answerIndex: 1,
          why: {
            zh: "从最后一维往前对齐：(64, 784) 对 (784,)，最后一维 784 = 784 相等；偏置缺少的批量维按 1 处理，于是被读成 (1, 784)，相加后每一行都加上同一份偏置，结果仍是 (64, 784)。如果偏置写成 (785,)，最后一维既不相等也不是 1，就会立刻报错——这正是形状写错时最常见的错误信息。",
            en: "Align from the last dimension backwards: (64, 784) against (784,) matches at 784 = 784, and the batch dimension the bias lacks counts as 1, so it is read as (1, 784) and every row receives the same bias. The result is still (64, 784). Write the bias as (785,) instead and the last dimensions are neither equal nor 1, so the operation fails at once — the most common error message a wrong shape produces.",
          },
        },
        {
          kind: "formula",
          tex: String.raw`(64,\, 784) + (784,) \;\longrightarrow\; (64,\, 784)`,
          reveal: true,
          caption: {
            zh: "缺掉的维度按 1 处理：偏置的 (784,) 被读成 (1, 784)，再沿批量维扩展 64 次（计算上不必真的复制）。图像批也一样：(64, 1, 28, 28) 加上一个形状 (1, 1, 28, 28) 的常数，结果仍然是 (64, 1, 28, 28)。",
            en: "A missing dimension counts as 1: the bias shape (784,) is read as (1, 784) and then extended along the batch dimension 64 times (no real copying happens). The image batch behaves the same way: (64, 1, 28, 28) plus a constant of shape (1, 1, 28, 28) is still (64, 1, 28, 28).",
          },
        },
        {
          kind: "example",
          title: { zh: "一批 64 张图走完整个网络", en: "One batch of 64 images walks the whole network" },
          steps: {
            zh: [
              "输入：第 i 个样本记作 x^(i)，整批 X 的形状是 (64, 1, 28, 28)。",
              "展平：X 变成 (64, 784)，第 i 行就是第 i 个样本 x^(i)。",
              "第一个 dense layer：nn.Linear(784, 256)，隐藏层输出 H = g(XΘ + θ₀)，形状变成 (64, 256)。",
              "第二个 dense layer：nn.Linear(256, 10)，得到 (64, 10) 的分数，每一行是一个样本对 10 个类别的分数。",
              "标签：本来是一个 (64,) 的整数向量，写成独热后变成 (64, 10)，与输出逐格对应。",
              "Error：E(W, b) 比较这两张 (64, 10) 的表，再用学习率 α 和 backpropagation 把梯度传回去。",
            ],
            en: [
              "Input: sample i is written x^(i), and the whole batch X has shape (64, 1, 28, 28).",
              "Flatten: X becomes (64, 784), whose row i is exactly sample x^(i).",
              "First dense layer: nn.Linear(784, 256), the hidden output H = g(XΘ + θ₀), with a new shape of (64, 256).",
              "Second dense layer: nn.Linear(256, 10), giving scores of shape (64, 10), one row of ten class scores per sample.",
              "Labels: an integer vector of shape (64,) turned into one-hot form, (64, 10), lined up with the output entry by entry.",
              "Error: E(W, b) compares the two (64, 10) tables, and the learning rate α with backpropagation carries the gradients back.",
            ],
          },
          result: {
            zh: "整条链上只有最后一维在换：784 个像素 → 256 个中间特征 → 10 个类别分数；批量维 64 从头到尾都在最前面。形状一旦对齐，一批样本就只是一次矩阵乘法，这也是 GPU 喜欢这种写法的原因。",
            en: "Only the last dimension changes along the chain: 784 pixels, then 256 intermediate features, then 10 class scores, with the batch dimension 64 in front the whole way. Once the shapes line up, a batch is a single matrix product, which is exactly why a GPU likes this arrangement.",
          },
        },
        {
          kind: "callout",
          tone: "tip",
          title: { zh: "形状检查清单", en: "A shape checklist" },
          body: {
            zh: "写代码之前先把三件事写下来：批量维在最前面；dense layer 的输入必须是二维的 (n, in)，所以图像要先展平；权重矩阵的形状是 (in, out)，偏置是 (out,)，它靠广播加到每一行上。最后核对一遍：输出层的宽度必须等于独热标签的长度，否则矩阵乘法或 Error 计算会在第一秒就报错。",
            en: "Write three things down before writing code: the batch dimension comes first; a dense layer wants a two-dimensional input (n, in), so images are flattened first; the weight matrix has shape (in, out) and the bias has shape (out,), broadcast across the rows. Then check the last point: the width of the output layer must equal the length of the one-hot label, or the matrix product or the Error computation fails in the first second.",
          },
        },
      ],
    },
    {
      label: { zh: "全连接", en: "DENSE" },
      title: {
        zh: "dense layer：in × out + out 个参数",
        en: "The dense layer: in × out + out parameters",
      },
      blocks: [
        {
          kind: "prose",
          paragraphs: {
            zh: [
              "讲义把这种层叫做 dense layer（全连接层），PyTorch 里写成 nn.Linear(in, out)。dense 的意思是「稠密」：上一层的每一个节点都连到这一层的每一个节点，没有一条线被省掉——这也正是「同一层之间没有连线」的另一面，稠密说的是相邻两层之间。",
              "所以一个 dense layer 只有两个参数：一个 (in, out) 的权重矩阵，和一个长度为 out 的偏置向量。名字里的两个数字就是这一层的形状：in 是它读进来的宽度，out 是它交出去的宽度。",
            ],
            en: [
              "The lecture calls this kind of layer a dense layer, and PyTorch spells it nn.Linear(in, out). Dense means fully connected: every node of the previous layer links to every node of this one, with no line left out — the other side of the coin from having no links inside a layer, since dense is a statement about two neighbouring layers.",
              "A dense layer therefore owns exactly two parameters: a weight matrix of shape (in, out) and a bias vector of length out. The two numbers in its name are simply its shape: in is the width it reads and out is the width it hands on.",
            ],
          },
        },
        {
          kind: "formula",
          tex: String.raw`H = g\left(X \Theta + \theta_0\right), \qquad \hat{Y} = H W + b`,
          reveal: true,
          caption: {
            zh: "整批一次算完：X 是 (64, 784)，Θ 是 (784, 256)，θ₀ 是长度为 256 的偏置向量，按上一节的广播规则加到每一行上。右边是输出层，另一个 dense layer，用 W 和 b 表示，得到 (64, 10)。左边是隐藏层所以用 Θ 和 θ₀，右边回到 W 和 b。",
            en: "The whole batch in one go: X is (64, 784), Θ is (784, 256), and θ₀ is a bias vector of length 256 that broadcasts across the rows exactly as in the previous section. On the right sits the output layer, another dense layer written with W and b, returning (64, 10). The hidden layer on the left uses Θ and θ₀; the output layer goes back to W and b.",
          },
        },
        {
          kind: "formula",
          tex: String.raw`n_{\text{params}} = d_{\text{in}} \times d_{\text{out}} + d_{\text{out}}, \qquad 784 \times 256 + 256 = 200{,}960`,
          reveal: true,
          caption: {
            zh: "每个输出节点都有一行「它对该层每个输入的权重」，共 d_in 个，再加上它自己的一个偏置，所以是 in × out + out。784 → 256 这一层因此有 784 × 256 + 256 = 200,960 个参数；只算 784 × 256 会少掉 256 个偏置。",
            en: "Each output node owns one row of weights — its own weight on every input of the layer, d_in of them — plus one bias of its own, so the count is in × out + out. The 784 → 256 layer therefore holds 784 × 256 + 256 = 200,960 parameters; counting only 784 × 256 would drop 256 biases.",
          },
        },
        {
          kind: "example",
          title: { zh: "手算 784 → 256 → 10 的参数量", en: "Counting the parameters of 784 → 256 → 10 by hand" },
          steps: {
            zh: [
              "第一个 dense layer：nn.Linear(784, 256)。权重 784 × 256 = 200,704 个，偏置 256 个。",
              "加起来是 200,704 + 256 = 200,960 个参数。",
              "第二个 dense layer：nn.Linear(256, 10)。权重 256 × 10 = 2,560 个，偏置 10 个。",
              "加起来是 2,560 + 10 = 2,570 个参数。",
              "两层合计 200,960 + 2,570 = 203,530 个参数——正是代码单元里 print 出来的那个总数。",
            ],
            en: [
              "First dense layer: nn.Linear(784, 256). Weights: 784 × 256 = 200,704, plus 256 biases.",
              "Together that is 200,704 + 256 = 200,960 parameters.",
              "Second dense layer: nn.Linear(256, 10). Weights: 256 × 10 = 2,560, plus 10 biases.",
              "Together that is 2,560 + 10 = 2,570 parameters.",
              "The two layers hold 200,960 + 2,570 = 203,530 parameters — exactly the total the code cell prints.",
            ],
          },
          result: {
            zh: "把输入也算进来看形状：X 是 (64, 784)，第一个权重矩阵是 (784, 256)，两者相乘得到 (64, 256)；第二个权重矩阵是 (256, 10)，相乘得到 (64, 10)。相邻两个形状必须有一位对上——784 接 784、256 接 256——对不上就是那句熟悉的形状报错。",
            en: "Put the input into the picture: X is (64, 784) and the first weight matrix is (784, 256), so their product is (64, 256); the second weight matrix is (256, 10) and the product is (64, 10). Neighbouring shapes must share one dimension — 784 meets 784, 256 meets 256 — and when they do not, you get the familiar shape error.",
          },
        },
        {
          kind: "table",
          headers: {
            zh: ["层", "形状变化", "参数量", "怎么算的"],
            en: ["Layer", "Shape change", "Parameters", "How it is counted"],
          },
          rows: {
            zh: [
              ["输入", "(64, 1, 28, 28)", "0", "数据本身不是参数"],
              ["展平", "(64, 784)", "0", "只换写法，不增不减"],
              ["nn.Linear(784, 256)", "(64, 784) → (64, 256)", "200,960", "784 × 256 + 256"],
              ["nn.Linear(256, 10)", "(64, 256) → (64, 10)", "2,570", "256 × 10 + 10"],
              ["合计", "(64, 784) → (64, 10)", "203,530", "两层之和"],
            ],
            en: [
              ["Input", "(64, 1, 28, 28)", "0", "the data itself is not a parameter"],
              ["Flatten", "(64, 784)", "0", "a change of spelling, nothing added"],
              ["nn.Linear(784, 256)", "(64, 784) → (64, 256)", "200,960", "784 × 256 + 256"],
              ["nn.Linear(256, 10)", "(64, 256) → (64, 10)", "2,570", "256 × 10 + 10"],
              ["Total", "(64, 784) → (64, 10)", "203,530", "the two layers together"],
            ],
          },
          caption: {
            zh: "展平不花参数，参数全在两个 dense layer 里；每一层的数目都是 in × out + out，其中最后那个 out 是偏置。",
            en: "Flattening costs no parameters and all of them live in the two dense layers; each count is in × out + out, where the final out is the bias.",
          },
        },
        {
          kind: "lab",
          id: "layer-sizes",
        },
        {
          kind: "predict",
          prompt: {
            zh: "nn.Linear(784, 256) 一共有多少个参数？",
            en: "How many parameters does nn.Linear(784, 256) hold?",
          },
          options: {
            zh: ["200,960", "200,704", "1,040", "256"],
            en: ["200,960", "200,704", "1,040", "256"],
          },
          answerIndex: 0,
          why: {
            zh: "权重是 784 × 256 = 200,704 个，另外还有 256 个偏置，所以一共 200,960 个。200,704 就是「忘了偏置」的答案，也是考试里最常见的陷阱；1,040 是 784 + 256，256 是偏置的数量——都不对。记住公式 in × out + out，最后那个加号后面不是可有可无的。",
            en: "The weights number 784 × 256 = 200,704 and there are 256 biases on top, giving 200,960. The value 200,704 is the \"forgot the bias\" answer and the classic exam trap; 1,040 is 784 + 256 and 256 is just the bias — neither is right. Remember in × out + out, and note that the addition at the end is not optional.",
          },
        },
        {
          kind: "callout",
          tone: "tip",
          title: { zh: "框架里存的方向不同，数目一样", en: "Frameworks store it the other way round" },
          body: {
            zh: "PyTorch 把同一个矩阵存成 (out, in)，并按 y = xWᵀ + b 计算，所以 nn.Linear(784, 256).weight.shape 是 (256, 784)——和讲义里 Θ 的 (in, out) 正好转置。这只是一个存储约定，参数量 in × out + out 完全不变，考试按讲义的写法答即可。",
            en: "PyTorch stores the same matrix as (out, in) and computes y = xWᵀ + b, so nn.Linear(784, 256).weight.shape is (256, 784) — the transpose of the lecture's (in, out) form of Θ. That is only a storage convention: the count in × out + out is unchanged, and in an exam you answer with the lecture's arrangement.",
          },
        },
        {
          kind: "prose",
          paragraphs: {
            zh: [
              "这些参数不是手写的，是训练出来的。Error 记作 E(W, b)，衡量这批数据错得多厉害；学习率是 α，决定每一步走多大；backpropagation 用链式法则把梯度从输出层一路传回第一层。层数越多，参数量越大，需要的数据也越多。",
              "训练开始时，形状是唯一能保证不出错的东西：输入是 (64, 784)，第一个权重矩阵是 (784, 256)，第二个是 (256, 10)，标签是 (64, 10)。任何一环写错，连第一次前向计算都跑不过去——所以先把形状对齐，再谈训练。",
            ],
            en: [
              "These parameters are not written by hand; they are trained. The Error is written E(W, b) and measures how wrong the model is on the batch, the learning rate α sets the size of each step, and backpropagation uses the chain rule to carry gradients from the output layer all the way back to the first one. More layers mean more parameters, and more parameters mean more data.",
              "At the start of training, shapes are the only thing guaranteed to be checkable: the input is (64, 784), the first weight matrix is (784, 256), the second is (256, 10), and the labels are (64, 10). Get any one of them wrong and even the first forward pass fails — so line the shapes up before talking about training.",
            ],
          },
        },
        {
          kind: "formula",
          tex: String.raw`\theta_{ij} \leftarrow \theta_{ij} - \alpha \frac{\partial E}{\partial \theta_{ij}}`,
          reveal: true,
          caption: {
            zh: "隐藏层的权重就是这样一步步改的：沿着梯度的反方向走 α 那么远。输出层与别处的权重照旧写成 W 和 b，规则一模一样，只是记号换成 w_i 和 b。",
            en: "This is how a hidden-layer weight is nudged, step by step: α in the direction opposite the gradient. Weights elsewhere, including the output layer, keep the names W and b, and the rule is identical with w_i and b in place of θ_ij.",
          },
        },
        {
          kind: "callout",
          tone: "takeaway",
          title: { zh: "三句话记住这一章", en: "Three sentences hold the chapter" },
          body: {
            zh: "连线只从一层指向下一层：同一层内部没有连线，也不回头。输出层的宽度由任务的类别数决定——二分类 1 个，识别 0–9 要 10 个，标签写成同样长度的独热向量。张量永远把批量维放在最前面，(64, 1, 28, 28) 展平成 (64, 784)，再交给 nn.Linear(784, 256) 与 nn.Linear(256, 10)，而每个 dense layer 的参数就是 in × out + out。",
            en: "Links point only from one layer to the next: none inside a layer, none backwards. The width of the output layer comes from the number of classes — 1 for binary, 10 for the digits 0–9 — and the label becomes a one-hot vector of that same length. A tensor always keeps the batch dimension first, so (64, 1, 28, 28) flattens to (64, 784) and feeds nn.Linear(784, 256) and nn.Linear(256, 10), while each dense layer costs in × out + out parameters.",
          },
        },
      ],
    },
  ],
  lab: "tensor-shape",
  code: {
    id: "module_09.py",
    title: {
      zh: "一批 MNIST 图像的形状与参数量",
      en: "Shapes and parameter counts for a batch of MNIST images",
    },
    intro: {
      zh: "先造一批 64 张 28 × 28 的灰度图，打印它的形状、阶和元素总数；展平成 (64, 784) 之后，再数一数 784 → 256 → 10 这两级 dense layer 各有多少参数。",
      en: "Build a batch of 64 grayscale 28 × 28 images and print its shape, rank, and element count; after flattening to (64, 784), count the parameters of a 784 → 256 → 10 pair of dense layers.",
    },
    source: `import numpy as np

# One batch of 64 grayscale images: (batch, channels, height, width).
batch = np.zeros((64, 1, 28, 28))
print(f"image batch: {batch.shape}  rank={batch.ndim}  size={batch.size}")

# A dense layer wants one row per sample, so each image becomes 784 numbers.
flat = batch.reshape(64, 784)
print(f"flattened:   {flat.shape}  rank={flat.ndim}  size={flat.size}")

# nn.Linear(784, 256) then nn.Linear(256, 10).
first = 784 * 256 + 256
second = 256 * 10 + 10
print(f"784 -> 256:  {first} parameters")
print(f"256 -> 10:   {second} parameters")
print(f"total:       {first + second} parameters")`,
    challenge: {
      zh: "把批量大小从 64 改成 128，先写下你猜的结果，再运行：哪几行会变，哪几行一动不动？",
      en: "Change the batch size from 64 to 128, write down your guess, then run it: which lines change, and which do not move at all?",
    },
    expectedOutput: `image batch: (64, 1, 28, 28)  rank=4  size=50176
flattened:   (64, 784)  rank=2  size=50176
784 -> 256:  200960 parameters
256 -> 10:   2570 parameters
total:       203530 parameters`,
    expectedNote: {
      zh: "三件事一次看清：(64, 1, 28, 28) 的阶是 4、元素总数 50,176；展平成 (64, 784) 之后阶变成 2，元素总数一个也没变——展平只是换写法，不增不减，而且批量维 64 从头到尾都在最前面。参数量与批量无关：784 × 256 + 256 = 200,960，256 × 10 + 10 = 2,570，两层合计 203,530，每一个数都对应 in × out + out 里那个容易被忘掉的偏置。把批量改成 128，只有前两行的 64 变成 128（元素总数翻倍成 100,352），三行参数量一动不动。",
      en: "Three things become visible at once: (64, 1, 28, 28) has rank 4 and 50,176 elements; after flattening to (64, 784) the rank drops to 2 and not a single element is added or lost — flattening is a change of spelling, and the batch dimension 64 stays in front the whole way. The parameter counts do not depend on the batch at all: 784 × 256 + 256 = 200,960, 256 × 10 + 10 = 2,570, and 203,530 for the two layers together, each number carrying the bias that in × out + out so easily forgets. With the batch set to 128 only the two 64s become 128s (the element count doubles to 100,352) and the three parameter lines do not move.",
    },
  },
  quiz: [
    {
      question: {
        zh: "讲义里那句 No links to nodes of same or previous layers 说的是什么？",
        en: "What does the lecture's line \"No links to nodes of same or previous layers\" state?",
      },
      options: {
        zh: [
          "同一层内部的节点之间没有连线，也不能连回上一层或更早的层",
          "每一层只能有一个节点",
          "输入层的节点不参与任何计算",
          "只有输出层可以连到隐藏层",
        ],
        en: [
          "There are no links between nodes of one layer, and none back to a previous or earlier layer",
          "Each layer may hold only one node",
          "The nodes of the input layer take no part in the computation",
          "Only the output layer may link to a hidden layer",
        ],
      },
      correct: 0,
      explanation: {
        zh: "连线只从一层指向它的下一层：同一层的节点互不相连，也不允许连回上一层，所以第 l 层只看第 l − 1 层的输出。正因为这样，一整层的计算才能写成一次矩阵乘法。",
        en: "Every link points from one layer to the next: nodes inside a layer are not connected to each other and nothing goes back, so layer l only reads the output of layer l − 1. That is exactly why a whole layer is a single matrix product.",
      },
    },
    {
      question: {
        zh: "识别手写数字 0–9 时，输出层和标签应该是什么形式？",
        en: "When recognising the handwritten digits 0–9, what form should the output layer and the label take?",
      },
      options: {
        zh: [
          "1 个输出节点，标签是 0–9 的整数",
          "10 个输出节点，标签是 10 维独热向量",
          "10 个输出节点，标签是 0–9 的整数",
          "9 个输出节点，标签是 9 维独热向量",
        ],
        en: [
          "1 output node, with the label an integer from 0 to 9",
          "10 output nodes, with the label a 10-dimensional one-hot vector",
          "10 output nodes, with the label an integer from 0 to 9",
          "9 output nodes, with the label a 9-dimensional one-hot vector",
        ],
      },
      correct: 1,
      explanation: {
        zh: "类别一共 10 个（0 到 9 各算一个），所以输出层要有 10 个节点，一个类别一个；标签也必须写成同样长度的独热向量，否则「9 比 1 大」这种并不存在的顺序会被当成信息来用。",
        en: "There are 10 classes, since 0 through 9 each count as one, so the output layer needs 10 nodes, one per class, and the label must be a one-hot vector of the same length; otherwise the non-existent order \"9 is bigger than 1\" is taken as information.",
      },
    },
    {
      question: {
        zh: "nn.Linear(784, 256) 有多少个参数？",
        en: "How many parameters does nn.Linear(784, 256) hold?",
      },
      options: {
        zh: [
          "784 × 256 + 256 = 200,960",
          "784 × 256 = 200,704",
          "784 + 256 = 1,040",
          "256 个偏置",
        ],
        en: [
          "784 × 256 + 256 = 200,960",
          "784 × 256 = 200,704",
          "784 + 256 = 1,040",
          "The 256 biases",
        ],
      },
      correct: 0,
      explanation: {
        zh: "每个输出节点都有一行 784 个权重，再加上它自己的一个偏置，所以是 784 × 256 + 256 = 200,960。只写 200,704 就是漏掉了偏置，这是最常见的少算；记住 in × out + out。",
        en: "Each output node owns a row of 784 weights plus one bias of its own, so the count is 784 × 256 + 256 = 200,960. Answering 200,704 drops the biases, which is the classic undercount; remember in × out + out.",
      },
    },
  ],
};

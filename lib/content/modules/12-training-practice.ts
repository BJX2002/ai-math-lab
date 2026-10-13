import type { CourseModule } from "../types";

export const trainingPractice: CourseModule = {
  slug: "training-practice",
  number: "12",
  track: "ai",
  durationMinutes: 55,
  level: { zh: "AI 实战", en: "AI practice" },
  title: {
    zh: "训练的实战：轮次、批次与 PyTorch",
    en: "Training in practice: epochs, batches, and PyTorch",
  },
  shortTitle: { zh: "训练实战", en: "Training in practice" },
  subtitle: {
    zh: "把数据切成批，把循环写成五行代码",
    en: "Cut the data into batches, write the loop in five lines",
  },
  description: {
    zh: "课程的最后一章，把前面所有零件装成一台会转的机器：轮次（epoch）与批次大小（batch size）怎么定、一个 epoch 里有多少次参数更新、DataLoader 为什么本质是一个生成器、PyTorch 五行训练循环的每一行在做什么、lr 就是 α、log-softmax 配 NLLLoss 为什么是交叉熵最稳的写法、model.train() 与 state_dict，以及不做归一化网络为什么学不起来。",
    en: "The last chapter of the course bolts every earlier part into a machine that turns: how to choose an epoch and a batch size, how many parameter updates one epoch contains, why a DataLoader is really a generator, what each of the five lines of a PyTorch training loop does, why lr is α, why log-softmax with NLLLoss is the numerically stable way to write cross entropy, model.train() and state_dict, and why a network tends to fail in learning without normalization.",
  },
  plainIdea: {
    zh: "训练不是一次把全部数据喂进去，而是一小批一小批地喂、一遍又一遍地喂：一遍叫一个轮次（epoch），一小批叫一个批次（batch）。",
    en: "Training does not feed the network the whole dataset at once. It feeds one small batch at a time, over and over: one pass is an epoch, one handful is a batch.",
  },
  analogy: {
    zh: "像背单词：不会等到整本单词书背完才检查一次，而是每次抓 20 个词过一遍（一个批次），500 个词全部过完算一轮（一个 epoch），然后第二轮、第三轮。每过一批就立刻纠错一次，这正是梯度下降的节奏。",
    en: "It is like learning vocabulary: you do not wait until the whole book has been read before testing yourself. You take 20 words at a time (a batch), finish all 500 words (an epoch), then go round again. Correcting yourself after every handful is exactly the rhythm of gradient descent.",
  },
  beforeMath: {
    zh: "先记住四个词：轮次（epoch）是整个数据集走一遍，批次大小（batch size）是一次取多少张图，迭代（iteration）是一次参数更新，而学习率 α 在代码里写作 lr。",
    en: "Four words are enough to begin: an epoch is one pass over the whole dataset, the batch size is how many images come out of the loader at a time, an iteration is one parameter update, and the learning rate α is spelled lr in code.",
  },
  aiConnection: {
    zh: "这一章写的就是你项目里要写的那段代码：读数据、做归一化、装进 DataLoader、选 E(W, b)、开 optim.SGD(lr)、循环 epochs，每轮看一次 E 有没有降。剩下的时间你都在调这几个数字。",
    en: "This chapter is the code your own project will contain: read the data, normalize it, wrap it in a DataLoader, choose E(W, b), start optim.SGD(lr), loop over epochs, and check once per epoch whether E is falling. The rest of your time goes on tuning these few numbers.",
  },
  outcomes: {
    zh: [
      "用自己的话说清轮次（epoch）与批次大小（batch size）",
      "算出 updates per epoch = ⌈m / B⌉，并说明为什么要向上取整",
      "写出并解释 PyTorch 五行训练循环的每一行",
      "说明 lr 就是 α，以及 log-softmax 配 NLLLoss 为什么数值稳定",
      "解释归一化前后 Error 曲面的形状变化，以及它为什么决定训练成败",
    ],
    en: [
      "Define an epoch and a batch size in your own words",
      "Compute updates per epoch = ⌈m / B⌉ and say why the ceiling is there",
      "Write and explain each of the five lines of a PyTorch training loop",
      "Say that lr is α, and why log-softmax with NLLLoss is numerically stable",
      "Explain how normalization changes the shape of the Error surface, and why that decides whether training works",
    ],
  },
  figure: "optimization",
  figureCaption: {
    zh: "还是那张 Error 曲面（error surface）：不做归一化时它是一条又窄又斜的山谷，归一化之后才接近一个圆碗。这一章讲的全是怎样在这张曲面上走得更稳。",
    en: "The same Error surface again: without normalization it is a narrow, slanted valley, and only after normalization does it come close to a round bowl. Everything in this chapter is a way of walking that surface more steadily.",
  },
  sections: [
    {
      label: { zh: "轮次", en: "EPOCH" },
      title: {
        zh: "轮次与批次：数据是怎么被喂进去的",
        en: "Epochs and batches: how the data is fed in",
      },
      blocks: [
        {
          kind: "prose",
          paragraphs: {
            zh: [
              "一次轮次（epoch）就是对整个数据集的一次完整处理：所有训练图片都被送进网络一次，无论中间被切成了多少批。课程里的原话是 a single processing of the entire dataset。",
              "批次大小（batch size）是一次迭代（iteration）里从数据加载器（DataLoader）取出的图片数量——the number of images we get from the data loader in one iteration。把批次大小记作 B，一个 epoch 里的参数更新次数就是数据量除以 B 再向上取整。",
              "为什么不一次把整个数据集送进网络？两个原因。一是对全部数据算一遍梯度太贵，而一个 epoch 只换来一次更新，参数挪得太慢；二是整份数据的梯度也未必装得进内存。切成小批以后，每一步只用手边这一小撮样本估一次梯度，一个 epoch 就能更新成百上千次，参数很快就走下去了。",
              "小批的梯度是带噪声的：它只看了一小撮样本，方向未必就是整个数据集最陡的方向。这点噪声反而是好事，它让下降的路线不那么死板，不容易卡在一个不好的地方。还要注意，每轮开始时数据通常会重新打乱（shuffle），所以两个 epoch 见到的批次组合并不一样。",
            ],
            en: [
              "An epoch is a single processing of the entire dataset: every training image is fed through the network once, no matter how many batches it was cut into along the way.",
              "The batch size is the number of images we get from the data loader in one iteration. Write the batch size as B, and the number of parameter updates inside one epoch is the dataset size divided by B, rounded up.",
              "Why not feed the whole dataset in at once? Two reasons. Computing one gradient over all of it is expensive while a whole epoch buys only a single update, so the parameters barely move; and the gradients for the entire dataset may not even fit in memory. Cut it into small batches and every step estimates the gradient from the handful of samples in hand, so one epoch contains hundreds of updates and the parameters travel a long way.",
              "A small batch gives a noisy gradient: it saw only a handful of samples, so its direction need not be the steepest direction for the whole dataset. That noise is useful — it keeps the descent from marching rigidly into a bad spot. Notice too that the data is normally shuffled again at the start of each epoch, so no two epochs see the same batch contents.",
            ],
          },
        },
        {
          kind: "formula",
          tex: String.raw`\text{updates per epoch} = \left\lceil \frac{m}{B} \right\rceil`,
          reveal: true,
          caption: {
            zh: "m 是数据集大小，B 是批次大小，⌈ ⌉ 表示向上取整（ceiling）：最后一批往往不满 B 张，但它照样算一次更新，所以小数不能丢。",
            en: "Here m is the dataset size, B is the batch size, and the ⌈ ⌉ brackets mean round up: the final batch is usually shorter than B, yet it still counts as one update, so the fraction cannot simply be dropped.",
          },
        },
        { kind: "lab", id: "epoch-batch" },
        {
          kind: "example",
          title: { zh: "MNIST 上的账：60000 张图，B = 64", en: "The arithmetic on MNIST: 60000 images, B = 64" },
          steps: {
            zh: [
              "数据集大小 m = 60000，批次大小 B = 64。",
              "一个 epoch 的更新次数：60000 / 64 = 937.5，向上取整是 938 次。最后一批只有 60000 − 937 × 64 = 32 张。",
              "epochs 先取 10：这是最常见的起步值，先看模型有没有在学，再决定加不加。",
              "参数一共被更新 10 × 938 = 9380 次。",
              "对比一下：若一次用全部 60000 张（B = 60000），10 个 epoch 只有 10 次更新，次数差了将近一千倍。",
            ],
            en: [
              "The dataset size is m = 60000 and the batch size is B = 64.",
              "Updates per epoch: 60000 / 64 = 937.5, which rounds up to 938. The last batch holds just 60000 − 937 × 64 = 32 images.",
              "Start with epochs = 10, the most common starting value: see whether the model is learning at all before adding more.",
              "The parameters are updated 10 × 938 = 9380 times in total.",
              "Compare that with using all 60000 images at once (B = 60000): ten epochs would contain only 10 updates, nearly a thousand times fewer.",
            ],
          },
          result: {
            zh: "B 决定一个 epoch 里有几次更新：B 越小，更新越频繁、每步越便宜、梯度越吵；B 越大，每步越贵、更新越少、方向越稳。常用的折中是 32、64、128。",
            en: "B decides how many updates an epoch contains: a smaller B updates more often, costs less per step, and is noisier; a larger B costs more per step, updates less often, and points more reliably. The usual compromise is 32, 64, or 128.",
          },
        },
        {
          kind: "predict",
          prompt: {
            zh: "数据集有 1000 张图片，批次大小 B = 64。一个 epoch 里参数更新多少次？",
            en: "A dataset holds 1000 images and the batch size is B = 64. How many parameter updates happen in one epoch?",
          },
          options: {
            zh: [
              "15 次：把小数直接丢掉",
              "16 次：最后一批只有 40 张，也算一次更新",
              "64 次：每一批更新 64 次",
            ],
            en: [
              "15 — drop the fraction",
              "16 — the final batch of 40 images still counts as one update",
              "64 — 64 updates, one per image in a batch",
            ],
          },
          answerIndex: 1,
          why: {
            zh: "1000 / 64 = 15.625。先有 15 个满批（960 张），剩下 40 张是第 16 批，它照样做一次前向、一次反向、一次更新，所以是 ⌈15.625⌉ = 16 次。丢掉小数就等于每轮漏掉最后 40 张图——它们一次也不会被训练到。",
            en: "1000 / 64 = 15.625. There are 15 full batches (960 images) and a 16th batch of 40 images, which still gets its own forward pass, backward pass, and update, so the count is ⌈15.625⌉ = 16. Dropping the fraction would silently skip the last 40 images — they would never be trained on at all.",
          },
        },
      ],
    },
    {
      label: { zh: "循环", en: "LOOP" },
      title: {
        zh: "五行代码：PyTorch 的训练循环",
        en: "Five lines: the PyTorch training loop",
      },
      blocks: [
        {
          kind: "prose",
          paragraphs: {
            zh: [
              "一次更新只用一小批样本去估梯度，这套做法叫小批量梯度下降（mini-batch gradient descent），也常被笼统地叫随机梯度下降（stochastic gradient descent, SGD）。两个极端也各有名字：批次大小等于整个数据集时是批量梯度下降（batch gradient descent），批次大小等于 1 时是最原始的随机梯度下降。三者的更新公式一模一样，区别只在于每一步用多少样本去估那个梯度。",
              "数据加载器（DataLoader）的本质是一个生成器（generator）：它不把数据一次交给你，而是你每要一次，它才递出一批图片和标签。所以 for 循环的循环体每次只处理一批，内存里永远只放着一批数据；把整个数据集要完，正好就是一个 epoch，下一轮 for 又从打乱后的数据重新开始。",
              "把这件事写成代码就是下面这五行，顺序不能换。",
            ],
            en: [
              "Estimating the gradient from one small batch is called mini-batch gradient descent, and it is often loosely called stochastic gradient descent (SGD). The two extremes have names too: a batch size equal to the whole dataset is batch gradient descent, and a batch size of 1 is the original stochastic gradient descent. All three use exactly the same update formula; they differ only in how many samples estimate the gradient at each step.",
              "A DataLoader is really a generator: it does not hand over the data in one go, but yields one batch of images and labels each time you ask it. The body of the for loop therefore handles a single batch, and only one batch is ever in memory; asking it for everything once is exactly one epoch, and the next for loop starts again over the reshuffled data.",
              "Written as code, the whole business is the five lines below, and their order cannot change.",
            ],
          },
        },
        {
          kind: "table",
          headers: { zh: ["代码行", "它做什么"], en: ["Line of code", "What it does"] },
          rows: {
            zh: [
              [
                "optimizer.zero_grad()",
                "把上一批留下的梯度清零。PyTorch 的梯度是累加的，不清零，这一批的梯度就会和上一批的混在一起。",
              ],
              [
                "y_hat = model(x)",
                "前向传播（forward pass）：把这一批图片送进网络，算出输出分数。",
              ],
              [
                "loss = criterion(y_hat, y)",
                "用这一批的预测和标签算出 Error。代码里这个变量习惯叫 loss，数学上它仍然是 E(W, b)。",
              ],
              [
                "loss.backward()",
                "反向传播（backpropagation）：从 Error 出发沿计算图往回走，求出每个参数的梯度 ∂E/∂W、∂E/∂b，存进参数的 .grad。",
              ],
              [
                "optimizer.step()",
                "真正改动参数：W ← W − α ∂E/∂W，b ← b − α ∂E/∂b。这是五行里唯一改权重的一行。",
              ],
            ],
            en: [
              [
                "optimizer.zero_grad()",
                "Clears the gradients left behind by the previous batch. PyTorch accumulates gradients, so without this the current batch is mixed together with the previous one.",
              ],
              [
                "y_hat = model(x)",
                "The forward pass: push this batch of images through the network to get its output scores.",
              ],
              [
                "loss = criterion(y_hat, y)",
                "Turns this batch's predictions and labels into the Error. The code convention calls that variable loss; mathematically it is still E(W, b).",
              ],
              [
                "loss.backward()",
                "Backpropagation: walk back along the computation graph from the Error and work out every parameter's gradient, ∂E/∂W and ∂E/∂b, storing it on the parameter's .grad.",
              ],
              [
                "optimizer.step()",
                "Actually changes the parameters: W ← W − α ∂E/∂W and b ← b − α ∂E/∂b. Of the five lines, this is the only one that touches a weight.",
              ],
            ],
          },
          caption: {
            zh: "背下这个顺序：清零、前向、算 Error、反向、更新。漏掉 backward()，梯度一直是 0，参数永远不动；漏掉 zero_grad()，梯度会悄悄累加，训练看起来还在动，其实每一步都拖着之前所有的历史。",
            en: "Memorise the order: zero, forward, compute the Error, backward, update. Leave out backward() and the gradients stay 0, so nothing ever moves; leave out zero_grad() and the gradients quietly accumulate, so training still looks alive while every step drags along all of its history.",
          },
        },
        {
          kind: "formula",
          tex: String.raw`E(W, b) = -\frac{1}{B} \sum_{i=1}^{B} \left[ y^{(i)} \ln \hat{y}^{(i)} + \left(1 - y^{(i)}\right) \ln\left(1 - \hat{y}^{(i)}\right) \right]`,
          reveal: true,
          caption: {
            zh: "这是一批 B 个样本上的 Error，也是 loss.backward() 真正去求导的那个数。注意求和上限是 B，不是整个数据集：每一批算出的 E(W, b) 只是整个数据集 Error 的一个带噪声估计。B 越小，估计越吵，每一步也越便宜。",
            en: "This is the Error over one batch of B samples, and it is the number loss.backward() actually differentiates. Note that the sum runs to B, not to the whole dataset: the E(W, b) of one batch is a noisy estimate of the Error over all the data. The smaller B is, the noisier that estimate and the cheaper each step.",
          },
        },
        {
          kind: "formula",
          tex: String.raw`W \leftarrow W - \alpha \frac{\partial E}{\partial W}, \qquad b \leftarrow b - \alpha \frac{\partial E}{\partial b}`,
          reveal: true,
          caption: {
            zh: "optimizer.step() 做的就是这个。前四行都只是在为这一行准备两个梯度：∂E/∂W 与 ∂E/∂b。学习率 α 决定这一步迈多大。",
            en: "This is what optimizer.step() does. The first four lines only prepare the two gradients this line needs, ∂E/∂W and ∂E/∂b. The learning rate α sets how far the step reaches.",
          },
        },
        {
          kind: "callout",
          tone: "warning",
          title: { zh: "梯度是累加的，所以每一批都要清零", en: "Gradients accumulate, so clear them every batch" },
          body: {
            zh: "zero_grad() 必须写在循环里面，因为 PyTorch 的梯度是累加的：backward() 把新算出来的梯度加到 .grad 上，而不是覆盖它。一个 epoch 里调用几次 backward()，就要调用几次 zero_grad()。自己写训练循环时最经典的错误就是漏掉这一行——Error 先是显得降得很慢，然后突然爆炸。",
            en: "zero_grad() has to sit inside the loop because PyTorch accumulates gradients: backward() adds the newly computed gradients onto .grad instead of overwriting them. The loop needs exactly as many zero_grad() calls as backward() calls. The classic mistake when writing a custom training loop is to forget that line: the Error first seems to fall slowly and then explodes.",
          },
        },
      ],
    },
    {
      label: { zh: "代码", en: "CODE" },
      title: {
        zh: "lr 就是 α：优化器、log-softmax 与 NLLLoss",
        en: "lr is α: the optimizer, log-softmax, and NLLLoss",
      },
      blocks: [
        {
          kind: "prose",
          paragraphs: {
            zh: [
              "优化器（optimizer）负责第 5 行。课程里写的是 optim.SGD(model.parameters(), lr=0.003)：model.parameters() 告诉它有哪些 W 和 b 要更新，而 lr 就是数学里的学习率 α——同一个东西的两个名字，数学里写 α，代码里写 lr。0.003 是课程在 MNIST 例子里用的值，偏小、稳，但要跑很多轮才看得出效果。",
              "损失函数（criterion）负责第 3 行。网络的最后一层给出的通常不是概率，而是一排未归一化的分数，叫 logits。要把它们变成概率需要 softmax，而要算交叉熵还需要取自然对数。",
              "在多分类的例子里，课程用的是 nn.LogSoftmax() 接 nn.NLLLoss()：log-softmax 先把 logits 变成对数概率，NLLLoss（负对数似然，negative log-likelihood）再取相反数求平均。这两步合起来就是交叉熵。",
            ],
            en: [
              "The optimizer owns line 5. The course writes optim.SGD(model.parameters(), lr=0.003): model.parameters() tells it which W and b to update, and lr is the learning rate α from the mathematics — two names for one thing, α in the maths and lr in the code. The value 0.003 is the one the course uses in its MNIST example; it is on the small side, so training is steady but needs many epochs to show.",
              "The criterion owns line 3. The last layer of a network usually outputs not probabilities but a row of unnormalised scores, called logits. Turning them into probabilities needs a softmax, and computing cross entropy also needs a natural logarithm.",
              "For the multiclass examples the course uses nn.LogSoftmax() followed by nn.NLLLoss(): log-softmax turns the logits into log-probabilities, and NLLLoss (negative log-likelihood) negates and averages them. Put those two steps together and you have cross entropy.",
            ],
          },
        },
        {
          kind: "formula",
          tex: String.raw`\ln \hat{y}_y = z_y - \max_k z_k - \ln \sum_{j=1}^{K} e^{\,z_j - \max_k z_k}`,
          reveal: true,
          caption: {
            zh: "log-softmax 内部做的事：每一行先减去这一行里最大的分数，再取指数、求和、取对数。减掉最大值不改变 softmax 的结果，却保证指数永远不大于 0——这就是它数值稳定的全部秘密。",
            en: "What log-softmax does inside: for each row it first subtracts the largest score in that row, then exponentiates, sums, and takes the logarithm. Subtracting the maximum changes nothing about the softmax result, but it guarantees the exponent is never positive — that is the whole secret of its numerical stability.",
          },
        },
        {
          kind: "formula",
          tex: String.raw`E(W, b) = -\ln \hat{p}_y, \qquad \hat{p}_y = \frac{e^{\,z_y}}{\sum_{j=1}^{K} e^{\,z_j}}`,
          reveal: true,
          caption: {
            zh: "交叉熵就是正确类别的对数概率取负号：模型给正确答案的概率是 1 时 E(W, b) = 0，给得越小 E(W, b) 越大。这里 z_y 是正确类别的分数，K 是类别个数。",
            en: "Cross entropy is the negative log-probability the model gives the correct class: when that probability is 1, E(W, b) = 0, and the smaller it becomes the larger E(W, b) is. Here z_y is the score of the correct class and K is the number of classes.",
          },
        },
        {
          kind: "callout",
          tone: "warning",
          title: { zh: "不要先 softmax 再取自然对数", en: "Do not take a softmax and then a logarithm" },
          body: {
            zh: "先算 softmax 再取对数、分两步写，是数值上最危险的写法：softmax 可能给出一个小到被浮点数存成 0 的概率，而 ln 0 是负无穷，反向传播一路乘下去，梯度就成了 NaN，训练从此不动。nn.LogSoftmax 把取指数、求和、取对数合成一步，用 log-sum-exp（对数求和指数）算完，真正的 0 永远不会先出现。还要记住 nn.NLLLoss() 期望的输入是对数概率，不是概率：把 softmax 的输出喂给它，Error 会算得毫无意义，而且它不会报错。",
            en: "Computing a softmax and then its logarithm, as two separate steps, is the most dangerous spelling numerically: the softmax can return a probability so small that a float stores it as 0, and ln 0 is minus infinity, which propagates through backpropagation until the gradients are NaN and training stops dead. nn.LogSoftmax combines exponentiate, sum, and logarithm into one log-sum-exp step, so a true 0 never appears. Remember too that nn.NLLLoss() expects log-probabilities, not probabilities: feed it the output of a softmax and the Error becomes meaningless, without any error message.",
          },
        },
        {
          kind: "example",
          title: { zh: "手算一遍：三个类别的 log-softmax", en: "By hand: log-softmax for three classes" },
          steps: {
            zh: [
              "网络输出三个类别的分数（logits）：z = [2.0, 1.0, 0.1]，正确答案是第 0 类。",
              "先减去这一行的最大值 2.0：z − 2.0 = [0.0, −1.0, −1.9]。这一步只为了让指数不溢出，softmax 的结果一点不变。",
              "取指数并求和：e⁰ = 1.0000，e^(−1.0) = 0.3679，e^(−1.9) = 0.1496，和是 1.5174。",
              "正确类别的对数概率：ln p̂_y = 0.0 − ln 1.5174 = −0.4170。",
              "Error 取相反数：E(W, b) = 0.4170。三类乱猜的 Error 是 ln 3 ≈ 1.0986，所以这个模型已经比乱猜好不少。",
            ],
            en: [
              "The network outputs three class scores (logits): z = [2.0, 1.0, 0.1], and the correct class is class 0.",
              "Subtract the largest score in the row, 2.0: z − 2.0 = [0.0, −1.0, −1.9]. This only keeps the exponentials from overflowing; the softmax result is unchanged.",
              "Exponentiate and add: e⁰ = 1.0000, e^(−1.0) = 0.3679, e^(−1.9) = 0.1496, summing to 1.5174.",
              "The log-probability of the correct class: ln p̂_y = 0.0 − ln 1.5174 = −0.4170.",
              "The Error is its negative: E(W, b) = 0.4170. Guessing blindly among three classes would give ln 3 ≈ 1.0986, so this model is already well ahead of a guess.",
            ],
          },
          result: {
            zh: "换一批图片，数字会变，公式不变：正确类别的分数越高，E(W, b) 越小。在 PyTorch 里这一整套由 nn.LogSoftmax(dim=1) 与 nn.NLLLoss() 两行完成，你不需要自己写 exp 或 ln；dim=1 表示沿着类别那一维做，因为第 0 维是批次。",
            en: "Change the batch and the numbers change while the formula does not: the higher the score of the correct class, the smaller E(W, b). In PyTorch the whole thing is two lines, nn.LogSoftmax(dim=1) and nn.NLLLoss(), and you never write exp or ln yourself; dim=1 says to work along the class dimension, because dimension 0 is the batch.",
          },
        },
        {
          kind: "prose",
          paragraphs: {
            zh: [
              "训练模式和评估模式是两件不同的事。model.train() 把网络切到训练模式，model.eval() 切到评估模式：dropout（随机丢弃）在训练时随机关掉一部分神经元，评估时必须全部打开；批归一化（batch normalization）在两种模式下用不同的统计量。训练循环开始前写一次 model.train()，验证或测试前写一次 model.eval()，评估时再用 torch.no_grad() 关掉梯度记录——评估只是在读数，不需要反向传播，白白记录计算图只会吃内存。",
              "训练完还要把参数存下来。torch.save(model.state_dict(), \"model.pt\") 存的是一个字典，里面是每一层的权重和偏置张量，而不是整个模型对象；下次用 model.load_state_dict(torch.load(\"model.pt\")) 原样装回去。存 state_dict 更稳，因为它只依赖定义网络的代码，不依赖类的完整路径，改个文件名或挪个目录都不会突然加载失败。",
            ],
            en: [
              "Training mode and evaluation mode are two different things. model.train() puts the network into training mode and model.eval() into evaluation mode: dropout randomly switches neurons off during training and must switch all of them on for evaluation, while batch normalization uses different statistics in the two modes. Call model.train() once before the training loop and model.eval() before validation or testing, and while evaluating wrap the work in torch.no_grad() to switch off gradient tracking — evaluation only reads numbers and never runs backpropagation, so recording a computation graph for it just wastes memory.",
              "When training finishes, save the parameters. torch.save(model.state_dict(), \"model.pt\") writes a dictionary of the weight and bias tensors of every layer rather than the whole model object, and model.load_state_dict(torch.load(\"model.pt\")) loads them straight back. Saving the state_dict is the sturdier habit, because it depends only on the code that defines the network and not on a class's full path; rename a file or move a folder and it will not suddenly refuse to load.",
            ],
          },
        },
      ],
    },
    {
      label: { zh: "归一化", en: "NORMALIZATION" },
      title: {
        zh: "不做归一化，网络往往会学不起来",
        en: "Without normalization the network tends to fail in learning",
      },
      blocks: [
        {
          kind: "prose",
          paragraphs: {
            zh: [
              "归一化（normalization）就是逐列重新缩放输入：先减去这一列的均值 μ，再除以这一列的标准差 σ。图片更常见的第一步是除以 255，把像素压到 0 到 1 之间。做完之后每个特征的均值是 0、标准差是 1，谁也不比谁大几十倍。",
              "课程在这里给了一句很重的警告：without normalization, the network will tend to fail in learning——不做归一化，网络往往会学不起来。想看懂这句话，得回到 Error 曲面的形状上。",
              "两个特征的尺度相差很大时，E(W, b) 的等高线不再是一个圆碗，而是一条又窄又斜的山谷。在谷里，梯度几乎全部指向谷壁：陡的那个方向梯度大得吓人，下降一步就冲到对面壁上，再冲回来；而缓的那个方向梯度很小，沿着谷底几乎不动。于是一步一步在两壁之间横跳，看着很忙，其实一直没有走到谷底。",
              "学习率也跟着遭殃：能用的 α 上限由最陡的那个方向决定，也就是由最大的那个二次系数决定。两个特征的尺度差 100 倍，系数就差 10000 倍，能用的 α 就小了 10000 倍。为了不震荡，你只好把 α 调到极小，于是本来就慢的那个方向变成了几乎不动。归一化把两个方向拉回同一个尺度，曲面重新接近圆碗，梯度方向指向谷底，同一个 α 就能又快又稳地走下去。",
            ],
            en: [
              "Normalization rescales each input column: subtract that column's mean μ, then divide by its standard deviation σ. With images the usual first step is simply dividing by 255 to squeeze the pixels into 0 to 1. Afterwards every feature has mean 0 and standard deviation 1, and none of them is tens of times larger than another.",
              "The course gives a blunt warning here: without normalization, the network will tend to fail in learning. To see why, go back to the shape of the Error surface.",
              "When two features differ wildly in scale, the level curves of E(W, b) are no longer a round bowl but a narrow, slanted valley. Inside it the gradient points almost entirely at the walls: along the steep direction it is enormous, so one step shoots across to the opposite wall and back again, while along the shallow direction it is tiny and the step barely moves down the valley floor. The run hops between the two walls, looking busy while never reaching the bottom.",
              "The learning rate suffers too: the largest usable α is set by the steepest direction, which is to say by the largest quadratic coefficient. Let two features differ in scale by a factor of 100 and the coefficients differ by 10000, so the usable α shrinks by 10000. To avoid oscillation you must pick a tiny α, and the direction that was already slow along the valley floor effectively stops. Normalization pulls both directions onto the same scale, the surface comes back towards a round bowl, the gradient points down the valley, and one α can then descend quickly and steadily.",
            ],
          },
        },
        {
          kind: "formula",
          tex: String.raw`x' = \frac{x - \mu}{\sigma}`,
          reveal: true,
          caption: {
            zh: "逐个特征做：μ 是这一列的平均值，σ 是这一列的标准差。做完之后这一列均值是 0、标准差是 1。若某一列几乎不变，σ 接近 0，除之前要先加一个很小的数保护一下。",
            en: "Applied feature by feature: μ is the mean of that column and σ its standard deviation. Afterwards the column has mean 0 and standard deviation 1. If a column barely varies, σ is close to 0, so add a very small number before dividing.",
          },
        },
        {
          kind: "formula",
          tex: String.raw`E(W, b) = a_x \left(W - W^{\star}\right)^2 + a_y \left(b - b^{\star}\right)^2`,
          reveal: true,
          caption: {
            zh: "把曲面在最优点附近写成这个样子最容易看清：a_x 与 a_y 由两个输入特征的尺度决定。两个系数一样大时等高线是圆；差得越多，等高线越扁、山谷越窄、训练越难。",
            en: "Written near the optimum, the surface looks like this: a_x and a_y are set by the scales of the two input features. When the two coefficients are equal the level curves are circles; the more they differ, the flatter the ellipses, the narrower the valley, and the harder training becomes.",
          },
        },
        { kind: "lab", id: "normalization" },
        {
          kind: "callout",
          tone: "takeaway",
          title: { zh: "顺序不能颠倒：先归一化，再调 α", en: "The order matters: normalize first, tune α second" },
          body: {
            zh: "如果顺序反了，你会用一个为了迁就陡方向而压得极小的 α 去训练，然后误以为「模型学不动」。先归一化，再挑学习率，同样的 α 会表现出完全不同的效果。归一化是唯一一步做了没坏处、不做多半出事的预处理，所以把它当成训练流程的第一步写死。",
            en: "Get the order wrong and you will train with an α squashed tiny to accommodate the steep direction, then conclude that the model refuses to learn. Normalize first and choose the learning rate second, and the same α behaves completely differently. Normalization is the one preprocessing step that never hurts and usually decides the outcome, so hard-wire it as the first step of the pipeline.",
          },
        },
      ],
    },
    {
      label: { zh: "接下来", en: "NEXT" },
      title: {
        zh: "你的项目，就从这一章开始",
        en: "Your own project starts from here",
      },
      blocks: [
        {
          kind: "prose",
          paragraphs: {
            zh: [
              "到这里，你已经把一台完整的机器拆开又装回去了：向量与矩阵是形状，线性系统与最小二乘是求解，优化是下坡的方式，感知机与激活函数是神经元，E(W, b) 衡量错得多厉害，反向传播是求梯度的办法，而这一章是让它们真的转起来的节奏——批次、轮次、优化器、归一化。",
              "你自己的项目就是把上面的东西按顺序拼起来：读数据、逐列归一化、装进 DataLoader（定好 batch size 与 shuffle）、搭网络、选 E(W, b) 和它的 criterion、开 optim.SGD(lr)、循环 epochs 并每轮打印一次 E，训练完 model.eval() 再保存 state_dict。第一次跑不通时，九成的时间会花在四件小事上：忘了 zero_grad()、忘了归一化、学习率太大、train 与 eval 用错。",
              "所以不要一上来就追求更好的模型。先用最小的网络，把 E(W, b) 每个 epoch 都打印出来，看它是不是在稳稳地降。只要这条曲线在降，剩下的都是调参和换结构；如果它不降，回头检查上面那四件事，比换一个更大的网络有用得多。",
            ],
            en: [
              "By now you have taken a complete machine apart and put it back together: vectors and matrices are the shapes, linear systems and least squares are how we solve, optimization is how we walk downhill, the perceptron and the activations are the neuron, E(W, b) measures how wrong the model is, backpropagation finds the gradients, and this chapter is the rhythm that makes all of it turn — batches, epochs, the optimizer, and normalization.",
              "Your own project is those pieces in order: read the data, normalize every column, wrap it in a DataLoader (choose the batch size and shuffle), build the network, pick E(W, b) and its criterion, start optim.SGD(lr), loop over epochs printing E once per epoch, then call model.eval() and save the state_dict when training ends. The first time it refuses to work, nine tenths of your time will go on four small things: a missing zero_grad(), a missing normalization, a learning rate that is too large, and train used where eval was meant.",
              "So do not chase a better model first. Start with the smallest network, print E(W, b) every epoch, and watch whether it falls steadily. While that curve falls, everything else is tuning and architecture; if it does not fall, checking those four things will help far more than a bigger network would.",
            ],
          },
        },
        {
          kind: "table",
          headers: { zh: ["旋钮", "常见起步值", "它影响什么"], en: ["Dial", "Typical starting value", "What it changes"] },
          rows: {
            zh: [
              ["批次大小 B", "32 / 64 / 128", "一个 epoch 里有几次更新，以及每步梯度的噪声大小"],
              ["轮次 epochs", "10", "整个数据集被看几遍：太少欠拟合，太多会过拟合"],
              ["学习率 lr（就是 α）", "0.003", "每步走多大：太大震荡甚至发散，太小慢到看不出来"],
              ["输入归一化", "永远要做", "Error 曲面的形状：圆碗还是窄谷"],
            ],
            en: [
              ["Batch size B", "32 / 64 / 128", "How many updates an epoch contains, and how noisy each step's gradient is"],
              ["Epochs", "10", "How many times the whole dataset is seen: too few underfits, too many overfits"],
              ["Learning rate lr (that is α)", "0.003", "How big each step is: too large oscillates or diverges, too small is invisible"],
              ["Input normalization", "Always", "The shape of the Error surface: a round bowl or a narrow valley"],
            ],
          },
          caption: {
            zh: "把这张表抄在项目 notebook 的第一页：四个旋钮里，归一化是开关，另外三个是刻度。",
            en: "Copy this table onto the first page of your project notebook: of the four dials, normalization is a switch and the other three are graduations.",
          },
        },
        {
          kind: "callout",
          tone: "takeaway",
          title: { zh: "最后一句话", en: "One last sentence" },
          body: {
            zh: "训练的全部内容就是：把数据切成小批，一批一批地估梯度，按 α 走一步；走完一遍叫一个 epoch，走十遍看看 Error 降了没有。你在项目里写的每一行，都是这一句话的展开。",
            en: "All of training is this: cut the data into small batches, estimate the gradient batch by batch, take one step of size α, call one full pass an epoch, and go round ten times to see whether the Error fell. Every line you write in your own project is that sentence spelled out.",
          },
        },
      ],
    },
  ],
  lab: "training-curve",
  code: {
    id: "module_12.py",
    title: { zh: "用 NumPy 模拟一次小批量训练", en: "Simulate a mini-batch training run with NumPy" },
    intro: {
      zh: "没有 torch 也能看清训练的节奏：50 个二维样本，批次大小 B = 8，跑 10 轮（epoch），每处理一批就更新一次 W 和 b，只在第 0、1、2、5、10 轮打印 E(W, b)。",
      en: "No torch needed to see the rhythm of training: 50 two-dimensional samples, batch size B = 8, ten epochs, one update of W and b per batch, with E(W, b) printed at epochs 0, 1, 2, 5, and 10.",
    },
    source: `import numpy as np

rng = np.random.default_rng(0)

# A tiny dataset: 50 points in 2D, two classes split by the line x1 + x2 = 0.
m = 50
X = rng.normal(size=(m, 2))
y = (X[:, 0] + X[:, 1] > 0).astype(float)

B = 8                         # batch size: how many images per iteration
updates = -(-m // B)          # ceil(m / B)
print(f"dataset size m = {m}, batch size B = {B}")
print(f"updates per epoch = ceil({m} / {B}) = {updates}")

def error(W, b):
    """E(W, b): cross entropy of the sigmoid model over the whole dataset."""
    p = 1.0 / (1.0 + np.exp(-(X @ W + b)))
    p = np.clip(p, 1e-12, 1.0 - 1e-12)
    return -np.mean(y * np.log(p) + (1.0 - y) * np.log(1.0 - p))

W = np.zeros(2)
b = 0.0
alpha = 0.5
epochs = 10

print(f"epoch  0: E(W, b) = {error(W, b):.4f}")

for epoch in range(1, epochs + 1):
    for start in range(0, m, B):          # the data loader hands over one batch
        xb, yb = X[start:start + B], y[start:start + B]
        p = 1.0 / (1.0 + np.exp(-(xb @ W + b)))
        gW = xb.T @ (p - yb) / len(yb)    # dE/dW for this batch
        gb = np.mean(p - yb)              # dE/db for this batch
        W -= alpha * gW                   # W <- W - alpha dE/dW
        b -= alpha * gb                   # b <- b - alpha dE/db
    if epoch in (1, 2, 5, 10):
        print(f"epoch {epoch:2d}: E(W, b) = {error(W, b):.4f}")`,
    challenge: {
      zh: "把 B 从 8 改成 16：一个 epoch 还剩几次更新？先写下你的猜测再运行。顺便看看第 10 轮的 E(W, b) 是更大还是更小——批次变大，梯度更稳，但一个 epoch 的步数更少了。",
      en: "Change B from 8 to 16: how many updates does an epoch have left? Guess before you run it. Then look at E(W, b) at epoch 10 — is it larger or smaller? A bigger batch gives a steadier gradient, but an epoch contains fewer steps.",
    },
    expectedOutput:
      "dataset size m = 50, batch size B = 8\nupdates per epoch = ceil(50 / 8) = 7\nepoch  0: E(W, b) = 0.6931\nepoch  1: E(W, b) = 0.3776\nepoch  2: E(W, b) = 0.2935\nepoch  5: E(W, b) = 0.2067\nepoch 10: E(W, b) = 0.1573",
    expectedNote: {
      zh: "先看前两行：50 张图、批次大小 8，⌈50 / 8⌉ = 7 次更新，最后一批只有 2 张（50 = 6 × 8 + 2），但它照样算一次。再看 E(W, b)：0.6931 正是 W = 0、b = 0 时二分类乱猜的值 ln 2，十轮、70 次更新之后降到 0.1573——这就是你在项目里想看到的那条下降曲线。注意每一步的梯度只来自 8 张图，而打印出来的 E 是在整个数据集上算的，这就是小批量梯度下降：用一小撮样本的噪声，换更多次更新。",
      en: "Start with the first two lines: 50 images, batch size 8, and ⌈50 / 8⌉ = 7 updates, the last batch holding just 2 images (50 = 6 × 8 + 2) yet still counting as one. Then watch E(W, b): 0.6931 is exactly ln 2, the value of blind guessing in two classes at W = 0 and b = 0, and after 70 updates in ten epochs it has fallen to 0.1573 — the falling curve you want to see in your own project. Notice that each step's gradient came from only 8 images while the E being printed is measured over the whole dataset: that is mini-batch gradient descent, trading a handful of samples' worth of noise for many more updates.",
    },
  },
  quiz: [
    {
      question: {
        zh: "轮次（epoch）的确切含义是什么？",
        en: "What exactly is an epoch?",
      },
      options: {
        zh: ["对整个数据集的一次完整处理", "一次参数更新", "一个批次里的图片数量"],
        en: [
          "A single processing of the entire dataset",
          "One parameter update",
          "The number of images in one batch",
        ],
      },
      correct: 0,
      explanation: {
        zh: "课程的定义就是 a single processing of the entire dataset：所有训练样本都被处理一遍，不管中间分了多少批。一次参数更新叫一次迭代（iteration），一个批次里的图片数量叫批次大小（batch size）。三个词很容易混，考试常考。",
        en: "The definition is a single processing of the entire dataset: every training sample is processed once, however many batches that took. One parameter update is an iteration, and the number of images in a batch is the batch size. The three words are easy to mix up, and exams like them.",
      },
    },
    {
      question: {
        zh: "训练时为什么不一次把整个数据集送进网络？",
        en: "Why not feed the entire dataset into the network in one go?",
      },
      options: {
        zh: [
          "算一遍全部数据的梯度太贵，而且一个 epoch 只换来一次更新",
          "因为 DataLoader 只肯接受小批次的数据",
          "因为批次越大，梯度就一定是错的",
        ],
        en: [
          "One gradient over all the data is expensive, and a whole epoch would buy only one update",
          "Because a DataLoader only accepts small batches",
          "Because a larger batch always gives a wrong gradient",
        ],
      },
      correct: 0,
      explanation: {
        zh: "整份数据的梯度又贵又占内存，而且一个 epoch 只更新一次，参数挪得太慢。切成小批之后，一个 epoch 有 m / B 次更新，每步便宜得多；梯度虽然带噪声，方向大体上仍然是对的，噪声还能让下降不那么死板。批次大小等于整个数据集的做法也有名字，叫批量梯度下降（batch gradient descent）。",
        en: "A gradient over everything is expensive and memory-hungry, and an epoch would contain a single update, so the parameters barely travel. Cut into batches and one epoch holds m / B updates, each far cheaper; the gradient is noisy but broadly right, and the noise keeps the descent from marching rigidly. Using the whole dataset as one batch has a name too: batch gradient descent.",
      },
    },
    {
      question: {
        zh: "在 PyTorch 里，交叉熵数值上最稳的写法是哪一个？",
        en: "In PyTorch, which spelling of cross entropy is the numerically stable one?",
      },
      options: {
        zh: [
          "先 softmax 再取自然对数，分两步写",
          "nn.LogSoftmax() 接 nn.NLLLoss()",
          "把分数直接送进 nn.MSELoss()",
        ],
        en: [
          "softmax first and the natural logarithm second, as two steps",
          "nn.LogSoftmax() followed by nn.NLLLoss()",
          "send the scores straight into nn.MSELoss()",
        ],
      },
      correct: 1,
      explanation: {
        zh: "先 softmax 再取对数，概率可能小到被浮点数存成 0，而 ln 0 是负无穷，反向传播下去梯度就成了 NaN。nn.LogSoftmax 用 log-sum-exp 一步算出对数概率，nn.NLLLoss 再取相反数求平均，合起来正是交叉熵；注意 NLLLoss 要的是对数概率，不是概率。",
        en: "Softmax first and the logarithm second can produce a probability so small that a float stores it as 0, and ln 0 is minus infinity, which turns the gradients into NaN. nn.LogSoftmax computes the log-probabilities in one log-sum-exp step and nn.NLLLoss negates and averages them, which together are exactly cross entropy; note that NLLLoss wants log-probabilities, not probabilities.",
      },
    },
  ],
};

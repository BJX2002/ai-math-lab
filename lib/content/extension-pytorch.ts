import type { Localized } from "../i18n/localized";

/**
 * The PyTorch extension track.
 *
 * Lecture 8's hands-on half: the five things that stand between the five-line
 * training loop of module 12 and a run that actually works. The reader has
 * finished all twelve modules, so nothing here is new mathematics — each topic
 * is a new *practice*, and the page is written in the order the work happens:
 * prepare the input, standardise it, reuse a backbone, put everything on one
 * device, then save the result.
 *
 * PyTorch is not installed in this environment and the site's code cells run
 * NumPy only, so the steps below describe the API and say what each call does.
 * They are not transcripts of a run, and no program output is quoted anywhere
 * in this file.
 *
 * Notation follows the rest of the course: the loss is E(W, b), the learning
 * rate is α in mathematics and lr in code.
 */

export type ExtensionTopic = {
  id: string;
  title: Localized<string>;
  why: Localized<string>;
  body: Localized<string[]>;
  formula?: string;
  example?: Localized<string[]>;
};

export const PYTORCH_EXTENSION: {
  copy: Localized<{
    title: string;
    description: string;
    eyebrow: string;
    heading: string;
    intro: string;
    topicsHeading: string;
    ctaLabel: string;
  }>;
  topics: ExtensionTopic[];
} = {
  copy: {
    zh: {
      title: "拓展 · PyTorch 实战：让训练真的跑起来",
      description:
        "讲义第 8 讲的动手部分：数据增强、归一化、迁移学习、设备与保存。每一节先说清为什么必须做，再给一段能直接抄进项目的写法。",
      eyebrow: "拓展轨道 · 第 8 讲",
      heading: "让模型真的学起来的，是这五件事。",
      intro:
        "这是给走完十二个模块的读者的一条可选路线。模块 12 那个五行训练循环，在真机上跑起来之前还要过五道关：输入要随机地变（数据增强）、要被标准化（归一化）、小数据集最好借一个已经训练好的主干（迁移学习）、模型和数据必须住在同一块设备上（设备）、训练完还要存得下来装得回去（保存与加载）。每一节都先讲它为什么必须做，再给一段可以直接抄进项目的写法。这一页的代码片段是 API 说明，不是运行记录：本站的代码单元只跑 NumPy，环境里没有安装 PyTorch，所以这里说的是「这样写」，具体的结果请在你自己的环境里跑一遍。",
      topicsHeading: "五个主题",
      ctaLabel: "回到模块 12，把五行训练循环再逐行读一遍",
    },
    en: {
      title: "Extensions · PyTorch in practice: making the training run",
      description:
        "Lecture 8's hands-on half: data augmentation, normalization, transfer learning, devices and saving. Each topic says why the step is necessary, then gives a spelling you can copy.",
      eyebrow: "Extension track · Lecture 8",
      heading: "Five things decide whether the model actually learns.",
      intro:
        "An optional track for a reader who has finished all twelve modules. Before the five-line training loop from module 12 runs on a real machine, it has to pass five gates: the input has to vary at random (data augmentation), it has to be standardised (normalization), a small dataset is better off borrowing a backbone that is already trained (transfer learning), the model and the data have to sit on the same device (devices), and the result has to be saved and reloaded (saving and loading). Each topic says why the step is necessary and then gives a spelling you can copy into your own project. The snippets here describe the API rather than record a run: the code cells on this site execute NumPy only and PyTorch is not installed in this environment, so read them as \"write it this way\" and run them yourself.",
      topicsHeading: "Five topics",
      ctaLabel: "Back to module 12 — read the five-line training loop once more",
    },
  },
  topics: [
    {
      id: "data-augmentation",
      title: {
        zh: "数据增强：把随机性加进输入本身",
        en: "Data augmentation: put randomness into the input itself",
      },
      why: {
        zh: "讲义把这件事放在「怎么让模型泛化」的第一位，原话是 introduce randomness into the input data itself——在输入数据本身上引入随机性。同一张图每次都以不同的样子出现，模型就没法靠记住像素的精确排布来降低 E(W, b)，只能去学那些变换之下不变的性质。",
        en: "The lecture puts this first among the ways to make a model generalise, in the words introduce randomness into the input data itself. Show the model the same image looking different every time and it can no longer drive E(W, b) down by memorising pixel arrangements; it has to learn what survives the transforms.",
      },
      body: {
        zh: [
          "数据增强（data augmentation）要做的事，讲义用一句话就说完了：在输入数据本身上引入随机性。训练时每读一张图片，先随机地做一次变换，再把变换后的版本送进网络，标签原封不动地跟着走。网络看到的是变换后的 x̃ = T(x)，而不是原来那张 x。",
          "最常用的四种变换是旋转（rotation）、镜像（mirroring）、缩放（scaling）和裁剪（cropping）。在 torchvision 里它们各自是一个类：transforms.RandomRotation、transforms.RandomHorizontalFlip、transforms.RandomResizedCrop、transforms.RandomAffine。每调用一次就重新抽一组随机参数——旋转角在给定范围里随机取，裁剪窗口的位置和大小也是随机的——所以同一张图两轮之间几乎不会重样。",
          "它为什么能提升泛化（generalization）？因为模型很容易走一条捷径：不去学「这是不是一只猫」，而是记住训练集里像素的精确排布——第 37 行第 12 列那个亮点出现过，就投一票。这种记忆能把训练集上的 E(W, b) 压得非常低，换一批新图片立刻崩掉。随机变换把这条捷径堵死：同一个物体每次出现时像素排布都不一样，于是在所有变换下都保持不变的性质，才是唯一值得学的东西。换个说法，有效的训练分布（effective training distribution）被放大了——你手上还是 m 张图，模型见到的却是接近无穷多个版本。",
          "两个边界要记住。第一，变换必须让标签依然成立：水平镜像对自然照片几乎总是安全的，但对数字「6」和「9」、对文字识别、对左右并不对称的医学影像，它会把正确答案改掉，等于主动教模型学错。第二，随机增强只加在训练集上；验证集与测试集只做确定性的缩放与归一化，否则每次评估的数字都不一样，你无法判断模型是不是真的变好了。还要有一点心理准备：加了增强之后，训练集上的 E(W, b) 会降得更慢、最终也更高，这是正常的——你用它换来的是验证集上的提升。",
        ],
        en: [
          "Data augmentation is summed up by the lecture in one line: introduce randomness into the input data itself. Each time an image is read during training, a random transform is applied first and the transformed version goes into the network, with its label carried along unchanged. What the network sees is x̃ = T(x) rather than the original x.",
          "The four commonest transforms are rotation, mirroring, scaling and cropping. In torchvision each one is a class: transforms.RandomRotation, transforms.RandomHorizontalFlip, transforms.RandomResizedCrop, transforms.RandomAffine. Every call draws a fresh set of random parameters — the angle from the given range, the crop window's position and size — so the same image rarely comes out the same way twice.",
          "Why does it improve generalization? Because a model will happily take a shortcut: instead of learning \"is this a cat\", it memorises the exact arrangement of pixels in the training set — a bright spot at row 37, column 12 once voted for cat, so it votes again. That memory drives E(W, b) very low on the training set and collapses on new images. Random transforms block the shortcut: the same object never appears twice with the same pixel arrangement, so the only property that survives every transform is the one worth learning. Put another way, the effective training distribution gets larger — you still hold m images, but the model meets something close to infinitely many versions of them.",
          "Two boundaries are worth holding on to. First, a transform has to leave the label true: a horizontal flip is almost always safe for natural photographs, but for the digits 6 and 9, for text, or for medical images where left and right are not symmetric, it can silently change the right answer and teach the model something false. Second, random augmentation belongs to the training set alone; validation and test sets get deterministic resizing and normalization, or every evaluation returns a different number and you cannot tell whether the model improved. Expect as well that with augmentation the training E(W, b) falls more slowly and settles higher — that is the trade, and what you buy with it is the validation number.",
        ],
      },
      formula: String.raw`\tilde{x} = T(x), \qquad T \sim \mathcal{T}_{\text{aug}}`,
      example: {
        zh: [
          "训练用的那条链写成一个 transforms.Compose：里面依次放 transforms.RandomRotation(degrees=15)、transforms.RandomHorizontalFlip()、transforms.RandomResizedCrop(size=224, scale=(0.8, 1.0))，最后接 transforms.ToTensor()。Compose 只负责把几个变换按顺序串起来，之后每读一张图就按这个顺序全部走一遍。",
          "验证集和测试集另写一条链，只放确定性的变换（transforms.Resize、transforms.CenterCrop、transforms.ToTensor），一条随机变换也不要。两条链的区别，就是「训练时看见的世界」和「评估时看见的世界」的区别。",
          "用 datasets.ImageFolder(root=..., transform=train_tf) 读训练数据：它按子目录名生成标签，一个子目录一个类别，不需要另写标签文件；验证集同样用 ImageFolder，只是指向另一个目录、传另一条链。",
          "把训练集交给 DataLoader 时打开 shuffle=True。增强是在读取样本的那一刻现做的，所以每个 epoch 都会重新抽一次随机参数：第 2 轮见到的图和第 1 轮的不一样，这正是「有效的训练分布被放大」在代码里的样子。",
        ],
        en: [
          "Write the training chain as one transforms.Compose: transforms.RandomRotation(degrees=15), then transforms.RandomHorizontalFlip(), then transforms.RandomResizedCrop(size=224, scale=(0.8, 1.0)), finishing with transforms.ToTensor(). Compose does nothing but chain several transforms together in order, and every image read afterwards goes through the whole chain.",
          "Give validation and test sets a second chain holding only deterministic transforms — transforms.Resize, transforms.CenterCrop, transforms.ToTensor — and no random transform at all. The difference between the two chains is the difference between the world seen while training and the world seen while evaluating.",
          "Read the training data with datasets.ImageFolder(root=..., transform=train_tf): it takes the label from the subdirectory name, one directory per class, so no separate label file is needed. The validation set uses ImageFolder too, pointed at another directory with the other chain.",
          "Ask the DataLoader for shuffle=True on the training set. The augmentation is applied at the moment a sample is read, so fresh random parameters are drawn every epoch: round 2 does not see the same images as round 1, which is what \"a larger effective training distribution\" looks like in code.",
        ],
      },
    },
    {
      id: "normalization",
      title: {
        zh: "归一化：不做它，网络往往会学不起来",
        en: "Normalization: without it the network tends to fail in learning",
      },
      why: {
        zh: "讲义在这里的警告很重：without normalization, the network will tend to fail in learning。它也是唯一一步「做了没坏处、不做多半出事」的预处理；面对预训练模型，它更是一条硬性要求——必须用与训练时完全相同的均值与标准差。",
        en: "The lecture's warning here is blunt: without normalization, the network will tend to fail in learning. It is also the one preprocessing step that never hurts and usually decides the outcome — and with a pretrained model it becomes a hard requirement: the same mean and standard deviation it was trained on.",
      },
      body: {
        zh: [
          "归一化（normalization）逐通道地把输入重新缩放：先减去这一通道的均值 μ，再除以这一通道的标准差 σ。图片通常还多一步：transforms.ToTensor() 先把 0–255 的整数像素除以 255 压到 0 到 1 之间，所以后面用到的 μ 与 σ 都是在这个尺度上给出的。做完之后每个通道的均值是 0、标准差是 1，三个通道谁也不比谁大几十倍。",
          "为什么不做就会「学不起来」？回到模块 12 那张 Error 曲面：输入的尺度相差很大时，E(W, b) 的等高线不再是一个圆碗，而是一条又窄又斜的山谷。谷里梯度几乎全部指向谷壁——陡的那个方向梯度大得吓人，缓的那个方向梯度小得可怜——而能用的 α 上限由最陡方向决定。为了不震荡，你只好把学习率压到极小，本来就慢的方向于是彻底不动了。归一化把各个通道拉回同一个尺度，曲面重新接近圆碗，同一个 lr 就能又快又稳地走下去。",
          "预训练模型还带来一组具体的常数。在 ImageNet 上训练过的模型（讲义用的 DenseNet-121 就是其中之一）按 RGB 三个通道分别处理：均值 mean = [0.485, 0.456, 0.406]，标准差 std = [0.229, 0.224, 0.225]。这六个数不是随手挑的，它们是 ImageNet 全部训练图片逐通道统计出来的结果——第 0 个通道（红）的平均亮度是 0.485、波动是 0.229，以此类推。transforms.Normalize(mean=..., std=...) 做的正是按通道把它们减掉、除掉。",
          "为什么必须和训练时一模一样？因为这些权重是在「输入已经被这样标准化过」的前提下学出来的：第一层的每个权重都对应一个减掉 0.485、除掉 0.229 之后的红通道值。你喂进没归一化的图，等于把第一层收到的加权和整体平移、放大，后面每一层都在处理一个它从没见过的分布，微调就变成了在错误的输入上调整。这不像忘记 shuffle 那样只是慢一点，它足以让一个在 ImageNet 上准确率很高的主干退到接近乱猜。自己从零训练时也一样：用训练集算出的逐通道 mean 与 std（不要用验证集，也不要只统计一张图），并且训练、验证、推理三处永远共用同一组常数。",
        ],
        en: [
          "Normalization rescales the input channel by channel: subtract that channel's mean μ, then divide by its standard deviation σ. Images usually need one step first: transforms.ToTensor() divides the 0–255 integer pixels by 255 to squeeze them into 0 to 1, and that is the scale the μ and σ values quoted here are measured on. Afterwards every channel has mean 0 and standard deviation 1, and no channel is tens of times larger than another.",
          "Why does skipping it make learning fail? Go back to the Error surface from module 12: when the input channels differ wildly in scale, the level curves of E(W, b) are no longer a round bowl but a narrow, slanted valley. Inside it the gradient points almost entirely at the walls — enormous along the steep direction, tiny along the shallow one — and the largest usable α is set by the steepest direction. To stop the run oscillating you squash the learning rate down to something tiny, and the direction that was already slow stops moving altogether. Normalization pulls the channels back onto one scale, the surface returns towards a round bowl, and a single lr then descends quickly and steadily.",
          "A pretrained model adds a specific set of constants. A model trained on ImageNet — DenseNet-121, the lecture's backbone, is one — works channel by channel over RGB with mean = [0.485, 0.456, 0.406] and std = [0.229, 0.224, 0.225]. Those six numbers were not chosen by hand: they are the per-channel statistics of the whole ImageNet training set — channel 0 (red) averages 0.485 with a spread of 0.229, and so on. transforms.Normalize(mean=..., std=...) is the call that subtracts and divides by exactly those numbers, channel by channel.",
          "Why must it match training exactly? Because those weights were learned under the assumption that the input had already been standardised this way: every weight in the first layer corresponds to a red-channel value with 0.485 already subtracted and 0.229 already divided out. Feed it an unnormalised image and the weighted sums arriving at the first layer are shifted and stretched, so every layer after that is processing a distribution it has never seen; fine-tuning then means adjusting to the wrong input. This is not like forgetting to shuffle, which only makes the run slower — it is enough to drop a backbone with a high ImageNet accuracy back towards guessing. Training from scratch is no different: compute the per-channel mean and std from the training set (not from the validation set, and not from a single image), and share that one set of constants across training, validation and inference.",
        ],
      },
      formula: String.raw`x'_c = \frac{x_c - \mu_c}{\sigma_c}, \qquad \mu = (0.485,\; 0.456,\; 0.406), \qquad \sigma = (0.229,\; 0.224,\; 0.225)`,
      example: {
        zh: [
          "把 transforms.ToTensor() 排在 transforms.Normalize() 前面：ToTensor 一次做两件事——把像素从 0–255 缩到 0–1，并把形状从 HWC 排成 CHW；而 Normalize 正是沿着通道那一维去对齐三个数的，顺序反了就会对错维度。",
          "归一化那一步写成 transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])，两组数都按 R、G、B 的顺序给出，对应 ImageNet 训练时统计出来的六个值。",
          "把它同时加进训练链和验证链的两条 transforms.Compose 里，位置都在 ToTensor() 之后。归一化是确定性的，训练与评估必须做同一遍——这一点和数据增强正好相反。",
          "整条链写完大致是 Compose([Resize, CenterCrop, ToTensor, Normalize])。送进网络时，nn.Conv2d 或 nn.Linear 收到的是已经减过均值、除过标准差的张量，而不是 0–255 的原始像素；这就是那句「不做就会学不起来」在代码里的落点。",
        ],
        en: [
          "Put transforms.ToTensor() before transforms.Normalize() in the chain: ToTensor does two jobs at once — it scales pixels from 0–255 to 0–1 and reorders the shape from HWC to CHW — and Normalize aligns its three numbers along the channel dimension, so reversing the order normalises the wrong axis.",
          "Write the normalising step as transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]), both triples given in R, G, B order and matching the six values ImageNet training produced.",
          "Add it to both transforms.Compose chains, the training one and the validation one, in each case after ToTensor(). Normalization is deterministic, so training and evaluation must apply the identical step — the exact opposite of data augmentation.",
          "The finished chain is roughly Compose([Resize, CenterCrop, ToTensor, Normalize]). By the time a batch reaches the network, nn.Conv2d or nn.Linear is receiving tensors with the mean already subtracted and the standard deviation already divided out, not raw 0–255 pixels; that is where the warning about failing to learn lands in code.",
        ],
      },
    },
    {
      id: "transfer-learning",
      title: {
        zh: "迁移学习：借一个已经看过 ImageNet 的主干",
        en: "Transfer learning: borrow a backbone that has already seen ImageNet",
      },
      why: {
        zh: "在几百到几千张图的小数据集上从零训练，等于让模型在几百万个参数里瞎猜。ImageNet 教给网络的边缘、纹理、形状是通用的，借过来只需要训练最后一层——讲义用的主干是 DenseNet-121。",
        en: "Training from scratch on a few hundred or a few thousand images means guessing among millions of parameters. The edges, textures and shapes ImageNet teaches are general, so borrowing them leaves only the last layer to train — and the lecture's backbone is DenseNet-121.",
      },
      body: {
        zh: [
          "迁移学习（transfer learning）的想法很直接：一个在 ImageNet 上训练过的网络（约 120 万张图、1000 个类别）已经把「图像长什么样」这件事学得很透——靠前的层看边缘和色块，中间的层看纹理和部件，越靠后越针对具体类别。前面那些层学到的东西，对你的猫狗分类、零件缺陷检测几乎同样有用；真正只对 ImageNet 有用的，是最后那一层分类器。",
          "做法因此分两步。第一步，冻结主干（backbone）：对它的每一个参数写 requires_grad = False，告诉 PyTorch 不必为它们记录梯度，反向传播走到这里就停。第二步，换掉分类头（classifier head）：DenseNet-121 原来那一层是 nn.Linear(in_features=1024, out_features=1000)，其中 1024 是主干吐出来的特征维数，1000 是 ImageNet 的类别数；把你的类别数记作 K，换成 nn.Linear(in_features=1024, out_features=K)，新层的参数默认 requires_grad = True。",
          "之后只训练这个新的头。它的参数量是 1024 × K + K——K = 10 时不过一万多个，而整个 DenseNet-121 有七八百万个。要更新的参数少了两三个数量级，所以它收敛得快、不容易过拟合，几百张图就能看出效果；而且 lr（数学里的 α）可以取得比微调整个网络时大一些，因为这一层是从随机初始化开始的，没有什么需要小心保护的东西。",
          "什么时候它比从零训练好？小数据集。样本量远小于参数量时，从零训练的网络会把训练集背下来，验证集上的表现不升反降；冻结主干等于把「怎样从像素看出形状」这件事外包出去，你只学最后那一小步映射。数据量很大（几十万张以上）并且与 ImageNet 差得很远时，这个优势会变小，那时可以考虑解冻最后几个 block 一起微调（fine-tuning），或者干脆从头训练。还有一个实践上的细节：如果批次很小，或者你的图片与 ImageNet 差别比较大，通常会把主干里的批归一化（batch normalization）层固定在评估模式，免得用几个样本的统计量去改动预训练时累积下来的 running mean 与 running variance。",
        ],
        en: [
          "Transfer learning starts from a simple observation: a network trained on ImageNet — about 1.2 million images over 1000 classes — has already learned a great deal about what images look like. The early layers see edges and colour patches, the middle ones see textures and parts, and only the last layers are specific to the classes. What the early layers know is nearly as useful for your cats-and-dogs classifier or your defective-part detector; the part that is only good for ImageNet is the final classifier.",
          "So the work splits in two. First, freeze the backbone: set requires_grad = False on every one of its parameters, which tells PyTorch not to record gradients for them, so backpropagation stops there. Second, replace the classifier head: DenseNet-121's original head is nn.Linear(in_features=1024, out_features=1000), where 1024 is the feature width the backbone hands over and 1000 is ImageNet's class count. Call your own number of classes K and use nn.Linear(in_features=1024, out_features=K); the parameters of this new layer keep requires_grad = True by default.",
          "From then on only the new head is trained. Its parameter count is 1024 × K + K — for K = 10 barely more than ten thousand, against the seven or eight million in DenseNet-121 as a whole. Two or three orders of magnitude fewer parameters have to move, so it converges quickly, resists overfitting, and shows results from a few hundred images; and lr (the α of the mathematics) can be set larger than when fine-tuning a whole network, because this layer starts from a random initialisation and there is nothing in it that needs protecting.",
          "When is this better than training from scratch? On small datasets. When the number of samples is far below the number of parameters, a network trained from scratch memorises the training set and gets worse on validation; freezing the backbone outsources \"how to see shape in pixels\" and leaves you only the last small mapping to learn. With plenty of data — hundreds of thousands of images, and a domain far from ImageNet — that advantage shrinks, and unfreezing the last few blocks to fine-tune, or training from scratch, becomes worth considering. One practical detail: with a small batch size, or images quite different from ImageNet, the backbone's batch normalization layers are often pinned to evaluation mode so that a handful of samples cannot overwrite the running mean and running variance accumulated during pretraining.",
        ],
      },
      formula: String.raw`z = W_{\text{head}}\, h + b_{\text{head}}, \qquad \frac{\partial E}{\partial W_{\text{backbone}}} = 0`,
      example: {
        zh: [
          "取主干：torchvision.models.densenet121(weights=DenseNet121_Weights.IMAGENET1K_V1)（旧写法是 pretrained=True），它会连同在 ImageNet 上训练好的权重一起下载下来。",
          "冻结：for param in model.parameters(): param.requires_grad = False。此后这些参数的 .grad 一直是 None，backward() 不会为它们保存梯度，optimizer.step() 也就无从改动它们。",
          "换头：model.classifier = nn.Linear(in_features=1024, out_features=K)，K 换成你自己的类别数（3 类就写 3）。原来那个 nn.Linear(1024, 1000) 是为 ImageNet 的 1000 类准备的，你的任务用不上；替换之后，新层的参数默认 requires_grad = True。",
          "把带梯度的参数交给优化器：optim.SGD(filter(lambda p: p.requires_grad, model.parameters()), lr=0.001)。filter 不是必需的（冻结的参数本来也拿不到梯度），但它把「谁会被训练」写在了代码里；接着照常写那五行训练循环。",
        ],
        en: [
          "Take the backbone: torchvision.models.densenet121(weights=DenseNet121_Weights.IMAGENET1K_V1), the older spelling of which is pretrained=True. It arrives with the weights learned on ImageNet.",
          "Freeze it: for param in model.parameters(): param.requires_grad = False. From then on those parameters keep .grad as None, backward() stores no gradient for them, and optimizer.step() has nothing to change.",
          "Replace the head: model.classifier = nn.Linear(in_features=1024, out_features=K), with K set to your own number of classes (3 classes, so 3). The original nn.Linear(1024, 1000) was built for ImageNet's 1000 classes and is no use for your task; the new layer's parameters have requires_grad = True by default.",
          "Hand the optimiser only the parameters that carry gradients: optim.SGD(filter(lambda p: p.requires_grad, model.parameters()), lr=0.001). The filter is not compulsory — frozen parameters never receive a gradient anyway — but it puts \"what is being trained\" into the code; then write the five-line training loop as usual.",
        ],
      },
    },
    {
      id: "gpu-and-devices",
      title: {
        zh: "设备：模型和数据必须住在同一块设备上",
        en: "Devices: the model and its data have to live on the same device",
      },
      why: {
        zh: "GPU 能把训练从几小时压到几分钟，代价是每个张量都多出一个属性：它住在哪块设备上。漏掉这一步的报错只在运行时出现，而且它不会悄悄变慢，它会直接停下来。",
        en: "A GPU turns hours of training into minutes, at the price of one extra property on every tensor: which device it lives on. Miss the step and the failure appears only at runtime — and it does not quietly slow down, it stops.",
      },
      body: {
        zh: [
          "张量（tensor）除了形状和数据类型，还有一个属性：它住在哪块设备上。默认是 CPU（torch.device(\"cpu\")），torch.device(\"cuda\") 则指第一块 NVIDIA GPU。最常见的写法是先选一次设备，之后到处复用这个名字：device = torch.device(\"cuda\" if torch.cuda.is_available() else \"cpu\")。这样同一份代码在实验室的 GPU 机器和你的笔记本上都能跑，差别只是快慢。",
          "搬运用 .to(device)。模型这边写 model.to(device)：它把所有参数和缓冲（buffer）原地搬到 GPU 上，并返回模型自己，所以习惯写成 model = model.to(device)——其实原地那次搬家已经完成了。张量那边写 xb.to(device)，它返回一个住在目标设备上的新张量。在本来就是 CPU 的机器上，.to(\"cpu\") 什么也不做，所以这一个写法在两种机器上都成立，不必维护两个版本。",
          "最经典的错误是：模型搬到了 GPU，而 DataLoader 交出来的批次还在 CPU 上。矩阵乘法要求两个操作数在同一块设备上，CPU 张量与 GPU 张量放在一起不是「慢一点」，而是直接抛 RuntimeError（常见提示是 Expected all tensors to be on the same device）。这是硬错误（hard error），不是静默的性能问题。这其实是件好事：如果它只是悄悄变慢，你会以为是模型本身慢，然后花一整天去调一个根本不存在的问题。",
          "所以搬运的位置是固定的：模型在循环外搬一次，每一批数据在循环体内、送进模型之前搬一次。DataLoader 每次交出来的都是新建的 CPU 张量，所以这一行必须写在循环里面；写在循环外，只有第一批会被搬过去。还有一处和保存有关：在 GPU 上训练出来的模型直接 torch.save 会带上设备信息，换到没有 GPU 的机器上要用 torch.load(path, map_location=torch.device(\"cpu\"))，或者保存前先 .to(\"cpu\")，否则加载时会因为找不到 cuda 而失败。",
        ],
        en: [
          "Besides its shape and its data type, a tensor has one more property: the device it lives on. The default is the CPU (torch.device(\"cpu\")) and torch.device(\"cuda\") names the first NVIDIA GPU. The usual spelling picks the device once and reuses the name everywhere: device = torch.device(\"cuda\" if torch.cuda.is_available() else \"cpu\"). The same script then runs on a lab machine with a GPU and on your laptop, differing only in speed.",
          "Moving happens with .to(device). On the model side write model.to(device): it moves every parameter and buffer onto the GPU in place and returns the model itself, which is why the idiom is written model = model.to(device) — the move has already happened in place. On the tensor side write xb.to(device), which returns a new tensor that lives on the target device. On a machine that is already CPU-only, .to(\"cpu\") is a no-op, so this one spelling works on both kinds of machine and you never maintain two versions.",
          "The classic mistake is this: the model has been moved to the GPU while the batches coming out of the DataLoader are still on the CPU. A matrix product needs both operands on the same device, so a CPU tensor meeting a GPU tensor is not \"a bit slower\" — it raises a RuntimeError (the familiar message is Expected all tensors to be on the same device). That is a hard error rather than a silent performance problem, and it is a kindness: if the mismatch merely slowed things down, you would conclude that the model was slow and spend a day tuning a problem that does not exist.",
          "So the moves have fixed places: the model is moved once outside the loop, and every batch is moved inside the loop, before it reaches the model. Each pass of a DataLoader builds fresh CPU tensors, so that line has to sit inside the loop; put it outside and only the first batch ever travels. One more move concerns saving: a model trained on a GPU and saved with torch.save carries its device information, so on a machine without a GPU load it with torch.load(path, map_location=torch.device(\"cpu\")), or call .to(\"cpu\") before saving — otherwise loading fails because cuda cannot be found.",
        ],
      },
      formula: String.raw`y = W x + b \qquad \text{defined only when} \quad \mathrm{device}(W) = \mathrm{device}(x) = \mathrm{device}(b)`,
      example: {
        zh: [
          "先选设备：device = torch.device(\"cuda\" if torch.cuda.is_available() else \"cpu\")。把这一行放在脚本开头，后面每一处都引用同一个 device 变量，就不会出现「模型按 cuda 写、数据按 cpu 写」这种不一致。",
          "搬模型：model = model.to(device)，只做一次，放在训练循环之前。循环里再搬一次模型没有意义，只会白白浪费时间。",
          "搬数据：在 for xb, yb in loader 的循环体第一行写 xb, yb = xb.to(device), yb.to(device)，然后才是 y_hat = model(xb)。顺序反过来就会撞上那个 RuntimeError。",
          "想在代码里确认，可以比较 next(model.parameters()).device 与 xb.device；训练结束保存之前先 model.to(\"cpu\")，或者加载时用 map_location，这样存下来的权重在任何机器上都能读。",
        ],
        en: [
          "Choose the device first: device = torch.device(\"cuda\" if torch.cuda.is_available() else \"cpu\"). Put that line at the top of the script and refer to the same device variable everywhere below, and the mismatch between a model written for cuda and data written for cpu cannot arise.",
          "Move the model: model = model.to(device), once, before the training loop. Moving it again inside the loop accomplishes nothing and only wastes time.",
          "Move the data: make the first line of the for xb, yb in loader body xb, yb = xb.to(device), yb.to(device), and only then y_hat = model(xb). Reverse the order and that RuntimeError is waiting for you.",
          "To check it in code, compare next(model.parameters()).device with xb.device; and before saving at the end of training call model.to(\"cpu\"), or load with map_location, so the stored weights can be read on any machine.",
        ],
      },
    },
    {
      id: "saving-and-loading",
      title: {
        zh: "保存与加载：存参数，而不是存整个模型对象",
        en: "Saving and loading: store the parameters, not the whole model object",
      },
      why: {
        zh: "几个小时的训练结果必须能存下来、能在另一台机器上装回去。存错东西的代价是那几个小时白跑，而且往往在真正需要它的时候才发现。",
        en: "Hours of training have to survive being written to disk and loaded again on another machine. Store the wrong thing and those hours are gone — usually discovered at the moment you need them.",
      },
      body: {
        zh: [
          "state_dict 是一个字典：键是每一层参数的名字（字符串），值是对应的张量。torch.save(model.state_dict(), \"model.pt\") 存下来的就是这个字典。要留意它里面没有任何关于网络结构的信息——不含层与层怎么连接，也不含你自己写的那个类的名字，它只是一份「名字 → 张量」的清单。",
          "为什么不直接存整个模型对象？因为 torch.save(model, ...) 走的是 pickle，它把「这个对象属于哪个模块里的哪个类」一并写进文件。加载时 Python 必须能 import 到那个一模一样的类定义：改个文件名、挪个目录、把 Net 改名成 Classifier，加载就会失败，报的错甚至和保存时毫无关系。state_dict 只依赖名字和形状，所以只要有能构造出同样结构的代码，参数就能装回去——这也是官方文档推荐存 state_dict 的原因。",
          "加载的标准写法是两步，顺序不能换：先构造模型（model = Net()），再 model.load_state_dict(torch.load(\"model.pt\", map_location=torch.device(\"cpu\")))。构造这一步省不掉，因为文件里没有结构；map_location 则是为了在没有 GPU 的机器上也能读 GPU 上存出来的权重。load_state_dict 按名字和形状逐个匹配，strict=True（默认）时凡有多出来或缺失的键都会直接报错——这通常不是坏事，它说明你改过网络结构，参数和结构已经对不上了。",
          "最后是评估。加载回来准备用的时候要先 model.eval()：dropout 在训练时随机关掉一部分神经元，评估时必须全部打开；批归一化在两种模式下用的统计量也不一样——训练模式用当前这一批算出的 mean 与 variance，顺便更新累积的 running 值，评估模式则直接用训练时累积下来的 running mean 与 running variance。所以忘记 model.eval() 会让同一份参数给出不同、而且通常更差的预测：不是权重变了，而是网络的行为模式变了。再套一层 torch.no_grad() 关掉计算图记录，评估会更快也更省内存；但要分清两者的分工——影响数值的是 eval()，no_grad() 只管开销。",
        ],
        en: [
          "A state_dict is a dictionary: the keys are the names of each layer's parameters (strings) and the values are the tensors. torch.save(model.state_dict(), \"model.pt\") writes exactly that dictionary. Notice what it does not contain: nothing about the network's structure, nothing about how the layers are wired, and not the name of the class you wrote. It is a list of name-to-tensor entries and nothing more.",
          "Why not save the whole model object instead? Because torch.save(model, ...) goes through pickle, which writes down which class in which module the object belongs to. Loading then requires Python to import that exact class definition: rename the file, move the directory, rename Net to Classifier, and loading fails — sometimes with an error that has nothing to do with saving. A state_dict depends only on names and shapes, so any code that can build the same structure can take the parameters back, which is why the documentation recommends saving the state_dict.",
          "Loading takes two steps and their order cannot change: build the model first (model = Net()), then model.load_state_dict(torch.load(\"model.pt\", map_location=torch.device(\"cpu\"))). The construction cannot be skipped, because the file holds no structure; map_location is there so weights saved on a GPU can be read on a machine without one. load_state_dict matches name by name and shape by shape, and with strict=True (the default) any extra or missing key is an outright error — which is usually good news: it tells you the structure changed and the parameters no longer line up with it.",
          "Last comes evaluation. Before using a loaded model, call model.eval(): dropout randomly switches off a fraction of neurons during training and must switch all of them on for evaluation, and batch normalization uses different statistics in the two modes — training mode takes the mean and variance of the current batch and updates the running values on the way, while evaluation mode uses the running mean and running variance accumulated during training. So forgetting model.eval() makes the same parameters produce different, usually worse, predictions: the weights did not change, the network's behaviour did. Wrapping the work in torch.no_grad() as well switches off graph recording, which makes evaluation faster and lighter on memory; keep the two roles apart — eval() changes the numbers, no_grad() only changes the overhead.",
        ],
      },
      formula: String.raw`\text{state\_dict} : \texttt{classifier.weight} \mapsto W, \qquad \texttt{classifier.bias} \mapsto b`,
      example: {
        zh: [
          "训练结束后保存参数：torch.save(model.state_dict(), \"model.pt\")。想以后接着训练，就把优化器一起存：torch.save({\"model\": model.state_dict(), \"optimizer\": optimizer.state_dict()}, \"checkpoint.pt\")，因为动量、步数这些状态也在它的 state_dict 里。",
          "加载时先构造结构，再装参数：model = Net()，然后 model.load_state_dict(torch.load(\"model.pt\", map_location=\"cpu\"))。顺序颠倒（先构造错的结构、或者换过头再加载）就会得到键不匹配的报错。",
          "评估前调用 model.eval()，并把读数放进 with torch.no_grad(): 里。eval() 会改变 dropout 与批归一化的行为，必须在读数之前调用；要继续训练，就在循环开始前再写一次 model.train() 切回来。",
          "要恢复训练，还要 optimizer.load_state_dict(...) 把优化器状态装回去，否则动量从零开始，前几个 step 与保存前接不上。模型和优化器都按名字匹配，所以两边的结构都必须与保存时一致。",
        ],
        en: [
          "When training ends, save the parameters: torch.save(model.state_dict(), \"model.pt\"). To carry on training later, save the optimiser alongside them: torch.save({\"model\": model.state_dict(), \"optimizer\": optimizer.state_dict()}, \"checkpoint.pt\") — momentum and step counts live in its state_dict too.",
          "To load, build the structure first and put the parameters in second: model = Net(), then model.load_state_dict(torch.load(\"model.pt\", map_location=\"cpu\")). Reverse the order — build the wrong structure, or swap the head before loading — and you get missing and unexpected keys.",
          "Call model.eval() before evaluating and put the readings inside with torch.no_grad():. eval() changes how dropout and batch normalization behave, so it has to come before you read any number; to train again, write model.train() once before the loop to switch back.",
          "To resume training, also restore the optimiser with optimizer.load_state_dict(...), or momentum restarts from zero and the first few steps do not continue where the saved run left off. Both the model and the optimiser match by name, so both structures have to be identical to the ones that were saved.",
        ],
      },
    },
  ],
};

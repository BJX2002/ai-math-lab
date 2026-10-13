import type { Localized } from "../i18n/localized";

/**
 * The capstone: the assessed project and the exam.
 *
 * Every figure, weighting and criterion on this page is copied from the course's
 * own Project Specification and Exam Practice documents, so the reader is
 * preparing for the real thing rather than for a plausible-sounding version of
 * it. Where the source documents contradict themselves, that is stated rather
 * than quietly corrected.
 */

export type MarkRow = {
  item: Localized<string>;
  description: Localized<string>;
  marks: number;
  /** Which modules give the reader the material this criterion is asking for. */
  modules: string;
};

export type ExamQuestion = {
  title: Localized<string>;
  prompt: Localized<string>;
  /** The working, step by step, so the method is visible and not just the answer. */
  working: Localized<string[]>;
  answer: string;
  caution?: Localized<string>;
};

export const PROJECT_WEIGHTING: Localized<string[]> = {
  zh: [
    "小组项目占总成绩的 35%：其中小组展示 10%，个人论文 25%，两部分紧密相关。",
    "小组最多 4 人，每位成员都必须有实质贡献。",
    "这是一份提案，不是实现——课程原文写明「Implementation is not mandatory in this project」。",
  ],
  en: [
    "The group project is 35% of the overall grade: 10% for the group presentation and 25% for the individual essay, and the two are closely related.",
    "Groups are up to 4 members, and every member must contribute substantially.",
    "It is a proposal, not an implementation — the specification says outright that implementation is not mandatory.",
  ],
};

export const PRESENTATION: Localized<{ minutes: string; brief: string; points: string[] }> = {
  zh: {
    minutes: "20 分钟，不计更长",
    brief: "提出一个新的、基于神经网络的产品或服务想法，并做 20 分钟展示。",
    points: [
      "找出一个现存问题，讨论它的不足，或者神经网络能带来的改进空间。",
      "应该用哪些神经网络应用（图像识别、语音识别、自然语言处理等）来解决它，以及怎么用？",
      "分析你的产品对用户和各相关方（组织、社会等）的好处、局限和潜在伦理问题。",
      "写出全部参考文献并在幻灯片里引用（APA、MLA、IEEE 等格式均可）。",
    ],
  },
  en: {
    minutes: "20 minutes, no longer",
    brief: "Propose a new idea for a neural-network-based product or service and present it in 20 minutes.",
    points: [
      "Identify an existing problem and discuss its shortcomings, or the room for improvement neural networks could address.",
      "Which neural network applications (image recognition, speech recognition, natural language processing, or others) should address it, and how?",
      "Analyse the benefits and limitations of your product for users and affected parties — organisations, society — and discuss potential ethical issues.",
      "Write down all references and cite them on your slides. APA, MLA or IEEE are all acceptable.",
    ],
  },
};

export const ESSAY: Localized<{ brief: string; points: string[] }> = {
  zh: {
    brief:
      "约 750 字英文（不含参考文献）。每位成员分析一个与小组提案相关的「已有」神经网络产品——同一个或类似的问题，或者同一种神经网络应用——并且每人必须选不同的产品。",
    points: [
      "描述你选的产品解决了什么问题。",
      "描述它是怎么解决的。",
      "解释其中涉及的神经网络应用的细节——鼓励给出更多技术细节。",
      "分析它的好处、可能造成的问题，以及从不同角度看它的局限。",
      "写出全部参考文献并在文中引用。",
    ],
  },
  en: {
    brief:
      "About 750 words in English, excluding references. Each member analyses an existing neural-network product related to the group's proposal — the same or a similar problem, or the same kind of application — and each member must choose a different product.",
    points: [
      "Describe the problem your chosen product solves.",
      "Describe how it solves it.",
      "Explain the details of the neural network applications involved; more technical detail is encouraged.",
      "Analyse the benefits, the problems it may cause, and its limitations from different perspectives.",
      "Write down all references and cite them in the essay.",
    ],
  },
};

export const PRESENTATION_MARKS: MarkRow[] = [
  {
    item: { zh: "引言", en: "Introduction" },
    description: {
      zh: "描述你找到的现存问题。听完展示后，同学必须知道那是什么问题。",
      en: "Describe the existing problem you identified. Your classmates must know what it is after hearing you.",
    },
    marks: 15,
    modules: "01–06",
  },
  {
    item: { zh: "机会", en: "Opportunity" },
    description: {
      zh: "描述你的神经网络产品如何解决这个问题。",
      en: "Describe how your neural-network product solves this problem.",
    },
    marks: 15,
    modules: "07",
  },
  {
    item: { zh: "技术", en: "Technology" },
    description: {
      zh: "解释其中神经网络应用的细节。要让同学明白它们「怎么工作」，而不只是「能做什么」。鼓励给出更多技术细节。",
      en: "Explain the details of the neural network applications involved. Make sure your classmates understand how they work, not just what they can do. More technical detail is encouraged.",
    },
    marks: 40,
    modules: "08–12",
  },
  {
    item: { zh: "分析", en: "Analysis" },
    description: {
      zh: "从不同角度说明使用它的好处、它可能造成的问题，以及它会带来的局限。",
      en: "Explain the benefits, the problems it may cause, and the limitations it may impose, from different perspectives.",
    },
    marks: 20,
    modules: "拓展 · 伦理",
  },
  {
    item: { zh: "展示技巧", en: "Presentation" },
    description: {
      zh: "展示有多吸引人？你是在有效表达，还是在念幻灯片上的字？队里每个人都知道团队在做什么吗？",
      en: "How engaging is the presentation? Are you presenting effectively rather than reading the slides? Does everyone on the team know what the team is doing?",
    },
    marks: 10,
    modules: "—",
  },
];

export const ESSAY_MARKS: MarkRow[] = [
  {
    item: { zh: "引言", en: "Introduction" },
    description: {
      zh: "描述你选的产品解决了什么问题。",
      en: "Describe the problem your chosen product solves.",
    },
    marks: 10,
    modules: "01–06",
  },
  {
    item: { zh: "机会", en: "Opportunity" },
    description: {
      zh: "描述这个产品是怎么解决它的。",
      en: "Describe how the selected product solves the problem.",
    },
    marks: 10,
    modules: "07",
  },
  {
    item: { zh: "技术", en: "Technology" },
    description: {
      zh: "解释其中神经网络应用的细节。鼓励给出更多技术细节。",
      en: "Explain the details of the neural network applications involved. More technical detail is encouraged.",
    },
    marks: 45,
    modules: "08–12",
  },
  {
    item: { zh: "分析", en: "Analysis" },
    description: {
      zh: "说明它的好处、可能造成的问题，以及从不同角度看它的局限。",
      en: "Explain the benefits, the problems it may cause, and the limitations from different perspectives.",
    },
    marks: 25,
    modules: "拓展 · 伦理",
  },
  {
    item: { zh: "参考文献", en: "Reference" },
    description: {
      zh: "写出全部参考文献并在文中引用。格式不限。",
      en: "Write down all references and cite them. Any appropriate style is acceptable.",
    },
    marks: 10,
    modules: "—",
  },
];

/**
 * The three practice questions from the course's Exam Practice handout.
 *
 * Question 1's recovered handwritten working contains an arithmetic slip and
 * Question 2's printed statement is self-contradictory; both are flagged here
 * instead of being smoothed over, because a reader who trusts the slip would
 * lose the mark.
 */
export const EXAM_QUESTIONS: ExamQuestion[] = [
  {
    title: { zh: "第 1 题 · 神经元输出（数值题）", en: "Question 1 · neuron output (numeric)" },
    prompt: {
      zh: "一个神经元有三个输入。权重向量 w = [3, 2, 1]ᵀ，偏置 b = 2，激活函数是 sigmoid。输入向量 x = [0.2, 0.4, 0.6]ᵀ，求神经元的输出，保留两位小数。",
      en: "A neuron has three inputs. The weight vector is w = [3, 2, 1]ᵀ and the bias is 2. The neuron uses a sigmoid activation. Given x = [0.2, 0.4, 0.6]ᵀ, calculate the output, to two decimal places.",
    },
    working: {
      zh: [
        "先算加权和：wᵀx = 3(0.2) + 2(0.4) + 1(0.6) = 0.6 + 0.8 + 0.6 = 2.0",
        "加上偏置：z = wᵀx + b = 2.0 + 2 = 4.0",
        "过 sigmoid：σ(4.0) = 1 / (1 + e^(−4.0)) = 0.9820…",
        "保留两位小数：0.98",
      ],
      en: [
        "Weighted sum first: wᵀx = 3(0.2) + 2(0.4) + 1(0.6) = 0.6 + 0.8 + 0.6 = 2.0",
        "Add the bias: z = wᵀx + b = 2.0 + 2 = 4.0",
        "Through the sigmoid: σ(4.0) = 1 / (1 + e^(−4.0)) = 0.9820…",
        "To two decimal places: 0.98",
      ],
    },
    answer: "0.98",
    caution: {
      zh: "注意：这份练习的参考答案手稿里把加权和写成了 3.0，σ(3.0) ≈ 0.95。3(0.2) + 2(0.4) + 1(0.6) + 2 的实际结果是 4.0，不是 3.0——手稿少算了。考试时请自己一步步验算。",
      en: "Careful: the recovered handwritten solution states the weighted sum as 3.0 and answers σ(3.0) ≈ 0.95. But 3(0.2) + 2(0.4) + 1(0.6) + 2 is 4.0, not 3.0 — the working dropped a term. Check each step yourself in the exam.",
    },
  },
  {
    title: { zh: "第 2 题 · 交叉熵（数值题）", en: "Question 2 · cross entropy (numeric)" },
    prompt: {
      zh: "一个分类网络的最后一层是带 softmax 的全连接层。对某个样本，真实标签是 [1, 0, 0]，预测概率是 [0.1, 0.5, 0.2]。用自然对数计算该样本的交叉熵损失，保留两位小数。",
      en: "A classification network ends in a dense layer with a softmax activation. For one training example the true label is [1, 0, 0] and the predicted probabilities are [0.1, 0.5, 0.2]. Calculate the cross entropy loss for this example using the natural logarithm, to two decimal places.",
    },
    working: {
      zh: [
        "标签是独热的，只有第一个位置是 1，所以只有那一项留下：E = −ln(p₁)",
        "代入 p₁ = 0.1：E = −ln(0.1) = 2.30258…",
        "保留两位小数：2.30",
        "顺带一提：如果模型给真实类别 0.9 的把握，E = −ln(0.9) = 0.105——差了 22 倍。",
      ],
      en: [
        "The label is one-hot, so only the first position is 1 and only that term survives: E = −ln(p₁)",
        "Substituting p₁ = 0.1: E = −ln(0.1) = 2.30258…",
        "To two decimal places: 2.30",
        "For comparison: had the model given the true class 0.9, E = −ln(0.9) = 0.105 — a factor of 22 smaller.",
      ],
    },
    answer: "2.30",
    caution: {
      zh: "注意：题目本身自相矛盾——它说「五个类别」，但标签 [1, 0, 0] 和预测 [0.1, 0.5, 0.2] 都只有三个数。按给出的向量算就是 2.30。这属于原题的错误，不用因此怀疑自己的方法。",
      en: "Careful: the printed question contradicts itself — it says five classes, but the label [1, 0, 0] and the predictions [0.1, 0.5, 0.2] both have only three entries. Working from the vectors as given gives 2.30. That is a defect in the question, not in your method.",
    },
  },
  {
    title: { zh: "第 3 题 · 小网络的前向传播", en: "Question 3 · forward pass through a small network" },
    prompt: {
      zh: "图中给出输入 x₁、x₂、x₃，隐藏层节点 I₁、H₁，权重 w₁₁、w₁₂、w₂₁。已知 x = [1, 2, 3]ᵀ，隐藏层用 sigmoid 激活函数。求 I₁ 的输出，保留两位小数。",
      en: "The diagram gives inputs x₁, x₂, x₃, hidden nodes I₁ and H₁, and weights w₁₁, w₁₂, w₂₁. With x = [1, 2, 3]ᵀ and a sigmoid activation on the hidden layer, find the output of I₁ to two decimal places.",
    },
    working: {
      zh: [
        "隐藏层节点的定义：a⁽ʲ⁾ = g(θ₀ⱼ + Σᵢ θᵢⱼ xᵢ)，其中 g 是 sigmoid，θ₀ⱼ 是偏置。",
        "把图上的权重代进去：z = θ₀₁ + θ₁₁x₁ + θ₂₁x₂ + θ₃₁x₃",
        "对 I₁ 来说只用到连到它的那些权重——具体数值要读图上的标注，这正是本题的关键。",
        "最后一步永远是同一个：a⁽¹⁾ = σ(z) = 1 / (1 + e^(−z))，再保留两位小数。",
        "所以这道题考的是「会不会把图翻译成求和式」，不是靠背答案。",
      ],
      en: [
        "The hidden node is defined as a⁽ʲ⁾ = g(θ₀ⱼ + Σᵢ θᵢⱼ xᵢ), where g is the sigmoid and θ₀ⱼ is the bias.",
        "Substitute the diagram's weights: z = θ₀₁ + θ₁₁x₁ + θ₂₁x₂ + θ₃₁x₃",
        "For I₁ only the weights actually connected to it count — reading those off the diagram is the real task here.",
        "The last step is always the same: a⁽¹⁾ = σ(z) = 1 / (1 + e^(−z)), then round to two decimals.",
        "So the question tests whether you can translate a diagram into a sum, not whether you memorised an answer.",
      ],
    },
    answer: "σ(θ₀₁ + θ₁₁x₁ + θ₂₁x₂ + θ₃₁x₃)",
    caution: {
      zh: "说明：原题的权重数值印在图上，文字层无法可靠还原，所以这里给出方法而不是编一个数字。真要考试时，把图上的数字代进上面的式子即可。",
      en: "A note on honesty: the weight values live in the diagram, which could not be recovered reliably from the source, so this page gives the method rather than inventing a number. In the exam, substitute the diagram's values into the expression above.",
    },
  },
];

/** The exam's format, verbatim from the handout. */
export const EXAM_FORMAT: Localized<string[]> = {
  zh: [
    "两小时，闭卷。",
    "选择题占 10%，简答题占 10%，长答题占 80%。",
    "长答题包含概念题、计算题、代码题，以及需要约 300 字作答的开放题。",
    "三道练习都指向同一类能力：把定义代进数字，并把中间步骤写清楚。",
  ],
  en: [
    "Two hours, closed book.",
    "Multiple choice is 10%, short answer is 10%, and long answer is 80%.",
    "Long answer covers concepts, calculations, code, and open-ended questions that ask for roughly 300 words.",
    "All three practice questions test the same skill: substituting into a definition and showing the intermediate steps.",
  ],
};

/** Where the material for the technology and analysis marks actually lives. */
export const TECHNOLOGY_ADVICE: Localized<string[]> = {
  zh: [
    "技术项是单项分最高的：展示 40/100，论文 45/100。它要的是「怎么工作」，不是「能做什么」。",
    "能把这句话写清楚就已经拿到这一项：输入是一批张量 (64, 1, 28, 28)，展平成 (64, 784)，经过 nn.Linear(784, 256) 再 nn.Linear(256, 10)，输出 10 个分数，softmax 变成概率，交叉熵 E(W, b) 衡量差距，反向传播算出 ∂E/∂w，再用 w′ = w − α ∂E/∂w 更新。",
    "分析项（展示 20/100，论文 25/100）问的是好处、问题和局限。要具体：数据从哪里来、谁被影响、出错时谁负责、隐私边界在哪里。",
    "论文的参考文献占 10 分，是最容易拿的分——别丢掉。",
  ],
  en: [
    "Technology is the single heaviest item: 40/100 in the presentation and 45/100 in the essay. It asks how it works, not what it does.",
    "Being able to write this sentence clearly already earns the lion's share: the input is a batch of tensors shaped (64, 1, 28, 28), flattened to (64, 784), passed through nn.Linear(784, 256) then nn.Linear(256, 10) to give 10 scores, turned into probabilities by softmax, measured against the truth by the cross entropy E(W, b), and corrected by computing ∂E/∂w through backpropagation and updating with w′ = w − α ∂E/∂w.",
    "Analysis (20/100 presentation, 25/100 essay) asks for benefits, problems and limitations. Be concrete: where the data comes from, who is affected, who is accountable when it fails, where the privacy boundary sits.",
    "References are worth 10 marks in the essay — the easiest marks on the sheet, so do not drop them.",
  ],
};

export const CAPSTONE_FIGURE = "optimization" as const;

/**
 * Page copy.
 *
 * Kept here rather than in the shared message dictionary: it belongs to this one
 * page, and adding a group to that dictionary means editing two interleaved
 * language blocks where a misplaced brace is easy to miss.
 */
export const CAPSTONE_COPY: Localized<{
  title: string;
  description: string;
  eyebrow: string;
  heading: string;
  intro: string;
  weightingHeading: string;
  presentationTag: string;
  presentationHeading: string;
  essayTag: string;
  essayHeading: string;
  markingHeading: string;
  markingIntro: string;
  presentationCaption: string;
  essayCaption: string;
  technologyHeading: string;
  examHeading: string;
  nextLabel: string;
  nextHeading: string;
  nextBody: string;
  nextCta: string;
}> = {
  zh: {
    title: "结课项目与考试 · 对齐 INT2093",
    description:
      "对齐课程自己的 Project Specification 与 Exam Practice：35% 小组项目的评分表、四要素，以及三道练习题的完整解法。",
    eyebrow: "结课项目 · 考试",
    heading: "把学到的东西变成一份提案，然后去考试。",
    intro:
      "这一页照着课程自己的 Project Specification 和 Exam Practice 文件写：分值、要求、评分表都是原文数字。目标是让你知道分数具体从哪里来，以及网站里哪几个模块正好供给那个评分项。",
    weightingHeading: "项目结构",
    presentationTag: "10%",
    presentationHeading: "小组展示",
    essayTag: "25%",
    essayHeading: "个人论文",
    markingHeading: "评分表（原文照录）",
    markingIntro:
      "两栏「分值」是各自满分 100 分制下的分数。请特别注意「技术」这一项——它是两张表里单项分最高的。",
    presentationCaption: "小组展示 · 满分 100 · 不超过 20 分钟",
    essayCaption: "个人论文 · 满分 100 · 约 750 字英文",
    technologyHeading: "怎么拿到「技术」这 40 / 45 分",
    examHeading: "考试与练习题",
    nextLabel: "接下来",
    nextHeading: "回到课程列表",
    nextBody:
      "如果某一项评分要求让你觉得没把握，回到对应的模块重新过一遍——每个模块都有能动手拖的图形和能真跑的代码。",
    nextCta: "查看全部 12 个模块",
  },
  en: {
    title: "Capstone project and exam · aligned to INT2093",
    description:
      "Aligned to the course's own Project Specification and Exam Practice: the 35% project marking scheme, its four required elements, and full worked solutions to all three practice questions.",
    eyebrow: "Capstone · Exam",
    heading: "Turn what you learned into a proposal, then sit the exam.",
    intro:
      "This page is written directly from the course's own Project Specification and Exam Practice documents: every weighting, requirement and mark is the original number. The point is that you can see exactly where the marks come from, and which modules supply the material for each criterion.",
    weightingHeading: "How the project is structured",
    presentationTag: "10%",
    presentationHeading: "Group presentation",
    essayTag: "25%",
    essayHeading: "Individual essay",
    markingHeading: "Marking scheme (transcribed)",
    markingIntro:
      "The marks column is out of the original 100 for each component. Pay particular attention to Technology — it is the heaviest single item on both sheets.",
    presentationCaption: "Group presentation · 100 marks · no more than 20 minutes",
    essayCaption: "Individual essay · 100 marks · about 750 words in English",
    technologyHeading: "How to earn the 40 / 45 Technology marks",
    examHeading: "The exam and the practice questions",
    nextLabel: "Next",
    nextHeading: "Back to the course list",
    nextBody:
      "If one of the marking criteria feels shaky, go back to the module that covers it — every module has figures you can drag and code you can actually run.",
    nextCta: "See all 12 modules",
  },
};

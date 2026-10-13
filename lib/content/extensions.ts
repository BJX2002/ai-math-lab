import type { Localized } from "../i18n/localized";

/**
 * The extension track.
 *
 * The first page is deliberately not optional reading: the course assesses
 * social, legal, privacy and ethical issues directly, and they carry 15–25 % of
 * the project's marks. The lecture names specific cases; this page names the
 * same cases and poses the question each one raises, rather than asserting
 * details about them that a reader could not check.
 */

export type EthicCase = {
  /** The case as the lecture names it. */
  name: Localized<string>;
  /** The question it raises — what the reader has to argue about. */
  question: Localized<string>;
  /** Which lens it belongs to. */
  lens: "legal" | "privacy" | "ethics" | "social";
  /** Which project criterion it feeds. */
  feeds: Localized<string>;
};

export const EXTENSIONS_COPY: Localized<{
  title: string;
  description: string;
  eyebrow: string;
  heading: string;
  intro: string;
  whyHeading: string;
  whyBody: string;
  lensesHeading: string;
  casesHeading: string;
  checklistHeading: string;
  checklistIntro: string;
  moreHeading: string;
  linearAlgebraLabel: string;
  linearAlgebraBody: string;
  pytorchLabel: string;
  pytorchBody: string;
  methodHeading: string;
  methodBody: string;
  laterHeading: string;
  laterBody: string;
  ctaLabel: string;
  ctaHref: string;
}> = {
  zh: {
    title: "拓展 · AI 的伦理、法律与隐私",
    description:
      "讲义第 2 讲直接考核的内容：法律、隐私、伦理与社会影响四个视角，项目「分析」项 15–25% 的分数就在这里。",
    eyebrow: "拓展轨道 · 项目评分",
    heading: "技术能做的事，和应该做的事，是两回事。",
    intro:
      "这一页不是选修的消遣。讲义的 Project Specification 里，「分析」是实打实的评分项——展示占 20/100，论文占 25/100——问的就是好处、可能造成的问题，以及从不同角度看的局限。技术部分你能从模块 08–12 里拿到材料，这一项只能从这里拿。",
    whyHeading: "为什么它值得你花时间",
    whyBody:
      "很多人在这一项上失分，不是因为不关心，而是因为只写了一句「AI 可能侵犯隐私」就过去了。评分标准问的是「从不同角度」——也就是说，同一个产品，对用户、对公司、对第三方、对社会的影响要分开写，而且要落到具体的机制上。",
    lensesHeading: "四个视角",
    casesHeading: "讲义点名的案例",
    checklistHeading: "写作检查表",
    checklistIntro: "按这五条逐项检查你的分析与论文，能覆盖评分标准里的每一个关键词。",
    moreHeading: "这个轨道里的其他文章",
    linearAlgebraLabel: "线性代数再往前一步",
    linearAlgebraBody: "可逆性、行列式的几何意义、特征向量、正规方程、条件数——模块 01–06 没来得及展开的那部分理论。",
    pytorchLabel: "PyTorch 进阶",
    pytorchBody: "数据增强、归一化常数、迁移学习、GPU 设备、模型存取——讲义第 8 讲的动手内容。",
    methodHeading: "一个方法：把「谁受影响」写具体",
    methodBody:
      "与其写「AI 会影响就业」，不如写清楚：谁的数据被采集、谁在不知情的情况下被记录、出错时谁承担后果、谁有权要求解释、谁被排除在收益之外。每一条都对应一个可查证的机制，而不是一句态度。",
    laterHeading: "这个轨道后面还会有什么",
    laterBody:
      "讲义第 8 讲还讲了数据增强、归一化、迁移学习和 GPU，这些是动手部分；线性代数那边也可以再往深走一步（可逆性、行列式的几何、正规方程）。它们会陆续加到这里。",
    ctaLabel: "先看结课项目的评分表",
    ctaHref: "/capstone",
  },
  en: {
    title: "Extensions · AI ethics, law and privacy",
    description:
      "The material Lecture 2 assesses directly: the legal, privacy, ethical and social lenses, where 15–25% of the project's analysis marks live.",
    eyebrow: "Extension track · assessed",
    heading: "What technology can do and what it should do are two different questions.",
    intro:
      "This page is not optional light reading. In the course's Project Specification, Analysis is a real assessed item — 20/100 in the presentation and 25/100 in the essay — asking for the benefits, the problems it may cause, and the limitations from different perspectives. You get the Technology material from modules 08–12; you get this here.",
    whyHeading: "Why it is worth your time",
    whyBody:
      "Most people lose marks here not because they do not care but because they write one line — \"AI may invade privacy\" — and move on. The criterion asks for different perspectives, which means separating the effect on users, on the company, on third parties and on society, and grounding each one in a concrete mechanism.",
    lensesHeading: "Four lenses",
    casesHeading: "The cases the lecture names",
    checklistHeading: "A checklist before you submit",
    checklistIntro:
      "Work through these five and you will have covered every keyword in the marking criterion.",
    moreHeading: "Other articles in this track",
    linearAlgebraLabel: "Linear algebra, one step further",
    linearAlgebraBody: "Invertibility, the geometry of determinants, eigenvectors, the normal equations, the condition number — the theory modules 01–06 did not have room for.",
    pytorchLabel: "PyTorch in practice",
    pytorchBody: "Data augmentation, normalization constants, transfer learning, GPU devices, saving and loading — the hands-on material from Lecture 8.",
    methodHeading: "One method: make \"who is affected\" specific",
    methodBody:
      "Instead of writing \"AI will affect employment\", write down: whose data is collected, who is recorded without knowing, who bears the consequences when it fails, who can demand an explanation, and who is left out of the benefits. Each of those points to a checkable mechanism rather than a sentiment.",
    laterHeading: "What else is coming to this track",
    laterBody:
      "Lecture 8 also covers data augmentation, normalization, transfer learning and GPUs, which are the hands-on topics; and the linear algebra side can go further (invertibility, the geometry of determinants, the normal equations). They will be added here.",
    ctaLabel: "See the capstone marking scheme first",
    ctaHref: "/capstone",
  },
};

export const LENSES: Localized<{ key: string; title: string; body: string }[]> = {
  zh: [
    {
      key: "legal",
      title: "法律",
      body: "出事的时候，责任落在谁头上？是制造商、软件供应商、车主，还是训练数据的提供者？自动驾驶事故尤其尖锐：如果决策由模型做出，而模型的行为无法逐条追溯，现有的责任框架还适用吗？",
    },
    {
      key: "privacy",
      title: "隐私",
      body: "语音助手需要一直听才能被唤醒，那么「没在录音」这句话该怎么验证？工作场所的传感器（讲义举了银行的例子）采集的是设备数据还是人的行为数据？人脸识别在用户没有主动上传照片时，又采集了谁的数据？",
    },
    {
      key: "ethics",
      title: "伦理",
      body: "合法不等于合乎伦理。在用户不知情的情况下做情绪影响实验，即便条款里写了，是否正当？知情同意要满足什么条件才算真的「知情」？模型对某一群体系统性偏差更大时，谁该发现、谁该修复、谁该被告知？",
    },
    {
      key: "social",
      title: "社会",
      body: "被替代的岗位和新增的岗位往往不是同一批人能胜任的，这个错配由谁承担？讲义提到有些危险工作由机器人接手是明显的进步——那么判断「进步」的标准是什么，由谁来决定？",
    },
  ],
  en: [
    {
      key: "legal",
      title: "Legal",
      body: "When something goes wrong, who is liable — the manufacturer, the software supplier, the owner, or whoever supplied the training data? Autonomous driving makes this sharpest: if the decision is made by a model whose behaviour cannot be traced step by step, do existing liability frameworks still apply?",
    },
    {
      key: "privacy",
      title: "Privacy",
      body: "A voice assistant has to listen continuously in order to be woken, so how would anyone verify that it is \"not recording\"? Do workplace sensors — the lecture gives a bank's example — collect equipment data or human behaviour? And when face recognition runs on photos a user never uploaded, whose data is being collected?",
    },
    {
      key: "ethics",
      title: "Ethical",
      body: "Legal is not the same as ethical. Is an emotion-influence experiment on users who were not told about it justified because a terms-of-service clause mentioned it? What has to be true for consent to be informed? When a model is systematically worse for one group, who is supposed to notice, who fixes it, and who is told?",
    },
    {
      key: "social",
      title: "Social",
      body: "The jobs destroyed and the jobs created are rarely held by the same people, so who absorbs that mismatch? The lecture notes that having robots take over some dangerous work is clear progress — so what is the standard for calling something progress, and who gets to set it?",
    },
  ],
};

export const ETHIC_CASES: EthicCase[] = [
  {
    name: { zh: "自动驾驶事故的责任归属", en: "Liability in an autonomous driving accident" },
    question: {
      zh: "如果事故由模型的判断造成，谁该被追责？要求「可解释」到什么程度，责任才分得清？",
      en: "If the accident follows from the model's judgement, who should be held responsible? How much explainability is needed before responsibility can be assigned at all?",
    },
    lens: "legal",
    feeds: { zh: "分析 · 局限", en: "Analysis · limitations" },
  },
  {
    name: { zh: "聊天机器人知识库里的知识归谁", en: "Who owns the knowledge in a chatbot's knowledge base" },
    question: {
      zh: "模型回答里的内容来自谁的劳动？训练数据的来源需不需要披露？",
      en: "Whose labour produced the content in the answers? Does the provenance of the training data need to be disclosed?",
    },
    lens: "legal",
    feeds: { zh: "分析 · 问题", en: "Analysis · problems" },
  },
  {
    name: { zh: "Alexa / Siri 一直在听", en: "Alexa and Siri always listening" },
    question: {
      zh: "「唤醒前不录音」这个承诺，用户能验证吗？不能验证的承诺值多少？",
      en: "Can a user verify the promise that nothing is recorded before the wake word? What is an unverifiable promise worth?",
    },
    lens: "privacy",
    feeds: { zh: "分析 · 隐私边界", en: "Analysis · the privacy boundary" },
  },
  {
    name: { zh: "工作场所的 IoT 传感器", en: "IoT sensors in the workplace" },
    question: {
      zh: "采集的是设备还是人？员工有拒绝的选项吗？拒绝的代价是什么？",
      en: "Is it measuring equipment or people? Does an employee have the option to refuse, and what does refusing cost them?",
    },
    lens: "privacy",
    feeds: { zh: "分析 · 第三方影响", en: "Analysis · effects on third parties" },
  },
  {
    name: { zh: "Facebook 人脸识别", en: "Facebook face recognition" },
    question: {
      zh: "被识别的人往往没有上传过自己的照片。这种情况下「同意」应该由谁给出？",
      en: "The people being identified often never uploaded a photo of themselves. In that case, who is in a position to consent?",
    },
    lens: "privacy",
    feeds: { zh: "分析 · 数据来源", en: "Analysis · where the data comes from" },
  },
  {
    name: { zh: "Facebook 信息流的情绪实验", en: "Facebook's news-feed emotion experiment" },
    question: {
      zh: "条款里写了，就算知情同意了吗？研究伦理和商业实验的边界在哪里？",
      en: "Does writing it in the terms make consent informed? Where is the line between research ethics and a commercial experiment?",
    },
    lens: "ethics",
    feeds: { zh: "分析 · 伦理问题", en: "Analysis · ethical issues" },
  },
  {
    name: { zh: "透明度与偏见", en: "Transparency and bias" },
    question: {
      zh: "如果模型对某个群体系统性更差，用户有权知道吗？谁有义务去测？",
      en: "If a model is systematically worse for one group, do users have a right to know? Who is obliged to test for it?",
    },
    lens: "ethics",
    feeds: { zh: "分析 · 公平性", en: "Analysis · fairness" },
  },
  {
    name: { zh: "机器人接手危险工作", en: "Robots taking over dangerous work" },
    question: {
      zh: "这是明确的进步。那被替代的人呢？新增的岗位他们能胜任吗？",
      en: "This is unambiguous progress. So what about the people replaced — can they do the jobs that are created?",
    },
    lens: "social",
    feeds: { zh: "分析 · 社会影响", en: "Analysis · social impact" },
  },
];

export const ANALYSIS_CHECKLIST: Localized<string[]> = {
  zh: [
    "好处：对用户、对公司分别是什么？要具体到「省掉了哪一步」，不要写「更高效」。",
    "问题：它可能造成什么伤害？分清楚「会出错」和「出错后无法追责」是两件事。",
    "局限：技术上的边界在哪里？数据不够、分布变了、标注有偏，分别会怎样？",
    "不同角度：至少写出用户、公司、第三方、社会四个视角，并且明确指出它们之间的冲突。",
    "引用：每一个具体的事实性主张都要有来源。参考文献本身就是 10 分。",
  ],
  en: [
    "Benefits: what are they for the user, and for the company? Be specific about which step is removed rather than writing \"more efficient\".",
    "Problems: what harm could it do? Separate \"it can be wrong\" from \"when it is wrong, nobody can be held to account\" — those are different claims.",
    "Limitations: where are the technical boundaries? What happens when there is too little data, when the distribution shifts, or when the labels are biased?",
    "Perspectives: cover at least the user, the company, third parties and society — and say explicitly where their interests conflict.",
    "References: every concrete factual claim needs a source. The reference list is itself worth 10 marks.",
  ],
};

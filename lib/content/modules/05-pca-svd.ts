import type { CourseModule } from "../types";

export const pcaSvd: CourseModule = {
  slug: "pca-svd",
  number: "05",
  track: "foundations",
  durationMinutes: 55,
  level: { zh: "探索", en: "Explore" },
  title: {
    zh: "PCA 与 SVD：留下有用的结构",
    en: "PCA & SVD: keep the useful structure",
  },
  shortTitle: { zh: "PCA 与 SVD", en: "PCA & SVD" },
  subtitle: { zh: "压缩信息", en: "Compress information" },
  description: {
    zh: "看懂投影、主方向、解释方差和低秩近似，同时不丢掉大局。",
    en: "See projection, principal directions, explained variance, and low-rank approximation without losing the big picture.",
  },
  plainIdea: {
    zh: "PCA 和 SVD 保留大的图案，丢掉一些微小的细节。",
    en: "PCA and SVD keep the big pattern and throw away some tiny detail.",
  },
  analogy: {
    zh: "缩略图比原照片小得多，但你仍然能一眼认出画面里是什么。",
    en: "A thumbnail is much smaller than the original photo, but you can still recognise what the picture shows.",
  },
  beforeMath: {
    zh: "当数据有很多数字、但只有少数几个重要模式时，压缩就有用。",
    en: "Compression is useful when data has many numbers but only a few important patterns.",
  },
  aiConnection: {
    zh: "降维、推荐系统、图像压缩和隐特征，都依赖数据中的低秩结构。",
    en: "Dimensionality reduction, recommendation systems, image compression, and latent features rely on low-rank structure.",
  },
  outcomes: {
    zh: ["理解投影", "说清 PCA 到底保留了什么", "读懂 SVD 的分解形式", "对低秩压缩做出数量判断"],
    en: [
      "Understand projection",
      "Explain what PCA preserves",
      "Read an SVD factorization",
      "Reason about low-rank compression",
    ],
  },
  figure: "pca-svd",
  figureCaption: {
    zh: "一堆散乱的点，常常可以用一条最强的方向概括——就是承载主要图案的那条线。",
    en: "Many scattered points can often be summarized by one strong direction — the line that carries the main pattern.",
  },
  sections: [
    {
      label: { zh: "投影", en: "PROJECTION" },
      title: { zh: "沿着一个选定的方向描述数据", en: "Describe data along a chosen direction" },
      blocks: [
        {
          kind: "prose",
          paragraphs: {
            zh: [
              "投影问的是：一个向量有多少「落在」另一个方向上。当方向 u 是单位向量时，那个标量坐标就是 x·u，投影后的向量是 (x·u)u。",
              "降维，就是精心挑几个信息量大的方向，然后只记录这些方向上的坐标。",
            ],
            en: [
              "Projection asks how much of a vector points along another direction. With a unit direction u, the scalar coordinate is x·u and the projected vector is (x·u)u.",
              "Reducing dimensions means choosing a few informative directions and recording only those coordinates.",
            ],
          },
        },
        {
          kind: "formula",
          tex: String.raw`\mathrm{proj}_{u}(x) = (x \cdot u)\,u \qquad \text{when } \|u\| = 1`,
          reveal: true,
        },
        {
          kind: "lab",
          id: "pca-cloud",
        },
        {
          kind: "callout",
          tone: "analogy",
          title: { zh: "茶壶的影子", en: "The teapot's shadow" },
          body: {
            zh: "把一只茶壶放在灯下旋转，它会投出无数个影子：有的能看清壶嘴和把手，有的只剩一条线。PCA 做的事，就是找出那个「最能看清茶壶形状」的影子，然后只记录它。",
            en: "Rotate a teapot under a lamp and it casts countless shadows: some clearly show the spout and handle, some collapse to a flat line. PCA is the maths of finding the single most informative shadow and keeping only that one.",
          },
        },
      ],
    },
    {
      label: { zh: "PCA", en: "PCA" },
      title: { zh: "主成分抓住的是「变化」", en: "Principal components capture variance" },
      blocks: [
        {
          kind: "prose",
          paragraphs: {
            zh: [
              "PCA 先做中心化：把每个特征的均值减掉。然后找出一些互相垂直的方向，让数据在这些方向上的变化尽可能大。",
              "第一主成分抓住最多的变化，第二主成分抓住剩下的变化里最多的那一份，以此类推。",
            ],
            en: [
              "PCA first centres the dataset by subtracting the feature means. It then finds orthogonal directions that capture as much variation as possible.",
              "The first component captures the most variance, the second captures the most remaining variance, and so on.",
            ],
          },
        },
        {
          kind: "formula",
          tex: String.raw`X_{\text{centered}} = X - \operatorname{mean}(X)`,
          reveal: true,
        },
        {
          kind: "lab",
          id: "pca-rank",
        },
        {
          kind: "predict",
          prompt: {
            zh: "一个特征用「米」记录，另一个用「毫米」，数值差了 1000 倍。直接做 PCA 会发生什么？",
            en: "One feature is measured in metres and another in millimetres — a factor of 1000 apart. What happens if you run PCA directly?",
          },
          options: {
            zh: ["没有影响", "第一主成分几乎就是「毫米」那个特征"],
            en: ["No effect", "The first component becomes essentially the millimetre feature"],
          },
          answerIndex: 1,
          why: {
            zh: "PCA 找的是「变化最大」的方向，而单位的数字大小直接决定了谁看起来变化大。所以做 PCA 前通常要先标准化各个特征，让它们公平竞争。",
            en: "PCA looks for the direction of greatest variance, and the raw numeric scale decides who appears to vary most. That is why features are usually standardized before PCA, so they compete fairly.",
          },
        },
        {
          kind: "callout",
          tone: "warning",
          body: {
            zh: "PCA 对特征的尺度很敏感。它保留的是「变化」，不是「重要」——一个变化很大但完全无关的噪声特征，会被 PCA 优先保留下来。",
            en: "PCA is sensitive to feature scale, and it preserves variation, not importance — a noisy feature with huge variance will be kept preferentially.",
          },
        },
      ],
    },
    {
      label: { zh: "SVD", en: "SVD" },
      title: { zh: "把一个矩阵分解成有用的方向", en: "Factor a matrix into useful directions" },
      blocks: [
        {
          kind: "prose",
          paragraphs: {
            zh: [
              "SVD 把矩阵写成 UΣVᵀ。U 和 V 里装的是互相垂直的方向，Σ 里那些奇异值给这些方向排了重要性。",
              "只保留最大的 k 个奇异值，就得到常见范数意义下最好的秩 k 近似。",
            ],
            en: [
              "SVD writes a matrix as UΣVᵀ. U and V contain orthogonal directions; the singular values in Σ rank their importance.",
              "Keeping only the largest k singular values gives the best rank-k approximation under common matrix norms.",
            ],
          },
        },
        {
          kind: "formula",
          tex: String.raw`X = U\Sigma V^{\top} \qquad\qquad X_k = U_k \Sigma_k V_k^{\top}`,
          reveal: true,
        },
        {
          kind: "lab",
          id: "pca-compress",
        },
        {
          kind: "example",
          title: { zh: "一张图要存多少个数字？", en: "How many numbers does an image need?" },
          steps: {
            zh: [
              "一张 300 × 450 的灰度图，原始要存 300 × 450 = 135,000 个数字。",
              "用秩 k 近似，需要存 k × 300（U）+ k（奇异值）+ k × 450（Vᵀ）。",
              "取 k = 20：20 × 751 = 15,020 个数字——大约只要原来的 11%。",
              "取 k = 150：150 × 751 = 112,650 个数字，已经几乎没有收益了。",
            ],
            en: [
              "A 300 × 450 greyscale image stores 300 × 450 = 135,000 numbers.",
              "A rank-k approximation stores k × 300 (U) + k (singular values) + k × 450 (Vᵀ).",
              "At k = 20: 20 × 751 = 15,020 numbers — about 11% of the original.",
              "At k = 150: 150 × 751 = 112,650 numbers, which saves almost nothing.",
            ],
          },
          result: {
            zh: "压缩的收益不是线性的：k 小的时候省得极多，k 大的时候反而开始亏。真实图像的能量也常常集中在最前面的几个奇异值上。",
            en: "Compression is not linear: small k saves enormously, large k saves nothing. Real images usually concentrate their energy in the first few singular values.",
          },
        },
      ],
    },
  ],
  lab: "pca-svd",
  code: {
    id: "module_05.py",
    title: { zh: "用 SVD 做一次 PCA", en: "Run PCA with SVD" },
    intro: {
      zh: "中心化之后，右奇异向量给出主方向，奇异值的平方衡量被抓住的变化量。",
      en: "After centering, the right singular vectors give principal directions and squared singular values measure captured variance.",
    },
    source: `import numpy as np

X = np.array([[2., 0.], [0., 1.], [3., 1.], [4., 2.]])
Xc = X - X.mean(axis=0)
U, s, Vt = np.linalg.svd(Xc, full_matrices=False)

# A singular vector's sign is arbitrary: v and -v are both correct, so different
# builds may return opposite signs. Pin the first entry positive.
component = Vt[0]
if component[0] < 0:
    component = -component

scores_1d = Xc @ component
explained = s**2 / np.sum(s**2)
print("first component:", component)
print("explained ratio:", explained)
print("1D coordinates:", scores_1d)`,
    challenge: {
      zh: "只用第一主成分重建 Xc。重建结果还是原来的形状吗？什么被丢掉了？",
      en: "Reconstruct Xc using only the first component. What shape is the reconstruction, and what has been lost?",
    },
    expectedOutput:
      "first component: [0.96444065 0.26429951]\nexplained ratio: [0.86493848 0.13506152]\n1D coordinates: [-0.50540968 -2.16999146  0.72333049  1.95207065]",
    expectedNote: {
      zh: "第一主成分抓住了约 86.5% 的变化，第二主成分只剩 13.5%。代码里那段「把第一个元素固定为正」是必要的：奇异向量的符号是任意的，v 和 −v 都正确，不同机器可能给出相反的结果，先定符号才能稳定比较。",
      en: "The first component captures about 86.5% of the variation and the second only 13.5%. The sign fix in the code matters: the sign of a singular vector is arbitrary, so v and −v are equally valid and different machines may return opposite ones. Pinning it makes comparisons stable.",
    },
  },
  quiz: [
    {
      question: { zh: "做 PCA 之前通常必须先做什么？", en: "What must normally happen before PCA?" },
      options: {
        zh: ["把数据中心化", "删掉负值", "让每一行都相同"],
        en: ["Center the data", "Delete negative values", "Make every row identical"],
      },
      correct: 0,
      explanation: {
        zh: "PCA 研究的是围绕均值的「变化」，不中心化就等于把原点的位置也算进了变化量。",
        en: "PCA works on variation around the feature means; without centering, the distance from the origin leaks into the variance.",
      },
    },
    {
      question: { zh: "秩 k 近似里保留哪些奇异值？", en: "Which singular values are kept in a rank-k approximation?" },
      options: { zh: ["最小的 k 个", "最大的 k 个", "只有负数"], en: ["The k smallest", "The k largest", "Only negative ones"] },
      correct: 1,
      explanation: {
        zh: "最大的奇异值承载最强的结构。",
        en: "The largest singular values capture the strongest structure.",
      },
    },
    {
      question: { zh: "PCA 得到的主成分之间是什么关系？", en: "How are PCA components related to each other?" },
      options: {
        zh: ["互相垂直的方向", "类别标签", "随机复制出来的"],
        en: ["Orthogonal directions", "Class labels", "Random duplicates"],
      },
      correct: 0,
      explanation: {
        zh: "主方向之间互相正交，所以它们携带的信息不会重复。",
        en: "Principal directions are mutually orthogonal, so they carry non-overlapping information.",
      },
    },
  ],
};

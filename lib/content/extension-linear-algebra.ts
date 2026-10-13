import type { Localized } from "../i18n/localized";

/**
 * The linear-algebra extension track.
 *
 * Modules 01–06 teach the reader to *use* the objects — build the matrix, solve
 * the system, project the cloud, walk downhill. They deliberately skip the
 * theory, because a first-year reader dragging a two-column matrix around does
 * not need to know why the drag is legal. This page is the detour for the reader
 * who has finished module 12 and now wants the words for what they were doing:
 * singular, orientation, eigenvector, normal equations, condition number.
 *
 * Everything here is anchored to something the modules already showed. A topic
 * that says "det(A) = 0 is important" is worth nothing; a topic that says "this
 * is the parallel-lines case in module 04, and here is the matrix" is worth the
 * reader's afternoon.
 */

export type ExtensionTopic = {
  id: string;
  title: Localized<string>;
  why: Localized<string>;
  body: Localized<string[]>;
  /** LaTeX for `renderMath`; no `$` delimiters, no Chinese inside `\text{}`. */
  formula?: string;
  example?: Localized<string[]>;
};

export const LINEAR_ALGEBRA_EXTENSION: {
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
      title: "拓展 · 模块 01–06 跳过的线性代数",
      description:
        "给读完十二个模块的人：可逆性、行列式的几何、特征向量、正规方程与条件数——把前面拖来拖去的那些东西补上理论。",
      eyebrow: "拓展轨道 · 可选的深水区",
      heading: "十二个模块教你怎么用，这一页解释为什么能用。",
      intro:
        "模块 01–06 是刻意实用的：搭出矩阵、解开方程、把点云压到一条线上、沿着 Error 曲面走几步。它们没有停下来解释这些操作为什么合法，因为那时候你不需要。这一页是给读完模块 12 的人的回程票：五个话题，每一个都接回你已经拖过的那张图——平行直线的 det = 0、PCA 的主成分、模块 04 的最小二乘投影，以及模块 12 的归一化。",
      topicsHeading: "五个话题",
      ctaLabel: "回到模块 04，再拖一次那张投影图",
    },
    en: {
      title: "Extensions · the linear algebra modules 01–06 skipped",
      description:
        "For readers who finished all twelve modules: invertibility, the geometry of determinants, eigenvectors, the normal equations and the condition number.",
      eyebrow: "Extension track · optional depth",
      heading: "Twelve modules showed you how to use it. This page says why it works.",
      intro:
        "Modules 01–06 are deliberately practical: build the matrix, solve the system, squash the cloud onto a line, take a few steps down the Error surface. They never stop to justify those operations, because at that point you do not need the justification. This page is the return ticket for a reader who has finished module 12: five topics, each one tied back to a figure you have already dragged — the parallel-lines case where det = 0, the principal components behind PCA, the least-squares projection of module 04, and the normalization of module 12.",
      topicsHeading: "Five topics",
      ctaLabel: "Back to module 04: drag the projection figure once more",
    },
  },
  topics: [
    {
      id: "invertibility",
      title: {
        zh: "可逆性：什么时候一个矩阵可以被撤销",
        en: "Invertibility: when a matrix can be undone",
      },
      why: {
        zh: "模块 04 里你拖动两条直线，让它们平行，交点就消失了——那时图上只是「没有唯一解」。这一节告诉你那一刻究竟发生了什么：有一个方向被整个压掉了，信息已经丢掉，无论用什么算法都找不回来。",
        en: "In module 04 you dragged two lines until they were parallel and the intersection vanished. On the page that was merely \"no unique solution\". This topic says what actually happened at that moment: an entire direction was squashed away, information was destroyed, and no algorithm can put it back.",
      },
      body: {
        zh: [
          "矩阵是一次搬运：它把每个输入向量搬到一个输出向量。可逆（invertible）的意思很朴素——这次搬运可以被完整撤销。已知结果，就能唯一地还原输入，而且这个还原动作本身也是一个矩阵，记作 A⁻¹。所以 A⁻¹(Ax) = x 对每一个 x 都成立。",
          "损坏的情形就一种：有某个非零向量 u 让 Au = 0。它和零向量都被搬到了原点，两个不同的输入挤在同一个输出上，还原时你不知道该送回哪一个——这就是「信息被销毁」的准确含义。顺便把为什么也说了：若 A 可逆而 Au = 0，两边同时左乘 A⁻¹ 会得到 u = 0，与「u 非零」矛盾。所以可逆性不是规定，是列向量的结构推出来的结论。",
          "这三件事其实是一件事：det(A) = 0、两列线性相关、平面被压到一条线上、信息无法恢复。det(A) = 0 只是它们共同的判据。写下来就是一个等价链：det(A) = 0 ⟺ 列线性相关 ⟺ 秩不满 ⟺ 存在非零 u 使 Au = 0 ⟺ A 不可逆。整条链上任何一个成立，其余全部成立。",
          "回到模块 04 的平行直线，这个判据就变成了你熟悉的样子：det A = 0 时 Ax = b 要么无解、要么有无穷多解，唯独没有唯一解。真实数据里的多重共线性是同一个现象——两列几乎成比例，det(A) 就接近 0，解会剧烈跳动。你在模块 04 的预测题里见过它，只是当时还没有「不可逆」这个词。",
        ],
        en: [
          "A matrix is a move: it carries every input vector to one output vector. Invertible means, plainly, that the move can be undone completely. From the result alone you can recover the input uniquely, and the undoing is itself a matrix, written A⁻¹, so that A⁻¹(Ax) = x for every x.",
          "There is only one way for it to break: some non-zero vector u satisfies Au = 0. Then u and the zero vector have both been carried to the origin, two different inputs are stacked on one output, and a reversal could not tell which one to send back — that is the precise meaning of information destroyed. The why comes free: if A were invertible and Au = 0, multiplying on the left by A⁻¹ would give u = 0, contradicting u ≠ 0. So invertibility is not a rule but a consequence of how the columns are arranged.",
          "These are one fact wearing four costumes: det(A) = 0, the columns are linearly dependent, the plane is squashed onto a line, and the information cannot be recovered. det(A) = 0 is only their shared test. Written out it is a chain of equivalences: det(A) = 0 ⟺ the columns are linearly dependent ⟺ the rank is deficient ⟺ some non-zero u has Au = 0 ⟺ A is not invertible. If any link holds, all of them do.",
          "Go back to the parallel lines of module 04 and the test takes the shape you already know: when det A = 0, Ax = b has either no solution or infinitely many, and never a unique one. Multicollinearity in real data is the same phenomenon — two columns almost proportional, so det(A) sits near 0 and the solution jumps around. You met it in the prediction question in module 04; you simply did not have the word \"singular\" yet.",
        ],
      },
      formula: String.raw`A \text{ invertible} \iff \det(A) \neq 0 \iff \text{the columns of } A \text{ are linearly independent}`,
      example: {
        zh: [
          "取 A = [[1, 2], [2, 4]]。第二行正好是第一行的 2 倍，两列 (1, 2) 与 (2, 4) 也正好成比例，所以这是一个不可逆的矩阵。",
          "用对角线法则手算：det A = 1 × 4 − 2 × 2 = 4 − 4 = 0。判据的第一环成立，于是整条等价链全部成立。",
          "找那个被压掉的向量：取 u = (2, −1)。Au = (1 × 2 + 2 × (−1), 2 × 2 + 4 × (−1)) = (0, 0)。一个非零向量被搬到了原点，所以 A 把整条 u 方向压成了一个点。",
          "换成模块 04 的语言：方程组 [[1, 2], [2, 4]] x = (3, 6) 有无穷多解（第二行只是第一行的 2 倍，两条线完全重合）；把右边换成 (3, 7)，第二个方程要求 2x + 4y = 7，而第一个方程已经要求 2x + 4y = 3，于是无解。唯一解这个选项从一开始就不存在。",
        ],
        en: [
          "Take A = [[1, 2], [2, 4]]. Row 2 is exactly 2 × row 1, and the columns (1, 2) and (2, 4) are proportional in the same way, so A is singular.",
          "By hand, with the diagonal rule: det A = 1 × 4 − 2 × 2 = 4 − 4 = 0. The first link of the chain holds, so every link does.",
          "Find the direction that was flattened: take u = (2, −1). Then Au = (1 × 2 + 2 × (−1), 2 × 2 + 4 × (−1)) = (0, 0). A non-zero vector was carried to the origin, so A squashed the whole u direction to a point.",
          "In the language of module 04: the system [[1, 2], [2, 4]] x = (3, 6) has infinitely many solutions, because row 2 is just 2 × row 1 and the two lines coincide. Change the right-hand side to (3, 7) and the second equation demands 2x + 4y = 7 while the first already demands 2x + 4y = 3, so there is no solution. A unique solution was never on the menu.",
        ],
      },
    },
    {
      id: "determinant-geometry",
      title: {
        zh: "行列式的几何：一个面积（或体积）的缩放倍数",
        en: "The geometry of the determinant: an area or volume scale factor",
      },
      why: {
        zh: "模块 03 的变形图里，det 只是读数旁边的一行小字。它不是代数技巧，而是一个几何量：单位正方形被搬过去之后，面积变成了原来的 |det| 倍，而正负号只负责回答一个问题——平面有没有被翻面。",
        en: "In the warp figure of module 03, det is a small line of text next to a readout. It is not an algebraic trick but a geometric quantity: after the unit square is moved, its area is |det| times what it was, and the sign answers exactly one question — was the plane flipped over?",
      },
      body: {
        zh: [
          "把矩阵的两列看成两个箭头。单位正方形（底边 (1, 0)、左边 (0, 1)）被 A 搬过去之后，变成由这两个新箭头张成的平行四边形（parallelogram）。这个平行四边形的面积正好是 |det A|——行列式的绝对值就是面积的缩放倍数（scale factor）。",
          "符号是另一条信息。det A > 0 表示定向（orientation）保持：从第一列转到第二列仍然是逆时针，网格没有被翻面。det A < 0 表示定向翻转：整个平面像照镜子一样翻了过来，面积大小不变，但左右换了位置。所以行列式是一个带符号的面积，负号不是「面积为负」，而是「方向反了」。",
          "维度升高，说法只换一个词。二维里单位正方形换成平行四边形，三维里单位立方体换成平行六面体、面积换成体积，|det A| 仍然是那个倍数；再高维也一样，只是「体积」不再有直观的图形。一维最简单：det A 就是那个数，长度被拉伸的倍数。",
          "于是就看清了 det = 0 的几何样子：面积为零的平行四边形不是平行四边形，而是一条线段；单位正方形被压扁，整个平面被压到一条直线上——这正是不可逆矩阵在做的事，与第一题的「信息被销毁」是同一个事实的两种说法。也因此 det 不能单独当「安不安全」的指标：矩阵整体乘 2，det 就乘 4，可逆性和条件数却一点没变。det 只回答「塌缩了没有」，「离塌缩有多近」要留到第五个话题用条件数回答。",
        ],
        en: [
          "Read the two columns of a matrix as two arrows. The unit square, with base (1, 0) and left edge (0, 1), is carried by A into the parallelogram spanned by those two new arrows. The area of that parallelogram is exactly |det A|: the absolute value of the determinant is the area scale factor.",
          "The sign carries separate information. det A > 0 means orientation is preserved: turning from the first column towards the second still goes anticlockwise and the grid has not been turned over. det A < 0 means orientation is flipped: the whole plane has been mirrored, so the area is unchanged but left and right have swapped. The determinant is therefore a signed area, and the minus sign does not mean \"negative area\", it means \"reversed direction\".",
          "In higher dimensions only one word changes. In two dimensions the unit square becomes a parallelogram; in three the unit cube becomes a parallelepiped and area becomes volume, while |det A| is still the factor; and beyond that the same definition holds even though the volume has no picture left. One dimension is the simplest of all: det A is just the single number by which lengths are stretched.",
          "That makes the geometry of det = 0 visible: a parallelogram of zero area is not a parallelogram but a line segment, the unit square has been flattened, and the whole plane is squeezed onto a line — exactly what a singular matrix does, and the same fact as \"information is destroyed\" in the first topic. It is also why det cannot be the only safety check: scale the whole matrix by 2 and det grows by 4 while invertibility and conditioning are untouched. det answers only \"has it collapsed\"; how close it is to collapsing belongs to the condition number, in the fifth topic.",
        ],
      },
      formula: String.raw`\left|\det\begin{bmatrix} a & b \\ c & d \end{bmatrix}\right| = \text{area of the parallelogram spanned by } \begin{bmatrix} a \\ c \end{bmatrix} \text{ and } \begin{bmatrix} b \\ d \end{bmatrix}`,
      example: {
        zh: [
          "取 A = [[2, 1], [1, 2]]。两列分别是 (2, 1) 与 (1, 2)，所以单位正方形被搬成了以这两个箭头为邻边的平行四边形。",
          "先算它的面积：det A = 2 × 2 − 1 × 1 = 3。也就是说搬运之后面积变成 3 倍——原来面积是 1，现在面积是 3。",
          "手算核对一遍：把 (2, 1) 当作底边，它的长度是 √5 ≈ 2.236。另一个顶点到这条底边的垂直距离是 3 / √5 ≈ 1.342。底乘高 = 2.236 × 1.342 ≈ 3.0，与 det 一致。",
          "再看定向：det = 3 > 0，所以从第一列 (2, 1) 转到第二列 (1, 2) 仍是逆时针，平面没有翻面。换一个矩阵 [[0, 1], [1, 0]]：它交换两个坐标轴，det = 0 × 0 − 1 × 1 = −1。面积倍数还是 1，但负号说明平面被翻了过来——这就是「带符号的面积」里那个符号的全部工作。",
        ],
        en: [
          "Take A = [[2, 1], [1, 2]]. Its columns are (2, 1) and (1, 2), so the unit square is carried to the parallelogram with those two arrows as adjacent sides.",
          "Compute its area first: det A = 2 × 2 − 1 × 1 = 3. After the move the area is three times what it was — it started at 1 and is now 3.",
          "Check it by hand: take (2, 1) as the base, of length √5 ≈ 2.236. The perpendicular distance from the other vertex to that base is 3 / √5 ≈ 1.342. Base times height is 2.236 × 1.342 ≈ 3.0, matching det.",
          "Now the orientation: det = 3 > 0, so turning from the first column (2, 1) towards the second (1, 2) still goes anticlockwise and the plane was not turned over. Try the matrix [[0, 1], [1, 0]] instead: it swaps the two coordinate axes and det = 0 × 0 − 1 × 1 = −1. The area factor is still 1, but the minus sign says the plane was flipped — that is the entire job of the sign in \"signed area\".",
        ],
      },
    },
    {
      id: "eigenvectors",
      title: {
        zh: "特征向量：矩阵只会把它们拉长",
        en: "Eigenvectors: the directions a matrix only stretches",
      },
      why: {
        zh: "在模块 05 里，PCA 的主成分像是从数据里「冒出来」的。其实它们有名字：它们是协方差矩阵的特征向量。知道了这件事，PCA 就不再是一串步骤，而是一个特征值问题——而且模块 05 里那些「主方向互相垂直」的性质也自动有了理由。",
        en: "In module 05 the principal components look as if they emerge from the data by themselves. They have a name: they are the eigenvectors of the covariance matrix. Once you know that, PCA stops being a sequence of steps and becomes an eigenvalue problem — and the \"components are orthogonal\" property from module 05 acquires a reason.",
      },
      body: {
        zh: [
          "随机挑一个向量，用矩阵乘它，方向多半会变。特征向量（eigenvector）是那些例外的方向：矩阵乘上去之后，方向一点没变，只是长度被乘了一个数。这个数叫特征值（eigenvalue），记作 λ。写成式子就是 Av = λv，v 不等于零。",
          "「方向不变」这四个字就是全部内容。λ 大于 1 说明这个方向被拉长，λ 在 0 和 1 之间说明被压缩，λ 是负数说明被反向拉长，λ = 0 说明这个方向被整个压掉了——那正是一个不可逆的矩阵在做的事。所以特征值里只要出现一个 0，行列式就是 0，矩阵就不可逆，第一题的判据在这里第二次出场。",
          "特征值怎么求？把 Av = λv 移项得到 (A − λI)v = 0。这个方程组要有非零解，括号里的矩阵就必须不可逆，也就是 det(A − λI) = 0。解出这个关于 λ 的方程拿到特征值，再代回去求 v——这就是为什么「求特征向量」永远从算行列式开始。",
          "现在和模块 05 接上。协方差矩阵（covariance matrix）刻画每个方向上有多少变化，它的特征向量给出变化的方向，特征值给出那个方向上的变化量。第一主成分就是特征值最大的那个特征向量，第二主成分是第二大的，依此类推——这就是为什么 PCA 是一个特征值问题。而实对称矩阵（协方差矩阵就是）的不同特征值对应的特征向量互相垂直，所以模块 05 里「主方向是正交的」不是巧合；用 SVD 做 PCA 时，右奇异向量就是同一批方向，奇异值的平方与特征值一一对应。",
        ],
        en: [
          "Pick a vector at random, multiply it by a matrix, and its direction almost certainly changes. Eigenvectors are the exceptional directions: after the multiplication the direction is untouched and only the length has been scaled by some number. That number is the eigenvalue, written λ. As an equation, Av = λv with v non-zero.",
          "\"The direction does not change\" is the whole content. A λ above 1 stretches that direction, a λ between 0 and 1 compresses it, a negative λ stretches it backwards, and λ = 0 flattens it completely — which is what a singular matrix does. So if any eigenvalue is 0, the determinant is 0, the matrix is not invertible, and the test from the first topic is back for a second visit.",
          "How are the eigenvalues found? Rearranging Av = λv gives (A − λI)v = 0. For that system to have a non-zero solution the matrix in brackets must be singular, that is det(A − λI) = 0. Solve that equation for λ, then substitute back to find v — which is why finding eigenvectors always begins with a determinant.",
          "Now connect it to module 05. A covariance matrix records how much variation there is along each direction; its eigenvectors give the directions and its eigenvalues give the amount of variation along them. The first principal component is the eigenvector with the largest eigenvalue, the second the next largest, and so on — that is why PCA is an eigenvalue problem. And for a symmetric matrix, which a covariance matrix is, eigenvectors belonging to different eigenvalues are perpendicular: the orthogonality of the principal directions in module 05 is no coincidence. Computed through the SVD, the right singular vectors are those same directions and the squared singular values are the matching eigenvalues.",
        ],
      },
      formula: String.raw`A v = \lambda v, \qquad v \neq 0 \qquad\Longleftrightarrow\qquad \det(A - \lambda I) = 0`,
      example: {
        zh: [
          "取 A = [[2, 1], [1, 2]]，试向量 v = (1, 1)：Av = (2 × 1 + 1 × 1, 1 × 1 + 2 × 1) = (3, 3) = 3v。方向没变，只被拉长了 3 倍，所以 λ = 3。",
          "解 det(A − λI) = 0：(2 − λ)² − 1 = 0，即 λ² − 4λ + 3 = 0，解得 λ = 3 或 λ = 1。另一个特征向量取 v = (1, −1)：Av = (1, −1) = 1 × v，方向不变，长度也不变，λ = 1。",
          "两个特征向量 (1, 1) 与 (1, −1) 的点积是 1 × 1 + 1 × (−1) = 0，它们互相垂直——因为 A 是对称矩阵。这也解释了模块 05 里主成分为什么一定正交。",
          "在模块 05 的数据上验一遍：那四个中心化之后的点算出协方差矩阵 [[2.1875, 0.5], [0.5, 0.5]]，它的特征向量是 (0.964, 0.264) 与 (−0.264, 0.964)，就是模块 05 用 SVD 得到的第一个主成分的两个分量。对应特征值是 2.3245 与 0.3630，两者相加是 2.6875，也就是总方差；比值 2.3245 / 2.6875 = 0.8649，正是代码打印出来的解释方差比 0.86493848。",
        ],
        en: [
          "Take A = [[2, 1], [1, 2]] and try v = (1, 1): Av = (2 × 1 + 1 × 1, 1 × 1 + 2 × 1) = (3, 3) = 3v. The direction is unchanged and the length was multiplied by 3, so λ = 3.",
          "Solve det(A − λI) = 0: (2 − λ)² − 1 = 0, that is λ² − 4λ + 3 = 0, giving λ = 3 or λ = 1. For the other eigenvalue try v = (1, −1): Av = (1, −1) = 1 × v, so the direction and the length both survive, with λ = 1.",
          "The two eigenvectors (1, 1) and (1, −1) have dot product 1 × 1 + 1 × (−1) = 0, so they are perpendicular — because A is symmetric. That is also why the principal components in module 05 must be orthogonal.",
          "Check it on the data from module 05. The four centred points give the covariance matrix [[2.1875, 0.5], [0.5, 0.5]], whose eigenvectors are (0.964, 0.264) and (−0.264, 0.964) — the two entries of the first component that module 05 obtained from the SVD. The eigenvalues are 2.3245 and 0.3630, which add up to 2.6875, the total variance; their ratio 2.3245 / 2.6875 = 0.8649 is exactly the explained ratio 0.86493848 printed by the code.",
        ],
      },
    },
    {
      id: "normal-equations",
      title: {
        zh: "正规方程：最小二乘的闭式解，以及为什么没人真的求逆",
        en: "The normal equations: the closed form for least squares, and why nobody inverts it",
      },
      why: {
        zh: "模块 04 里最小二乘是「把 b 投影到列空间上」的那个动图；模块 12 里它是每个 epoch 降一点的 E(W, b)。这一节把两者接起来：投影这个几何条件可以写成一个方程，解出来就是 β̂；而当参数多到百万级时，这个方程只能靠梯度下降去逼近。",
        en: "In module 04 least squares was the animation that projects b onto the column space; in module 12 it is an E(W, b) that falls a little every epoch. This topic joins them: the geometric condition — orthogonality — can be written as an equation whose solution is β̂, and once there are a million parameters that equation can only be approached by gradient descent.",
      },
      body: {
        zh: [
          "模块 04 的图给出了答案的几何样子：数据不在 A 的列空间里，所以 Ax = b 没有精确解；最小二乘退而求其次，取 b 在列空间上的投影，投影点就是 A x̂，x̂ 就是最小二乘解。投影的判别特征是残差 r = b − A x̂ 与列空间垂直——也就是与 A 的每一列都垂直。",
          "把「与每一列垂直」写成矩阵乘法，就是 Aᵀr = 0，展开即 Aᵀ(b − A x̂) = 0，移项得到 AᵀA x̂ = Aᵀb。这就是正规方程（normal equations）。它是「残差与列空间正交」这句话的代数形式，不是另一条新规则——你在模块 04 的图上看到的东西，和这里写下的方程是同一件事。",
          "正规方程可以直接解出 x̂ = (AᵀA)⁻¹Aᵀb。但请把这句话读成一句警告：它只说明解存在，不说明应该这么算。实际代码里没有人去求 AᵀA 的逆，用的是解方程——np.linalg.lstsq(X, y)，或者面对方阵时的 np.linalg.solve；逆矩阵只是写在纸上的记法。真正的原因是规模：AᵀA 的边长等于未知数的个数 n，n 是一百万时它就是百万乘百万的矩阵，写下来要 10¹² 个数，求逆还要再乘 n³ 的代价，而神经网络的参数正是这个量级。",
          "这就是梯度下降（gradient descent）存在的理由，也是模块 06 到 12 一路在做的事：每一步只看一小批数据，用 E(W, b) 对参数的梯度挪一小步，不需要构造 AᵀA，也不需要求逆。代价是需要迭代很多次；换来的是每一步都便宜、都装得进内存。闭式解和梯度下降回答的是同一个问题，只是一个在小规模上更省事，另一个在大规模上才跑得动。",
        ],
        en: [
          "The figure in module 04 shows the geometry of the answer: the data does not lie in the column space of A, so Ax = b has no exact solution, and least squares settles for the projection of b onto that column space. The projected point is A x̂, and x̂ is the least-squares solution. What identifies a projection is that the residual r = b − A x̂ is perpendicular to the column space — perpendicular to every column of A.",
          "Write \"perpendicular to every column\" as a matrix product and you get Aᵀr = 0, which expands to Aᵀ(b − A x̂) = 0 and rearranges to AᵀA x̂ = Aᵀb. These are the normal equations. They are the algebraic spelling of \"the residual is orthogonal to the column space\", not a fresh rule: what you saw in the module 04 figure and the equation written here are one statement.",
          "The normal equations solve directly as x̂ = (AᵀA)⁻¹Aᵀb. Read that as a warning rather than a recipe: it says the solution exists, not that anyone should compute it this way. No real code inverts AᵀA — it solves the system, with np.linalg.lstsq(X, y), or np.linalg.solve when the matrix is square; the inverse is notation for the page. The reason is size: AᵀA has one side for each unknown, so at n = 1000000 it is a million-by-million matrix that needs 10¹² numbers just to write down, and inverting it costs a further factor of n³. Neural networks live at exactly that scale.",
          "That is the reason gradient descent exists, and it is what modules 06 to 12 have been doing all along: look at one small batch, take one step along the gradient of E(W, b) with respect to the parameters, and never build AᵀA or invert anything. The price is many iterations; what it buys is a step that is cheap and fits in memory. The closed form and gradient descent answer the same question — one is more convenient at small scale, the other is the only one that runs at large scale.",
        ],
      },
      formula: String.raw`A^{\mathsf{T}}A \hat{x} = A^{\mathsf{T}}b, \qquad \hat{x} = (A^{\mathsf{T}}A)^{-1} A^{\mathsf{T}} b`,
      example: {
        zh: [
          "拿模块 04 的那四个点：(x, y) = (0, 1.0), (1, 2.1), (2, 2.9), (3, 4.2)，拟合直线 y = β₀ + β₁x。设计矩阵第一列全是 1（截距项），第二列是 x，所以 A = [[1, 0], [1, 1], [1, 2], [1, 3]]，b = (1.0, 2.1, 2.9, 4.2)ᵀ，形状 4 × 2：四个方程、两个未知数，方程比未知数多，所以它没有精确解。",
          "构造正规方程：AᵀA = [[4, 6], [6, 14]]（4 是样本数，6 是 x 的和，14 是 x² 的和），Aᵀb = (10.2, 20.5)ᵀ（10.2 是 y 的和，20.5 = 0×1.0 + 1×2.1 + 2×2.9 + 3×4.2）。也就是 [[4, 6], [6, 14]] β̂ = (10.2, 20.5)。",
          "解出参数：det(AᵀA) = 4 × 14 − 6 × 6 = 20，所以 β̂₀ = (14 × 10.2 − 6 × 20.5) / 20 = 19.8 / 20 = 0.99，β̂₁ = (4 × 20.5 − 6 × 10.2) / 20 = 20.8 / 20 = 1.04——正是模块 04 里 np.linalg.lstsq(X, y) 打印的 [0.99, 1.04]，即 y = 0.99 + 1.04x。",
          "核对那句几何断言：残差 r = b − Aβ̂ = (0.01, 0.07, −0.17, 0.09)。它与 A 的第一列点乘是 0.01 + 0.07 − 0.17 + 0.09 = 0，与第二列点乘是 0×0.01 + 1×0.07 + 2×(−0.17) + 3×0.09 = 0.07 − 0.34 + 0.27 = 0。两个点积都是 0：残差与列空间正交，这正是正规方程，也是模块 04 那张投影图真正在画的东西。",
        ],
        en: [
          "Take the four points from module 04: (x, y) = (0, 1.0), (1, 2.1), (2, 2.9), (3, 4.2), and fit the line y = β₀ + β₁x. The design matrix has a first column of ones (the intercept) and x in the second, so A = [[1, 0], [1, 1], [1, 2], [1, 3]] and b = (1.0, 2.1, 2.9, 4.2)ᵀ. Its shape is 4 × 2 — four equations, two unknowns — so it is overdetermined and has no exact solution.",
          "Build the normal equations: AᵀA = [[4, 6], [6, 14]], where 4 is the number of samples, 6 the sum of x and 14 the sum of x²; and Aᵀb = (10.2, 20.5)ᵀ, where 10.2 is the sum of y and 20.5 = 0×1.0 + 1×2.1 + 2×2.9 + 3×4.2. In full, [[4, 6], [6, 14]] β̂ = (10.2, 20.5).",
          "Solve for the parameters: det(AᵀA) = 4 × 14 − 6 × 6 = 20, so β̂₀ = (14 × 10.2 − 6 × 20.5) / 20 = 19.8 / 20 = 0.99 and β̂₁ = (4 × 20.5 − 6 × 10.2) / 20 = 20.8 / 20 = 1.04 — exactly the [0.99, 1.04] that module 04's np.linalg.lstsq(X, y) prints, that is y = 0.99 + 1.04x.",
          "Check the geometric claim. The residual is r = b − Aβ̂ = (0.01, 0.07, −0.17, 0.09). Its dot product with the first column of A is 0.01 + 0.07 − 0.17 + 0.09 = 0, and with the second column it is 0×0.01 + 1×0.07 + 2×(−0.17) + 3×0.09 = 0.07 − 0.34 + 0.27 = 0. Both are zero, so the residual is orthogonal to the column space: that is the normal equations, and it is what the projection figure in module 04 draws.",
        ],
      },
    },
    {
      id: "condition-number",
      title: {
        zh: "条件数：为什么有些矩阵碰不得",
        en: "The condition number: why some matrices are dangerous to invert",
      },
      why: {
        zh: "模块 12 的归一化图里，Error 曲面从圆碗变成一条又窄又斜的山谷，图上写着一个数：海森矩阵的条件数。这一节解释那个数是什么、为什么它决定训练能不能走稳，以及它和 det ≈ 0 的关系。",
        en: "In the normalization figure of module 12 the Error surface turns from a round bowl into a narrow slanted valley, and the figure prints a number beside it: the condition number of the Hessian. This topic says what that number is, why it decides whether training stays steady, and how it relates to det ≈ 0.",
      },
      body: {
        zh: [
          "有些矩阵可以求逆，但求出来的答案不可信。输入动一点点，解就动一大截——矩阵是病态的（ill-conditioned）。这不是算法的错，也不是浮点数的错：信息在矩阵里本来就被压得极扁，再把它放大回来，输入里那一点点误差会被一起放大。",
          "衡量这件事的量叫条件数（condition number），定义是最大奇异值与最小奇异值的比值 σ₁ / σₙ。奇异值刻画矩阵在各个方向上把长度拉伸了多少倍，所以这个比值问的是：最长的伸缩与最短的伸缩差多少倍？比值接近 1 说明各个方向伸缩得差不多，矩阵温和；比值很大说明某些方向被压得几乎消失，而那些方向正是误差的放大器。误差的放大量有上界：解的相对误差不超过 κ(A) 乘以右端项的相对误差。",
          "条件数和你前面见过的判据是一家人，但不完全同一件事。det = 0 是「已经塌了」，条件数 = ∞；而 det 很小时矩阵往往条件数很大，因为两列几乎平行意味着某个方向被压得极扁。区别在于 det 是一个乘积，会被整体缩放带偏：矩阵乘 2，det 乘 4，条件数却一点不变。所以「危险到什么程度」要问条件数，「有没有塌」才问 det。",
          "现在回到模块 12 的那张图。归一化之前，两个特征的尺度相差很多倍，E(W, b) 的等高线是一条又窄又斜的山谷：陡方向上二次系数大，缓方向上二次系数小，这个二次型矩阵（海森矩阵）的条件数就是两个系数之比，所以条件数大就意味着曲率极不均匀，同一个 α 在陡方向震荡、在缓方向几乎不动——这正是「不做归一化，网络往往会学不起来」的数学内容。归一化把每一列减去均值、除以标准差，让所有方向回到同一尺度，条件数随之降到接近 1，曲面重新接近圆碗，一个 α 就能又快又稳地走到底。模块 05 的 PCA 是同一件事的另一面：换到主成分坐标系里，协方差矩阵变成对角矩阵，各个方向互不干扰。条件数不是一条抽象的注意事项，它就是你图上那条山谷的宽窄。",
        ],
        en: [
          "Some matrices can be inverted and still give an answer you should not trust. Move the input a hair and the solution moves a mile: the matrix is ill-conditioned. This is not the algorithm's fault or the floating point's: the information was already squashed extremely flat inside the matrix, and scaling it back up magnifies the small error in the input along with it.",
          "The quantity that measures this is the condition number, defined as the ratio of the largest to the smallest singular value, σ₁ / σₙ. Singular values describe how much the matrix stretches lengths in each direction, so the ratio asks: how many times bigger is the longest stretch than the shortest? A ratio near 1 means every direction is stretched about the same and the matrix is gentle; a large ratio means some directions have almost vanished, and those are the error amplifiers. The amplification is bounded: the relative error in the solution is at most κ(A) times the relative error in the right-hand side.",
          "The condition number belongs to the same family as the tests you have already met, without being the same test. det = 0 means the collapse has happened and the condition number is infinite; and a very small det usually means a large condition number, because nearly parallel columns mean one direction is squashed very flat. The difference is that det is a product and therefore moves when the whole matrix is rescaled: double the matrix and det grows by 4 while the condition number does not budge. So \"how dangerous\" is a question for the condition number, and \"has it collapsed\" is a question for det.",
          "Now return to the figure in module 12. Before normalization the two features differ in scale by a large factor, and the level curves of E(W, b) are a narrow slanted valley: the quadratic coefficient is large along the steep direction and small along the shallow one, and the condition number of that quadratic form — the Hessian — is the ratio of the two. A large condition number therefore means wildly uneven curvature, so one α oscillates along the steep direction and barely moves along the shallow one; that is the mathematical content of \"without normalization, the network will tend to fail in learning\". Normalization subtracts each column's mean and divides by its standard deviation, puts every direction on the same scale, and drops the condition number towards 1, so the surface comes back towards a round bowl and a single α descends quickly and steadily. The PCA of module 05 is the same fact from the other side: in the principal-component coordinates the covariance matrix becomes diagonal and the directions stop interfering. The condition number is not an abstract caution — it is the width of the valley in your figure.",
        ],
      },
      formula: String.raw`\kappa(A) = \frac{\sigma_1}{\sigma_n} = \frac{\sigma_{\max}}{\sigma_{\min}}, \qquad \frac{\|\Delta x\|}{\|x\|} \leq \kappa(A) \, \frac{\|\Delta b\|}{\|b\|}`,
      example: {
        zh: [
          "取 A = [[1, 1], [1, 1.01]]：det A = 1 × 1.01 − 1 × 1 = 0.01，两列几乎相同，已经很接近不可逆。算奇异值——AᵀA = [[2, 2.01], [2.01, 2.0201]]，两个特征值加起来是迹 4.0201、乘起来是 det(AᵀA) = 0.0001，解得约 4.02 与 0.0000249，开方得 σ₁ ≈ 2.005、σ₂ ≈ 0.005。于是 κ(A) = 2.005 / 0.005 ≈ 400：输入的误差最多被放大 400 倍。",
          "再确认它不是不能解：取 b = (1, 1)，则 x = (1, 0)，因为 b 恰好是第一列的 1 倍，这是一个精确解。可逆性没有问题，问题在可信度。",
          "把 b 的第一个分量从 1 改成 1.001，相对改变只有 0.001 / 1.414 ≈ 0.07%；解却跳到 x ≈ (1.101, −0.1)，相对改变超过 14%。输入动了万分之七，答案动了一成四——这就是「可逆但不可信」的具体样子。",
          "回到模块 12：那里的矩阵是 E(W, b) 的海森矩阵。特征没归一化时它的条件数很大，梯度下降要用的 α 被最陡方向卡死，缓方向就几乎不动；归一化之后条件数接近 1，同一张图上那条又窄又斜的山谷就变回了圆碗。",
        ],
        en: [
          "Take A = [[1, 1], [1, 1.01]]: det A = 1 × 1.01 − 1 × 1 = 0.01, and the two columns are nearly identical, so it is already close to singular. For the singular values, AᵀA = [[2, 2.01], [2.01, 2.0201]], whose two eigenvalues add up to the trace 4.0201 and multiply to det(AᵀA) = 0.0001, giving about 4.02 and 0.0000249; their square roots are σ₁ ≈ 2.005 and σ₂ ≈ 0.005. So κ(A) = 2.005 / 0.005 ≈ 400 — an input error can be magnified 400 times.",
          "Confirm next that it is not unsolvable: with b = (1, 1) the solution is x = (1, 0), because b is exactly one copy of the first column and this is an exact solve. Invertibility is intact; what is missing is trustworthiness.",
          "Change only the first entry of b, from 1 to 1.001 — a relative change of 0.001 / 1.414 ≈ 0.07%. The solution jumps to x ≈ (1.101, −0.1), a relative change of over 14%. Seven parts in ten thousand went in and about a seventh of the answer came out: that is what invertible but untrustworthy looks like.",
          "Back in module 12 the matrix in question is the Hessian of E(W, b). Before the features are normalized its condition number is large, the usable α is pinned down by the steepest direction, and the shallow direction barely moves; after normalization the condition number is close to 1 and the narrow slanted valley on that figure has turned back into a round bowl.",
        ],
      },
    },
  ],
};

const captions: Record<string, string> = {
  vectors: "One thing can be described by several numbers. Keep those numbers together and you have a vector.",
  "dot-products": "Give each clue an importance, multiply, then add. The final score helps a neuron make a decision.",
  matrices: "Put several vectors into rows and a matrix can transform the whole batch in one operation.",
  "linear-systems": "Each line is one rule. Their crossing point is the answer that satisfies both rules.",
  "pca-svd": "Many scattered points can often be summarized by one strong direction—the line that carries the main pattern.",
  optimization: "Learning takes small downhill steps. Each step should make the mistake, or loss, smaller.",
};

function VectorPicture() {
  return <div className="vector-picture">
    <div className="thing-card"><span>🍎</span><strong>one apple</strong></div>
    <span className="picture-arrow">→</span>
    <div className="feature-list"><span><small>redness</small><b>0.9</b></span><span><small>weight</small><b>0.6</b></span><span><small>roundness</small><b>0.8</b></span></div>
    <span className="picture-arrow">→</span>
    <div className="vector-bracket"><b>[</b><span>0.9<br />0.6<br />0.8</span><b>]</b></div>
  </div>;
}

function DotPicture() {
  return <div className="dot-picture">
    <div className="dot-row"><span>redness <b>0.9</b></span><i>×</i><span>importance <b>0.8</b></span><em>= 0.72</em></div>
    <div className="dot-row"><span>weight <b>0.6</b></span><i>×</i><span>importance <b>0.2</b></span><em>= 0.12</em></div>
    <div className="dot-total"><span>add the matches</span><strong>score = 0.84</strong></div>
  </div>;
}

function MatrixPicture() {
  return <div className="matrix-picture">
    <div><small>3 apples × 3 clues</small><div className="matrix-grid grid-nine">{[.9,.6,.8,.3,.7,.5,.8,.4,.9].map((value, index) => <i key={index} style={{ opacity: value }}>{value}</i>)}</div></div>
    <span className="picture-arrow">→</span>
    <div className="machine-box"><span>same<br />recipe</span></div>
    <span className="picture-arrow">→</span>
    <div><small>3 scores</small><div className="matrix-grid grid-three"><i>.84</i><i>.37</i><i>.90</i></div></div>
  </div>;
}

function SystemPicture() {
  return <div className="system-picture">
    <svg viewBox="0 0 520 250" role="img" aria-label="Two straight lines crossing at one shared solution">
      <path className="axis" d="M40 220H490M70 235V20" />
      <path className="rule-one" d="M55 205L470 35" />
      <path className="rule-two" d="M70 40L455 220" />
      <circle cx="270" cy="117" r="11" />
    </svg>
    <span className="system-label label-one">rule 1</span><span className="system-label label-two">rule 2</span><strong>both true here</strong>
  </div>;
}

function PcaPicture() {
  const dots = [[70,184],[105,166],[140,170],[170,143],[202,149],[236,121],[268,127],[300,100],[332,95],[365,76],[402,74],[440,50],[120,196],[210,118],[315,126],[389,50]];
  return <div className="pca-picture"><svg viewBox="0 0 520 250" role="img" aria-label="A cloud of data points summarized by one diagonal direction">
    <path d="M55 210L470 32" />
    {dots.map(([x,y], index) => <circle key={index} cx={x} cy={y} r="8" />)}
  </svg><div><span>lots of detail</span><span>one main pattern</span></div></div>;
}

function OptimizationPicture() {
  return <div className="optimization-picture"><svg viewBox="0 0 520 250" role="img" aria-label="A sequence of steps moving down a curved loss landscape toward its lowest point">
    <path className="loss-curve" d="M45 35C120 35 150 215 260 215S400 35 475 35" />
    <path className="step-path" d="M90 67L150 131L200 183L244 211" />
    {[ [90,67], [150,131], [200,183], [244,211] ].map(([x,y], index) => <g key={index}><circle cx={x} cy={y} r="10" /><text x={x} y={y-17}>{index + 1}</text></g>)}
  </svg><div><span>large mistake</span><strong>smallest mistake</strong></div></div>;
}

export function LessonIllustration({ slug }: { slug: string }) {
  const picture = slug === "vectors" ? <VectorPicture /> : slug === "dot-products" ? <DotPicture /> : slug === "matrices" ? <MatrixPicture /> : slug === "linear-systems" ? <SystemPicture /> : slug === "pca-svd" ? <PcaPicture /> : <OptimizationPicture />;
  return <figure className={`lesson-illustration illustration-${slug}`}>
    <div className="illustration-label"><span>PICTURE THE IDEA</span><small>No symbols needed yet</small></div>
    <div className="illustration-stage">{picture}</div>
    <figcaption>{captions[slug]}</figcaption>
  </figure>;
}

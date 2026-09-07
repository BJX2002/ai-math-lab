import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SiteFooter } from "../../components/SiteFooter";
import { SiteHeader } from "../../components/SiteHeader";

const siteOrigin = "https://ai-math-lab-foundations.woshisheiwoshifei.chatgpt.site";

export const metadata: Metadata = {
  title: "Start here: AI and neural networks from zero — AI Math Lab",
  description: "A picture-led introduction to data, neurons, predictions, and training for complete beginners.",
  openGraph: {
    title: "Start here: AI and neural networks from zero",
    description: "Meet data, neurons, predictions, and training through pictures—no maths required.",
    images: [{ url: `${siteOrigin}/neural-network-beginner.png`, width: 1536, height: 1024, alt: "Everyday clues flowing through a small neural network to make a prediction" }],
  },
  twitter: { card: "summary_large_image", images: [`${siteOrigin}/neural-network-beginner.png`] },
};

const words = [
  { icon: "📦", word: "Data", simple: "examples the computer can look at", example: "photos of apples and oranges" },
  { icon: "🔎", word: "Feature", simple: "one clue inside an example", example: "colour, weight, or shape" },
  { icon: "🧠", word: "Model", simple: "the rule-making machine", example: "a small neural network" },
  { icon: "💬", word: "Prediction", simple: "the model’s best guess", example: "“I think this is an apple”" },
  { icon: "🔁", word: "Training", simple: "practising and correcting mistakes", example: "guess, check, adjust, repeat" },
];

export default function StartHerePage() {
  return <main className="beginner-page">
    <div className="beginner-dark"><SiteHeader dark />
      <section className="beginner-hero">
        <div>
          <p className="eyebrow">MODULE 00 · ABSOLUTE BEGINNER</p>
          <h1>What does AI actually do?</h1>
          <p>Let’s explain it without equations, programming, or clever words. You only need to know how to compare two things.</p>
          <a className="button button-primary" href="#one-sentence">Show me the simple version ↓</a>
        </div>
        <aside className="safe-start-card">
          <span>YOU ARE IN THE RIGHT PLACE IF…</span>
          <ul><li>You have never studied linear algebra</li><li>You do not know what a neuron is</li><li>Code still looks unfamiliar</li><li>You want the picture before the formula</li></ul>
        </aside>
      </section>
    </div>

    <section className="one-sentence-section" id="one-sentence">
      <div className="one-sentence-copy">
        <p className="eyebrow dark">AI IN ONE SENTENCE</p>
        <h2>AI looks at examples, notices patterns, and uses those patterns to make a guess.</h2>
        <p>That is the whole story. Everything else in this course helps us describe how the computer stores clues, combines them, and improves its guesses.</p>
      </div>
      <figure className="neural-art-card">
        <Image src="/neural-network-beginner.png" alt="An apple, a scale, and colour clues passing through connected neurons to produce a checked prediction" width={1536} height={1024} priority />
        <figcaption><span>1 · clues go in</span><span>2 · the network mixes them</span><span>3 · a guess comes out</span></figcaption>
      </figure>
    </section>

    <section className="word-section">
      <div className="section-heading"><p className="eyebrow dark">FIVE FRIENDLY WORDS</p><h2>The vocabulary, translated into normal language.</h2><p>You will see these words often. None of them needs to feel mysterious.</p></div>
      <div className="word-grid">{words.map((item) => <article key={item.word}><b>{item.icon}</b><h3>{item.word}</h3><p>{item.simple}</p><small>Example: {item.example}</small></article>)}</div>
    </section>

    <section className="neuron-section">
      <div className="neuron-copy">
        <p className="eyebrow">MEET ONE TINY NEURON</p>
        <h2>A neuron is a very small decision maker.</h2>
        <p>It receives a few clues, decides how important each clue is, and turns them into one score.</p>
        <ol><li><b>1</b><span><strong>Receive clues</strong>Redness, weight, and roundness arrive as numbers.</span></li><li><b>2</b><span><strong>Choose importance</strong>The neuron may care a lot about redness and less about weight.</span></li><li><b>3</b><span><strong>Make one score</strong>A high score can mean “this looks like an apple.”</span></li></ol>
      </div>
      <figure className="one-neuron-picture">
        <div className="neuron-inputs"><span><b>0.9</b><small>redness</small></span><span><b>0.6</b><small>weight</small></span><span><b>0.8</b><small>roundness</small></span></div>
        <div className="neuron-lines" aria-hidden="true"><i /><i /><i /></div>
        <div className="neuron-body"><span>tiny<br />neuron</span></div>
        <div className="neuron-output"><span>→</span><strong>apple<br />score</strong><b>0.84</b></div>
        <figcaption>Three clues go in. One useful score comes out.</figcaption>
      </figure>
    </section>

    <section className="network-section">
      <div className="section-heading"><p className="eyebrow dark">FROM ONE NEURON TO A NETWORK</p><h2>A neural network is simply many tiny decision makers connected together.</h2><p>Early neurons notice simple clues. Later neurons combine those clues into bigger ideas. A picture-recognition network might move from edges → shapes → objects.</p></div>
      <figure className="layer-picture" aria-label="A neural network with input, hidden, and output layers">
        <div className="layer"><span>INPUTS</span>{["colour","weight","shape"].map((label) => <i key={label}><small>{label}</small></i>)}</div>
        <b aria-hidden="true">→</b>
        <div className="layer middle"><span>HIDDEN LAYER</span>{[1,2,3,4].map((node) => <i key={node} />)}</div>
        <b aria-hidden="true">→</b>
        <div className="layer final"><span>OUTPUT</span><i><small>apple?</small></i></div>
      </figure>
      <p className="network-note"><strong>Why “hidden”?</strong> We can see the inputs and the answer, but the middle layer invents its own useful internal clues while training.</p>
    </section>

    <section className="training-section">
      <div className="section-heading"><p className="eyebrow dark">HOW LEARNING HAPPENS</p><h2>Practise, check, adjust, repeat.</h2></div>
      <div className="training-loop"><article><b>1</b><span>🍎</span><h3>Show an example</h3><p>“Here is an apple.”</p></article><article><b>2</b><span>💭</span><h3>Make a guess</h3><p>“Maybe it is an orange?”</p></article><article><b>3</b><span>📏</span><h3>Measure the mistake</h3><p>The guess was wrong.</p></article><article><b>4</b><span>🔧</span><h3>Adjust a little</h3><p>Change the importance numbers.</p></article></div>
      <div className="loop-callout">Do this thousands of times <span>↻</span> and the guesses gradually improve.</div>
    </section>

    <section className="math-map-section">
      <div><p className="eyebrow">SO WHY LINEAR ALGEBRA?</p><h2>It gives us a neat language for the pictures you just saw.</h2><p>You already understand the story. The next modules simply give names and tools to each part.</p></div>
      <div className="math-map"><Link href="/modules/vectors"><span>01</span><b>Vectors</b><small>keep clues together</small></Link><Link href="/modules/dot-products"><span>02</span><b>Dot products</b><small>mix clues into a score</small></Link><Link href="/modules/matrices"><span>03</span><b>Matrices</b><small>process many examples</small></Link><Link href="/modules/optimization"><span>06</span><b>Optimization</b><small>correct mistakes</small></Link></div>
    </section>

    <section className="gentle-cta"><p>You now know enough to begin.</p><h2>Next: turn three apple clues into your first vector.</h2><Link className="button button-primary" href="/modules/vectors">Start module 01 →</Link></section>
    <SiteFooter />
  </main>;
}

import Image from "next/image";
import Link from "next/link";
import { SiteFooter } from "../components/SiteFooter";
import { SiteHeader } from "../components/SiteHeader";
import { courseModules } from "../lib/course-data";

export default function Home() {
  return (
    <main>
      <SiteHeader />

      <section className="hero" id="top">
        <div className="hero-grid" aria-hidden="true" />
        <div className="hero-copy">
          <p className="eyebrow">A ZERO-MATH STARTING POINT</p>
          <h1>New to all of this?<br /><span>Start here.</span></h1>
          <p className="hero-intro">Never studied linear algebra or neural networks? That is completely fine. We begin with pictures and everyday ideas, then add one small piece of maths at a time.</p>
          <div className="hero-actions">
            <a className="button button-primary" href="#how-ai-works">Teach me like I’m new <span aria-hidden="true">↓</span></a>
            <Link className="button button-secondary" href="/courses">Explore the course</Link>
          </div>
          <ul className="quick-facts" aria-label="Course features">
            <li><span>✓</span> No maths assumed</li>
            <li><span>✓</span> Pictures before symbols</li>
            <li><span>✓</span> Try everything yourself</li>
          </ul>
        </div>

        <div className="concept-panel beginner-panel" id="how-ai-works" aria-label="A simple picture of how a neural network makes a guess">
          <div className="panel-bar"><span>AI IN ONE PICTURE</span><span className="status-dot">NO MATHS YET</span></div>
          <div className="beginner-network">
            <div className="clue-stack">
              <span><b>🎨</b><small>colour</small><strong>red</strong></span>
              <span><b>⚖️</b><small>weight</small><strong>150 g</strong></span>
              <span><b>●</b><small>shape</small><strong>round</strong></span>
            </div>
            <div className="flow-arrow" aria-hidden="true">→</div>
            <div className="tiny-network" aria-label="Three layers of connected artificial neurons">
              <div>{[1,2,3].map((node) => <i key={node} />)}</div>
              <span aria-hidden="true">→</span>
              <div>{[1,2].map((node) => <i key={node} />)}</div>
              <span aria-hidden="true">→</span>
              <div><i /></div>
            </div>
            <div className="flow-arrow" aria-hidden="true">→</div>
            <div className="guess-card"><small>computer’s guess</small><strong>🍎 Apple</strong><em>92% sure</em></div>
          </div>
          <div className="picture-steps"><span><b>1</b> Look at clues</span><span><b>2</b> Mix the clues</span><span><b>3</b> Make a guess</span></div>
        </div>
      </section>

      <section className="home-primer">
        <figure><Image src="/neural-network-beginner.png" alt="An apple, scale, and colour clues entering a simple neural network and producing a checked prediction" width={1536} height={1024} /></figure>
        <div><p className="eyebrow dark">BRAND NEW? BEGIN BEFORE MODULE 01</p><h2>First, see what a neural network is doing.</h2><p>No equations. No code. Just one friendly, picture-led lesson about data, neurons, guesses, and how learning happens.</p><Link className="button button-dark" href="/start-here">Take the 15-minute introduction →</Link></div>
      </section>

      <section className="pathway" id="pathway">
        <div className="section-heading">
          <p className="eyebrow dark">A PATH YOU CAN FOLLOW</p>
          <h2>From a single vector to a learning model.</h2>
          <p>Each module combines intuition, worked examples, live exploration, NumPy code, and a short knowledge check.</p>
        </div>
        <div className="module-grid">
          {courseModules.map((module) => (
            <Link className="module-card" href={`/modules/${module.slug}`} key={module.number}>
              <span className="module-number">{module.number}</span>
              <div><p>{module.subtitle}</p><h3>{module.shortTitle}</h3><small>{module.duration} · {module.level}</small></div>
              <span className="card-arrow" aria-hidden="true">↗</span>
            </Link>
          ))}
        </div>
        <Link className="text-link" href="/courses">See the full learning path <span>→</span></Link>
      </section>

      <section className="method-section" id="about">
        <div className="method-intro"><p className="eyebrow dark">HOW THIS SITE TEACHES</p><h2>Less passive watching. More useful thinking.</h2></div>
        <div className="method-steps">
          <article><span>01</span><h3>See it</h3><p>Start with meaning, shape, and a visual mental model—not a wall of symbols.</p></article>
          <article><span>02</span><h3>Work it</h3><p>Follow a compact example and make a prediction before seeing the answer.</p></article>
          <article><span>03</span><h3>Code it</h3><p>Translate the idea into readable NumPy and experiment with the values.</p></article>
          <article><span>04</span><h3>Connect it</h3><p>Locate the same idea inside embeddings, dense layers, PCA, or training.</p></article>
        </div>
      </section>

      <section className="about-band"><p>Learn visually · verify with code · explore at your own pace</p><Link href="/start-here">Begin at zero →</Link></section>
      <SiteFooter />
    </main>
  );
}

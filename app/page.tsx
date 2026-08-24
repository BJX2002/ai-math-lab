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
          <p className="eyebrow">LINEAR ALGEBRA FOR AI BEGINNERS</p>
          <h1>See the maths.<br /><span>Make it work.</span></h1>
          <p className="hero-intro">Build the visual intuition and coding confidence to understand vectors, matrices, neural networks, and the mathematics behind AI.</p>
          <div className="hero-actions">
            <Link className="button button-primary" href="/modules/vectors">Start with vectors <span aria-hidden="true">→</span></Link>
            <Link className="button button-secondary" href="/courses">Explore the course</Link>
          </div>
          <ul className="quick-facts" aria-label="Course features">
            <li><span>✓</span> No prerequisites</li>
            <li><span>✓</span> Six guided modules</li>
            <li><span>✓</span> NumPy practice</li>
          </ul>
        </div>

        <div className="concept-panel" aria-label="Example vector code lab">
          <div className="panel-bar"><span>CODE LAB · 01</span><span className="status-dot">READY</span></div>
          <div className="concept-visual" aria-hidden="true">
            <div className="vector-card vector-x"><small>input x</small><strong>[0.5, 1.0, −0.5]</strong><em>shape (3,)</em></div>
            <div className="operator">·</div>
            <div className="vector-card vector-w"><small>weights w</small><strong>[0.2, 0.8, −0.4]</strong><em>shape (3,)</em></div>
          </div>
          <pre className="code-preview"><code><span className="code-keyword">import</span> numpy <span className="code-keyword">as</span> np{"\n\n"}z = np.dot(w, x) + b{"\n"}<span className="code-comment"># predict before you run it</span>{"\n"}<span className="code-function">print</span>(z)</code></pre>
          <div className="result-row"><span>OUTPUT</span><strong>1.20</strong><span className="result-note">Now change one weight.</span></div>
        </div>
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

      <section className="about-band"><p>Learn visually · verify with code · explore at your own pace</p><Link href="/modules/vectors">Begin module 01 →</Link></section>
      <SiteFooter />
    </main>
  );
}

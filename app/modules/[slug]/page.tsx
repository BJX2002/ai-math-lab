import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ModuleExperience } from "../../../components/ModuleExperience";
import { LessonIllustration } from "../../../components/LessonIllustration";
import { SiteFooter } from "../../../components/SiteFooter";
import { SiteHeader } from "../../../components/SiteHeader";
import { courseModules, getModule } from "../../../lib/course-data";

export function generateStaticParams() {
  return courseModules.map((module) => ({ slug: module.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const lesson = getModule(slug);
  if (!lesson) return {};
  const title = `${lesson.number} · ${lesson.title} — AI Math Lab`;
  return { title, description: lesson.description, openGraph: { title, description: lesson.description, images: [] }, twitter: { title, description: lesson.description, images: [] } };
}

export default async function ModulePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const lesson = getModule(slug);
  if (!lesson) notFound();
  const current = courseModules.findIndex((item) => item.slug === lesson.slug);
  const previous = courseModules[current - 1];
  const next = courseModules[current + 1];

  return (
    <main className="lesson-page">
      <div className="lesson-dark"><SiteHeader dark />
        <section className="lesson-hero">
          <Link className="back-link" href="/courses">← All modules</Link>
          <div className="lesson-title-row">
            <span className="lesson-number">{lesson.number}</span>
            <div><p className="eyebrow">{lesson.level} · {lesson.duration}</p><h1>{lesson.title}</h1><p>{lesson.description}</p></div>
          </div>
          <div className="lesson-ai-link"><span>WHERE AI USES THIS</span><p>{lesson.aiConnection}</p></div>
        </section>
      </div>

      <nav className="lesson-nav" aria-label="On this page"><span>IN THIS MODULE</span><a href="#learn">Learn</a><a href="#practice">Interact</a><a href="#code-lab">Code</a><a href="#quiz">Check</a></nav>

      <section className="plain-idea-section" id="learn">
        <div className="plain-idea-copy">
          <p className="eyebrow dark">START GENTLY</p>
          <h2>{lesson.plainIdea}</h2>
          <p>{lesson.beforeMath}</p>
          <div className="analogy-card"><span>EVERYDAY PICTURE</span><p>{lesson.analogy}</p></div>
        </div>
        <LessonIllustration slug={lesson.slug} />
      </section>

      <section className="outcomes-section">
        <div><p className="eyebrow dark">BY THE END</p><h2>You will be able to…</h2></div>
        <ul>{lesson.outcomes.map((outcome) => <li key={outcome}><span>✓</span>{outcome}</li>)}</ul>
      </section>

      <section className="lesson-content">
        {lesson.sections.map((section, index) => (
          <article className="lesson-block" key={section.title}>
            <div className="lesson-block-index"><span>{String(index + 1).padStart(2, "0")}</span><b>{section.label}</b></div>
            <div className="lesson-block-copy"><h2>{section.title}</h2>{section.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              {section.formula && <details className="math-reveal"><summary>Ready? Show me the maths</summary><pre className="formula"><code>{section.formula}</code></pre></details>}
              {section.example && <div className="worked-example"><span>WORKED EXAMPLE</span><p>{section.example}</p></div>}
              {section.takeaway && <p className="takeaway"><strong>Keep in mind:</strong> {section.takeaway}</p>}
            </div>
          </article>
        ))}
      </section>

      <ModuleExperience module={lesson} />

      <nav className="module-pagination" aria-label="Module pagination">
        {previous ? <Link href={`/modules/${previous.slug}`}><span>← PREVIOUS</span><strong>{previous.shortTitle}</strong></Link> : <span />}
        {next ? <Link className="next" href={`/modules/${next.slug}`}><span>NEXT →</span><strong>{next.shortTitle}</strong></Link> : <Link className="next" href="/courses"><span>FINISH →</span><strong>Learning path</strong></Link>}
      </nav>
      <SiteFooter />
    </main>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { ProgressOverview } from "../../components/ProgressOverview";
import { SiteFooter } from "../../components/SiteFooter";
import { SiteHeader } from "../../components/SiteHeader";
import { courseModules } from "../../lib/course-data";

export const metadata: Metadata = {
  title: "Learning path — AI Math Lab",
  description: "Six practical linear algebra modules for AI beginners, from vectors to gradient descent.",
};

export default function CoursesPage() {
  return (
    <main className="inner-page">
      <div className="inner-dark"><SiteHeader dark />
        <section className="course-hero">
          <p className="eyebrow">THE LEARNING PATH</p>
          <h1>Start from zero. Build one idea at a time.</h1>
          <p>You do not need to know any linear algebra or neural networks. Begin with our picture-led introduction, then move through six small steps at your own pace.</p>
          <div className="course-facts"><span><b>06</b> modules</span><span><b>4.5h</b> guided study</span><span><b>18</b> quiz questions</span><span><b>06</b> interactive labs</span></div>
        </section>
      </div>
      <section className="course-list-section">
        <Link className="primer-row" href="/start-here">
          <span className="course-row-number">00</span>
          <div><p>NEW TO EVERYTHING?</p><h2>Start here: what does AI actually do?</h2><small>Meet data, neurons, predictions, and training through pictures—before any linear algebra.</small></div>
          <span>15 MIN · BEGINNER</span><b>BEGIN →</b>
        </Link>
        <ProgressOverview />
        <div className="course-list">
          {courseModules.map((module, index) => (
            <Link className="course-row" href={`/modules/${module.slug}`} key={module.slug}>
              <span className="course-row-number">{module.number}</span>
              <div className="course-row-main"><p>{module.subtitle}</p><h2>{module.title}</h2><small>{module.description}</small></div>
              <div className="course-row-meta"><span>{module.duration}</span><span>{module.level}</span></div>
              <span className="course-row-arrow">{index === 0 ? "START →" : "OPEN →"}</span>
            </Link>
          ))}
        </div>
      </section>
      <section className="course-note"><span>STUDY TIP</span><h2>Prediction is a learning tool.</h2><p>Before revealing an output or checking a quiz, say what you expect and why. A wrong prediction you can explain teaches more than a result you only watched.</p></section>
      <SiteFooter />
    </main>
  );
}

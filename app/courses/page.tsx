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
          <h1>Six ideas that make AI mathematics less mysterious.</h1>
          <p>Start at module 01 if this is new. If you already know the basics, use the AI connection and code lab in each module as a bridge to deeper study.</p>
          <div className="course-facts"><span><b>06</b> modules</span><span><b>4.5h</b> guided study</span><span><b>18</b> quiz questions</span><span><b>06</b> interactive labs</span></div>
        </section>
      </div>
      <section className="course-list-section">
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

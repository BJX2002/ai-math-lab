import type { Metadata } from "next";
import { Fragment } from "react";
import { ProgressOverview } from "../../../components/ProgressOverview";
import { SiteFooter } from "../../../components/SiteFooter";
import { SiteHeader } from "../../../components/SiteHeader";
import { LocalizedLink } from "../../../components/i18n/LocalizedLink";
import {
  courseModules,
  deriveCourseStats,
  formatDuration,
} from "../../../lib/content/index";
import type { Locale } from "../../../lib/i18n/locales";
import { resolve } from "../../../lib/i18n/localized";
import { getMessages } from "../../../lib/i18n/messages";
import { requireLocale } from "../../../lib/i18n/server";
import { absoluteUrl, languageAlternates } from "../../../lib/site";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const locale = requireLocale((await params).locale);
  const t = getMessages(locale);
  return {
    title: t.courses.title,
    description: t.courses.description,
    alternates: languageAlternates("/courses"),
    openGraph: {
      title: t.courses.title,
      description: t.courses.description,
      url: absoluteUrl(`/${locale}/courses`),
      images: [],
    },
    twitter: { title: t.courses.title, description: t.courses.description, images: [] },
  };
}

function twoDigits(value: number): string {
  return String(value).padStart(2, "0");
}

/**
 * Indices where the course changes track, so the list can show a heading.
 *
 * Computed once before rendering rather than tracked inside the loop: mutating a
 * variable while mapping over children is a side effect during render.
 */
function trackBreakIndices(): Set<number> {
  const breaks = new Set<number>();
  courseModules.forEach((module, index) => {
    if (index === 0 || courseModules[index - 1].track !== module.track) breaks.add(index);
  });
  return breaks;
}

export default async function CoursesPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale: Locale = requireLocale((await params).locale);
  const t = getMessages(locale);
  const stats = deriveCourseStats();
  const trackBreaks = trackBreakIndices();

  return (
    <main className="inner-page" id="main">
      <div className="inner-dark">
        <SiteHeader locale={locale} dark />
        <section className="course-hero">
          <p className="eyebrow">{t.courses.eyebrow}</p>
          <h1>{t.courses.heading}</h1>
          <p>{t.courses.intro}</p>
          <div className="course-facts">
            <span>
              <b>{twoDigits(stats.moduleCount)}</b> {t.courses.facts.modules}
            </span>
            <span>
              <b>{stats.guidedHours}</b> {t.courses.facts.hours}
            </span>
            <span>
              <b>{stats.quizCount}</b> {t.courses.facts.quizzes}
            </span>
            <span>
              <b>{twoDigits(stats.labCount)}</b> {t.courses.facts.labs}
            </span>
          </div>
        </section>
      </div>

      <section className="course-list-section">
        <LocalizedLink className="primer-row" href="/start-here" locale={locale}>
          <span className="course-row-number">00</span>
          <div>
            <p>{t.courses.primerRow.tag}</p>
            <h2>{t.courses.primerRow.title}</h2>
            <small>{t.courses.primerRow.body}</small>
          </div>
          <span>{t.courses.primerRow.meta}</span>
          <b>{t.courses.primerRow.cta}</b>
        </LocalizedLink>

        <ProgressOverview locale={locale} />

        <div className="course-list">
          {courseModules.map((module, index) => (
            <Fragment key={module.slug}>
              {trackBreaks.has(index) ? (
                <h3 className={`track-heading track-${module.track}`}>
                  {module.track === "foundations" ? t.courses.trackFoundations : t.courses.trackAi}
                </h3>
              ) : null}
              <LocalizedLink className="course-row" href={`/modules/${module.slug}#learn`} locale={locale}>
                <span className="course-row-number">{module.number}</span>
                <div className="course-row-main">
                  <p>{resolve(locale, module.subtitle)}</p>
                  <h2>{resolve(locale, module.title)}</h2>
                  <small>{resolve(locale, module.description)}</small>
                </div>
                <div className="course-row-meta">
                  <span>{formatDuration(module.durationMinutes, locale)}</span>
                  <span>{resolve(locale, module.level)}</span>
                </div>
                <span className="course-row-arrow">
                  {index === 0 ? t.common.startModule : t.common.openModule}
                </span>
              </LocalizedLink>
            </Fragment>
          ))}
        </div>
      </section>

      <section className="course-note">
        <span>{t.courses.studyTipLabel}</span>
        <h2>{t.courses.studyTipTitle}</h2>
        <p>{t.courses.studyTipBody}</p>
      </section>

      <SiteFooter locale={locale} />
    </main>
  );
}
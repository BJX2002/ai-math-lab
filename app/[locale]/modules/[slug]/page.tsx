import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LessonBlockView } from "../../../../components/lesson/LessonBlocks";
import { FigureView } from "../../../../components/lesson/figures";
import { ModuleExperience } from "../../../../components/ModuleExperience";
import { SiteFooter } from "../../../../components/SiteFooter";
import { SiteHeader } from "../../../../components/SiteHeader";
import { LocalizedLink } from "../../../../components/i18n/LocalizedLink";
import {
  courseModules,
  formatDuration,
  getModule,
  getModuleNeighbours,
} from "../../../../lib/content/index";
import { toModuleExperienceView } from "../../../../lib/content/view";
import type { Locale } from "../../../../lib/i18n/locales";
import { resolve } from "../../../../lib/i18n/localized";
import { getMessages } from "../../../../lib/i18n/messages";
import { requireLocale } from "../../../../lib/i18n/server";
import { absoluteUrl, languageAlternates } from "../../../../lib/site";

export function generateStaticParams() {
  return courseModules.map((module) => ({ slug: module.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale, slug } = await params;
  const locale = requireLocale(rawLocale);
  const lesson = getModule(slug);
  if (!lesson) return {};

  const title = `${lesson.number} · ${resolve(locale, lesson.title)} — AI Math Lab`;
  const description = resolve(locale, lesson.description);
  const path = `/modules/${lesson.slug}`;

  return {
    title,
    description,
    alternates: languageAlternates(path),
    openGraph: {
      title,
      description,
      url: absoluteUrl(`/${locale}${path}`),
      images: [],
    },
    twitter: { title, description, images: [] },
  };
}

export default async function ModulePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: rawLocale, slug } = await params;
  const locale: Locale = requireLocale(rawLocale);
  const lesson = getModule(slug);
  if (!lesson) notFound();

  const t = getMessages(locale);
  const { previous, next } = getModuleNeighbours(lesson.slug);

  return (
    <main className="lesson-page" id="main">
      <div className="lesson-dark">
        <SiteHeader locale={locale} dark />
        <section className="lesson-hero">
          <LocalizedLink className="back-link" href="/courses" locale={locale}>
            {t.module.backToCourses}
          </LocalizedLink>
          <div className="lesson-title-row">
            <span className="lesson-number">{lesson.number}</span>
            <div>
              <p className="eyebrow">
                {resolve(locale, lesson.level)} · {formatDuration(lesson.durationMinutes, locale)}
              </p>
              <h1>{resolve(locale, lesson.title)}</h1>
              <p>{resolve(locale, lesson.description)}</p>
            </div>
          </div>
          <div className="lesson-ai-link">
            <span>{t.module.whereAiUsesThis}</span>
            <p>{resolve(locale, lesson.aiConnection)}</p>
          </div>
        </section>
      </div>

      <nav className="lesson-nav" aria-label={t.module.onThisPage}>
        <span>{t.module.onThisPage}</span>
        <a href="#learn">{t.module.onThisPageLinks.learn}</a>
        <a href="#practice">{t.module.onThisPageLinks.practice}</a>
        <a href="#code-lab">{t.module.onThisPageLinks.codeLab}</a>
        <a href="#quiz">{t.module.onThisPageLinks.quiz}</a>
      </nav>

      <section className="plain-idea-section" id="learn">
        <div className="plain-idea-copy">
          <p className="eyebrow dark">{t.module.startGently}</p>
          <h2>{resolve(locale, lesson.plainIdea)}</h2>
          <p>{resolve(locale, lesson.beforeMath)}</p>
          <div className="analogy-card">
            <span>{t.module.everydayPicture}</span>
            <p>{resolve(locale, lesson.analogy)}</p>
          </div>
        </div>
        <FigureView
          id={lesson.figure}
          locale={locale}
          caption={resolve(locale, lesson.figureCaption)}
        />
      </section>

      <section className="outcomes-section">
        <div>
          <p className="eyebrow dark">{t.module.byTheEnd}</p>
          <h2>{t.module.byTheEndTitle}</h2>
        </div>
        <ul>
          {resolve(locale, lesson.outcomes).map((outcome) => (
            <li key={outcome}>
              <span aria-hidden="true">✓</span>
              {outcome}
            </li>
          ))}
        </ul>
      </section>

      <section className="lesson-content">
        {lesson.sections.map((section, index) => (
          <article className="lesson-block" key={resolve(locale, section.title)}>
            <div className="lesson-block-index">
              <span>{String(index + 1).padStart(2, "0")}</span>
              <b>{resolve(locale, section.label)}</b>
            </div>
            <div className="lesson-block-copy">
              <h2>{resolve(locale, section.title)}</h2>
              {section.blocks.map((block, blockIndex) => (
                <LessonBlockView block={block} locale={locale} key={blockIndex} />
              ))}
            </div>
          </article>
        ))}
      </section>

      <ModuleExperience view={toModuleExperienceView(lesson, locale)} locale={locale} />

      <nav className="module-pagination" aria-label="Module pagination">
        {previous ? (
          <LocalizedLink href={`/modules/${previous.slug}`} locale={locale}>
            <span>{t.module.paginationPrevious}</span>
            <strong>{resolve(locale, previous.shortTitle)}</strong>
          </LocalizedLink>
        ) : (
          <span />
        )}
        {next ? (
          <LocalizedLink className="next" href={`/modules/${next.slug}`} locale={locale}>
            <span>{t.module.paginationNext}</span>
            <strong>{resolve(locale, next.shortTitle)}</strong>
          </LocalizedLink>
        ) : (
          <LocalizedLink className="next" href="/courses" locale={locale}>
            <span>{t.module.paginationFinish}</span>
            <strong>{t.module.paginationFinishTitle}</strong>
          </LocalizedLink>
        )}
      </nav>

      <SiteFooter locale={locale} />
    </main>
  );
}

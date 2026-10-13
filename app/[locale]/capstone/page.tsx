import type { Metadata } from "next";
import { SiteFooter } from "../../../components/SiteFooter";
import { SiteHeader } from "../../../components/SiteHeader";
import { LocalizedLink } from "../../../components/i18n/LocalizedLink";
import {
  CAPSTONE_COPY,
  ESSAY,
  ESSAY_MARKS,
  EXAM_FORMAT,
  EXAM_QUESTIONS,
  PRESENTATION,
  PRESENTATION_MARKS,
  PROJECT_WEIGHTING,
  TECHNOLOGY_ADVICE,
  type MarkRow,
} from "../../../lib/content/capstone";
import { resolve } from "../../../lib/i18n/localized";
import { requireLocale } from "../../../lib/i18n/server";
import { languageAlternates } from "../../../lib/site";
import type { Locale } from "../../../lib/i18n/locales";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const locale: Locale = requireLocale((await params).locale);
  const copy = resolve(locale, CAPSTONE_COPY);
  return {
    title: copy.title,
    description: copy.description,
    alternates: languageAlternates("/capstone"),
    openGraph: { title: copy.title, description: copy.description, images: [] },
    twitter: { title: copy.title, description: copy.description, images: [] },
  };
}

function MarkTable({ locale, rows, caption }: { locale: Locale; rows: MarkRow[]; caption: string }) {
  const total = rows.reduce((sum, row) => sum + row.marks, 0);
  return (
    <table className="marks-table">
      <caption>{caption}</caption>
      <thead>
        <tr>
          <th scope="col">{locale === "zh" ? "评分项" : "Item"}</th>
          <th scope="col">{locale === "zh" ? "要求" : "What it asks for"}</th>
          <th scope="col">{locale === "zh" ? "分值" : "Marks"}</th>
          <th scope="col">{locale === "zh" ? "对应模块" : "Modules"}</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.item.en}>
            <th scope="row">{resolve(locale, row.item)}</th>
            <td>{resolve(locale, row.description)}</td>
            <td className="marks-cell">{row.marks}</td>
            <td className="marks-modules">{row.modules}</td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr>
          <th scope="row" colSpan={2}>
            {locale === "zh" ? "合计" : "Total"}
          </th>
          <td className="marks-cell">{total}</td>
          <td />
        </tr>
      </tfoot>
    </table>
  );
}

export default async function CapstonePage({ params }: { params: Promise<{ locale: string }> }) {
  const locale: Locale = requireLocale((await params).locale);
  const copy = resolve(locale, CAPSTONE_COPY);
  const presentation = resolve(locale, PRESENTATION);
  const essay = resolve(locale, ESSAY);

  return (
    <main className="shell" id="main">
      <SiteHeader locale={locale} />

      <section className="hero">
        <p className="eyebrow">{copy.eyebrow}</p>
        <h1>{copy.heading}</h1>
        <p className="hero-lede">{copy.intro}</p>
      </section>

      <section className="guide-card">
        <h2>{copy.weightingHeading}</h2>
        <ul className="plain-list">
          {resolve(locale, PROJECT_WEIGHTING).map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </section>

      <section className="guide-grid">
        <article className="guide-card">
          <span className="guide-tag">{copy.presentationTag}</span>
          <h2>{copy.presentationHeading}</h2>
          <p>{presentation.brief}</p>
          <p className="marks-note">{presentation.minutes}</p>
          <ol className="plain-list ordered">
            {presentation.points.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ol>
        </article>

        <article className="guide-card">
          <span className="guide-tag">{copy.essayTag}</span>
          <h2>{copy.essayHeading}</h2>
          <p>{essay.brief}</p>
          <ol className="plain-list ordered">
            {essay.points.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ol>
        </article>
      </section>

      <section className="guide-card">
        <h2>{copy.markingHeading}</h2>
        <p>{copy.markingIntro}</p>
        <MarkTable
          locale={locale}
          rows={PRESENTATION_MARKS}
          caption={copy.presentationCaption}
        />
        <MarkTable locale={locale} rows={ESSAY_MARKS} caption={copy.essayCaption} />
      </section>

      <section className="guide-card">
        <h2>{copy.technologyHeading}</h2>
        <ul className="plain-list">
          {resolve(locale, TECHNOLOGY_ADVICE).map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </section>

      <section className="guide-card">
        <h2>{copy.examHeading}</h2>
        <ul className="plain-list">
          {resolve(locale, EXAM_FORMAT).map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>

        <div className="exam-list">
          {EXAM_QUESTIONS.map((question) => (
            <details className="exam-item" key={question.title.en}>
              <summary>{resolve(locale, question.title)}</summary>
              <p className="exam-prompt">{resolve(locale, question.prompt)}</p>
              <ol className="plain-list ordered">
                {resolve(locale, question.working).map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
              <p className="exam-answer">
                {locale === "zh" ? "答案" : "Answer"}: <strong>{question.answer}</strong>
              </p>
              {question.caution ? (
                <p className="exam-caution">{resolve(locale, question.caution)}</p>
              ) : null}
            </details>
          ))}
        </div>
      </section>

      <section className="course-note">
        <span>{copy.nextLabel}</span>
        <h2>{copy.nextHeading}</h2>
        <p>{copy.nextBody}</p>
        <LocalizedLink className="button" href="/courses" locale={locale}>
          {copy.nextCta}
        </LocalizedLink>
      </section>

      <SiteFooter locale={locale} />
    </main>
  );
}

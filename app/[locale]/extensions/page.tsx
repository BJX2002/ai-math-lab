import type { Metadata } from "next";
import { SiteFooter } from "../../../components/SiteFooter";
import { SiteHeader } from "../../../components/SiteHeader";
import { LocalizedLink } from "../../../components/i18n/LocalizedLink";
import {
  ANALYSIS_CHECKLIST,
  ETHIC_CASES,
  EXTENSIONS_COPY,
  LENSES,
} from "../../../lib/content/extensions";
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
  const copy = resolve(locale, EXTENSIONS_COPY);
  return {
    title: copy.title,
    description: copy.description,
    alternates: languageAlternates("/extensions"),
    openGraph: { title: copy.title, description: copy.description, images: [] },
    twitter: { title: copy.title, description: copy.description, images: [] },
  };
}

export default async function ExtensionsPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale: Locale = requireLocale((await params).locale);
  const copy = resolve(locale, EXTENSIONS_COPY);
  const lenses = resolve(locale, LENSES);

  return (
    <main className="shell" id="main">
      <SiteHeader locale={locale} />

      <section className="hero">
        <p className="eyebrow">{copy.eyebrow}</p>
        <h1>{copy.heading}</h1>
        <p className="hero-lede">{copy.intro}</p>
      </section>

      <section className="guide-card">
        <h2>{copy.whyHeading}</h2>
        <p>{copy.whyBody}</p>
      </section>

      <section className="lens-grid">
        {lenses.map((lens) => (
          <article className={`guide-card lens-${lens.key}`} key={lens.key}>
            <h2>{lens.title}</h2>
            <p>{lens.body}</p>
          </article>
        ))}
      </section>

      <section className="guide-card">
        <h2>{copy.casesHeading}</h2>
        <div className="case-list">
          {ETHIC_CASES.map((item) => (
            <article className={`case-item case-${item.lens}`} key={item.name.en}>
              <span className="case-lens">
                {lenses.find((lens) => lens.key === item.lens)?.title ?? item.lens}
              </span>
              <h3>{resolve(locale, item.name)}</h3>
              <p>{resolve(locale, item.question)}</p>
              <small>{resolve(locale, item.feeds)}</small>
            </article>
          ))}
        </div>
      </section>

      <section className="guide-grid">
        <article className="guide-card">
          <h2>{copy.methodHeading}</h2>
          <p>{copy.methodBody}</p>
        </article>
        <article className="guide-card">
          <h2>{copy.checklistHeading}</h2>
          <p>{copy.checklistIntro}</p>
          <ol className="plain-list ordered">
            {resolve(locale, ANALYSIS_CHECKLIST).map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ol>
        </article>
      </section>

      <section className="guide-card">
        <h2>{copy.moreHeading}</h2>
        <div className="case-list">
          <LocalizedLink className="case-item case-legal" href="/extensions/linear-algebra" locale={locale}>
            <h3>{copy.linearAlgebraLabel}</h3>
            <p>{copy.linearAlgebraBody}</p>
          </LocalizedLink>
          <LocalizedLink className="case-item case-privacy" href="/extensions/pytorch" locale={locale}>
            <h3>{copy.pytorchLabel}</h3>
            <p>{copy.pytorchBody}</p>
          </LocalizedLink>
        </div>
      </section>

      <section className="course-note">
        <span>{copy.eyebrow}</span>
        <h2>{copy.laterHeading}</h2>
        <p>{copy.laterBody}</p>
        <LocalizedLink className="button" href={copy.ctaHref} locale={locale}>
          {copy.ctaLabel}
        </LocalizedLink>
      </section>

      <SiteFooter locale={locale} />
    </main>
  );
}

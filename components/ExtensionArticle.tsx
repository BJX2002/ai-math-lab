import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";
import { LocalizedLink } from "./i18n/LocalizedLink";
import { renderMath } from "../lib/math";
import { resolve, type Localized } from "../lib/i18n/localized";
import type { Locale } from "../lib/i18n/locales";

/**
 * Renders one article in the extension track.
 *
 * The two tracks (`linear-algebra` and `pytorch`) are separate data modules with
 * the same shape, so the layout lives here once. Their `ExtensionTopic` types are
 * structurally identical; this accepts that shape rather than importing either
 * one, so neither data module depends on the other.
 */
export type ArticleTopic = {
  id: string;
  title: Localized<string>;
  why: Localized<string>;
  body: Localized<string[]>;
  formula?: string;
  example?: Localized<string[]>;
};

export type ArticleCopy = {
  title: string;
  description: string;
  eyebrow: string;
  heading: string;
  intro: string;
  topicsHeading: string;
  ctaLabel: string;
};

export function ExtensionArticle({
  locale,
  copy,
  topics,
}: {
  locale: Locale;
  copy: ArticleCopy;
  topics: ArticleTopic[];
}) {
  return (
    <main className="shell" id="main">
      <SiteHeader locale={locale} />

      <section className="hero">
        <p className="eyebrow">{copy.eyebrow}</p>
        <h1>{copy.heading}</h1>
        <p className="hero-lede">{copy.intro}</p>
      </section>

      <section className="guide-card">
        <h2>{copy.topicsHeading}</h2>
        <ol className="topic-index">
          {topics.map((topic, index) => (
            <li key={topic.id}>
              <a href={`#${topic.id}`}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                {resolve(locale, topic.title)}
              </a>
            </li>
          ))}
        </ol>
      </section>

      {topics.map((topic, index) => (
        <section className="guide-card topic-card" id={topic.id} key={topic.id}>
          <span className="topic-number">{String(index + 1).padStart(2, "0")}</span>
          <h2>{resolve(locale, topic.title)}</h2>
          <p className="topic-why">{resolve(locale, topic.why)}</p>

          {resolve(locale, topic.body).map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}

          {topic.formula ? (
            <div
              className="topic-formula"
              // KaTeX runs at build time and emits MathML, so this is inert markup.
              dangerouslySetInnerHTML={{ __html: renderMath(topic.formula) }}
            />
          ) : null}

          {topic.example ? (
            <div className="topic-example">
              <h3>{locale === "zh" ? "动手算一遍" : "Work through it"}</h3>
              <ol className="plain-list ordered">
                {resolve(locale, topic.example).map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </div>
          ) : null}
        </section>
      ))}

      <section className="course-note">
        <h2>{copy.title}</h2>
        <p>{copy.description}</p>
        <LocalizedLink className="button" href="/courses" locale={locale}>
          {copy.ctaLabel}
        </LocalizedLink>
      </section>

      <SiteFooter locale={locale} />
    </main>
  );
}

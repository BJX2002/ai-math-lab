import type { Metadata } from "next";
import Image from "next/image";
import { SiteFooter } from "../../../components/SiteFooter";
import { SiteHeader } from "../../../components/SiteHeader";
import { LocalizedLink } from "../../../components/i18n/LocalizedLink";
import { Icon } from "../../../components/icons";
import type { Locale } from "../../../lib/i18n/locales";
import { getMessages } from "../../../lib/i18n/messages";
import { requireLocale } from "../../../lib/i18n/server";
import { absoluteUrl, languageAlternates } from "../../../lib/site";

/** The three clue values shown in the single-neuron figure. Language-independent. */
const NEURON_VALUES = [0.9, 0.6, 0.8];
const NEURON_SCORE = "0.84";

/** Hrefs stay here, labels come from messages, so a URL is never translated. */
const MATH_MAP_ENTRIES = [
  { id: "vectors", href: "/modules/vectors" },
  { id: "dotProducts", href: "/modules/dot-products" },
  { id: "matrices", href: "/modules/matrices" },
  { id: "optimization", href: "/modules/optimization" },
] as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const locale = requireLocale((await params).locale);
  const t = getMessages(locale);
  const image = {
    url: `${absoluteUrl("/neural-network-beginner.png")}`,
    width: 1536,
    height: 1024,
    alt: t.startHere.artAlt,
  };
  return {
    title: t.startHere.title,
    description: t.startHere.description,
    alternates: languageAlternates("/start-here"),
    openGraph: {
      title: t.startHere.title,
      description: t.startHere.description,
      url: absoluteUrl(`/${locale}/start-here`),
      images: [image],
    },
    twitter: { card: "summary_large_image", description: t.startHere.description, images: [image.url] },
  };
}

export default async function StartHerePage({ params }: { params: Promise<{ locale: string }> }) {
  const locale: Locale = requireLocale((await params).locale);
  const t = getMessages(locale);
  const s = t.startHere;

  return (
    <main className="beginner-page" id="main">
      <div className="beginner-dark">
        <SiteHeader locale={locale} dark />
        <section className="beginner-hero">
          <div>
            <p className="eyebrow">{s.eyebrow}</p>
            <h1>{s.heading}</h1>
            <p>{s.intro}</p>
            <a className="button button-primary" href="#one-sentence">
              {s.heroCta}
            </a>
          </div>
          <aside className="safe-start-card">
            <span>{s.safeStartTitle}</span>
            <ul>
              {s.safeStartItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </aside>
        </section>
      </div>

      <section className="one-sentence-section" id="one-sentence">
        <div className="one-sentence-copy">
          <p className="eyebrow dark">{s.oneSentenceEyebrow}</p>
          <h2>{s.oneSentenceTitle}</h2>
          <p>{s.oneSentenceBody}</p>
        </div>
        <figure className="neural-art-card">
          <Image
            src="/neural-network-beginner.png"
            alt={s.artAlt}
            width={1536}
            height={1024}
            priority
          />
          <figcaption>
            {s.artCaption.map((caption) => (
              <span key={caption}>{caption}</span>
            ))}
          </figcaption>
        </figure>
      </section>

      <section className="word-section">
        <div className="section-heading">
          <p className="eyebrow dark">{s.wordsEyebrow}</p>
          <h2>{s.wordsTitle}</h2>
          <p>{s.wordsBody}</p>
        </div>
        <div className="word-grid">
          {s.words.map((item) => (
            <article key={item.word}>
              <b>
                <Icon name={item.icon} size={28} />
              </b>
              <h3>{item.word}</h3>
              <p>{item.simple}</p>
              <small>{item.example}</small>
            </article>
          ))}
        </div>
      </section>

      <section className="neuron-section">
        <div className="neuron-copy">
          <p className="eyebrow">{s.neuronEyebrow}</p>
          <h2>{s.neuronTitle}</h2>
          <p>{s.neuronBody}</p>
          <ol>
            {s.neuronSteps.map((step, index) => (
              <li key={step.title}>
                <b>{index + 1}</b>
                <span>
                  <strong>{step.title}</strong>
                  {step.body}
                </span>
              </li>
            ))}
          </ol>
        </div>
        <figure className="one-neuron-picture">
          <div className="neuron-inputs">
            {s.neuronFigureClues.map((clue, index) => (
              <span key={clue}>
                <b>{NEURON_VALUES[index].toFixed(1)}</b>
                <small>{clue}</small>
              </span>
            ))}
          </div>
          <div className="neuron-lines" aria-hidden="true">
            <i />
            <i />
            <i />
          </div>
          <div className="neuron-body">
            <span>{s.neuronFigureBody}</span>
          </div>
          <div className="neuron-output">
            <span aria-hidden="true">→</span>
            <strong>{s.neuronFigureOutput}</strong>
            <b>{NEURON_SCORE}</b>
          </div>
          <figcaption>{s.neuronFigureCaption}</figcaption>
        </figure>
      </section>

      <section className="network-section">
        <div className="section-heading">
          <p className="eyebrow dark">{s.networkEyebrow}</p>
          <h2>{s.networkTitle}</h2>
          <p>{s.networkBody}</p>
        </div>
        <figure className="layer-picture" aria-label={s.networkFigureLabel}>
          <div className="layer">
            <span>{s.networkLayers.inputs}</span>
            {s.networkInputs.map((label) => (
              <i key={label}>
                <small>{label}</small>
              </i>
            ))}
          </div>
          <b aria-hidden="true">→</b>
          <div className="layer middle">
            <span>{s.networkLayers.hidden}</span>
            {[1, 2, 3, 4].map((node) => (
              <i key={node} />
            ))}
          </div>
          <b aria-hidden="true">→</b>
          <div className="layer final">
            <span>{s.networkLayers.output}</span>
            <i>
              <small>{s.networkOutput}</small>
            </i>
          </div>
        </figure>
        <p className="network-note">
          <strong>{s.networkNoteTitle}</strong> {s.networkNoteBody}
        </p>
      </section>

      <section className="training-section">
        <div className="section-heading">
          <p className="eyebrow dark">{s.trainingEyebrow}</p>
          <h2>{s.trainingTitle}</h2>
        </div>
        <div className="training-loop">
          {s.trainingLoop.map((step, index) => (
            <article key={step.title}>
              <b>{index + 1}</b>
              <span>
                <Icon name={step.icon} size={30} />
              </span>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </article>
          ))}
        </div>
        <div className="loop-callout">
          {s.loopCallout} <span aria-hidden="true">↻</span> {s.loopCalloutTail}
        </div>
      </section>

      <section className="math-map-section">
        <div>
          <p className="eyebrow">{s.mathMapEyebrow}</p>
          <h2>{s.mathMapTitle}</h2>
          <p>{s.mathMapBody}</p>
        </div>
        <div className="math-map">
          {MATH_MAP_ENTRIES.map((entry) => {
            const item = s.mathMapItems[entry.id];
            return (
              <LocalizedLink href={entry.href} locale={locale} key={entry.id}>
                <span>{item.number}</span>
                <b>{item.title}</b>
                <small>{item.subtitle}</small>
              </LocalizedLink>
            );
          })}
        </div>
      </section>

      <section className="gentle-cta">
        <p>{s.ctaLead}</p>
        <h2>{s.ctaTitle}</h2>
        <LocalizedLink className="button button-primary" href="/modules/vectors" locale={locale}>
          {s.ctaButton}
        </LocalizedLink>
      </section>

      <SiteFooter locale={locale} />
    </main>
  );
}

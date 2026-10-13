import Image from "next/image";
import { SiteFooter } from "../../components/SiteFooter";
import { SiteHeader } from "../../components/SiteHeader";
import { LocalizedLink } from "../../components/i18n/LocalizedLink";
import { Icon } from "../../components/icons";
import { courseModules, formatDuration } from "../../lib/content/index";
import { resolve } from "../../lib/i18n/localized";
import { getMessages } from "../../lib/i18n/messages";
import { requireLocale } from "../../lib/i18n/server";

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const locale = requireLocale((await params).locale);
  const t = getMessages(locale);

  return (
    <main id="main">
      <SiteHeader locale={locale} />

      <section className="hero" id="top">
        <div className="hero-grid" aria-hidden="true" />
        <div className="hero-copy">
          <p className="eyebrow">{t.home.heroEyebrow}</p>
          <h1>
            {t.home.heroTitleLead}
            <br />
            <span>{t.home.heroTitleAccent}</span>
          </h1>
          <p className="hero-intro">{t.home.heroIntro}</p>
          <div className="hero-actions">
            <a className="button button-primary" href="#how-ai-works">
              {t.home.heroPrimary} <span aria-hidden="true">↓</span>
            </a>
            <LocalizedLink className="button button-secondary" href="/courses" locale={locale}>
              {t.home.heroSecondary}
            </LocalizedLink>
          </div>
          <ul className="quick-facts" aria-label={t.home.pathwayEyebrow}>
            {t.home.quickFacts.map((fact) => (
              <li key={fact}>
                <span>✓</span> {fact}
              </li>
            ))}
          </ul>
        </div>

        <div className="concept-panel beginner-panel" id="how-ai-works" aria-label={t.home.panelTitle}>
          <div className="panel-bar">
            <span>{t.home.panelTitle}</span>
            <span className="status-dot">{t.home.panelStatus}</span>
          </div>
          <div className="beginner-network">
            <div className="clue-stack">
              {t.home.panelClues.map((clue) => (
                <span key={clue.label}>
                  <b>
                    <Icon name={clue.icon} />
                  </b>
                  <small>{clue.label}</small>
                  <strong>{clue.value}</strong>
                </span>
              ))}
            </div>
            <div className="flow-arrow" aria-hidden="true">
              →
            </div>
            <div className="tiny-network" aria-label={t.home.panelNetworkLabel}>
              <div>
                {[1, 2, 3].map((node) => (
                  <i key={node} />
                ))}
              </div>
              <span aria-hidden="true">→</span>
              <div>
                {[1, 2].map((node) => (
                  <i key={node} />
                ))}
              </div>
              <span aria-hidden="true">→</span>
              <div>
                <i />
              </div>
            </div>
            <div className="flow-arrow" aria-hidden="true">
              →
            </div>
            <div className="guess-card">
              <small>{t.home.panelGuessLabel}</small>
              <strong>
                <Icon name="specimen" size={20} />
                {t.home.panelGuessValue}
              </strong>
              <em>{t.home.panelGuessConfidence}</em>
            </div>
          </div>
          <div className="picture-steps">
            {t.home.panelSteps.map((step, index) => (
              <span key={step}>
                <b>{index + 1}</b> {step}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="home-primer">
        <figure>
          {/*
            The PNG is 1.8 MB; the same picture as WebP is 36 KB and as AVIF
            27 KB. Modern browsers take the first source they understand and the
            PNG stays as the fallback, so nothing is lost if neither is
            supported. The dimensions are on the img so the layout never shifts.
          */}
          <picture>
            <source srcSet="/neural-network-beginner.avif" type="image/avif" />
            <source srcSet="/neural-network-beginner.webp" type="image/webp" />
            <Image
              src="/neural-network-beginner.png"
              alt={t.home.primerImageAlt}
              width={1536}
              height={1024}
            />
          </picture>
        </figure>
        <div>
          <p className="eyebrow dark">{t.home.primerEyebrow}</p>
          <h2>{t.home.primerTitle}</h2>
          <p>{t.home.primerBody}</p>
          <LocalizedLink className="button button-dark" href="/start-here" locale={locale}>
            {t.home.primerCta} →
          </LocalizedLink>
        </div>
      </section>

      <section className="pathway" id="pathway">
        <div className="section-heading">
          <p className="eyebrow dark">{t.home.pathwayEyebrow}</p>
          <h2>{t.home.pathwayTitle}</h2>
          <p>{t.home.pathwayBody}</p>
        </div>
        <div className="module-grid">
          {courseModules.map((module) => (
            <LocalizedLink
              className="module-card"
              href={`/modules/${module.slug}#learn`}
              locale={locale}
              key={module.slug}
            >
              <span className="module-number">{module.number}</span>
              <div>
                <p>{resolve(locale, module.subtitle)}</p>
                <h3>{resolve(locale, module.shortTitle)}</h3>
                <small>
                  {formatDuration(module.durationMinutes, locale)} · {resolve(locale, module.level)}
                </small>
              </div>
              <span className="card-arrow" aria-hidden="true">
                ↗
              </span>
            </LocalizedLink>
          ))}
        </div>
        <LocalizedLink className="text-link" href="/courses" locale={locale}>
          {t.home.pathwayMore} <span aria-hidden="true">→</span>
        </LocalizedLink>
      </section>

      <section className="method-section" id="about">
        <div className="method-intro">
          <p className="eyebrow dark">{t.home.methodEyebrow}</p>
          <h2>{t.home.methodTitle}</h2>
        </div>
        <div className="method-steps">
          {t.home.methodSteps.map((step, index) => (
            <article key={step.title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="about-band">
        <p>{t.home.aboutBand}</p>
        <LocalizedLink href="/start-here" locale={locale}>
          {t.home.aboutCta}
        </LocalizedLink>
      </section>

      <SiteFooter locale={locale} />
    </main>
  );
}

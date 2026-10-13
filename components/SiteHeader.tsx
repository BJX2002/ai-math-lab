import { getMessages } from "../lib/i18n/messages";
import type { Locale } from "../lib/i18n/locales";
import { LanguageSwitch } from "./i18n/LanguageSwitch";
import { LocalizedLink } from "./i18n/LocalizedLink";

export function SiteHeader({ locale, dark = false }: { locale: Locale; dark?: boolean }) {
  const t = getMessages(locale);

  return (
    <header className={`site-header ${dark ? "site-header-dark" : ""}`}>
      <LocalizedLink className="brand" href="/" aria-label={t.header.brandHome} locale={locale}>
        <span className="brand-mark" aria-hidden="true">
          A²
        </span>
        <span>AI Math Lab</span>
      </LocalizedLink>
      <div className="header-actions">
        <nav aria-label="Primary navigation">
          <LocalizedLink href="/start-here" locale={locale}>
            {t.header.nav.startHere}
          </LocalizedLink>
          <LocalizedLink href="/courses" locale={locale}>
            {t.header.nav.courses}
          </LocalizedLink>
          <LocalizedLink href="/capstone" locale={locale}>
            {t.header.nav.capstone}
          </LocalizedLink>
          <LocalizedLink href="/extensions" locale={locale}>
            {t.header.nav.extensions}
          </LocalizedLink>
        </nav>
        <LanguageSwitch locale={locale} label={t.header.languageLabel} switchToLabel={t.header.switchTo} />
      </div>
    </header>
  );
}

import { getMessages } from "../lib/i18n/messages";
import type { Locale } from "../lib/i18n/locales";
import { LocalizedLink } from "./i18n/LocalizedLink";

export function SiteFooter({ locale }: { locale: Locale }) {
  const t = getMessages(locale);

  return (
    <footer className="site-footer">
      <div>
        <LocalizedLink className="brand footer-brand" href="/" locale={locale}>
          <span className="brand-mark" aria-hidden="true">
            A²
          </span>
          <span>AI Math Lab</span>
        </LocalizedLink>
        <p>{t.footer.tagline}</p>
      </div>
      <div className="footer-links">
        <LocalizedLink href="/courses" locale={locale}>
          {t.footer.links.courses}
        </LocalizedLink>
        <LocalizedLink href="/modules/vectors" locale={locale}>
          {t.footer.links.start}
        </LocalizedLink>
        <a href="mailto:hello@eduhkaimath.com">{t.footer.links.contact}</a>
      </div>
      <p className="footer-note">{t.footer.note}</p>
    </footer>
  );
}

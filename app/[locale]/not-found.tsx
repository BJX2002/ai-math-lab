"use client";

import { usePathname } from "next/navigation";
import { LocalizedLink } from "../../components/i18n/LocalizedLink";
import { DEFAULT_LOCALE, parseLocalePath } from "../../lib/i18n/locales";
import { getMessages } from "../../lib/i18n/messages";

/**
 * 404 inside the locale shell.
 *
 * `not-found.tsx` receives no route params, so the locale is read from the URL.
 * It cannot use `next/root-params` either: vinext implements that shim for its
 * own server internals but does not expose it to application code.
 */
export default function LocaleNotFound() {
  const pathname = usePathname() ?? "/";
  const locale = parseLocalePath(pathname).locale ?? DEFAULT_LOCALE;
  const t = getMessages(locale).errors;

  return (
    <main className="status-page" id="main">
      <div className="status-card">
        <span className="status-code" aria-hidden="true">
          404
        </span>
        <h1>{t.notFoundTitle}</h1>
        <p>{t.notFoundBody}</p>
        <div className="status-actions">
          <LocalizedLink className="button button-dark" href="/" locale={locale}>
            {t.notFoundHome}
          </LocalizedLink>
          <LocalizedLink className="text-link" href="/courses" locale={locale}>
            {t.notFoundCourses} <span aria-hidden="true">→</span>
          </LocalizedLink>
        </div>
      </div>
    </main>
  );
}

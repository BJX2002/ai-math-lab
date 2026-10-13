"use client";

import { usePathname } from "next/navigation";
import { LocalizedLink } from "../../components/i18n/LocalizedLink";
import { DEFAULT_LOCALE, parseLocalePath } from "../../lib/i18n/locales";
import { getMessages } from "../../lib/i18n/messages";

/**
 * Route-level error boundary.
 *
 * `error.tsx` must be a client component and receives no route params, so the
 * locale is read from the URL, matching `not-found.tsx`.
 */
export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const pathname = usePathname() ?? "/";
  const locale = parseLocalePath(pathname).locale ?? DEFAULT_LOCALE;
  const t = getMessages(locale).errors;

  return (
    <main className="status-page" id="main">
      <div className="status-card">
        <span className="status-code" aria-hidden="true">
          !
        </span>
        <h1>{t.errorTitle}</h1>
        <p>{t.errorBody}</p>
        {error.digest ? <p className="status-digest">digest: {error.digest}</p> : null}
        <div className="status-actions">
          <button className="button button-dark" onClick={reset}>
            {t.errorRetry}
          </button>
          <LocalizedLink className="text-link" href="/courses" locale={locale}>
            {t.notFoundCourses} <span aria-hidden="true">→</span>
          </LocalizedLink>
        </div>
      </div>
    </main>
  );
}

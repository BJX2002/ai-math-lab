"use client";

import { usePathname } from "next/navigation";
import { DEFAULT_LOCALE, parseLocalePath } from "../../lib/i18n/locales";
import { getMessages } from "../../lib/i18n/messages";

/**
 * Shown while a route streams in.
 *
 * Client-side so the announcement matches the language being read; the `lang`
 * attribute itself already comes from the locale layout.
 */
export default function LocaleLoading() {
  const pathname = usePathname() ?? "/";
  const locale = parseLocalePath(pathname).locale ?? DEFAULT_LOCALE;

  return (
    <div className="status-loading" role="status">
      <span className="status-spinner" aria-hidden="true" />
      <span className="visually-hidden">{getMessages(locale).errors.loading}</span>
    </div>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { localePath, otherLocale, parseLocalePath, type Locale } from "../../lib/i18n/locales";

const LABELS: Record<Locale, string> = { zh: "中文", en: "EN" };

/**
 * Language switch that keeps the reader on the same lesson.
 *
 * `usePathname` gives the current route, the locale prefix is stripped, and the
 * same path is rebuilt under the other locale — so `/zh/modules/vectors`
 * becomes `/en/modules/vectors` instead of dumping the reader on the homepage.
 */
export function LanguageSwitch({
  locale,
  label,
  switchToLabel,
}: {
  locale: Locale;
  label: string;
  switchToLabel: string;
}) {
  const pathname = usePathname() ?? "/";
  const { pathname: barePath } = parseLocalePath(pathname);
  const target = otherLocale(locale);

  return (
    <Link
      className="language-switch"
      href={localePath(target, barePath)}
      hrefLang={target}
      lang={target}
      aria-label={switchToLabel}
      title={switchToLabel}
    >
      <span aria-hidden="true">{LABELS[target]}</span>
      <span className="visually-hidden">{switchToLabel}</span>
      <span className="visually-hidden">{label}</span>
    </Link>
  );
}

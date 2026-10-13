/**
 * Locale constants shared by server and client code.
 *
 * Keep this module dependency-free: it is imported by client components, so it
 * must not pull in `next/navigation` or any server-only API.
 */

export const LOCALES = ["zh", "en"] as const;

export type Locale = (typeof LOCALES)[number];

/** The audience is Chinese-speaking AI freshmen, so Chinese is the default. */
export const DEFAULT_LOCALE: Locale = "zh";

export function isLocale(value: string | undefined): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

/** The other locale, for the header language switch. */
export function otherLocale(locale: Locale): Locale {
  return locale === "zh" ? "en" : "zh";
}

/**
 * Build a locale-prefixed href.
 *
 * `href` is always written without a locale prefix in this codebase, e.g.
 * `/modules/vectors` or `/courses#quiz`, so prefixing happens in exactly one
 * place. `localePath("zh", "/")` returns `/zh`, and a hash survives.
 */
export function localePath(locale: Locale, href: string): string {
  if (/^[a-z]+:/i.test(href) || href.startsWith("//")) return href;

  const [pathAndQuery, hash] = splitOnce(href, "#");
  const [pathname, query] = splitOnce(pathAndQuery, "?");
  const normalized = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const withPrefix = normalized === "/" ? `/${locale}` : `/${locale}${normalized}`;

  return `${withPrefix}${query ? `?${query}` : ""}${hash ? `#${hash}` : ""}`;
}

/**
 * Read the locale out of a pathname, e.g. `/en/modules/vectors` -> `en` and the
 * remaining `/modules/vectors`. Returns the locale-less path when there is no
 * prefix, so the language switch can preserve position on any route.
 */
export function parseLocalePath(pathname: string): { locale: Locale | null; pathname: string } {
  const segments = pathname.split("/").filter(Boolean);
  const [first, ...rest] = segments;
  if (isLocale(first)) return { locale: first, pathname: `/${rest.join("/")}` };
  return { locale: null, pathname };
}

function splitOnce(value: string, separator: string): [string, string] {
  const index = value.indexOf(separator);
  if (index === -1) return [value, ""];
  return [value.slice(0, index), value.slice(index + 1)];
}

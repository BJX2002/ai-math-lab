import { notFound } from "next/navigation";
import { DEFAULT_LOCALE, isLocale, type Locale } from "./locales";

/**
 * Narrow an untrusted route param to a `Locale` or render the 404 boundary.
 *
 * Server-only: this module imports `next/navigation`. Client components should
 * import from `./locales` instead.
 */
export function requireLocale(value: string | undefined): Locale {
  if (!isLocale(value)) notFound();
  return value;
}

/**
 * Locale for rendering the page shell.
 *
 * Unlike `requireLocale`, an unrecognised value falls back to the default
 * instead of throwing. The shell must stay renderable for an unknown locale,
 * otherwise the 404 has no working layout to render inside and the reader gets
 * an unstyled error document instead.
 */
export function shellLocale(value: string | undefined): Locale {
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

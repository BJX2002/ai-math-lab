import { LOCALES, type Locale } from "./locales";

/**
 * A value that exists in every supported language.
 *
 * Course content is authored as `Localized<T>` so a missing translation is a
 * type error rather than a runtime fallback. `tests/content.test.mjs` also
 * rejects empty strings at build/test time.
 */
export type Localized<T> = Record<Locale, T>;

export function localized<T>(value: Localized<T>): Localized<T> {
  return value;
}

/** Resolve a localized value for the active locale. */
export function resolve<T>(locale: Locale, value: Localized<T>): T {
  return value[locale];
}

export function resolveAll<T>(value: Localized<T>): T[] {
  return LOCALES.map((locale) => value[locale]);
}

/** True when a localized string has real content in every language. */
export function isComplete(value: Localized<string>): boolean {
  return LOCALES.every((locale) => value[locale].trim().length > 0);
}

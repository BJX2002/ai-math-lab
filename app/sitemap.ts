import type { MetadataRoute } from "next";
import { courseModules } from "../lib/content/index";
import { LOCALES, localePath } from "../lib/i18n/locales";
import { STATIC_ROUTES, absoluteUrl } from "../lib/site";

/**
 * Every page exists in both languages, and `alternates.languages` on each entry
 * tells a crawler they are translations of one another.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    ...STATIC_ROUTES,
    ...courseModules.map((module) => `/modules/${module.slug}`),
  ];

  const languagesFor = (path: string) =>
    Object.fromEntries(
      LOCALES.map((locale) => [locale === "zh" ? "zh-Hans" : "en", absoluteUrl(localePath(locale, path))]),
    );

  return paths.flatMap((path) =>
    LOCALES.map((locale) => ({
      url: absoluteUrl(localePath(locale, path)),
      changeFrequency: "monthly" as const,
      priority: path === "/" ? 1 : 0.7,
      alternates: { languages: languagesFor(path) },
    })),
  );
}

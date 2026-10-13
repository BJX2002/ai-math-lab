import type { Metadata } from "next";
import {
  DEFAULT_LOCALE,
  LOCALES,
  localePath,
  type Locale,
} from "./i18n/locales";

/**
 * Single owner for site identity and origin.
 *
 * Previously the deployment origin was duplicated in `app/layout.tsx` and
 * `app/start-here/page.tsx`; changing the domain meant finding both.
 */
export const SITE_ORIGIN =
  process.env.NEXT_PUBLIC_SITE_ORIGIN ??
  "https://ai-math-lab-foundations.woshisheiwoshifei.chatgpt.site";

export const SITE_NAME = "AI Math Lab";

/** Routes that exist for every locale, used by `sitemap.ts`. */
export const STATIC_ROUTES = [
  "/",
  "/start-here",
  "/courses",
  "/capstone",
  "/extensions",
  "/extensions/linear-algebra",
  "/extensions/pytorch",
] as const;

export function absoluteUrl(path: string): string {
  return new URL(path, SITE_ORIGIN).toString();
}

/** `hreflang` alternates so search engines pair the two language versions. */
export function languageAlternates(path: string): Metadata["alternates"] {
  const languages: Record<string, string> = {};
  for (const locale of LOCALES) languages[locale] = absoluteUrl(localePath(locale, path));
  return { canonical: absoluteUrl(localePath(DEFAULT_LOCALE, path)), languages };
}

export function localizedTitles(locale: Locale): { home: string; description: string } {
  return locale === "zh"
    ? {
        home: "AI Math Lab — 给 AI 新生的线性代数与神经网络",
        description: "用图片、可拖拽的图形和能真跑的 Python，从零学懂 AI 背后的线性代数与神经网络。",
      }
    : {
        home: "AI Math Lab — Linear Algebra & Neural Networks for AI Beginners",
        description:
          "Learn the linear algebra and neural networks behind AI from zero, with pictures, draggable diagrams, and Python you can actually run.",
      };
}

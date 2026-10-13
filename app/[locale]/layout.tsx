import type { Metadata } from "next";
import type { ReactNode } from "react";
import { LOCALES } from "../../lib/i18n/locales";
import { getMessages } from "../../lib/i18n/messages";
import { shellLocale } from "../../lib/i18n/server";
import { SITE_NAME, SITE_ORIGIN, localizedTitles } from "../../lib/site";
import "../../styles/tokens.css";
import "../../styles/shell.css";
import "../../styles/lesson.css";
import "../../styles/guide.css";
// Must come last so the breakpoint overrides win over the base rules above.
import "../../styles/responsive.css";

/**
 * The outermost layout of the site.
 *
 * It lives inside `[locale]` on purpose: that is what makes `<html lang>`
 * correct per language, and it is the arrangement vinext supports (a root
 * layout at `app/layout.tsx` is optional and the first layout in the chain is
 * treated as the root).
 */
export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  // Tolerant on purpose: metadata must not throw for a bad locale, or the 404
  // would have no shell to render inside.
  const locale = shellLocale((await params).locale);
  const { home, description } = localizedTitles(locale);

  return {
    title: home,
    description,
    metadataBase: new URL(SITE_ORIGIN),
    applicationName: SITE_NAME,
    openGraph: {
      title: home,
      description,
      type: "website",
      siteName: SITE_NAME,
      locale: locale === "zh" ? "zh_CN" : "en_US",
      images: [{ url: "/og.png", width: 1200, height: 768, alt: home }],
    },
    twitter: { card: "summary_large_image", title: home, description, images: ["/og.png"] },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const locale = shellLocale((await params).locale);
  const t = getMessages(locale);

  return (
    <html lang={locale === "zh" ? "zh-Hans" : "en"}>
      <body>
        <a className="skip-link" href="#main">
          {t.common.skipToContent}
        </a>
        {children}
      </body>
    </html>
  );
}

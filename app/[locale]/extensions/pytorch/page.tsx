import type { Metadata } from "next";
import { ExtensionArticle } from "../../../../components/ExtensionArticle";
import { PYTORCH_EXTENSION } from "../../../../lib/content/extension-pytorch";
import { resolve } from "../../../../lib/i18n/localized";
import { requireLocale } from "../../../../lib/i18n/server";
import { languageAlternates } from "../../../../lib/site";
import type { Locale } from "../../../../lib/i18n/locales";

const PATH = "/extensions/pytorch";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const locale: Locale = requireLocale((await params).locale);
  const copy = resolve(locale, PYTORCH_EXTENSION.copy);
  return {
    title: copy.title,
    description: copy.description,
    alternates: languageAlternates(PATH),
    openGraph: { title: copy.title, description: copy.description, images: [] },
    twitter: { title: copy.title, description: copy.description, images: [] },
  };
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const locale: Locale = requireLocale((await params).locale);
  return (
    <ExtensionArticle
      locale={locale}
      copy={resolve(locale, PYTORCH_EXTENSION.copy)}
      topics={PYTORCH_EXTENSION.topics}
    />
  );
}

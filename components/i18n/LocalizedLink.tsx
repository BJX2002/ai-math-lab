import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { localePath, type Locale } from "../../lib/i18n/locales";

type LocalizedLinkProps = Omit<ComponentProps<typeof Link>, "href"> & {
  locale: Locale;
  /** Always written without a locale prefix, e.g. `/modules/vectors`. */
  href: string;
  children: ReactNode;
};

/**
 * The single place where a locale prefix is added to an internal link.
 *
 * Writing hrefs without a prefix everywhere else means a new route cannot
 * accidentally ship as Chinese-only or English-only.
 */
export function LocalizedLink({ locale, href, children, ...rest }: LocalizedLinkProps) {
  return (
    <Link {...rest} href={localePath(locale, href)}>
      {children}
    </Link>
  );
}

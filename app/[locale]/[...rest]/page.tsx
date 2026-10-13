import { notFound } from "next/navigation";

/**
 * Catch-all for unknown paths inside a locale prefix.
 *
 * Without this, an unmatched URL such as `/en/typo` never enters the `[locale]`
 * route at all. The locale layout then runs with no locale param, so the
 * document declares the default language while the reader is browsing the
 * English tree. Routing the miss through a real route keeps `<html lang>`, the
 * 404 copy, and the shell consistent, because the layout finally receives the
 * locale and `not-found.tsx` renders inside it.
 */
export default function LocaleCatchAll(): never {
  notFound();
}

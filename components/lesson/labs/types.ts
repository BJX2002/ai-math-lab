import type { Locale } from "../../../lib/i18n/locales";

/**
 * Props every interactive lab receives.
 *
 * Kept in its own module so `labs.tsx` (the registry) and the per-topic lab
 * files can share it without importing each other.
 */
export type LabProps = { locale: Locale };

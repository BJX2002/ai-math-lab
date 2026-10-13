"use client";

import { useProgress } from "../hooks/useProgress";
import { MODULE_SLUGS } from "../lib/content/index";
import { interpolate } from "../lib/i18n/format";
import type { Locale } from "../lib/i18n/locales";
import { getMessages } from "../lib/i18n/messages";
import { completedCount, completionPercent } from "../lib/progress";

const TOTAL_MODULES = MODULE_SLUGS.length;

/**
 * Course progress readout.
 *
 * Renders a neutral placeholder until the client has read storage, so the
 * server HTML and the first client render agree (this component used to read
 * `localStorage` during render, which broke hydration).
 */
export function ProgressOverview({ locale }: { locale: Locale }) {
  const t = getMessages(locale);
  const { progress } = useProgress();

  const total = TOTAL_MODULES;
  const hydrated = progress !== null;
  const done = progress ? completedCount(progress, MODULE_SLUGS) : 0;
  const percent = progress ? completionPercent(done, total) : 0;

  return (
    <aside className="progress-card" aria-label={t.progress.label}>
      <div className="progress-copy">
        <span>{t.progress.label}</span>
        <strong>
          {hydrated ? done : "—"} / {total} {t.progress.unit}
        </strong>
      </div>
      <div
        className="progress-track"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        aria-label={interpolate(t.progress.ariaComplete, { percent })}
      >
        <span style={{ width: `${percent}%` }} />
      </div>
      <b>{hydrated ? `${percent}%` : "—"}</b>
    </aside>
  );
}

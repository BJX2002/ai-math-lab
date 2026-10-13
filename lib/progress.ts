/**
 * Single owner of study progress.
 *
 * Progress used to be read and written by two components that each kept their
 * own copy of the storage key, and both read `localStorage` inside a `useState`
 * initializer — which made the server-rendered HTML disagree with the first
 * client render.
 *
 * This module owns storage access and the data shape, and is deliberately free
 * of React and DOM-event code so it can be unit-tested in plain Node.
 * `hooks/useProgress.ts` adapts it to React through `useSyncExternalStore`.
 */

export const PROGRESS_STORAGE_KEY = "ai-math-lab-progress";

/** Same-tab change signal; the DOM `storage` event only fires in other tabs. */
export const PROGRESS_CHANGE_EVENT = "ai-math-lab-progress-change";

const CURRENT_VERSION = 2;

export type ProgressState = {
  version: number;
  /** Module slugs the reader has marked complete. */
  completed: string[];
};

export function emptyProgress(): ProgressState {
  return { version: CURRENT_VERSION, completed: [] };
}

/**
 * Parse a stored value.
 *
 * Handles the v1 shape (a bare JSON array of slugs) so existing readers keep
 * their progress, and never throws: a corrupted entry falls back to empty.
 */
export function normalizeProgress(raw: string | null): ProgressState {
  if (raw === null) return emptyProgress();

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return emptyProgress();
  }

  if (Array.isArray(parsed)) {
    return { version: CURRENT_VERSION, completed: onlyStrings(parsed) };
  }
  if (parsed && typeof parsed === "object") {
    const completed = (parsed as { completed?: unknown }).completed;
    if (Array.isArray(completed)) {
      return { version: CURRENT_VERSION, completed: onlyStrings(completed) };
    }
  }
  return emptyProgress();
}

function onlyStrings(values: unknown[]): string[] {
  return Array.from(
    new Set(
      values.filter((value): value is string => typeof value === "string" && value.length > 0),
    ),
  );
}

/** Read progress from storage. Safe to call in a browser only. */
export function readProgress(): ProgressState {
  if (typeof window === "undefined") return emptyProgress();
  try {
    return normalizeProgress(window.localStorage.getItem(PROGRESS_STORAGE_KEY));
  } catch {
    return emptyProgress();
  }
}

/** Announce that progress changed. */
export function emitProgressChange(): void {
  window.dispatchEvent(new Event(PROGRESS_CHANGE_EVENT));
}

export function setModuleComplete(slug: string, complete: boolean): void {
  if (typeof window === "undefined") return;

  const current = readProgress();
  const next: ProgressState = {
    version: CURRENT_VERSION,
    completed: complete
      ? Array.from(new Set([...current.completed, slug]))
      : current.completed.filter((item) => item !== slug),
  };

  try {
    window.localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Storage unavailable (private mode, quota). The change event below still
    // re-reads storage, so the UI reflects whatever was actually persisted.
  }
  emitProgressChange();
}

export function isModuleComplete(state: ProgressState, slug: string): boolean {
  return state.completed.includes(slug);
}

/**
 * Count completed modules that still exist in the course.
 *
 * Counting `state.completed.length` directly would also count slugs left behind
 * by a renamed or removed module.
 */
export function completedCount(state: ProgressState, knownSlugs: readonly string[]): number {
  return knownSlugs.filter((slug) => state.completed.includes(slug)).length;
}

export function completionPercent(completed: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((completed / total) * 100);
}

"use client";

import { useCallback, useSyncExternalStore } from "react";
import {
  PROGRESS_CHANGE_EVENT,
  PROGRESS_STORAGE_KEY,
  emptyProgress,
  isModuleComplete as isComplete,
  normalizeProgress,
  setModuleComplete as persistComplete,
  type ProgressState,
} from "../lib/progress";

/**
 * `null` means "the snapshot is not known yet".
 *
 * During server rendering and hydration React uses `getServerSnapshot`, so both
 * produce the same placeholder markup. Once hydrated, the real snapshot from
 * storage takes over. This is what keeps the completion band and the progress
 * bar from disagreeing with the server HTML.
 */
export type ProgressSnapshot = ProgressState | null;

function readRaw(): string | null {
  try {
    return window.localStorage.getItem(PROGRESS_STORAGE_KEY);
  } catch {
    return null;
  }
}

// `getSnapshot` must return a stable reference between real changes, so the
// parsed state is cached and only recomputed when the stored string differs.
let cachedRaw: string | null | undefined;
let cachedSnapshot: ProgressSnapshot = null;

function getSnapshot(): ProgressSnapshot {
  const raw = readRaw();
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedSnapshot = normalizeProgress(raw);
  }
  return cachedSnapshot;
}

function getServerSnapshot(): ProgressSnapshot {
  return null;
}

function subscribe(onStoreChange: () => void): () => void {
  // `storage` covers other tabs; the custom event covers this one.
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(PROGRESS_CHANGE_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(PROGRESS_CHANGE_EVENT, onStoreChange);
  };
}

export type UseProgressResult = {
  progress: ProgressSnapshot;
  isModuleComplete: (slug: string) => boolean;
  setModuleComplete: (slug: string, complete: boolean) => void;
};

export function useProgress(): UseProgressResult {
  const progress = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const isModuleComplete = useCallback(
    (slug: string) => isComplete(progress ?? emptyProgress(), slug),
    [progress],
  );

  return { progress, isModuleComplete, setModuleComplete: persistComplete };
}

"use client";

import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { interpolate } from "../../lib/i18n/format";
import type { Locale } from "../../lib/i18n/locales";
import { getMessages } from "../../lib/i18n/messages";
import { PYODIDE_APPROX_MB, type PythonPhase } from "../../lib/py/config";
import { pythonSupported, runPython, stopPython } from "../../lib/py/runtime";

/** Consecutive chunks from the same stream are merged into one block. */
type Segment = { stream: "stdout" | "stderr"; text: string };

const INDENT = "    ";

/** Capabilities do not change during a session, so there is nothing to subscribe to. */
function subscribeToCapabilities(): () => void {
  return () => {};
}

const readSupported = () => pythonSupported();
/** Optimistic on the server: the real answer is only knowable in a browser. */
const assumeSupported = () => true;

/**
 * An editable, runnable Python cell.
 *
 * Three states matter and all three are visible:
 *  - before the first run the reader sees the code plus the expected output, so
 *    the lesson is complete with no JavaScript and no download;
 *  - while running, stdout streams in;
 *  - if the runtime cannot load at all, the expected output is still there and
 *    the cell says why.
 *
 * Editing is a plain `<textarea>`: no editor dependency, and it works with
 * screen readers and the on-screen keyboard of a phone.
 */
export function PyCell({
  locale,
  fileName,
  source,
  expectedOutput,
  expectedNote,
}: {
  locale: Locale;
  fileName: string;
  source: string;
  expectedOutput: string;
  expectedNote: string;
}) {
  const t = getMessages(locale).py;
  const moduleT = getMessages(locale).module;
  const [code, setCode] = useState(source);
  const [phase, setPhase] = useState<PythonPhase>("idle");
  const [segments, setSegments] = useState<Segment[]>([]);
  const [hasRun, setHasRun] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);
  const [stopped, setStopped] = useState(false);
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle");
  const outputRef = useRef<HTMLPreElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Read through `useSyncExternalStore` so server and first client render agree:
  // capability detection cannot run during render, and setting state from an
  // effect would add a second render pass for no benefit.
  const supported = useSyncExternalStore(
    subscribeToCapabilities,
    readSupported,
    assumeSupported,
  );
  const unsupported = !supported;

  const running = phase === "running" || phase === "loading";

  // Follow the newest line while output streams in.
  useEffect(() => {
    const node = outputRef.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [segments]);

  async function onRun() {
    setFailure(null);
    setStopped(false);
    setSegments([]);
    setHasRun(true);

    const outcome = await runPython(code, {
      onPhase: setPhase,
      onOutput: (text, stream) =>
        setSegments((previous) => {
          const last = previous.at(-1);
          if (last && last.stream === stream) {
            return [...previous.slice(0, -1), { ...last, text: last.text + text }];
          }
          return [...previous, { stream, text }];
        }),
    });

    setPhase("idle");
    if (outcome.ok) return;
    if (outcome.cancelled) {
      setStopped(true);
      return;
    }
    setFailure(outcome.error);
  }

  function onStop() {
    stopPython();
    setPhase("idle");
    setStopped(true);
  }

  function onReset() {
    setCode(source);
    setSegments([]);
    setHasRun(false);
    setFailure(null);
    setStopped(false);
  }

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopyState("copied");
    } catch {
      // Clipboard access needs a secure context and can be refused.
      setCopyState("failed");
    }
    window.setTimeout(() => setCopyState("idle"), 1800);
  }

  function onKeyDown(event: ReactKeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== "Tab") return;
    // Tab must indent rather than leave the editor, or Python is unwritable.
    event.preventDefault();
    const field = event.currentTarget;
    const { selectionStart, selectionEnd } = field;
    setCode(code.slice(0, selectionStart) + INDENT + code.slice(selectionEnd));
    requestAnimationFrame(() => {
      const caret = selectionStart + INDENT.length;
      field.selectionStart = caret;
      field.selectionEnd = caret;
      field.focus();
    });
  }

  const statusText = unsupported
    ? t.statusFailed
    : failure
      ? t.statusFailed
      : phase === "loading"
        ? t.statusLoading
        : phase === "running"
          ? t.statusRunning
          : hasRun
            ? t.statusReady
            : t.statusIdle;

  const dirty = code !== source;

  return (
    <div className="py-cell">
      <div className="panel-bar">
        <span>{fileName}</span>
        <div className="py-actions">
          <button className="py-run" onClick={onRun} disabled={running || unsupported}>
            {running ? t.statusRunning : t.run}
          </button>
          <button className="py-stop" onClick={onStop} disabled={!running}>
            {t.stop}
          </button>
          <button className="py-reset" onClick={onReset} disabled={!dirty}>
            {t.reset}
          </button>
          <button className="py-copy" onClick={onCopy}>
            {copyState === "copied"
              ? moduleT.copied
              : copyState === "failed"
                ? moduleT.copyFailed
                : moduleT.copyCode}
          </button>
        </div>
      </div>

      <label className="visually-hidden" htmlFor={`${fileName}-editor`}>
        {t.title}
      </label>
      <textarea
        id={`${fileName}-editor`}
        ref={textareaRef}
        className="py-editor"
        value={code}
        spellCheck={false}
        rows={Math.min(26, Math.max(8, code.split("\n").length + 1))}
        onChange={(event) => setCode(event.target.value)}
        onKeyDown={onKeyDown}
      />

      <p className={`py-status py-status-${failure ? "failed" : phase}`} aria-live="polite">
        <span className="py-dot" aria-hidden="true" />
        {statusText}
      </p>

      <div className="py-note">
        <p>{interpolate(t.firstRunNote, { mb: PYODIDE_APPROX_MB })}</p>
        <p>{t.offlineNote}</p>
      </div>

      <div className="py-pane">
        <div className="py-pane-head">
          <span>{t.expectedTitle}</span>
        </div>
        <pre className="py-output py-expected">
          <code>{expectedOutput}</code>
        </pre>
        <p className="py-expected-note">{expectedNote}</p>
      </div>

      {hasRun ? (
        <div className="py-pane">
          <div className="py-pane-head">
            <span>{t.outputTitle}</span>
            <small>{t.kernelNote}</small>
          </div>
          {stopped ? <p className="py-banner py-banner-stopped">{t.stopped}</p> : null}
          {failure && !stopped ? <p className="py-banner py-banner-failed">{failure}</p> : null}
          {/*
            The output pane scrolls, so it must be reachable by keyboard for a
            reader who cannot use a mouse to scroll it. A labelled `region` with
            a tab stop is the documented pattern for a scrollable container; the
            a11y lint rule cannot tell a scroll container from decoration.
          */}
          {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- scrollable region needs a tab stop */}
          <pre className="py-output" ref={outputRef} tabIndex={0} role="region" aria-label={t.outputTitle}>
            {segments.length === 0 ? (
              <code className="py-empty">—</code>
            ) : (
              segments.map((segment, index) => (
                <code key={index} className={segment.stream === "stderr" ? "py-stderr" : undefined}>
                  {segment.text}
                </code>
              ))
            )}
          </pre>
        </div>
      ) : (
        <p className="py-hint">{t.editHint}</p>
      )}
    </div>
  );
}

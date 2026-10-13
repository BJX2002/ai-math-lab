"use client";

import { useId, useState } from "react";
import type { Locale } from "../../lib/i18n/locales";
import { getMessages } from "../../lib/i18n/messages";

/**
 * Predict-before-you-look.
 *
 * The reader commits to an answer, gets the verdict, then reads why. This is the
 * cheapest way to turn passive reading into thinking, so it is part of the
 * content model rather than a special case for one lesson.
 */
export function Predict({
  locale,
  prompt,
  options,
  answerIndex,
  why,
}: {
  locale: Locale;
  prompt: string;
  options: string[];
  answerIndex: number;
  why: string;
}) {
  const t = getMessages(locale).block;
  const groupName = useId();
  const [chosen, setChosen] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);

  const isCorrect = chosen === answerIndex;
  const verdict = isCorrect ? t.correct : t.notQuite;

  return (
    <div className="predict-card">
      <div className="predict-head">
        <span>{t.predict}</span>
      </div>
      <p className="predict-prompt">{prompt}</p>
      <div className="predict-options" role="radiogroup" aria-label={prompt}>
        {options.map((option, index) => {
          const state = revealed
            ? index === answerIndex
              ? "correct"
              : chosen === index
                ? "incorrect"
                : ""
            : chosen === index
              ? "chosen"
              : "";
          return (
            <label className={state} key={option}>
              <input
                type="radio"
                name={groupName}
                checked={chosen === index}
                onChange={() => {
                  setChosen(index);
                  // Changing the answer hides the previous verdict again.
                  setRevealed(false);
                }}
              />
              <span>{option}</span>
            </label>
          );
        })}
      </div>
      <div className="predict-actions">
        <button
          className="button button-primary"
          onClick={() => setRevealed(true)}
          disabled={chosen === null || revealed}
        >
          {t.reveal}
        </button>
        {revealed ? (
          <strong
            className={`predict-verdict ${isCorrect ? "correct" : "incorrect"}`}
            aria-live="polite"
          >
            {verdict}
          </strong>
        ) : null}
      </div>
      {revealed ? <p className="predict-why">{why}</p> : null}
    </div>
  );
}

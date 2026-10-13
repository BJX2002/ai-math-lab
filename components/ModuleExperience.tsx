"use client";

import { useState } from "react";
import { useProgress } from "../hooks/useProgress";
import type { ModuleExperienceView } from "../lib/content/view";
import type { Locale } from "../lib/i18n/locales";
import { getMessages } from "../lib/i18n/messages";
import { LabView } from "./lesson/labs";
import { PyCell } from "./py/PyCell";

export function ModuleExperience({  view,
  locale,
}: {
  view: ModuleExperienceView;
  locale: Locale;
}) {
  const t = getMessages(locale);
  const { progress, isModuleComplete, setModuleComplete } = useProgress();

  const [answers, setAnswers] = useState<(number | null)[]>(() => view.quiz.map(() => null));
  const [checked, setChecked] = useState(false);

  // Storage is only read after hydration, so server and first client render agree.
  const hydrated = progress !== null;
  const complete = hydrated && isModuleComplete(view.slug);

  const score = answers.reduce<number>(
    (total, answer, index) => total + (answer === view.quiz[index].correct ? 1 : 0),
    0,
  );

  function toggleComplete() {
    setModuleComplete(view.slug, !complete);
  }

  return (
    <>
      <section className="interactive-section" id="practice">
        <div className="lesson-kicker">{t.module.practiceKicker}</div>
        <div className="section-heading inline-heading">
          <h2>{t.module.practiceTitle}</h2>
          <p>{t.module.practiceBody}</p>
        </div>
        <LabView id={view.lab} locale={locale} />
      </section>

      <section className="code-lab-section" id="code-lab">
        <div className="code-lab-copy">
          <div className="lesson-kicker light">{t.module.codeKicker}</div>
          <h2>{view.code.title}</h2>
          <p>{view.code.intro}</p>
          <p className="code-reassurance">
            <strong>{t.module.codeReassuranceLead}</strong> {t.module.codeReassuranceBody}
          </p>
          <div className="challenge-card">
            <span>{t.module.tryThis}</span>
            <p>{view.code.challenge}</p>
          </div>
        </div>
        <PyCell
          locale={locale}
          fileName={view.code.id}
          source={view.code.source}
          expectedOutput={view.code.expectedOutput}
          expectedNote={view.code.expectedNote}
        />
      </section>

      <section className="quiz-section" id="quiz">
        <div className="section-heading inline-heading">
          <p className="eyebrow dark">{t.module.quizEyebrow}</p>
          <h2>{t.module.quizTitle}</h2>
          <p>{t.module.quizBody}</p>
        </div>
        <div className="quiz-list">
          {view.quiz.map((item, questionIndex) => (
            <fieldset key={item.question} className="quiz-card">
              <legend>
                <span>{String(questionIndex + 1).padStart(2, "0")}</span>
                {item.question}
              </legend>
              {item.options.map((option, optionIndex) => {
                const chosen = answers[questionIndex] === optionIndex;
                const state = checked
                  ? optionIndex === item.correct
                    ? "correct"
                    : chosen
                      ? "incorrect"
                      : ""
                  : "";
                return (
                  <label className={state} key={option}>
                    <input
                      type="radio"
                      name={`${view.slug}-question-${questionIndex}`}
                      checked={chosen}
                      onChange={() => {
                        const next = [...answers];
                        next[questionIndex] = optionIndex;
                        setAnswers(next);
                        setChecked(false);
                      }}
                    />
                    <span>{option}</span>
                  </label>
                );
              })}
              {checked ? <p className="quiz-explanation">{item.explanation}</p> : null}
            </fieldset>
          ))}
        </div>
        <div className="quiz-actions">
          <button
            className="button button-primary"
            onClick={() => setChecked(true)}
            disabled={answers.some((answer) => answer === null)}
          >
            {t.module.checkAnswers}
          </button>
          {checked ? (
            <strong aria-live="polite">
              {score} / {view.quiz.length} {t.module.correctCount}
            </strong>
          ) : null}
        </div>
      </section>

      <section className={`completion-band ${complete ? "is-complete" : ""}`}>
        <div>
          <span>{complete ? t.module.completionDone : t.module.completionReady}</span>
          <h2>{complete ? t.module.completionDoneBody : t.module.completionReadyBody}</h2>
        </div>
        <button onClick={toggleComplete} disabled={!hydrated}>
          {complete ? t.module.undoComplete : t.module.markComplete}
        </button>
      </section>
    </>
  );
}

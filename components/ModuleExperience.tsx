"use client";

import { useState } from "react";
import type { CourseModule } from "../lib/course-data";
import { InteractiveLab } from "./InteractiveLab";

const STORAGE_KEY = "ai-math-lab-progress";

export function ModuleExperience({ module }: { module: CourseModule }) {
  const [answers, setAnswers] = useState<(number | null)[]>(module.quiz.map(() => null));
  const [checked, setChecked] = useState(false);
  const [complete, setComplete] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      const completed: string[] = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
      return completed.includes(module.slug);
    } catch {
      return false;
    }
  });
  const [copied, setCopied] = useState(false);

  const score = answers.reduce<number>((total, answer, index) => total + (answer === module.quiz[index].correct ? 1 : 0), 0);

  function toggleComplete() {
    let completed: string[] = [];
    try { completed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]"); } catch { completed = []; }
    completed = complete ? completed.filter((slug) => slug !== module.slug) : Array.from(new Set([...completed, module.slug]));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(completed));
    setComplete(!complete);
  }

  async function copyCode() {
    await navigator.clipboard.writeText(module.code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  return (
    <>
      <section className="interactive-section" id="practice">
        <div className="lesson-kicker">INTERACTIVE CHECKPOINT</div>
        <div className="section-heading inline-heading">
          <h2>Change the values. Watch the idea respond.</h2>
          <p>This mini-lab runs in your browser. It is designed to build prediction habits before you move into Python.</p>
        </div>
        <InteractiveLab slug={module.slug} />
      </section>

      <section className="code-lab-section" id="code-lab">
        <div className="code-lab-copy">
          <div className="lesson-kicker light">NUMPY CODE LAB</div>
          <h2>{module.codeTitle}</h2>
          <p>{module.codeIntro}</p>
          <div className="challenge-card"><span>TRY THIS</span><p>{module.challenge}</p></div>
          <details><summary>Show expected insight</summary><p>{module.expected}</p></details>
        </div>
        <div className="full-code-panel">
          <div className="panel-bar"><span>module_{module.number}.py</span><button onClick={copyCode}>{copied ? "COPIED" : "COPY CODE"}</button></div>
          <pre><code>{module.code}</code></pre>
        </div>
      </section>

      <section className="quiz-section" id="quiz">
        <div className="section-heading inline-heading">
          <p className="eyebrow dark">KNOWLEDGE CHECK</p>
          <h2>Can you explain it without the notes?</h2>
          <p>Choose an answer for each question, then check your reasoning.</p>
        </div>
        <div className="quiz-list">
          {module.quiz.map((item, questionIndex) => (
            <fieldset key={item.question} className="quiz-card">
              <legend><span>0{questionIndex + 1}</span>{item.question}</legend>
              {item.options.map((option, optionIndex) => {
                const chosen = answers[questionIndex] === optionIndex;
                const state = checked ? (optionIndex === item.correct ? "correct" : chosen ? "incorrect" : "") : "";
                return <label className={state} key={option}><input type="radio" name={`question-${questionIndex}`} checked={chosen} onChange={() => { const next = [...answers]; next[questionIndex] = optionIndex; setAnswers(next); setChecked(false); }} /><span>{option}</span></label>;
              })}
              {checked && <p className="quiz-explanation">{item.explanation}</p>}
            </fieldset>
          ))}
        </div>
        <div className="quiz-actions">
          <button className="button button-primary" onClick={() => setChecked(true)} disabled={answers.some((answer) => answer === null)}>Check answers</button>
          {checked && <strong>{score} / {module.quiz.length} correct</strong>}
        </div>
      </section>

      <section className={`completion-band ${complete ? "is-complete" : ""}`}>
        <div><span>{complete ? "MODULE COMPLETE" : "READY TO MOVE ON?"}</span><h2>{complete ? "Nicely done. Your progress is saved on this device." : "Mark this module complete when you can explain the key idea."}</h2></div>
        <button onClick={toggleComplete}>{complete ? "Undo completion" : "Mark complete ✓"}</button>
      </section>
    </>
  );
}

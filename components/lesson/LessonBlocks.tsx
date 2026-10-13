import type { LessonBlock } from "../../lib/content/types";
import type { Locale } from "../../lib/i18n/locales";
import { getMessages } from "../../lib/i18n/messages";
import { resolve } from "../../lib/i18n/localized";
import { Formula } from "./Formula";
import { Predict } from "./Predict";
import { FigureView } from "./figures";
import { LabView } from "./labs";

/** A compile-time guarantee that every block kind is handled. */
function assertNever(value: never): never {
  throw new Error(`Unhandled lesson block: ${JSON.stringify(value)}`);
}

const CALLOUT_LABEL_KEYS = {
  analogy: "calloutAnalogy",
  warning: "calloutWarning",
  takeaway: "calloutTakeaway",
  tip: "calloutTip",
} as const;

export function LessonBlockView({ block, locale }: { block: LessonBlock; locale: Locale }) {
  const t = getMessages(locale);

  switch (block.kind) {
    case "prose":
      return (
        <>
          {resolve(locale, block.paragraphs).map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </>
      );

    case "formula": {
      const math = <Formula tex={block.tex} caption={block.caption ? resolve(locale, block.caption) : undefined} />;
      if (!block.reveal) return math;
      return (
        <details className="math-reveal">
          <summary>{t.module.revealMath}</summary>
          {math}
        </details>
      );
    }

    case "callout": {
      const label = t.block[CALLOUT_LABEL_KEYS[block.tone]];
      return (
        <aside className={`block-callout tone-${block.tone}`}>
          <span>{label}</span>
          {block.title ? <strong>{resolve(locale, block.title)}</strong> : null}
          <p>{resolve(locale, block.body)}</p>
        </aside>
      );
    }

    case "example":
      return (
        <div className="worked-example">
          <span>{t.module.workedExample}</span>
          <strong className="example-title">{resolve(locale, block.title)}</strong>
          <ol>
            {resolve(locale, block.steps).map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
          {block.result ? (
            <p className="example-result">
              <b>{t.block.result}:</b> {resolve(locale, block.result)}
            </p>
          ) : null}
        </div>
      );

    case "predict":
      return (
        <Predict
          locale={locale}
          prompt={resolve(locale, block.prompt)}
          options={resolve(locale, block.options)}
          answerIndex={block.answerIndex}
          why={resolve(locale, block.why)}
        />
      );

    case "figure":
      return (
        <FigureView
          id={block.id}
          locale={locale}
          caption={block.caption ? resolve(locale, block.caption) : undefined}
        />
      );

    case "lab":
      return (
        <div className="block-lab">
          <LabView id={block.id} locale={locale} />
        </div>
      );

    case "table":
      return (
        <figure className="block-table">
          <table>
            <thead>
              <tr>
                {resolve(locale, block.headers).map((header) => (
                  <th key={header} scope="col">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {resolve(locale, block.rows).map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {block.caption ? <figcaption>{resolve(locale, block.caption)}</figcaption> : null}
        </figure>
      );

    default:
      return assertNever(block);
  }
}

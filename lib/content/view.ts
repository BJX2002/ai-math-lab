import type { Locale } from "../i18n/locales";
import { resolve } from "../i18n/localized";
import type { CourseModule, LabId } from "./types";

export type QuizItemView = {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
};

export type CodeCellView = {
  id: string;
  title: string;
  intro: string;
  source: string;
  challenge: string;
  expectedOutput: string;
  expectedNote: string;
};

/**
 * The slice of a module the interactive client component needs, with every
 * `Localized` value already resolved to one language.
 *
 * This exists for payload size. Passing the whole `CourseModule` as a prop
 * serializes BOTH languages into the RSC flight data of every page, so the
 * English lesson shipped the complete Chinese text and vice versa — roughly
 * doubling the transferred page for content that is never displayed.
 */
export type ModuleExperienceView = {
  slug: string;
  number: string;
  lab: LabId;
  code: CodeCellView;
  quiz: QuizItemView[];
};

export function toModuleExperienceView(
  module: CourseModule,
  locale: Locale,
): ModuleExperienceView {
  return {
    slug: module.slug,
    number: module.number,
    lab: module.lab,
    code: {
      id: module.code.id,
      title: resolve(locale, module.code.title),
      intro: resolve(locale, module.code.intro),
      source: module.code.source,
      challenge: resolve(locale, module.code.challenge),
      expectedOutput: module.code.expectedOutput,
      expectedNote: resolve(locale, module.code.expectedNote),
    },
    quiz: module.quiz.map((item) => ({
      question: resolve(locale, item.question),
      options: resolve(locale, item.options),
      correct: item.correct,
      explanation: resolve(locale, item.explanation),
    })),
  };
}

import type { Locale } from "../i18n/locales";
import { vectors } from "./modules/01-vectors";
import { dotProducts } from "./modules/02-dot-products";
import { matrices } from "./modules/03-matrices";
import { linearSystems } from "./modules/04-linear-systems";
import { pcaSvd } from "./modules/05-pca-svd";
import { optimization } from "./modules/06-optimization";
import { perceptron } from "./modules/07-perceptron";
import { activations } from "./modules/08-activations";
import { layerShapes } from "./modules/09-layer-shapes";
import { lossFunctions } from "./modules/10-loss-functions";
import { backpropagation } from "./modules/11-backpropagation";
import { trainingPractice } from "./modules/12-training-practice";
import type { CourseModule } from "./types";

export * from "./types";

/**
 * The course, in teaching order.
 *
 * Two halves: the linear algebra that everything is built from, then the neural
 * networks themselves. Modules 07 onward follow the notation of the course
 * lectures they support — `E(W, b)` for the loss and `α` for the learning rate —
 * so `track` also marks where that vocabulary starts.
 *
 * Content is data, not JSX, so `tests/content.test.mjs` can validate it in plain
 * Node without a browser or a build.
 */
export const courseModules: CourseModule[] = [
  vectors,
  dotProducts,
  matrices,
  linearSystems,
  pcaSvd,
  optimization,
  perceptron,
  activations,
  layerShapes,
  lossFunctions,
  backpropagation,
  trainingPractice,
];

export const MODULE_SLUGS: string[] = courseModules.map((module) => module.slug);

export function getModule(slug: string): CourseModule | undefined {
  return courseModules.find((module) => module.slug === slug);
}

export function getModuleNeighbours(slug: string): {
  previous?: CourseModule;
  next?: CourseModule;
  index: number;
} {
  const index = courseModules.findIndex((module) => module.slug === slug);
  return {
    index,
    previous: index > 0 ? courseModules[index - 1] : undefined,
    next: index >= 0 && index < courseModules.length - 1 ? courseModules[index + 1] : undefined,
  };
}

/** "35 分钟" / "35 min" — the duration is data, its wording is UI. */
export function formatDuration(minutes: number, locale: Locale): string {
  return locale === "zh" ? `${minutes} 分钟` : `${minutes} min`;
}

export type CourseStats = {
  moduleCount: number;
  quizCount: number;
  labCount: number;
  guidedMinutes: number;
  /** Guided study time rounded down to the nearest half hour, e.g. 4.5. */
  guidedHours: number;
};

/**
 * Derive the headline numbers on the course page from the content itself.
 *
 * These used to be typed by hand ("06 modules", "4.5h", "18 quiz questions"),
 * so adding a module silently made the page lie.
 */
export function deriveCourseStats(modules: CourseModule[] = courseModules): CourseStats {
  const guidedMinutes = modules.reduce((total, module) => total + module.durationMinutes, 0);

  return {
    moduleCount: modules.length,
    quizCount: modules.reduce((total, module) => total + module.quiz.length, 0),
    // One interactive lab per module is the current contract.
    labCount: modules.length,
    guidedMinutes,
    guidedHours: Math.floor(guidedMinutes / 30) / 2,
  };
}

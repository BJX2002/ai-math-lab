/**
 * Icon vocabulary.
 *
 * These replace the emoji the first version used for every illustration. Emoji
 * render differently on Windows, macOS, and Android, embed a foreign visual
 * style, and cannot inherit the design's stroke weight or colour — so the same
 * page looked like three different products.
 *
 * Geometry lives here as plain data (24x24 grid, stroke-based) so that:
 *  - `components/icons.tsx` stays a thin renderer,
 *  - content and messages can name an icon without importing React,
 *  - `tests/content.test.mjs` can prove every referenced icon exists.
 */

export type IconShape =
  | { kind: "path"; d: string }
  | { kind: "circle"; cx: number; cy: number; r: number }
  | { kind: "rect"; x: number; y: number; width: number; height: number; rx?: number };

export const ICON_SHAPES = {
  /** A colour sample: three overlapping dots. */
  colour: [
    { kind: "circle", cx: 9, cy: 10, r: 4.5 },
    { kind: "circle", cx: 15, cy: 10, r: 4.5 },
    { kind: "circle", cx: 12, cy: 15.5, r: 4.5 },
  ],
  /** A weighing scale: beam, post, and two pans. */
  weight: [
    { kind: "path", d: "M12 4v16M5 8h14M8 20h8" },
    { kind: "path", d: "M5 8l-2.5 5h5L5 8zM19 8l-2.5 5h5L19 8z" },
  ],
  /** Roundness: a circle with a radius line. */
  shape: [
    { kind: "circle", cx: 12, cy: 12, r: 7.5 },
    { kind: "path", d: "M12 12l5.3-5.3" },
  ],
  /** Data: a stack of rows. */
  data: [
    { kind: "rect", x: 3.5, y: 4.5, width: 17, height: 15, rx: 2 },
    { kind: "path", d: "M3.5 9.5h17M3.5 14.5h17M9 4.5v15" },
  ],
  /** A feature: a magnifier over one entry. */
  feature: [
    { kind: "circle", cx: 10.5, cy: 10.5, r: 6 },
    { kind: "path", d: "M15 15l5 5" },
  ],
  /** A model: three inputs feeding one node. */
  model: [
    { kind: "circle", cx: 5, cy: 5.5, r: 2 },
    { kind: "circle", cx: 5, cy: 12, r: 2 },
    { kind: "circle", cx: 5, cy: 18.5, r: 2 },
    { kind: "circle", cx: 17.5, cy: 12, r: 3.5 },
    { kind: "path", d: "M7 5.5l7.5 5M7 12h7M7 18.5l7.5-5" },
  ],
  /** A prediction: a speech bubble. */
  prediction: [
    { kind: "path", d: "M4 5.5h16v11H12l-5 4v-4H4z" },
    { kind: "path", d: "M8.5 10.5h7" },
  ],
  /** Training: a correction loop. */
  training: [
    { kind: "path", d: "M20 12a8 8 0 1 1-2.6-5.9" },
    { kind: "path", d: "M20 3.5V8h-4.5" },
  ],
  /** One specimen going in. */
  specimen: [
    { kind: "circle", cx: 12, cy: 13.5, r: 6.5 },
    { kind: "path", d: "M12 7V4M10 4c1.5-1 3-1 4.5 0" },
  ],
  /** A guess being made: a thought bubble. */
  thought: [
    { kind: "path", d: "M4.5 10.5a5 5 0 0 1 5-5h5a5 5 0 0 1 0 10h-5a5 5 0 0 1-5-5z" },
    { kind: "circle", cx: 7.5, cy: 18.5, r: 1.2 },
    { kind: "circle", cx: 5, cy: 21, r: 0.8 },
  ],
  /** Measure the mistake: a ruler. */
  measure: [
    { kind: "rect", x: 3, y: 8, width: 18, height: 8, rx: 1.5 },
    { kind: "path", d: "M7 8v3M11 8v4M15 8v3M19 8v4" },
  ],
  /** Adjust a little: a two-way slider. */
  adjust: [
    { kind: "path", d: "M3 12h18" },
    { kind: "circle", cx: 9, cy: 12, r: 2.6 },
    { kind: "path", d: "M3 6.5h6M15 17.5h6" },
  ],
  /** Where a lesson starts: a door / entry arrow. */
  enter: [
    { kind: "path", d: "M13 4h5.5v16H13" },
    { kind: "path", d: "M4 12h9M9.5 8.5L13 12l-3.5 3.5" },
  ],
} as const satisfies Record<string, readonly IconShape[]>;

export type IconName = keyof typeof ICON_SHAPES;

export const ICON_NAMES = Object.keys(ICON_SHAPES) as IconName[];

export function isIconName(value: string): value is IconName {
  return Object.prototype.hasOwnProperty.call(ICON_SHAPES, value);
}

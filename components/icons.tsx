import type { SVGProps } from "react";
import { ICON_SHAPES, isIconName } from "../lib/icons";

/**
 * Renders one icon from the vocabulary in `lib/icons.ts`.
 *
 * An unknown name renders nothing rather than a placeholder glyph, so a typo
 * never ships a visible artefact. `tests/content.test.mjs` asserts that every
 * icon named in the messages exists, which is where the real mistake would
 * otherwise hide.
 */
export function Icon({
  name,
  size = 22,
  ...rest
}: { name: string; size?: number } & Omit<SVGProps<SVGSVGElement>, "name">) {
  if (!isIconName(name)) return null;
  const shapes = ICON_SHAPES[name];

  return (
    <svg
      className="icon"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {shapes.map((shape, index) => {
        if (shape.kind === "circle") {
          return <circle key={index} cx={shape.cx} cy={shape.cy} r={shape.r} />;
        }
        if (shape.kind === "rect") {
          return (
            <rect
              key={index}
              x={shape.x}
              y={shape.y}
              width={shape.width}
              height={shape.height}
              rx={shape.rx}
            />
          );
        }
        return <path key={index} d={shape.d} />;
      })}
    </svg>
  );
}

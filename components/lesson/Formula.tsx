import { renderMath } from "../../lib/math";

/**
 * A displayed formula rendered to MathML on the server.
 *
 * Nothing here is interactive, so this stays a server component: the reader
 * gets real math markup in the initial HTML.
 */
export function Formula({ tex, caption }: { tex: string; caption?: string }) {
  return (
    <figure className="formula-block">
      <div className="formula" dangerouslySetInnerHTML={{ __html: renderMath(tex) }} />
      {caption ? <figcaption className="formula-caption">{caption}</figcaption> : null}
    </figure>
  );
}

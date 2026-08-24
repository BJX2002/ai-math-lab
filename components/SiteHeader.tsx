import Link from "next/link";

export function SiteHeader({ dark = false }: { dark?: boolean }) {
  return (
    <header className={`site-header ${dark ? "site-header-dark" : ""}`}>
      <Link className="brand" href="/" aria-label="AI Math Lab home">
        <span className="brand-mark" aria-hidden="true">A²</span>
        <span>AI Math Lab</span>
      </Link>
      <nav aria-label="Primary navigation">
        <Link href="/courses">Course</Link>
        <Link href="/modules/vectors">Code labs</Link>
        <Link href="/#about">About</Link>
      </nav>
    </header>
  );
}

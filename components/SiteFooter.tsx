import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div>
        <Link className="brand footer-brand" href="/">
          <span className="brand-mark" aria-hidden="true">A²</span>
          <span>AI Math Lab</span>
        </Link>
        <p>Clear intuition, honest mathematics, useful code.</p>
      </div>
      <div className="footer-links">
        <Link href="/courses">Learning path</Link>
        <Link href="/modules/vectors">Start module 01</Link>
        <a href="mailto:hello@eduhkaimath.com">Contact</a>
      </div>
      <p className="footer-note">Built as a free starting point for future AI students.</p>
    </footer>
  );
}

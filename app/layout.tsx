import type { Metadata } from "next";
import "./globals.css";

export function generateMetadata(): Metadata {
  const base = "https://ai-math-lab-foundations.woshisheiwoshifei.chatgpt.site";
  const title = "AI Math Lab — Linear Algebra for AI Beginners";
  const description = "A visual, code-first introduction to the linear algebra behind artificial intelligence.";
  return {
    title,
    description,
    metadataBase: new URL(base),
    openGraph: { title, description, type: "website", images: [{ url: `${base}/og.png`, width: 1536, height: 1024, alt: "AI Math Lab — See the maths. Make it work." }] },
    twitter: { card: "summary_large_image", title, description, images: [`${base}/og.png`] },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}

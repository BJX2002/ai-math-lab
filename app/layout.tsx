import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const base = `${protocol}://${host}`;
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

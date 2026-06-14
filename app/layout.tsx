import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FixMySEO | Website SEO Checker and SEO Audit Tool",
  description:
    "Scan your website, identify SEO problems, and get actionable fixes for titles, meta descriptions, content, technical SEO, and on-page optimization."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

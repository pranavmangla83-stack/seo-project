import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import {
  CLARITY_PROJECT_ID,
  GA_MEASUREMENT_ID,
  GOOGLE_ADS_CONVERSION_ID
} from "@/lib/gtag";
import "./globals.css";

const gtagScriptId = GA_MEASUREMENT_ID ?? GOOGLE_ADS_CONVERSION_ID;
const geistSans = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });
const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono"
});

export const metadata: Metadata = {
  title: "FixMySEO | Website SEO Checker and SEO Audit Tool",
  description:
    "Scan your website, identify SEO problems, and get actionable fixes for titles, meta descriptions, content, technical SEO, and on-page optimization.",
  icons: {
    icon: "/logo.svg",
    shortcut: "/logo.svg",
    apple: "/logo.svg"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className={`${geistSans.variable} ${geistMono.variable}`} lang="en">
      <body>
        {gtagScriptId ? (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gtagScriptId}`}
              strategy="afterInteractive"
            />
            <Script id="google-tag" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                ${GA_MEASUREMENT_ID ? `gtag('config', '${GA_MEASUREMENT_ID}');` : ""}
                ${GOOGLE_ADS_CONVERSION_ID ? `gtag('config', '${GOOGLE_ADS_CONVERSION_ID}');` : ""}
              `}
            </Script>
          </>
        ) : null}
        {CLARITY_PROJECT_ID ? (
          <Script id="microsoft-clarity" strategy="afterInteractive">
            {`
              (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window, document, "clarity", "script", "${CLARITY_PROJECT_ID}");
            `}
          </Script>
        ) : null}
        {children}
      </body>
    </html>
  );
}

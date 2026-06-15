import type { Metadata } from "next";
import Script from "next/script";
import { CLARITY_PROJECT_ID, GA_MEASUREMENT_ID } from "@/lib/gtag";
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
      <body>
        {GA_MEASUREMENT_ID ? (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_MEASUREMENT_ID}');
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

import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

const adsensePublisherId = process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID;

export const metadata: Metadata = {
  title: "Savings Box",
  description: "Track your savings visually, one cell at a time.",
  ...(adsensePublisherId
    ? {
        other: {
          // Lets Google’s crawler verify AdSense without relying on JS execution
          "google-adsense-account": adsensePublisherId,
        },
      }
    : {}),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="light" className="h-full">
      <body className="min-h-full flex flex-col bg-[var(--bg)] text-[var(--ink)]">
        {adsensePublisherId ? (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsensePublisherId}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        ) : null}
        {children}
      </body>
    </html>
  );
}

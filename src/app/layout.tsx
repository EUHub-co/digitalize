import type { Metadata } from "next";
import { Plus_Jakarta_Sans, DM_Sans, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import { headers } from "next/headers";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
  preload: true, // heading font carries the LCP <h1>
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
  preload: true,
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  preload: false, // mono is used sparingly, off the critical path
});

const SKIP_LABEL: Record<string, string> = {
  en: "Skip to content",
  sk: "Preskočiť na obsah",
  de: "Zum Inhalt springen",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://ai.euhub.co"),
  title: {
    default: "EuHub AI | Strategic AI Implementation",
    template: "%s | EuHub AI",
  },
  description: "Your Strategic AI Implementation Partner in Central Europe. We engineer and deploy agentic AI systems.",
  openGraph: {
    type: "website",
    siteName: "EuHub AI",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "EuHub AI — Strategic AI Implementation" }],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/og.png"],
  },
};

import { Providers } from "./providers";

const umamiScriptUrl = process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL?.trim();
const umamiWebsiteId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID?.trim();
const umamiEnabled = Boolean(umamiScriptUrl && umamiWebsiteId);

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const locale = headersList.get('x-locale') || 'en';

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        {umamiEnabled && (
          <Script
            id="umami-script"
            strategy="afterInteractive"
            src={umamiScriptUrl}
            data-website-id={umamiWebsiteId}
          />
        )}
      </head>
      <body className={`${plusJakartaSans.variable} ${dmSans.variable} ${jetbrainsMono.variable} antialiased`}>
        {/* Skip-to-content link — first focusable element (WCAG 2.4.1) */}
        <a href="#main" className="skip-link">{SKIP_LABEL[locale] || SKIP_LABEL.en}</a>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}

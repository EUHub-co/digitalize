import type { Metadata } from 'next';
import { DM_Sans, JetBrains_Mono, Plus_Jakarta_Sans } from 'next/font/google';
import Script from 'next/script';
import { Providers } from '../providers';
import '../globals.css';

const LOCALES = ['en', 'sk', 'de'] as const;
type Locale = (typeof LOCALES)[number];

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
  preload: true,
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
  preload: true,
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
  preload: false,
});

const SKIP_LABEL: Record<Locale, string> = {
  en: 'Skip to content',
  sk: 'Preskočiť na obsah',
  de: 'Zum Inhalt springen',
};

export const metadata: Metadata = {
  metadataBase: new URL('https://ai.euhub.co'),
  title: {
    default: 'EUHub AI | Strategic AI Implementation',
    template: '%s | EUHub AI',
  },
  description: 'Your Strategic AI Implementation Partner in Central Europe. We engineer and deploy agentic AI systems.',
  openGraph: {
    type: 'website',
    siteName: 'EUHub AI',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'EUHub AI — Strategic AI Implementation' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og.png'],
  },
};

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export const dynamicParams = false;

const umamiScriptUrl = process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL?.trim();
const umamiWebsiteId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID?.trim();
const umamiEnabled = Boolean(umamiScriptUrl && umamiWebsiteId);

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}>) {
  const { lang: requestedLang } = await params;
  const lang = LOCALES.includes(requestedLang as Locale) ? requestedLang as Locale : 'en';

  return (
    <html lang={lang} suppressHydrationWarning>
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
        <a href="#main" className="skip-link">{SKIP_LABEL[lang]}</a>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

import type { Metadata } from 'next';
import { getDictionary } from '../../../get-dictionary';
import Header from '../../../components/layout/Header';
import { Footer } from '../../../components/layout/Footer';
import { LegalPage } from '../../../components/legal/LegalPage';
import { breadcrumbLd, ogLocale } from '../../../lib/seo';

const BASE_URL = 'https://ai.euhub.co';

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const dict = await getDictionary(lang as 'en' | 'sk' | 'de');

  return {
    title: dict.terms.title,
    description: dict.terms.metaDescription,
    alternates: {
      canonical: `${BASE_URL}/${lang}/terms`,
      languages: {
        'en': `${BASE_URL}/en/terms`,
        'sk': `${BASE_URL}/sk/terms`,
        'de': `${BASE_URL}/de/terms`,
        'x-default': `${BASE_URL}/en/terms`,
      },
    },
    openGraph: {
      title: dict.terms.title,
      description: dict.terms.metaDescription,
      url: `${BASE_URL}/${lang}/terms`,
      locale: ogLocale(lang),
      images: ['/og.png'],
    },
  };
}

export default async function TermsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const dict = await getDictionary(lang as 'en' | 'sk' | 'de');

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        name: dict.terms.title,
        description: dict.terms.metaDescription,
        url: `${BASE_URL}/${lang}/terms`,
        inLanguage: lang,
        isPartOf: { '@type': 'WebSite', url: BASE_URL, name: 'EUHub AI' },
        publisher: { '@type': 'Organization', name: 'EUHub AI', url: BASE_URL },
      },
      breadcrumbLd(lang, 'terms', dict.terms.title),
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Header dict={dict} lang={lang} />
      <LegalPage
        title={dict.terms.title}
        lastUpdated={dict.terms.lastUpdated}
        sections={dict.terms.sections}
        lang={lang}
        backHome={dict.legal?.backHome || 'Back to Home'}
      />
      <Footer lang={lang} dict={dict} />
    </>
  );
}

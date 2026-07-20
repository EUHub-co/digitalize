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
    title: dict.privacy.title,
    description: dict.privacy.metaDescription,
    alternates: {
      canonical: `${BASE_URL}/${lang}/privacy`,
      languages: {
        'en': `${BASE_URL}/en/privacy`,
        'sk': `${BASE_URL}/sk/privacy`,
        'de': `${BASE_URL}/de/privacy`,
        'x-default': `${BASE_URL}/en/privacy`,
      },
    },
    openGraph: {
      title: dict.privacy.title,
      description: dict.privacy.metaDescription,
      url: `${BASE_URL}/${lang}/privacy`,
      locale: ogLocale(lang),
      images: ['/og.png'],
    },
  };
}

export default async function PrivacyPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const dict = await getDictionary(lang as 'en' | 'sk' | 'de');

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        name: dict.privacy.title,
        description: dict.privacy.metaDescription,
        url: `${BASE_URL}/${lang}/privacy`,
        inLanguage: lang,
        isPartOf: { '@type': 'WebSite', url: BASE_URL, name: 'EuHub AI' },
        publisher: { '@type': 'Organization', name: 'EuHub AI', url: BASE_URL },
      },
      breadcrumbLd(lang, 'privacy', dict.privacy.title),
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Header dict={dict} lang={lang} />
      <LegalPage
        title={dict.privacy.title}
        lastUpdated={dict.privacy.lastUpdated}
        sections={dict.privacy.sections}
        lang={lang}
        backHome={dict.legal?.backHome || 'Back to Home'}
      />
      <Footer lang={lang} dict={dict} />
    </>
  );
}

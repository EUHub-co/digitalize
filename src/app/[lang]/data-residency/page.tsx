import type { Metadata } from 'next';
import { getDictionary } from '../../../get-dictionary';
import Header from '../../../components/layout/Header';
import { Footer } from '../../../components/layout/Footer';
import { LegalPage } from '../../../components/legal/LegalPage';
import { breadcrumbLd, ogLocale } from '../../../lib/seo';

const BASE_URL = 'https://ai.euhub.co';

// Authored in EN, SK and DE. Falls back to EN content for any unknown locale.
async function getPage(lang: string) {
  const dict = await getDictionary(lang as 'en' | 'sk' | 'de');
  const page = dict.dataResidency ?? (await getDictionary('en')).dataResidency;
  return { dict, page };
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const { page } = await getPage(lang);
  const desc = page.metaDescription ?? page.lastUpdated;

  return {
    title: page.title,
    description: desc,
    alternates: {
      canonical: `${BASE_URL}/${lang}/data-residency`,
      languages: {
        'en': `${BASE_URL}/en/data-residency`,
        'sk': `${BASE_URL}/sk/data-residency`,
        'de': `${BASE_URL}/de/data-residency`,
        'x-default': `${BASE_URL}/en/data-residency`,
      },
    },
    openGraph: {
      title: page.title,
      description: desc,
      url: `${BASE_URL}/${lang}/data-residency`,
      locale: ogLocale(lang),
      images: ['/og.png'],
    },
  };
}

export default async function DataResidencyPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const { dict, page } = await getPage(lang);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        name: page.title,
        description: page.lastUpdated,
        url: `${BASE_URL}/${lang}/data-residency`,
        inLanguage: lang,
        isPartOf: { '@type': 'WebSite', url: BASE_URL, name: 'EuHub AI' },
        publisher: { '@type': 'Organization', name: 'EuHub AI', url: BASE_URL },
      },
      breadcrumbLd(lang, 'data-residency', page.title),
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Header dict={dict} lang={lang} />
      <LegalPage
        title={page.title}
        lastUpdated={page.lastUpdated}
        sections={page.sections}
        lang={lang}
        backHome={dict.legal?.backHome || 'Back to Home'}
      />
      <Footer lang={lang} dict={dict} />
    </>
  );
}

import type { Metadata } from 'next';
import { getDictionary } from '../../../get-dictionary';
import Header from '../../../components/layout/Header';
import { Footer } from '../../../components/layout/Footer';
import { LegalPage } from '../../../components/legal/LegalPage';
import { breadcrumbLd, faqLd, ogLocale } from '../../../lib/seo';

const BASE_URL = 'https://ai.euhub.co';

// Authored in EN, SK and DE. Falls back to EN content for any unknown locale.
async function getPage(lang: string) {
  const dict = await getDictionary(lang as 'en' | 'sk' | 'de');
  const page = dict.aiAct ?? (await getDictionary('en')).aiAct;
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
      canonical: `${BASE_URL}/${lang}/ai-act`,
      languages: {
        'en': `${BASE_URL}/en/ai-act`,
        'sk': `${BASE_URL}/sk/ai-act`,
        'de': `${BASE_URL}/de/ai-act`,
        'x-default': `${BASE_URL}/en/ai-act`,
      },
    },
    openGraph: {
      title: page.title,
      description: desc,
      url: `${BASE_URL}/${lang}/ai-act`,
      locale: ogLocale(lang),
      images: ['/og.png'],
    },
  };
}

export default async function AiActPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const { dict, page } = await getPage(lang);

  const faq = faqLd(page.sections);
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        name: page.title,
        description: page.lastUpdated,
        url: `${BASE_URL}/${lang}/ai-act`,
        inLanguage: lang,
        isPartOf: { '@type': 'WebSite', url: BASE_URL, name: 'EUHub AI' },
        publisher: { '@type': 'Organization', name: 'EUHub AI', url: BASE_URL },
      },
      breadcrumbLd(lang, 'ai-act', page.title),
      ...(faq ? [faq] : []),
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

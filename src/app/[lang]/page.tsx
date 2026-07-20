import type { Metadata } from 'next';
import { getDictionary } from '../../get-dictionary';
import { personLd, serviceLd, founderId, ogLocale } from '../../lib/seo';
import { Navbar } from '../../components/navigation/Navbar';
import { Hero } from '../../components/sections/Hero';
import { PainsSituations } from '../../components/sections/PainsSituations';
import { BespokeEngineering } from '../../components/sections/BespokeEngineering';
import { FeatureGrid } from '../../components/sections/FeatureGrid';
import { ICP } from '../../components/sections/ICP';
import { Process } from '../../components/sections/Process';
import { CaseStudies } from '../../components/sections/CaseStudies';
import { Team } from '../../components/sections/Team';
import { Contact } from '../../components/sections/Contact';
import { Footer } from '../../components/layout/Footer';

const BASE_URL = 'https://ai.euhub.co';

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const dict = await getDictionary(lang as 'en' | 'sk' | 'de');

  return {
    // absolute → skip the "%s | EuHub AI" template (meta.title already carries the brand)
    title: { absolute: dict.meta?.title || 'EuHub AI | Strategic AI Implementation' },
    description: dict.meta?.description,
    alternates: {
      canonical: `${BASE_URL}/${lang}`,
      languages: {
        'en': `${BASE_URL}/en`,
        'sk': `${BASE_URL}/sk`,
        'de': `${BASE_URL}/de`,
        'x-default': `${BASE_URL}/en`,
      },
    },
    openGraph: {
      title: dict.meta?.title,
      description: dict.meta?.description,
      url: `${BASE_URL}/${lang}`,
      locale: ogLocale(lang),
      images: ['/og.png'],
    },
  };
}

export default async function Home({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const dict = await getDictionary(lang as 'en' | 'sk' | 'de');

  const members = dict.team?.members || [];
  const persons = personLd(members);
  const fId = founderId(members);
  const service = serviceLd(dict.process?.tiers);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${BASE_URL}/#organization`,
        name: 'EuHub AI',
        legalName: 'Engineers-incubator s.r.o.',
        url: BASE_URL,
        logo: `${BASE_URL}/logo_dark.webp`,
        email: 'hello@euhub-ai.com',
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'Horná 67',
          addressLocality: 'Banská Bystrica',
          postalCode: '974 01',
          addressCountry: 'SK',
        },
        ...(fId ? { founder: { '@id': fId } } : {}),
        ...(persons.length ? { employee: persons.map((p) => ({ '@id': p['@id'] })) } : {}),
      },
      {
        '@type': 'WebSite',
        '@id': `${BASE_URL}/#website`,
        url: BASE_URL,
        name: 'EuHub AI',
        publisher: { '@id': `${BASE_URL}/#organization` },
        inLanguage: lang,
      },
      ...persons,
      service,
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Navbar lang={lang} dict={dict} />
      <main id="main" className="min-h-screen bg-[var(--background)] text-[var(--foreground)] font-sans selection:bg-[var(--primary)] selection:text-[var(--background)]">
        <Hero lang={lang} dict={dict} />
        <PainsSituations lang={lang} dict={dict} />
        <BespokeEngineering lang={lang} dict={dict} />
        <FeatureGrid lang={lang} dict={dict} />
        <ICP lang={lang} dict={dict} />
        <Process lang={lang} dict={dict} />
        <CaseStudies lang={lang} dict={dict} />
        <Team lang={lang} dict={dict} />
        <Contact lang={lang} dict={dict} />
      </main>
      <Footer lang={lang} dict={dict} />
    </>
  );
}

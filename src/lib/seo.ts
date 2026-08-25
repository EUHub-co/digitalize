// Shared JSON-LD / structured-data helpers.
// Keeping these in one place so every page emits consistent schema.
import type { FaqItem } from './content-types';

export const BASE_URL = 'https://ai.euhub.co';
const ORG_ID = `${BASE_URL}/#organization`;

// Open Graph requires language_TERRITORY (e.g. "en_US"), not a bare language code.
// en_US is the OG default; swap to en_GB if you prefer EU-flavored English — the territory is cosmetic.
export const OG_LOCALE: Record<string, string> = { en: 'en_US', sk: 'sk_SK', de: 'de_DE' }
export function ogLocale(lang: string): string {
  return OG_LOCALE[lang] ?? 'en_US'
}

// Team LinkedIn profiles — identity references for Person.sameAs.
// Keyed by the (locale-stable) member name used in the dictionaries.
const LINKEDIN: Record<string, string> = {
  'Artashes A.': 'https://www.linkedin.com/in/arakelian-artashes-euhub/',
  'Mike G.': 'https://www.linkedin.com/in/gordievsky/',
  'Kateryna H.': 'https://www.linkedin.com/in/kateryna-hordi/',
};

// Strip markdown links to their visible text and collapse whitespace,
// so JSON-LD answer text matches what the user sees on the page.
export function plainText(s: string): string {
  return (s || '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

export function breadcrumbLd(lang: string, slug: string, name: string) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE_URL}/${lang}` },
      { '@type': 'ListItem', position: 2, name, item: `${BASE_URL}/${lang}/${slug}` },
    ],
  };
}

// Build a FAQPage from any sections whose heading is a question.
// Returns null when there are fewer than two — not worth marking up.
export function faqLd(sections: { heading: string; content: string }[] | undefined) {
  const qs = (sections || []).filter((s) => s?.heading?.trim().endsWith('?'));
  if (qs.length < 2) return null;
  return {
    '@type': 'FAQPage',
    mainEntity: qs.map((s) => ({
      '@type': 'Question',
      name: s.heading.trim(),
      acceptedAnswer: { '@type': 'Answer', text: plainText(s.content) },
    })),
  };
}

// FAQ schema is emitted only for questions shown visibly on the same guide.
export function faqItemsLd(items: FaqItem[] | undefined) {
  if (!items?.length) return null;
  return {
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: plainText(item.answer) },
    })),
  };
}

export function personLd(members: any[] | undefined) {
  return (members || []).map((m: any, i: number) => {
    const sameAs = [...new Set([LINKEDIN[m.name], m.url].filter(Boolean))];
    return {
      '@type': 'Person',
      '@id': `${BASE_URL}/#person-${i}`,
      name: m.name,
      ...(m.role ? { jobTitle: m.role } : {}),
      ...(m.url ? { url: m.url } : {}),
      ...(sameAs.length ? { sameAs } : {}),
      worksFor: { '@id': ORG_ID },
    };
  });
}

export function founderId(members: any[] | undefined) {
  const idx = (members || []).findIndex(
    (m: any) => m.badge === 'FOUNDER' || /founder/i.test(m.role || '')
  );
  return idx >= 0 ? `${BASE_URL}/#person-${idx}` : null;
}

export function serviceLd(tiers: any[] | undefined) {
  return {
    '@type': 'Service',
    '@id': `${BASE_URL}/#service`,
    name: 'AI implementation & EU AI Act compliance',
    serviceType: 'Agentic AI systems, systems integration, and EU AI Act / GDPR compliance',
    provider: { '@id': ORG_ID },
    areaServed: { '@type': 'Place', name: 'European Union' },
    ...(tiers && tiers.length
      ? {
          hasOfferCatalog: {
            '@type': 'OfferCatalog',
            name: 'Engagements',
            itemListElement: tiers.map((t: any) => ({
              '@type': 'Offer',
              name: t.name,
              ...(t.summary ? { description: t.summary } : {}),
            })),
          },
        }
      : {}),
  };
}

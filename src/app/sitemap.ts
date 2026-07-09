import { MetadataRoute } from 'next'

const BASE_URL = 'https://euhub-ai.com'
const LOCALES = ['en', 'sk', 'de'] as const
const ROUTES = ['', '/ai-act', '/data-residency', '/portability', '/privacy', '/terms', '/cookie'] as const

// Build the hreflang alternate set for a given route once, then attach to every locale entry.
function languagesFor(route: string): Record<string, string> {
  const langs = Object.fromEntries(LOCALES.map((l) => [l, `${BASE_URL}/${l}${route}`]))
  return { ...langs, 'x-default': `${BASE_URL}/en${route}` }
}

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  return ROUTES.flatMap((route) =>
    LOCALES.map((locale) => ({
      url: `${BASE_URL}/${locale}${route}`,
      lastModified: now,
      changeFrequency: route === '' ? ('weekly' as const) : ('monthly' as const),
      priority: route === '' ? 1 : 0.7,
      alternates: { languages: languagesFor(route) },
    })),
  )
}

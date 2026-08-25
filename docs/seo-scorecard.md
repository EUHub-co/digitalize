# SEO / GEO / AEO Scorecard

## Baseline — 2026-08-25

| Signal | Baseline |
|---|---|
| SEO / GEO / AEO score | 7 / 10, 6 / 10, 6 / 10 |
| Strategic URLs crawled | 12 (EN, SK and DE home, AI Act, data-residency and portability pages) |
| Sitemap URLs | 21 |
| Internal targets checked | 21, all returned 200 |
| Metadata and hreflang | Present on all 12 strategic URLs |
| JSON-LD | Valid Organization, Person, Service, WebSite, WebPage, BreadcrumbList and AI Act FAQPage markup |
| Image alt text | 51 audited image instances, none empty |
| Title length range | 30–56 characters |
| Data-residency page depth | 411–418 words |
| Portability page depth | 166–180 words |
| Search visibility sample | Site-restricted web searches returned no results; verify in Search Console before diagnosing indexation |
| Cache behavior | `private, no-cache, no-store` on marketing HTML |
| Field CWV/backlinks | Not measured in this audit |

## Verification ledger

| Date | Check | Result | Evidence / action |
|---|---|---|---|
| 2026-08-25 | Local production build | Pass | Baseline Next.js build completed before implementation. |
| 2026-08-25 | ESLint | Pre-existing failure | 41 errors in unrelated existing components; user approved continuing SEO/GEO/AEO work without broad lint remediation. |
| 2026-08-25 | Static locale rendering | Pass | All 21 locale pages are prerendered with `generateStaticParams`; local smoke check no longer finds `private` or `no-store` marketing HTML. |
| 2026-08-25 | Content and schema smoke gate | Pass | Local production check validates all 21 sitemap URLs, including 700-word strategic-guide thresholds, canonical/hreflang/lang, internal links, semantic guide landmarks and matching FAQPage schema. |

## External release gates

- Verify the `euhub.co` Search Console property and submit `https://ai.euhub.co/sitemap.xml`.
- Inspect `/en`, `/en/ai-act`, `/sk`, `/sk/data-residency`, `/de` and `/de/portability` in URL Inspection after deployment.
- Verify Bing Webmaster Tools ownership and run IndexNow with the configured secret after production smoke checks pass.
- Obtain legal review for EU AI Act/GDPR/SCC claims, client approval for case-study evidence, and identity approval for public leadership profiles before publishing those parts.
- Obtain fluent human editorial review of the new EN/SK/DE guide copy, terminology and citations before production release.

## Monthly visibility benchmark

Record the date, locale, exact prompt, engine, cited URL (if any), EUHub mention, competitor mentions and a saved screenshot/URL where permitted. A mention is directional evidence, not proof that a specific site change caused visibility.

| Topic | Prompt family | Locales | Engines |
|---|---|---|---|
| EU AI Act implementation | Who can help a European company prepare an AI Act implementation roadmap? | EN / SK / DE | Google AI features, ChatGPT Search, Perplexity, Gemini |
| AI data residency | How should an EU company keep AI prompts and documents in the EU? | EN / SK / DE | Google AI features, ChatGPT Search, Perplexity, Gemini |
| Vendor-neutral AI | What should a buyer require to avoid AI vendor lock-in? | EN / SK / DE | Google AI features, ChatGPT Search, Perplexity, Gemini |

## Evidence still required for a 10/10 claim

- Search Console and Bing ownership, sitemap success and URL-level indexing evidence.
- Field Core Web Vitals evidence after sufficient CrUX data exists.
- Approved public author/reviewer profiles and reviewed dates for high-stakes guides.
- At least three client-approved case studies or evidence notes and a reviewed insight cluster.
- Organization legal identity/contact/logo/social-profile facts verified for public schema.

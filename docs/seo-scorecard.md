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

## External release gates

- Verify the `euhub.co` Search Console property and submit `https://ai.euhub.co/sitemap.xml`.
- Inspect `/en`, `/en/ai-act`, `/sk`, `/sk/data-residency`, `/de` and `/de/portability` in URL Inspection after deployment.
- Verify Bing Webmaster Tools ownership and run IndexNow with the configured secret after production smoke checks pass.
- Obtain legal review for EU AI Act/GDPR/SCC claims, client approval for case-study evidence, and identity approval for public leadership profiles before publishing those parts.

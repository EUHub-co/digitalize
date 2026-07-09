# EuHub AI — SEO Indexation Report & Action Plan

**Source:** Ahrefs Site Audit export `euhub-ai.com-ahrefs-audit-2026-07-09-001.zip` (crawl 2026‑07‑09 11:02)
**Verified against:** live production HTML + repo `main` on 2026‑07‑09
**Scope:** 21 URLs — 7 page types (`/`, `/ai-act`, `/data-residency`, `/portability`, `/cookie`, `/privacy`, `/terms`) × 3 locales (`en`, `sk`, `de`)

---

## TL;DR

**The site is already technically well‑configured for indexation.** Every page is server‑rendered with a self‑referencing canonical, in‑page hreflang for all three locales, complete Open Graph/Twitter cards, and valid JSON‑LD; `robots.txt` allows all; the sitemap lists all 21 URLs; there is no accidental `noindex`. The team's own Lighthouse run scored **SEO 100/100**.

Consequently, the Ahrefs export contains **no live‑blocking defect**. The single "Error" is **stale** (the `mike.` subdomain no longer resolves), and the largest "Warning" bucket (42 Open Graph rows) is **not reproducible** on the live site. What remains is hygiene and reach work.

For a **brand‑new domain with 0 organic traffic**, the real indexation levers are external and durable, not a single code fix:

1. **Get discovered & submitted** — verify in Google Search Console + Bing Webmaster Tools, submit the sitemap, and wire up **IndexNow** for instant Bing/Yandex pickup. *(This is the most likely actual gap.)*
2. **Consolidate signals** — make the `/ → /en` and `http → https` redirects **permanent** and collapse the 2‑hop chain, so link equity settles on the canonical `/en` cleanly.
3. **Cluster locales faster** — add `xhtml:link` hreflang alternates to the sitemap.
4. **Tidy crawl surface** — drop the stale `mike.` subdomain from the Ahrefs project and decide `infra.`'s index policy (currently indexable, not canonicalised, not in sitemap).
5. **Polish** — lengthen 8 short meta descriptions, fix `og:locale` format, ship a real `llms.txt`.

---

## What Ahrefs reported (and what's actually true)

| # | Ahrefs finding | Rows | Severity label | Live status | Real severity |
|---|----------------|------|----------------|-------------|---------------|
| 1 | Robots.txt not accessible — `mike.euhub-ai.com/robots.txt` "Internal error" | 1 | **Error** | `mike.` **no longer resolves (NXDOMAIN)** | **Stale** — Ahrefs scope artifact |
| 2 | Open Graph tags incomplete (`og:locale`, `og:url`, `og:description`) | 42 | Warning | **All present** in live HTML (added in PR #10) | **Stale / non‑reproducible** — re‑crawl. One real sub‑issue: `og:locale` format |
| 3 | 302 redirect / 3XX redirect / redirect chain — `http→https→/en` | 8 | Warning + Notice | Confirmed: `302` then `307`, 2 hops, both temporary | **Medium** — signal consolidation |
| 4 | Meta description too short (8 indexable + 3 non‑indexable pages) | 11 | Warning + Notice | Confirmed: 44–86 chars on `data-residency`, `portability`, `ai-act` | **Medium** — SERP CTR (not indexation) |
| 5 | Pages to submit to IndexNow | 21 | Notice | No IndexNow key configured | **High (reach)** — instant Bing/Yandex indexing |
| 6 | HTTP→HTTPS redirect | 2 | Notice | Confirmed 302 at edge | **Low** — folds into #3 |
| 7 | Slow page — `/sk/cookie` TTFB 2.68 s | 1 | Warning | Cold‑start latency (Cloud Run) | **Low** — crawl efficiency |
| 8 | High AI content — `/en/privacy`, `/en/terms` | 2 | Notice | Legal boilerplate | **Info** — benign, no action |

### Not flagged by Ahrefs, but found during verification

- **`infra.euhub-ai.com` is fully indexable** (`HTTP 200`, no `noindex`, no `X-Robots-Tag`, real `<title>`), yet it carries **no canonical**, isn't in the sitemap, and has no hreflang. A stray indexable subdomain can split signals or get indexed unintentionally. **Decide its policy.**
- **`/llms.txt` returns `200` but `content-type: text/html`** — the App Router catch‑all answers instead of a static text file (matches the team's existing `docs/llms-txt-issue-report.md`). `public/llms.txt` now exists locally but is **uncommitted/undeployed**. Affects GEO/AEO (AI crawlers), not classic indexation.
- **`og:locale` uses bare language codes** (`en`, `sk`, `de`) instead of the OG‑spec `language_TERRITORY` form (`en_US`, `sk_SK`, `de_DE`). This is the *genuine* Open Graph defect behind finding #2 and is what stricter parsers (Facebook/LinkedIn debuggers) flag.
- **Dead `mike.euhub-ai.com` link in team data & structured data.** All three locales set Mike G.'s team `url` to `https://mike.euhub-ai.com` (now DNS NXDOMAIN), so the homepage "Connect" link is broken **and** `src/lib/seo.ts` publishes that dead URL inside his JSON‑LD `Person.sameAs` — a bad entity signal. Fix: repoint to his LinkedIn (already in the `LINKEDIN` map). *(Plan Task 8.)*
- **No Google Search Console verification meta tag** in the live `<head>` (verification may be via DNS/file instead — **confirm**).

---

## Root‑cause notes

- **Redirects (#3, #6).** `next.config.ts` declares both redirect rules with `permanent: false` → Next emits **307** for `/ → /en`. The `http → https` **302** happens at the edge (Cloud Run domain mapping / LB) before Next. Net path: `http://euhub-ai.com/` → **302** → `https://euhub-ai.com/` → **307** → `/en` → `200`. Temporary codes tell Google "don't consolidate yet," and the extra hop wastes a little crawl budget. Canonical + hreflang already point at `/en`, so this is **signal‑consolidation hygiene, not a blocker**.
  - *Caveat:* `permanent: false` may be deliberate to keep the door open for geo/`Accept-Language` locale routing at `/`. A cached **308** is sticky. If dynamic locale negotiation at `/` is planned, keep `/` temporary (or serve negotiated 200) and instead make only the non‑locale‑path catch‑all permanent.
- **Open Graph (#2).** Present live since PR #10 and confirmed by direct fetch on all page types. The crawl coincided with the `euhub-marketing` infra cut‑over (PR #23) — most plausibly Ahrefs captured a transient/older response. **Re‑crawl clears it.**
- **`mike.` (#1).** A personal/preview deploy that has since been removed from DNS. The "Error" is a leftover in the Ahrefs project's URL set, not a live fault.

---

## Prioritized action list

### P0 — Indexation reach (mostly external; do this week)
1. **Verify & submit in Google Search Console** (`euhub-ai.com`, all locales) → submit `https://euhub-ai.com/sitemap.xml` → request indexing for the three homepages. *(Confirm current verification method first.)*
2. **Verify in Bing Webmaster Tools** and submit the sitemap (feeds ChatGPT Search / Copilot too).
3. **Enable IndexNow** — generate a key, host `/{key}.txt`, and ping on deploy. Clears the 21‑row Notice and gives instant Bing/Yandex indexing. *(Code task — see plan.)*

### P1 — Signal consolidation & crawl hygiene (code + infra)
4. **Make redirects permanent** — `permanent: true` on the catch‑all locale rule (307 → 308), honoring the geo‑routing caveat for `/`. *(Code.)*
5. **Make `http → https` a 301** at the edge (Cloud Run mapping / LB `redirectResponseCode`). Collapse the chain where possible. *(Infra.)*
6. **Add hreflang to the sitemap** — `xhtml:link rel="alternate"` for each locale trio, so Google clusters `en/sk/de` variants faster. *(Code — `sitemap.ts`.)*
7. **Resolve stray subdomains** — remove `mike.euhub-ai.com` from the Ahrefs project (stale); decide `infra.`: either **noindex** it (`X-Robots-Tag`/meta via middleware) or make it a **first‑class page** (self‑canonical + add to sitemap). *(Infra + code.)*

### P2 — Content & GEO polish
8. **Lengthen 8 short meta descriptions** to 110–160 chars (`data-residency`, `portability`, `ai-act` × en/sk/de) in the dictionaries. *(Content.)*
9. **Fix `og:locale`** → `en_US` / `sk_SK` / `de_DE` via a small map in each `generateMetadata`. *(Code.)*
10. **Ship `llms.txt` properly** — commit `public/llms.txt`, verify it serves `200 text/plain` (add a header/route rule if the catch‑all still intercepts). *(Code.)*
11. **Warm `/sk/cookie`** — set Cloud Run `min-instances ≥ 1` (or accept cold starts) to cut the 2.68 s TTFB. *(Infra.)*

### P3 — Verification loop
12. **Re‑crawl in Ahrefs** after P1–P2 deploy to clear stale OG/redirect/subdomain findings and confirm a clean report.

---

## What this will *not* fix (set expectations)

Indexation of a new domain is gated by **discovery + trust + time**, not just tags. Even with everything above:
- Google still needs crawl cycles and some **external links** before it indexes and ranks all 21 URLs. Internal linking is already good; earn a few quality backlinks.
- **0 organic traffic today is normal** for a domain this age — the fixes accelerate and de‑risk indexation; they don't manufacture demand.
- The high‑value ranking work is **content depth** on the money pages (`ai-act`, `data-residency`, `portability`), which is a separate track from this technical audit.

---

## Evidence appendix (live checks, 2026‑07‑09)

```
# OG tags present on every page type (sample: /en)
og:title, og:description, og:url, og:locale, og:image  → all present
canonical → https://euhub-ai.com/en ; hreflang en/sk/de/x-default → present

# Redirect chain
http://euhub-ai.com/   → 302 → https://euhub-ai.com/
https://euhub-ai.com/  → 307 → /en → 200
https://www.euhub-ai.com/ → 307 → /en

# robots.txt (production) → 200, Allow: /, Sitemap declared
# sitemap.xml → 200 application/xml, 21 <loc>, 0 xhtml:link (no hreflang)
# mike.euhub-ai.com → DNS NXDOMAIN (stale in Ahrefs)
# infra.euhub-ai.com → 200, indexable, no canonical, not in sitemap
# /llms.txt → 200 text/html (catch-all, not a static file)
# og:locale value → "en" (should be "en_US")
```

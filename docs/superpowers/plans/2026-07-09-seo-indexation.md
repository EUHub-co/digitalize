# SEO Indexation Improvements — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use @superpowers:subagent-driven-development (recommended) or @superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close the technical-SEO gaps from the 2026‑07‑09 Ahrefs audit so all 21 URLs are discovered, consolidated on their canonical `/en|/sk|/de` variants, and indexed reliably across Google, Bing, and AI answer engines.

**Architecture:** Next.js 16 App Router, i18n via `[lang]` segment (`en|sk|de`), metadata via per‑page `generateMetadata`, `robots.ts` + `sitemap.ts` metadata routes, `middleware.ts` for host/locale handling, deployed to Cloud Run (GCP project `euhub-marketing`) and shipped via manual `gh workflow run deploy.yml`. All changes are additive and low‑risk; none alter page content or layout.

**Tech Stack:** TypeScript, Next.js 16, React 19, JSON dictionaries (`src/dictionaries/*.json`), IndexNow HTTP API.

**Companion report:** `docs/seo-indexation-report-2026-07-09.md` (findings, severity, evidence).

---

## Context the implementer needs

- **The site is already technically sound.** Canonicals, in‑page hreflang, OG/Twitter cards, JSON‑LD, and `robots.txt` are all correct and live. This plan is hygiene + reach, not a rescue. **Do not restructure** working metadata; make the minimal additive edits below.
- **No test runner exists** in this repo (`package.json` scripts are only `dev/build/start/lint`). "Tests" here = build the production bundle, run it, and assert the emitted HTML / HTTP behavior with `curl` + `grep`. Exact commands and expected output are given per task. Do **not** add Jest/Vitest — that's out of scope.
- **Verification harness** (used by most tasks): in one terminal run `npm run build && npm run start` (serves the production build on `http://localhost:3000`, which — unlike `next dev` — applies `next.config.ts` redirects/headers and middleware exactly as production does). Run the `curl` checks against `localhost:3000` in another terminal. See **Appendix B**.
- **Commit after every task.** Branch off `main` first (Task 0). Other agents may share this working tree, so `git add` only the exact paths listed in each step (never `git add -A`).
- **Some actions are ops/external, not code** (Google Search Console, Bing, Cloud Run min‑instances, edge 301, Ahrefs re‑crawl). Those are **Appendix A** as a human checklist — they are the highest‑leverage items for a brand‑new domain, so do them in parallel with the code.

---

## File Structure

| File | Responsibility | Change |
|------|----------------|--------|
| `next.config.ts` | Redirects & headers | Redirects → `permanent: true`; optional `/llms.txt` content‑type header |
| `src/app/sitemap.ts` | XML sitemap | Add per‑URL `alternates.languages` (hreflang) |
| `src/lib/seo.ts` | Shared SEO helpers | Add `ogLocale()` helper (`en`→`en_US`, …) |
| `src/app/[lang]/page.tsx` | Home metadata | Use `ogLocale(lang)` |
| `src/app/[lang]/{ai-act,data-residency,portability,privacy,terms,cookie}/page.tsx` | Sub‑page metadata | Use `ogLocale(lang)`; 3 of them also use new `metaDescription` |
| `src/dictionaries/{en,sk,de}.json` | Copy | Add `metaDescription` to `dataResidency`, `portability`, `aiAct` |
| `src/middleware.ts` | Host/locale handling | Add `X-Robots-Tag: noindex` for `infra.*` (decision‑flagged) |
| `public/llms.txt` | AI‑crawler manifest | Commit the existing (untracked) file |
| `public/<indexnow-key>.txt` | IndexNow ownership proof | New key file |
| `scripts/indexnow-submit.mjs` | Submit URLs to IndexNow | New script + `npm run indexnow` |

---

## Task 0: Branch & baseline snapshot

**Files:** none (git only)

- [ ] **Step 1: Confirm clean tree, then branch**

```bash
cd /incubator/web/euhub-ai.com
git status                     # note any pre-existing untracked files (public/llms.txt etc.)
git checkout -b seo/indexation-2026-07
```

- [ ] **Step 2: Capture a baseline of current behavior** (so you can prove each fix changed exactly what you expected)

```bash
npm run build && npm run start &   # wait for "Ready" then Ctrl-C-safe: run checks in another shell
# In a second shell:
curl -sI localhost:3000/           | grep -iE '^(HTTP|location)'   # baseline: 307 (Task 1 flips it to 308)
curl -sL localhost:3000/sitemap.xml | grep -c 'xhtml:link'         # expect 0 (no hreflang yet)
curl -sL localhost:3000/en          | grep -oE 'og:locale" content="[^"]*"'  # expect en
```

Expected baseline: `/` → **307**, sitemap `xhtml:link` count **0**, `og:locale` = **en**. Record these; each task flips one.

---

## Task 1: Make redirects permanent (307 → 308)

**Why:** Temporary redirects tell Google not to consolidate ranking signals onto the canonical `/en`. Making them permanent settles the canonical faster. (`http→https` is a separate edge‑level 302 — see Appendix A #4.)

**Files:**
- Modify: `next.config.ts:46` and `next.config.ts:58` (`permanent: false` → `true`)

> **DECISION NOTE:** `permanent: false` may have been intentional to keep `/` open for future geo/`Accept‑Language` locale routing (a cached 308 is sticky). There is **no** such routing in the codebase today (`middleware.ts` only sets an `x-locale` header; it does not negotiate). Making both rules permanent is the correct SEO call now. If geo‑routing is added later, revert the **root `/` rule only** to `permanent: false` and keep the catch‑all permanent.

- [ ] **Step 1: Edit both redirect rules**

In `next.config.ts`, both objects inside `redirects()` currently end with `permanent: false,`. Change **both** to:

```ts
        permanent: true,
```

- [ ] **Step 2: Build & verify the status code flipped**

```bash
npm run build && npm run start   # then in a second shell:
curl -sI localhost:3000/         | grep -iE '^(HTTP|location)'
curl -sI localhost:3000/privacy  | grep -iE '^(HTTP|location)'
```

Expected: `HTTP/1.1 308 Permanent Redirect` with `location: /en` (root) and `location: /en/privacy` (catch‑all). Baseline was 307.

- [ ] **Step 3: Commit**

```bash
git add next.config.ts
git commit -m "fix(seo): make locale redirects permanent (308) to consolidate canonical signals"
```

---

## Task 2: Add hreflang alternates to the sitemap

**Why:** In‑page hreflang is present, but sitemap‑level `xhtml:link` alternates help Google discover and cluster the `en/sk/de` variants of each page faster — directly aiding indexation of the SK/DE locales.

**Files:**
- Modify: `src/app/sitemap.ts` (full rewrite of the map body — small file)

- [ ] **Step 1: Rewrite `sitemap.ts` to emit alternates**

Replace the file contents with:

```ts
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
```

- [ ] **Step 2: Build & verify hreflang appears**

```bash
npm run build && npm run start   # then in a second shell:
curl -sL localhost:3000/sitemap.xml | grep -c 'xhtml:link'
curl -sL localhost:3000/sitemap.xml | grep -c '<loc>'
curl -sL localhost:3000/sitemap.xml | head -20
```

Expected: `xhtml:link` count **84** (21 URLs × 4 alternates incl. x‑default), `<loc>` count still **21**, and the `<urlset>` opening tag now includes `xmlns:xhtml="http://www.w3.org/1999/xhtml"`.

- [ ] **Step 3: Commit**

```bash
git add src/app/sitemap.ts
git commit -m "feat(seo): add hreflang alternates to sitemap for faster locale clustering"
```

---

## Task 3: Fix `og:locale` format (`en` → `en_US`)

**Why:** The Open Graph spec requires `language_TERRITORY` (e.g. `en_US`). Bare `en` is what Facebook/LinkedIn debuggers and Ahrefs flag as an invalid/incomplete OG tag. One shared helper keeps all 7 pages DRY.

**Files:**
- Modify: `src/lib/seo.ts` (add helper)
- Modify: all 7 page files' `generateMetadata` (`src/app/[lang]/page.tsx` + the 6 sub‑pages)

- [ ] **Step 1: Add the helper to `src/lib/seo.ts`**

Append near the top (after `const ORG_ID = ...`):

```ts
// Open Graph requires language_TERRITORY (e.g. "en_US"), not a bare language code.
// en_US is the OG default; swap to en_GB if you prefer EU-flavored English — the territory is cosmetic.
export const OG_LOCALE: Record<string, string> = { en: 'en_US', sk: 'sk_SK', de: 'de_DE' }
export function ogLocale(lang: string): string {
  return OG_LOCALE[lang] ?? 'en_US'
}
```

- [ ] **Step 2: Update the home page** `src/app/[lang]/page.tsx`

Add `ogLocale` to the existing import from `../../lib/seo`:
```ts
import { personLd, serviceLd, founderId, ogLocale } from '../../lib/seo';
```
In `openGraph`, change `locale: lang,` → `locale: ogLocale(lang),`.

- [ ] **Step 3: Update the 6 sub‑pages**

For each of `ai-act`, `data-residency`, `portability`, `privacy`, `terms`, `cookie` (`src/app/[lang]/<slug>/page.tsx`):
- Add `ogLocale` to the existing `from '../../../lib/seo'` import (each already imports something from there, e.g. `breadcrumbLd`).
- Change `locale: lang,` → `locale: ogLocale(lang),` in the `openGraph` block.

- [ ] **Step 4: Build & verify all locales**

```bash
npm run build && npm run start   # then in a second shell:
for u in en sk de en/ai-act sk/privacy de/portability; do
  echo -n "$u -> "; curl -sL localhost:3000/$u | grep -oE 'og:locale" content="[^"]*"'
done
```

Expected: `en_US`, `sk_SK`, `de_DE`, `en_US`, `sk_SK`, `de_DE` respectively.

- [ ] **Step 5: Commit**

```bash
git add src/lib/seo.ts \
        "src/app/[lang]/page.tsx" "src/app/[lang]/ai-act/page.tsx" "src/app/[lang]/data-residency/page.tsx" \
        "src/app/[lang]/portability/page.tsx" "src/app/[lang]/privacy/page.tsx" "src/app/[lang]/terms/page.tsx" \
        "src/app/[lang]/cookie/page.tsx"
git commit -m "fix(seo): emit spec-compliant og:locale (language_TERRITORY)"
```

---

## Task 4: Lengthen the short meta descriptions (8 flagged rows; 9 strings added, one per page×locale)

**Why:** `data-residency`, `portability`, and `ai-act` (all 3 locales) use their short on‑page tagline (`lastUpdated`) as the meta description — 44–86 chars, well under the ~110–160 ideal. Short descriptions get rewritten by Google and lower SERP CTR. This mirrors the existing `metaDescription` pattern already used by `privacy`/`terms`; the visible tagline is left untouched.

**Files:**
- Modify: `src/dictionaries/en.json`, `src/dictionaries/sk.json`, `src/dictionaries/de.json`
- Modify: `src/app/[lang]/ai-act/page.tsx`, `.../data-residency/page.tsx`, `.../portability/page.tsx`

- [ ] **Step 1: Add `metaDescription` to each dictionary**

In each of the three page nodes (`dataResidency`, `portability`, `aiAct`), add a sibling `metaDescription` key next to `lastUpdated`. Use these values verbatim:

**`en.json`:**
```json
"dataResidency": { "metaDescription": "Keep your AI data and workloads inside the EU. See exactly how EuHub AI guarantees EU data residency and GDPR compliance — infrastructure and controls." },
"portability":  { "metaDescription": "No vendor lock-in: own your models, data and workflows outright. EuHub AI builds portable AI systems you can export anytime and run anywhere in the EU." },
"aiAct":        { "metaDescription": "Get EU AI Act-ready before the 2 August 2026 deadline. EuHub AI helps you classify systems, meet risk and transparency duties, and ship AI that's legal in the EU." }
```

**`sk.json`:**
```json
"dataResidency": { "metaDescription": "Udržte svoje AI dáta a záťaže v EÚ. Pozrite si presne, ako EuHub AI zaručuje dátovú rezidenciu v EÚ a súlad s GDPR — infraštruktúra, sub-dodávatelia a kontroly." },
"portability":  { "metaDescription": "Žiadna závislosť od dodávateľa: vlastníte modely, dáta aj procesy. EuHub AI stavia prenositeľné AI systémy, ktoré kedykoľvek exportujete a prevádzkujete v EÚ." },
"aiAct":        { "metaDescription": "Pripravte sa na Akt EÚ o AI pred termínom 2. augusta 2026. EuHub AI vám pomôže klasifikovať systémy, splniť povinnosti a nasadiť AI, ktorá je legálna v EÚ." }
```

**`de.json`:**
```json
"dataResidency": { "metaDescription": "Halten Sie KI-Daten und -Workloads in der EU. EuHub AI zeigt genau, wie wir EU-Datenresidenz und DSGVO-Konformität sicherstellen — Infrastruktur und Kontrollen." },
"portability":  { "metaDescription": "Keine Anbieterabhängigkeit: Ihnen gehören Modelle, Daten und Workflows. EuHub AI baut portable KI-Systeme, die Sie jederzeit exportieren und in der EU betreiben." },
"aiAct":        { "metaDescription": "Werden Sie vor der Frist am 2. August 2026 EU-KI-Gesetz-konform. EuHub AI hilft, Systeme zu klassifizieren, Pflichten zu erfüllen und rechtskonforme KI zu liefern." }
```

> These are the **only** keys to add — merge them into the existing nodes; do not remove `lastUpdated`, `title`, `sections`, etc. Keep valid JSON (comma placement). After editing, validate: `node -e "['en','sk','de'].forEach(l=>JSON.parse(require('fs').readFileSync('src/dictionaries/'+l+'.json')))" && echo OK`.

- [ ] **Step 2: Use `metaDescription` in the 3 page files**

Each of `ai-act`, `data-residency`, `portability` contains `description: page.lastUpdated,` on **three** lines, but only the first two are in scope:
- line 23 — meta `description` (inside `generateMetadata`) ✅ replace
- line 35 — `openGraph.description` (inside `generateMetadata`) ✅ replace
- line ~53 — JSON‑LD `WebPage.description` (inside the **default component**, where `desc` does **not** exist) ❌ **leave untouched**

Right after `const { page } = await getPage(lang);` in `generateMetadata`, add:

```ts
  const desc = page.metaDescription ?? page.lastUpdated;
```

Then replace **only the two occurrences inside `generateMetadata`** (lines 23 & 35) with `description: desc,`. **Do NOT do a global replace-all** — rewriting the JSON‑LD line would put `desc` out of scope and break the build (`Cannot find name 'desc'`). Tell by indentation: the two to change are 4‑space (meta) and 6‑space (openGraph) indented; the JSON‑LD one is deeper inside the `@graph` object.

> TypeScript may not know `metaDescription` exists on the dictionary type. If the build errors on the property access, the dictionaries are typed loosely (JSON import) and it will be fine; if a strict type blocks it, use `(page as { metaDescription?: string }).metaDescription ?? page.lastUpdated`.

- [ ] **Step 3: Build & verify lengths are 110–160**

```bash
npm run build && npm run start   # then in a second shell:
for u in en/data-residency sk/portability de/ai-act en/portability sk/ai-act de/data-residency; do
  d=$(curl -sL localhost:3000/$u | grep -oE '<meta name="description" content="[^"]*"' | sed -E 's/.*content="([^"]*)".*/\1/')
  node -e "const s=process.argv[1];console.log(process.argv[2],'=>',[...s].length,'chars')" "$d" "$u"
done
```

Use `node`'s `[...s].length` (real character count), **not** bash `${#d}` — the strings contain em‑dashes and accented SK/DE letters (multibyte), so `${#d}` over‑counts in a non‑UTF‑8 locale and would spuriously fail. Expected: each between **110 and 160** characters; text matches the strings above.

- [ ] **Step 4: Commit**

```bash
git add src/dictionaries/en.json src/dictionaries/sk.json src/dictionaries/de.json \
        "src/app/[lang]/ai-act/page.tsx" "src/app/[lang]/data-residency/page.tsx" "src/app/[lang]/portability/page.tsx"
git commit -m "feat(seo): add proper 110-160 char meta descriptions for ai-act, data-residency, portability (EN/SK/DE)"
```

---

## Task 5: Serve a real `llms.txt` (`text/plain`, not the catch-all HTML)

**Why:** `/llms.txt` currently returns `200 text/html` (the App Router answers instead of a static file) — the issue documented in `docs/llms-txt-issue-report.md`. `public/llms.txt` exists locally but is **uncommitted**, so production never serves it. Shipping it improves GEO/AEO (AI crawler discoverability).

**Files:**
- Add (commit existing untracked): `public/llms.txt`
- Modify (only if Step 2 fails): `next.config.ts` headers

- [ ] **Step 1: Sanity-check and commit the static file**

```bash
head -5 public/llms.txt        # confirm it's the intended manifest, not empty/wrong
```

- [ ] **Step 2: Build & verify it serves as static text**

```bash
npm run build && npm run start   # then in a second shell:
curl -sI localhost:3000/llms.txt | grep -iE '^(HTTP|content-type)'
```

Expected: `HTTP/1.1 200 OK` and `content-type: text/plain`. Next serves `public/*.txt` statically and the redirect/middleware matchers already exclude dotted paths, so this should pass without config changes.

- [ ] **Step 3 (only if Step 2 shows `text/html` or a redirect):** diagnose before patching

`text/html` means the static file is **not** taking precedence — the `[lang]` catch‑all route is answering. First confirm the file is actually present in the build (`ls .next/standalone/public/llms.txt` or `ls public/llms.txt`) and that no route named `llms.txt` exists. A `Content-Type` header alone would only *mislabel* the HTML, not fix it — so only add the header below if the **body is the correct llms.txt text** but the type is wrong:
```ts
      { source: '/llms.txt', headers: [{ key: 'Content-Type', value: 'text/plain; charset=utf-8' }] },
```
Rebuild and re‑run the Step 2 check; expect `200 text/plain` **and** the correct body (`curl -s localhost:3000/llms.txt | head -3`).

- [ ] **Step 4: Commit**

```bash
git add public/llms.txt next.config.ts   # next.config.ts only if Step 3 was needed
git commit -m "fix(geo): ship llms.txt as a real static text/plain file"
```

---

## Task 6: Keep the `infra.` subdomain out of the index  *(DECISION-FLAGGED)*

**Why:** `infra.euhub-ai.com` is currently `200` and fully indexable, but it has no canonical, no hreflang, and isn't in the sitemap — a stray indexable surface that can split signals. Safest default is to `noindex` it; flip to first‑class (canonical + sitemap) later if you want it to rank.

> **DECISION:** Confirm intent before shipping. **Default (this task):** `noindex` the subdomain. **Alternative:** if `infra.euhub-ai.com` is meant to rank, skip this task and instead add a self‑canonical + sitemap entry for it (separate follow‑up). If unsure, ship the `noindex` — it's reversible.

**Files:**
- Modify: `src/middleware.ts` (the existing `infra.` branch)

- [ ] **Step 1: Add a `noindex` header on the infra rewrite**

In `src/middleware.ts`, the current `infra.` branch does a rewrite:
```ts
    if (host.startsWith('infra.') && !pathname.startsWith('/infra')) {
        const url = request.nextUrl.clone();
        url.pathname = '/infra';
        return NextResponse.rewrite(url);
    }
```
Change it to attach the header to the rewrite response, and also cover the case where the path is already `/infra`:
```ts
    if (host.startsWith('infra.')) {
        const url = request.nextUrl.clone();
        if (!pathname.startsWith('/infra')) url.pathname = '/infra';
        const res = NextResponse.rewrite(url);
        res.headers.set('X-Robots-Tag', 'noindex, nofollow');
        return res;
    }
```

- [ ] **Step 2: Build & verify the header (Host override)**

```bash
npm run build && npm run start   # then in a second shell:
curl -sI -H 'Host: infra.euhub-ai.com' localhost:3000/ | grep -iE '^(HTTP|x-robots-tag)'
curl -sI localhost:3000/en                              | grep -iE '^(HTTP|x-robots-tag)'
```

Expected: infra host → `x-robots-tag: noindex, nofollow`; the main `/en` → **no** `x-robots-tag` (still indexable).

- [ ] **Step 3: Commit**

```bash
git add src/middleware.ts
git commit -m "fix(seo): noindex the infra.* subdomain to prevent stray indexation"
```

---

## Task 7: IndexNow — instant Bing/Yandex indexing

**Why:** The audit's 21‑row "Pages to submit to IndexNow" notice. IndexNow pings Bing/Yandex (and downstream, Copilot/ChatGPT Search) the moment content changes, instead of waiting for a crawl. Two pieces: an ownership key file, and a submit script run after deploy.

**Files:**
- Add: `public/<key>.txt` (key file)
- Add: `scripts/indexnow-submit.mjs`
- Modify: `package.json` (add `indexnow` script)

- [ ] **Step 1: Generate a key and host it**

```bash
KEY=$(openssl rand -hex 16); echo "$KEY"
printf '%s' "$KEY" > "public/$KEY.txt"     # file body is exactly the key, no newline
echo "Record this key: $KEY"
```

- [ ] **Step 2: Add the submit script** `scripts/indexnow-submit.mjs`

```js
// Submits all sitemap URLs to IndexNow (Bing/Yandex). Run after a production deploy.
// Usage: INDEXNOW_KEY=<key> node scripts/indexnow-submit.mjs
const HOST = 'euhub-ai.com'
const KEY = process.env.INDEXNOW_KEY
if (!KEY) { console.error('Set INDEXNOW_KEY'); process.exit(1) }

const LOCALES = ['en', 'sk', 'de']
const ROUTES = ['', '/ai-act', '/data-residency', '/portability', '/privacy', '/terms', '/cookie']
const urlList = ROUTES.flatMap((r) => LOCALES.map((l) => `https://${HOST}/${l}${r}`))

const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host: HOST, key: KEY, keyLocation: `https://${HOST}/${KEY}.txt`, urlList }),
})
console.log('IndexNow response:', res.status, res.statusText)
if (res.status !== 200 && res.status !== 202) { console.error(await res.text()); process.exit(1) }
```

- [ ] **Step 3: Add the npm script** to `package.json` `scripts`:

```json
    "indexnow": "node scripts/indexnow-submit.mjs",
```

- [ ] **Step 4: Verify the key file serves (after deploy) and dry-run the payload**

Locally, confirm the key file is served and the URL list is well‑formed (don't hit the live API until the key file is actually deployed, or IndexNow will reject the ownership check):
```bash
npm run build && npm run start   # then in a second shell:
curl -sI "localhost:3000/$KEY.txt" | grep -iE '^(HTTP|content-type)'   # 200 text/plain
node -e "const L=['en','sk','de'],R=['','/ai-act','/data-residency','/portability','/privacy','/terms','/cookie'];console.log(R.flatMap(r=>L.map(l=>'https://euhub-ai.com/'+l+r)).length,'urls')"  # expect 21
```
After the real deploy, run once: `INDEXNOW_KEY=$KEY npm run indexnow` → expect `200`/`202`.

- [ ] **Step 5: Commit**

```bash
git add "public/$KEY.txt" scripts/indexnow-submit.mjs package.json
git commit -m "feat(seo): IndexNow key + submit script for instant Bing/Yandex indexing"
```

> **Follow‑up (optional, ops):** add `INDEXNOW_KEY` as a CI secret and append `npm run indexnow` as a post‑deploy step in `.github/workflows/deploy.yml` so every deploy pings automatically.

---

## Task 8: Fix the dead `mike.euhub-ai.com` link (broken on-page link + dead `Person.sameAs`)

**Why:** All three locales set Mike's team `url` to `https://mike.euhub-ai.com`, which now returns **DNS NXDOMAIN** (the subdomain was removed). This is a broken outbound "Connect" link on the homepage **and** `src/lib/seo.ts` folds `m.url` into the person's JSON‑LD `sameAs`, so a dead URL is currently published in structured data (a bad entity signal). Mike's correct profile is his LinkedIn (already in the `LINKEDIN` map in `seo.ts`).

**Files:**
- Modify: `src/dictionaries/en.json:67`, `src/dictionaries/sk.json:67`, `src/dictionaries/de.json:67`

- [ ] **Step 1: Repoint the URL in all three dictionaries**

In each dict, Mike G.'s member entry has `"url": "https://mike.euhub-ai.com"` (line 67; indentation differs — `sk.json` is more deeply nested). Change each to:
```json
"url": "https://www.linkedin.com/in/gordievsky/"
```

- [ ] **Step 2: Build & verify — no dead URL on-page or in schema**

```bash
npm run build && npm run start   # then in a second shell:
curl -sL localhost:3000/en | grep -o 'mike.euhub-ai.com' | head -1   # expect: (empty)
curl -sL localhost:3000/en | grep -oE '"sameAs":\[[^]]*gordievsky[^]]*\]' | head -1   # expect LinkedIn present
```

Expected: `mike.euhub-ai.com` appears **nowhere** in the rendered page; Mike's `sameAs` shows only the LinkedIn URL (the `new Set(...)` in `seo.ts` dedupes it).

- [ ] **Step 3: Commit**

```bash
git add src/dictionaries/en.json src/dictionaries/sk.json src/dictionaries/de.json
git commit -m "fix(seo): repoint Mike's dead mike.euhub-ai.com link to LinkedIn (on-page + Person.sameAs)"
```

---

## Task 9: Deploy & post-deploy verification

**Files:** none (ops)

- [ ] **Step 1: Merge & deploy**

Open a PR from `seo/indexation-2026-07`, merge, then ship prod manually (this repo deploys via workflow dispatch, not on merge):
```bash
gh workflow run deploy.yml
```

- [ ] **Step 2: Verify against production** (repeat the Appendix B checks against `https://euhub-ai.com`)

```bash
curl -sI https://euhub-ai.com/                | grep -iE '^(HTTP|location)'      # 308 -> /en
curl -sL https://euhub-ai.com/sitemap.xml     | grep -c 'xhtml:link'            # 84
curl -sL https://euhub-ai.com/de              | grep -oE 'og:locale" content="[^"]*"'  # de_DE
curl -sI https://euhub-ai.com/llms.txt        | grep -iE '^(HTTP|content-type)' # 200 text/plain
curl -sI -H 'Host: infra.euhub-ai.com' https://euhub-ai.com/ | grep -i x-robots-tag  # noindex (if same origin)
```

- [ ] **Step 3: Run IndexNow once**

```bash
INDEXNOW_KEY=<key> npm run indexnow   # expect 200/202
```

- [ ] **Step 4: Trigger a fresh Ahrefs crawl** and confirm the OG/redirect/subdomain findings clear (see Appendix A #5).

---

## Appendix A — Ops / external checklist (highest leverage; do in parallel with code)

These aren't code, but for a new domain they matter **more** than the code tasks. Assign an owner.

- [ ] **A1. Google Search Console** — confirm `euhub-ai.com` is verified (no inline verification meta tag was found; it may be DNS/file — check). Submit `https://euhub-ai.com/sitemap.xml`. Use **URL Inspection → Request indexing** for `/en`, `/sk`, `/de`.
- [ ] **A2. Bing Webmaster Tools** — verify the domain, submit the sitemap. (Feeds Copilot / ChatGPT Search.)
- [ ] **A3. Remove `mike.euhub-ai.com` from the Ahrefs project scope** — it no longer resolves (DNS NXDOMAIN); the "Robots.txt not accessible" Error is a stale scope artifact, not a live fault. Also confirm no other preview subdomains (`*.euhub-ai.com`) are publicly reachable/indexable.
- [ ] **A4. Make `http → https` a 301 at the edge** — currently 302 (Cloud Run domain mapping / load balancer). If using a GCP HTTPS LB, set the redirect's `redirectResponseCode` to `MOVED_PERMANENTLY_DEFAULT` (301). If it's Cloud Run's built‑in mapping and not configurable, deprioritize — `http` isn't canonical and Google follows 302 fine.
- [ ] **A5. Cloud Run min‑instances ≥ 1** — the one "Slow page" (`/sk/cookie`, 2.68 s TTFB) is a cold start. `gcloud run services update euhub-ai-web --min-instances=1` (project `euhub-marketing`) removes cold starts for crawlers. Weigh against cost.
- [ ] **A6. Re‑crawl in Ahrefs** after deploy to clear the stale Open Graph (42), redirect, and subdomain findings, and confirm a clean report.

---

## Appendix B — Local verification harness

Most tasks verify the same way. Keep two terminals open:

```bash
# Terminal 1 — production build + server (applies redirects/headers/middleware like prod; next dev does NOT)
npm run build && npm run start        # serves http://localhost:3000

# Terminal 2 — assertions
curl -sI localhost:3000/                         | grep -iE '^(HTTP|location)'
curl -sL localhost:3000/sitemap.xml              | grep -c 'xhtml:link'
curl -sL localhost:3000/en                       | grep -oE 'og:(locale|url|description)" content="[^"]*"'
curl -sI localhost:3000/llms.txt                 | grep -iE '^(HTTP|content-type)'
curl -sI -H 'Host: infra.euhub-ai.com' localhost:3000/ | grep -i x-robots-tag
```

**Why `next start`, not `next dev`:** `redirects()`/`headers()` from `next.config.ts` and the exact status codes only behave like production under `next build && next start`. `next dev` can differ.

---

## Sequencing & rollback

- **Order:** Task 0 → 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9. Tasks 1–8 are independent and each is its own commit, so any single one can be dropped or reverted (`git revert <sha>`) without affecting the others.
- **Risk:** all additive; no content/layout changes. The only behavioral changes visible to users are redirect status codes (transparent) and — if you run Task 6 — the infra subdomain becoming `noindex`.
- **Definition of done:** Appendix B checks pass on production (Task 8 Step 2), IndexNow returns 200/202, and a fresh Ahrefs crawl shows the Error cleared and the OG/redirect warnings gone.

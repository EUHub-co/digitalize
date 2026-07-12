# Split infra.euhub-ai.com into its own repo + Cloud Run service — Implementation Plan

> **For agentic workers (Claude Sonnet 5):** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. Read the **Decisions** and **Current coupling inventory** sections fully before Task 1.

**Goal:** Move the `infra.euhub-ai.com` landing page out of the `EUHUB-AI/ai-studio` monorepo into a new dedicated repo (`web-dev-studio/euhub-deploy`) deployed as its own Cloud Run service (`euhub-infra-web`), then remove all infra-host coupling from the main site.

**Architecture:** Today one Next.js 16 app serves both hosts: `src/middleware.ts` rewrites any `infra.*` host to the `/infra` route and stamps `X-Robots-Tag: noindex`. The split creates a second, trimmed Next.js app whose **root route `/` is the infra landing page** (no host logic, no locale URLs — the in-page language switcher is kept), deployed to a new Cloud Run service in the same GCP project (`euhub-marketing`). Cutover = re-pointing the existing `infra.euhub-ai.com` domain mapping from `euhub-ai-web` to `euhub-infra-web`. DNS does not change.

**Tech Stack:** Next.js 16.0.7 (App Router, `output: 'standalone'`), React 19, Tailwind 3.4, Bun Docker build, Cloud Run (europe-west1), GitHub Actions with Workload Identity Federation, `gh` + `gcloud` CLIs.

> **EXECUTION STATUS (2026-07-11):** **Phase 1 is DONE** — executed inline in `/incubator/web/euhub-deploy` (4 local commits: scaffold `1e93d34`, source `d29cdf5`, lockfile `2f37ef3`, README+CI `34501df`, plus `e0456e6` for the repo/D10 doc update). `bun run build` green (routes `/` + `/robots.txt`); runtime probes all pass on `next start` (200 + `X-Robots-Tag: noindex,nofollow`, correct title/canonical/JSON-LD/GTM, disallow-all robots, assets 200, absolute cookie links verified in the JS bundle). Task 3 Step 3b (CookieConsent hrefs), the `bun.lock` commit, and the Dockerfile `bun.lock*` glob fix are all applied. The Task 8 workflow file is already written and committed.
>
> **Task 7 (GCP provisioning) is DONE** — run directly by the user via `gcloud` CLI from `euhub-server` (not this sandbox, which has no valid gcloud auth). Artifact Registry `euhub-infra-web`, both service accounts, IAM bindings, and the WIF provider all created in `euhub-marketing`. One deviation from the plan text hit live: the WIF provider `--display-name` has a **32-char GCP limit** — `"GitHub web-dev-studio/euhub-deploy"` (34 chars) was rejected; fixed to `"web-dev-studio/euhub-deploy"` (27 chars). The plan's Task 7 Step 4 command is now updated to match what was actually run. **Sonnet should re-run Task 7 Step 6's verify command** (`describe ... --format="value(state)"` → expect `ACTIVE`) once it has working gcloud auth, to confirm before moving to Task 8 — this session's gcloud auth is expired so it wasn't re-checked here.
>
> **Task 1 preflight — done retroactively (2026-07-11), once sandbox gcloud auth started working mid-session.** Findings: prod `NEXT_PUBLIC_GTM_ID=GTM-KMHTFB3N` (matches code fallback — no env var override needed in the new service, confirming Task 8's assumption was safe). **Also surfaced an out-of-plan-order event:** the `infra.euhub-ai.com` domain mapping had already been switched (by the user, outside this plan's steps) to point at `euhub-infra-web` *before that service existed* — `gcloud beta run domain-mappings describe` showed `reason: RouteMissing`, i.e. **infra.euhub-ai.com was down**. Per user instruction, the mapping was deleted (`gcloud beta run domain-mappings delete --domain=infra.euhub-ai.com ...`) — the user will redo the mapping themselves once ready. **Do not treat "no mapping" as a regression to fix** — it's intentional until the user remaps both `infra.` and `deploy.` (D10).
>
> **Task 6 Step 2 (push) — DONE.** SSH push from the sandbox (`git@... euhub-support`) failed repeatedly ("Repository not found" / timeout) even after the repo existed — likely org-membership propagation lag, never fully diagnosed. **The user pushed from their own machine instead.** `origin/main` confirmed at `e0456e6` (all 5 commits). `gh repo view web-dev-studio/euhub-deploy` and `gh workflow run` now work fine from the sandbox — only raw `git push` over this sandbox's SSH identity was ever blocked.
>
> **Tasks 8–9 (CI deploy + verify) — DONE.** Two Cloud Run revisions now exist: `euhub-infra-web-00001-fks` (built via an ad-hoc `gcloud run deploy --source=.` from local source, done first to unblock the user while repo access was still stuck) and **`euhub-infra-web-00002-n8f` (built by the real `deploy.yml` GitHub Actions workflow** — `gh workflow run deploy.yml --repo web-dev-studio/euhub-deploy --ref main`, run [29152486490](https://github.com/web-dev-studio/euhub-deploy/actions/runs/29152486490), completed `success`). The CI-built revision is live at 100% traffic, verified: `https://euhub-infra-web-139826268276.europe-west1.run.app/` → 200, `x-robots-tag: noindex, nofollow`, correct title. **The designed WIF→AR→Cloud Run pipeline is proven end-to-end**, not just the fallback path.
>
> **✅ SPLIT COMPLETE (2026-07-12) — both services live, main site stripped + deployed.**
>
> **Phase 5 (strip ai-studio) — DONE + MERGED + DEPLOYED.** PR [#30](https://github.com/EUHUB-AI/ai-studio/pull/30) squash-merged to `main` as `3431884` (user explicitly authorized the merge via AskUserQuestion after the safety classifier blocked agent self-merge). Prod deployed (`gh workflow run deploy.yml --ref main`, run 29189969724 = success). **Live-verified:** `euhub-ai.com/infra` → **308 → `https://deploy.euhub-ai.com/`**, `/en` → 200, `/` → 308 `/en`. Deleted `src/app/infra/`; middleware host-rewrite gone; next.config `missing` guards gone + `/infra` 308 redirect added; `infra` dict blocks removed (sk 4-space indent preserved — reformatting trap caught).
>
> **infra.→deploy. 301 (D11 open item) — RESOLVED: user chose 301→deploy.** Implemented in `euhub-deploy/next.config.ts` as a host-conditional redirect (`has: host=infra.euhub-ai.com` → `https://deploy.euhub-ai.com/:path*`, `statusCode: 301`, ordered first so it beats the collapse-to-root rule). Commit `914d912`, CI-deployed (run 29190054510 = success, revision `euhub-infra-web-00004-stk`). Verified locally via `next start` + Host header (301, path preserved). **NOTE:** can't E2E-verify against Cloud Run until `infra.` is mapped — Cloud Run 404s an unmapped Host at ingress before it reaches the app. The redirect fires automatically once the user maps `infra.euhub-ai.com` → `euhub-infra-web`.
>
> **Domain state:** `deploy.euhub-ai.com` → `euhub-infra-web` LIVE (canonical, 200 noindex). `euhub-ai.com`/`www.` → `euhub-ai-web` (stripped main site). `infra.euhub-ai.com` UNMAPPED — map it to `euhub-infra-web` to activate the 301 (user manages mappings).
>
> **Apex `/deploy` path redirect (2026-07-12):** user wanted `euhub-ai.com/infra` + `euhub-ai.com/deploy` to both resolve to the landing. Cloud Run domain mappings are host→service (can't route a path to another service without a load balancer — none exists, 0 url-maps), so per user's choice the simplest option was taken: add `/deploy` + `/deploy/:path*` → `https://deploy.euhub-ai.com` (308) alongside the existing `/infra` ones in the main `next.config.ts`. **This also fixes a latent bug:** `euhub-ai.com/deploy` previously served the main EN homepage because "deploy" starts with "de" and slipped past the locale catch-all (rendered `[lang]="deploy"` → en fallback). Explicit redirect placed before the catch-all fixes it; verified `/de` + `/de/privacy` German locale still 200 (not caught). Branch `chore/redirect-deploy-path`.

---

## Decisions (defaults — user can override any before execution)

| # | Decision | Default | Rationale |
|---|----------|---------|-----------|
| D1 | Target repo | `git@github.com:web-dev-studio/euhub-deploy.git` | **User-designated 2026-07-11** (different org than ai-studio). ⚠ As of 2026-07-11 the sandbox SSH identity `euhub-support` gets "Repository not found" — the user must create the repo and/or grant `euhub-support` write access before Task 6 Step 2 can push |
| D2 | GCP project for new service | **Same project `euhub-marketing`** | Domain `euhub-ai.com` is already verified there; certs, IAM, WIF pool all in one place |
| D3 | Git history | Fresh repo, files copied (no `git filter-repo`) | Only ~6 source files; original history stays findable in ai-studio. Note the provenance commit hash in the new README |
| D4 | Index policy of the new site | **Keep `noindex`** (now via `next.config` header + `robots.ts` + metadata, not middleware) | Parity with the deliberate SEO decision from PR #27. Flipping to indexable later is a one-commit change in the new repo, listed in Appendix B |
| D5 | Analytics/consent | Keep GTM (`GTM-KMHTFB3N` default fallback) + Consent Mode v2 + self-hosted CookieConsent, consent UI locale `en` | Same behavior the page has in production today |
| D6 | URL shape in new app | Landing at `/`; no `/en|/sk|/de` paths | The page localizes in-page via localStorage; parity with today |
| D7 | Old path `euhub-ai.com/infra` | Permanent redirect → `https://infra.euhub-ai.com` (Next.js `permanent: true` emits **308**) | The path is live today (canonical already points at the subdomain) |
| D8 | CI identity | New WIF **provider** in the existing `github` pool + dedicated SAs `euhub-infra-web-{deployer,runtime}` | Least privilege; the existing provider is attribute-locked to the ai-studio repo |
| D9 | Local working dir for new repo | `/incubator/web/euhub-deploy` | Pre-created (empty) by the user 2026-07-11; sibling of the current checkout |
| D10 | Second host `deploy.euhub-ai.com` | Alias of the same new service — map it to `euhub-infra-web` in the cutover alongside `infra.` | **User-stated 2026-07-11**: infra.euhub-ai.com "also mapped to deploy.euhub-ai.com". DNS verified: both CNAME `ghs.googlehosted.com`. **SUPERSEDED same day → see D11.** |
| D11 | Canonical domain | **`deploy.euhub-ai.com` is the principal/canonical domain** (reverses D10). ✅ DONE 2026-07-11 (commit `0dbf734`, CI revision `-00003-f5x`): `BASE`/`metadataBase`/canonical/JSON-LD `url` all → `https://deploy.euhub-ai.com`; verified live. Also fixed the `/en` 404 the user hit — added a `next.config.ts` `redirects()` catch-all folding any non-asset/non-`_next` path (legacy `/en`,`/sk`,`/de`, etc.) → `/` with 308. **STILL OPEN:** whether `infra.euhub-ai.com` should 301→`deploy.` or stay an independent noindex alias — not decided; no `infra.` redirect implemented | **User-stated 2026-07-11**: "the one principal domain for this landing is 'deploy.euhub-ai.com'" |

---

## Current coupling inventory (verified 2026-07-11)

Everything that ties `infra.euhub-ai.com` to the `ai-studio` repo:

1. **`src/middleware.ts:10-18`** — host-based rewrite: any `infra.*` host → `/infra` route + `X-Robots-Tag: noindex, nofollow` on every response.
2. **`next.config.ts:40-60`** — both redirects (`/`→`/en`, locale catch-all) carry `missing: [{ type: 'host', value: 'infra.euhub-ai.com' }]` guards; the catch-all regex excludes `infra`.
3. **`src/app/infra/`** — `page.tsx` (metadata + JSON-LD, `BASE = 'https://infra.euhub-ai.com'`), `InfraLanding.tsx` (client component: in-page EN/SK/DE switcher via localStorage, scoped light/dark theme, Formspree waitlist form `xzdlajdd`), `infra.module.css` (74 lines, **self-contained** theme tokens — mirrors globals.css values but does not depend on them).
4. **`src/dictionaries/{en,sk,de}.json`** — top-level `infra` block (keys: `nav, hero, why, services, process, expert, cta, footerLinks, meta`). 2-space indent.
5. **`src/get-dictionary.ts`** — dictionary loader (server-only).
6. **`src/components/shared/GlassCard.tsx`** — used by InfraLanding; depends on the global `.glass` class in `src/app/globals.css`.
7. **`src/app/layout.tsx`** — the infra route inherits fonts (Plus Jakarta Sans / DM Sans / JetBrains Mono via `next/font`), GTM + Consent Mode v2 scripts, `CookieConsent`, skip-link, `globals.css`.
8. **`src/components/consent/CookieConsent.tsx`** — only external dep: `vanilla-cookieconsent` (+ its CSS).
9. **Public assets used by the infra page:** `/logo_light.webp`, `/logo_dark.webp`, `/photos/mike1.webp`, `/og.png`.
10. **Tailwind:** InfraLanding uses `font-sans`/`font-mono` (mapped to `--font-heading`/`--font-mono` in `tailwind.config.ts`) plus arbitrary-value classes over the scoped CSS vars; `globals.css` provides `.glass`, `.container` (horizontal-padding-only — see memory note), `.skip-link`.
11. **Cloud Run:** single service `euhub-ai-web` (project `euhub-marketing` / `139826268276`, region `europe-west1`, run.app URL `euhub-ai-web-os5qn6ntga-ew.a.run.app`) with **three** domain mappings: apex, `www.`, `infra.`. Certs Ready since 2026-07-06.
12. **`.github/workflows/deploy.yml`** — manual `workflow_dispatch` deploy; WIF provider `projects/139826268276/locations/global/workloadIdentityPools/github/providers/euhub-ai-web`; SAs `euhub-ai-web-{deployer,runtime}@euhub-marketing.iam.gserviceaccount.com`; IndexNow ping step (main site only — infra is noindex, so the new repo gets **no** IndexNow step).
13. **Not coupling (do not touch):** "infrastructure" copy mentions in `Hero.tsx`/`Contact.tsx`; `deploy-staging.yml`/`deploy-dev.yml` (staging/dev of the *main* site in the old `euhub-ai` project); the infra page's own links already point at `https://euhub-ai.com...` absolutely.

**Known environment constraints (from project memory):**
- Prod deploys are **manual**: `gh workflow run deploy.yml --ref main`. No auto-deploy on merge.
- Sandbox `curl` sometimes can't reach the custom domains (Google frontend IPs blocked) — fall back to the `*.run.app` URL and/or ask the user to verify from their machine.
- GitHub REST (`api.github.com`) is intermittently flaky from the sandbox — retry, or fall back to the browser for repo settings.
- Shared worktree: `git add` explicit paths only, never `-A`. Commit atomically.

---

## New repo file structure (`/incubator/web/euhub-deploy`)

```
infra-web/
├── .github/workflows/deploy.yml       # NEW — adapted from ai-studio deploy.yml
├── .dockerignore                      # copy from ai-studio
├── .gitignore                         # copy from ai-studio
├── Dockerfile                         # copy from ai-studio, FIX: bun.lockb* → bun.lock*
├── README.md                          # NEW — provenance + runbook
├── next.config.ts                     # NEW — standalone, security headers, site-wide noindex header
├── package.json                       # NEW — trimmed deps (drop next-themes, lucide-react)
├── postcss.config.mjs                 # copy
├── tailwind.config.ts                 # copy
├── tsconfig.json                      # copy
├── public/
│   ├── logo_light.webp  logo_dark.webp  og.png       # copy
│   └── photos/mike1.webp                             # copy
└── src/
    ├── get-dictionary.ts              # copy
    ├── dictionaries/{en,sk,de}.json   # NEW — extracted: { "infra": { ... } } only
    ├── components/
    │   ├── consent/CookieConsent.tsx  # copy
    │   └── shared/GlassCard.tsx       # copy
    └── app/
        ├── globals.css                # copy whole file (provides .glass/.container/.skip-link + tokens)
        ├── layout.tsx                 # NEW — trimmed (no x-locale header, no Providers/next-themes)
        ├── page.tsx                   # from src/app/infra/page.tsx, one import path change
        ├── InfraLanding.tsx           # from src/app/infra/InfraLanding.tsx, one import path change
        ├── infra.module.css           # copy verbatim
        └── robots.ts                  # NEW — disallow all (noindex site)
```

No `middleware.ts` (no host logic needed), no `sitemap.ts` (noindex site), no `[lang]` tree, no sections/ components.

---

## Phase 0 — Preflight (human-gated auth, snapshot)

### Task 1: Verify access + snapshot current state

**Files:** none (read-only).

- [ ] **Step 1: Verify `gh` auth**

Run: `gh auth status`
Expected: logged in with repo + workflow scopes for `EUHUB-AI`. If not: **STOP and ask the user** — auth is interactive.

- [ ] **Step 2: Verify `gcloud` auth** *(as of 2026-07-11 the sandbox token was expired — this will likely need the user)*

Run: `gcloud auth print-access-token >/dev/null && echo OK`
Expected: `OK`. If `Reauthentication failed`: **STOP and ask the user to run `gcloud auth login`** (interactive; cannot be done headlessly here).

- [ ] **Step 3: Snapshot Cloud Run state**

```bash
gcloud run services list --project=euhub-marketing --region=europe-west1
gcloud beta run domain-mappings list --project=euhub-marketing --region=europe-west1
```

Expected: service `euhub-ai-web`; mappings for `euhub-ai.com`, `www.euhub-ai.com`, `infra.euhub-ai.com` all → `euhub-ai-web`, certs Ready. **Also check for a `deploy.euhub-ai.com` mapping (D10):** DNS already CNAMEs it to `ghs.googlehosted.com`, but as of plan-writing it was unverified whether a Cloud Run mapping exists and which service it targets — record what you find; Task 10 handles both hosts. Save this output into the PR description later (it is the rollback reference).

Also capture the current GTM env var on the prod service:

```bash
gcloud run services describe euhub-ai-web --region=europe-west1 --project=euhub-marketing \
  --format="yaml(spec.template.spec.containers[0].env)"
```

Expected: a YAML block containing `name: NEXT_PUBLIC_GTM_ID` with its `value`. **If the value differs from `GTM-KMHTFB3N`** (the code's hardcoded fallback), the new service must carry the same env var — see the note in Task 8 Step 1.

- [ ] **Step 4: Describe the existing WIF provider (to mirror its attribute mapping in Task 8)**

```bash
gcloud iam workload-identity-pools providers describe euhub-ai-web \
  --project=euhub-marketing --location=global --workload-identity-pool=github \
  --format="yaml(attributeMapping, attributeCondition, oidc.issuerUri)"
```

Expected: issuer `https://token.actions.githubusercontent.com`, a mapping that includes `attribute.repository=assertion.repository`, and a condition pinned to `EUHUB-AI/ai-studio`. **Record the exact mapping — Task 8 must reuse it verbatim** (only the condition changes to the new repo).

- [ ] **Step 5: Confirm prod is healthy before touching anything**

Run: `curl -sI https://euhub-ai-web-os5qn6ntga-ew.a.run.app/infra | head -5` (and `curl -sI https://infra.euhub-ai.com` if the sandbox can reach it)
Expected: `HTTP/2 200` on the run.app path; the custom domain (if reachable) shows `x-robots-tag: noindex, nofollow`.

---

## Phase 1 — Build the new app

### Task 2: Scaffold repo directory + config files

**Files:**
- Create: `/incubator/web/euhub-deploy/` (everything below is relative to it)
- Create: `package.json`, `next.config.ts`
- Copy: `tsconfig.json`, `tailwind.config.ts`, `postcss.config.mjs`, `.gitignore`, `.dockerignore` from `/incubator/web/euhub-ai.com/`

- [ ] **Step 1: Create the directory and copy verbatim configs**

```bash
SRC=/incubator/web/euhub-ai.com
DST=/incubator/web/euhub-deploy
mkdir -p $DST
cp $SRC/tsconfig.json $SRC/tailwind.config.ts $SRC/postcss.config.mjs $SRC/.gitignore $SRC/.dockerignore $DST/
cd $DST && git init -b main
```

- [ ] **Step 2: Write `package.json`** (trimmed: no `next-themes`, no `lucide-react`, no IndexNow script)

```json
{
  "name": "infra-web",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint"
  },
  "dependencies": {
    "@formspree/react": "^3.0.0",
    "next": "16.0.7",
    "react": "19.2.0",
    "react-dom": "19.2.0",
    "vanilla-cookieconsent": "^3.1.0"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "autoprefixer": "^10.4.22",
    "eslint": "^9",
    "eslint-config-next": "16.0.7",
    "postcss": "^8.5.6",
    "tailwindcss": "3.4.17",
    "typescript": "^5"
  }
}
```

Also copy the lint config: `cp $SRC/eslint.config.mjs $DST/`

- [ ] **Step 3: Write `next.config.ts`** — standalone output, the same security headers as the main site, **plus a site-wide noindex header** (replaces the middleware's `X-Robots-Tag`). No redirects.

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for Docker
  output: 'standalone',

  images: {
    unoptimized: true,
  },

  async headers() {
    const securityHeaders = [
      { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
      // Whole site is noindex by design (see plan D4). Flip = delete this one header
      // plus src/app/robots.ts disallow (Appendix B).
      { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
      { key: 'Content-Security-Policy-Report-Only', value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://*.googletagmanager.com https://*.google-analytics.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data:; connect-src 'self' https://*.google-analytics.com https://*.googletagmanager.com https://*.analytics.google.com https://formspree.io https://*.formspree.io; frame-src 'self' https://www.googletagmanager.com; frame-ancestors 'self'; base-uri 'self'; object-src 'none'; form-action 'self' https://formspree.io" },
    ];
    return [
      { source: '/:path*', headers: securityHeaders },
      {
        source: '/:asset((?!_next/).*\\.(?:png|jpe?g|webp|avif|svg|ico|gif))',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=604800' },
        ],
      },
    ];
  },
};

export default nextConfig;
```

Note the CSP additions vs. the main site: `formspree.io` in `connect-src` and `form-action` — the waitlist form posts there via `@formspree/react` (fetch). This is Report-Only, same as the main site.

- [ ] **Step 4: Commit**

```bash
cd $DST && git add package.json next.config.ts tsconfig.json tailwind.config.ts postcss.config.mjs eslint.config.mjs .gitignore .dockerignore
git commit -m "chore: scaffold infra-web (configs from ai-studio @$(git -C /incubator/web/euhub-ai.com log -1 --format=%h origin/main 2>/dev/null || git -C /incubator/web/euhub-ai.com log -1 --format=%h))"
```

(Provenance hash: use ai-studio's actual `main` HEAD at execution time — it was `15e2764` when this plan was written, but main may have moved. Same applies to the commit in Task 3 and the README in Task 6.)

### Task 3: Copy app source + adjust import paths

**Files:**
- Create: `src/app/{layout.tsx,page.tsx,InfraLanding.tsx,infra.module.css,globals.css,robots.ts}`
- Create: `src/components/shared/GlassCard.tsx`, `src/components/consent/CookieConsent.tsx`
- Create: `src/get-dictionary.ts`, `src/dictionaries/{en,sk,de}.json`

- [ ] **Step 1: Copy verbatim files**

```bash
SRC=/incubator/web/euhub-ai.com
DST=/incubator/web/euhub-deploy
mkdir -p $DST/src/app $DST/src/components/shared $DST/src/components/consent $DST/src/dictionaries
cp $SRC/src/app/globals.css $DST/src/app/
cp $SRC/src/app/infra/InfraLanding.tsx $SRC/src/app/infra/infra.module.css $DST/src/app/
cp $SRC/src/components/shared/GlassCard.tsx $DST/src/components/shared/
cp $SRC/src/components/consent/CookieConsent.tsx $DST/src/components/consent/
cp $SRC/src/get-dictionary.ts $DST/src/
cp $SRC/src/app/favicon.ico $DST/src/app/ 2>/dev/null || true
```

- [ ] **Step 2: Extract the `infra` dictionary blocks** (keep the `{ "infra": ... }` wrapper so page code is unchanged; 2-space indent matches the source files)

```bash
cd $DST
for l in en sk de; do
  node -e "
    const src = require('$SRC/src/dictionaries/$l.json');
    require('fs').writeFileSync('src/dictionaries/$l.json',
      JSON.stringify({ infra: src.infra }, null, 2) + '\n');
  "
done
```

Verify: `node -e "console.log(Object.keys(require('./src/dictionaries/sk.json').infra))"` → `nav, hero, why, services, process, expert, cta, footerLinks, meta` (all three locales).

- [ ] **Step 3: Fix the one import path in `InfraLanding.tsx`** (moved up one directory level)

In `src/app/InfraLanding.tsx` change:
```ts
import { GlassCard } from '../../components/shared/GlassCard';
```
to:
```ts
import { GlassCard } from '../components/shared/GlassCard';
```
No other changes to this file.

- [ ] **Step 3b: Fix the consent modal's cookie-policy link in the copied `CookieConsent.tsx`**

The copied component's translations link to `/en/cookie` (and locale variants) — relative paths that exist on the main site but would **404 on this single-route app** (a GDPR-facing link). Edit `src/components/consent/CookieConsent.tsx`: replace every internal policy href like `"/en/cookie"` / `"/sk/cookie"` / `"/de/cookie"` (grep for `cookie"` and `href` in the translations object) with the absolute `https://euhub-ai.com/<locale>/cookie`. Verify afterwards:

```bash
grep -n 'href' src/components/consent/CookieConsent.tsx
```

Expected: no site-relative `/en/...`-style hrefs remain — all policy links absolute to `https://euhub-ai.com`.

- [ ] **Step 4: Write `src/app/page.tsx`** — this is `src/app/infra/page.tsx` with the import path adjusted and belt-and-braces `robots` metadata added:

```tsx
import type { Metadata } from 'next';
import { getDictionary } from '../get-dictionary';
import { InfraLanding } from './InfraLanding';

const BASE = 'https://infra.euhub-ai.com';

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary('en');
  const m = dict.infra?.meta || {};
  return {
    title: { absolute: m.title || 'Infrastructure Migration & DevSecOps | EuHub AI' },
    description: m.description,
    alternates: { canonical: BASE },
    robots: { index: false, follow: false },
    openGraph: { title: m.title, description: m.description, url: BASE, images: ['/og.png'] },
    twitter: { card: 'summary_large_image', images: ['/og.png'] },
  };
}

export default async function InfraPage() {
  const [en, sk, de] = await Promise.all([
    getDictionary('en'),
    getDictionary('sk'),
    getDictionary('de'),
  ]);
  const dicts = { en: en.infra, sk: sk.infra, de: de.infra };

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': 'https://euhub-ai.com/#organization',
        name: 'EuHub AI',
        legalName: 'Engineers-incubator s.r.o.',
        url: 'https://euhub-ai.com',
      },
      {
        '@type': 'Service',
        name: 'Infrastructure migration & DevSecOps',
        serviceType:
          'Cloud migration, DevSecOps pipelines, platform/SRE, and EU compliance-ready infrastructure',
        provider: { '@id': 'https://euhub-ai.com/#organization' },
        areaServed: { '@type': 'Place', name: 'European Union' },
        url: BASE,
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <InfraLanding dicts={dicts} />
    </>
  );
}
```

- [ ] **Step 5: Write `src/app/layout.tsx`** — trimmed from the main-site layout: fonts, GTM + Consent Mode v2, CookieConsent, skip link. Dropped: `headers()`/x-locale (this app has one route; the subdomain served `lang="en"` before, keep parity), `Providers`/next-themes (InfraLanding scopes its own theme):

```tsx
import type { Metadata } from "next";
import { Plus_Jakarta_Sans, DM_Sans, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import CookieConsent from "../components/consent/CookieConsent";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
  preload: true, // heading font carries the LCP <h1>
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
  preload: true,
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL("https://infra.euhub-ai.com"),
  title: "Infrastructure Migration & DevSecOps | EuHub AI",
  description: "EU-sovereign cloud migration, DevSecOps pipelines and platform engineering.",
  openGraph: {
    type: "website",
    siteName: "EuHub AI",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "EuHub AI — Infrastructure Migration & DevSecOps" }],
  },
  twitter: { card: "summary_large_image", images: ["/og.png"] },
};

const DEFAULT_GTM_ID = "GTM-KMHTFB3N";
const configuredGtmId = process.env.NEXT_PUBLIC_GTM_ID?.trim();
const GTM_ID =
  configuredGtmId && configuredGtmId !== "GTM-YOUR_ID_HERE" && configuredGtmId.startsWith("GTM-")
    ? configuredGtmId
    : DEFAULT_GTM_ID;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <head>
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        {/* Google Consent Mode v2 — defaults must run before GTM */}
        <Script id="consent-default" strategy="beforeInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('consent', 'default', {
              'ad_storage': 'denied',
              'ad_user_data': 'denied',
              'ad_personalization': 'denied',
              'analytics_storage': 'denied',
              'functionality_storage': 'denied',
              'personalization_storage': 'denied',
              'security_storage': 'granted',
              'wait_for_update': 500
            });
          `}
        </Script>
        {/* Google Tag Manager */}
        <Script id="gtm-head" strategy="afterInteractive">
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${GTM_ID}');
          `}
        </Script>
      </head>
      <body className={`${plusJakartaSans.variable} ${dmSans.variable} ${jetbrainsMono.variable} antialiased`}>
        <a href="#main" className="skip-link">Skip to content</a>
        <noscript>
          <iframe
            title="Google Tag Manager"
            src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        {children}
        <CookieConsent locale="en" />
      </body>
    </html>
  );
}
```

- [ ] **Step 6: Write `src/app/robots.ts`** — disallow everything, no sitemap (site is noindex by design):

```ts
import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      disallow: '/',
    },
  }
}
```

- [ ] **Step 7: Copy public assets** (only what the page uses)

```bash
mkdir -p $DST/public/photos
cp $SRC/public/logo_light.webp $SRC/public/logo_dark.webp $SRC/public/og.png $DST/public/
cp $SRC/public/photos/mike1.webp $DST/public/photos/
```

- [ ] **Step 8: Commit**

```bash
cd $DST
git add src public
git commit -m "feat: infra landing page as root route (from ai-studio src/app/infra @$(git -C /incubator/web/euhub-ai.com log -1 --format=%h))"
```

### Task 4: Local build + runtime verification

**Files:** none new.

- [ ] **Step 1: Install and build**

```bash
cd /incubator/web/euhub-deploy
bun install
bun run build
```

Expected: build succeeds; route list shows `/` (static or dynamic) and `/robots.txt`. If `server-only` import errors appear, the offending import got copied into a client file — fix by checking `get-dictionary.ts` is only imported from `page.tsx`.

`bun install` generates `bun.lock` — **commit it immediately** (the Dockerfile's `COPY package.json bun.lock*` and `bun install --frozen-lockfile` depend on it being in the repo; without it, CI silently resolves deps fresh — the exact bug this plan fixes in the Dockerfile glob):

```bash
git add bun.lock && git commit -m "chore: commit bun lockfile"
```

- [ ] **Step 2: Start and probe** (kill any stale server on :3000 first)

```bash
bun run start &  # if :3000 is taken, use PORT=3100 and adjust every probe below accordingly
sleep 3
curl -sI http://localhost:3000/ | grep -iE 'HTTP|x-robots-tag'
curl -s http://localhost:3000/ | grep -oE '<title>[^<]*' | head -1
curl -s http://localhost:3000/robots.txt
curl -sI http://localhost:3000/logo_light.webp | head -1
```

Expected:
- `HTTP/1.1 200` + `x-robots-tag: noindex, nofollow` on `/`
- `<title>Infrastructure Migration & DevSecOps | EuHub AI`
- robots.txt: `User-Agent: *` / `Disallow: /`
- `200` for the logo asset

Also grep the HTML for the three proofs of correct assembly:
```bash
curl -s http://localhost:3000/ | grep -c 'application/ld+json'   # expect ≥1
curl -s http://localhost:3000/ | grep -o 'canonical" href="[^"]*"'  # expect https://infra.euhub-ai.com
curl -s http://localhost:3000/ | grep -c 'googletagmanager'      # expect ≥1 (GTM wired)
```

- [ ] **Step 3: Stop the server, commit any fixes**

### Task 5: Dockerfile + local container build

**Files:**
- Create: `Dockerfile` (copy of ai-studio's with one fix)

- [ ] **Step 1: Copy the Dockerfile and fix the lockfile glob**

```bash
cp /incubator/web/euhub-ai.com/Dockerfile /incubator/web/euhub-deploy/
```

Then in the new `Dockerfile` change:
```dockerfile
COPY package.json bun.lockb* ./
```
to:
```dockerfile
COPY package.json bun.lock* ./
```

(The ai-studio glob `bun.lockb*` never matched its text lockfile `bun.lock`, so Docker builds silently resolved deps fresh. Fix it here; optionally backport to ai-studio later — flagged in Appendix B.)

- [ ] **Step 2: Build the image locally (if Docker/Podman available in the env; otherwise skip — CI will build)**

```bash
cd /incubator/web/euhub-deploy && docker build -t infra-web-local . && \
docker run -d --rm -p 3200:3000 --name infra-web-test infra-web-local && sleep 3 && \
curl -sI http://localhost:3200/ | head -3 && docker rm -f infra-web-test
```

Expected: `HTTP/1.1 200`.

- [ ] **Step 3: Commit**

```bash
git add Dockerfile && git commit -m "build: Dockerfile (bun standalone; fixed bun.lock glob)"
```

### Task 6: README + push to new GitHub repo

**Files:**
- Create: `README.md`

- [ ] **Step 1: Write `README.md`** — must cover: what the site is (waitlist one-pager for the DevSecOps/infra-migration line), provenance (`extracted from EUHUB-AI/ai-studio @ <main HEAD at execution time — 15e2764 when this plan was written>, original route src/app/infra/`), noindex-by-design note + how to flip (Appendix B of this plan), deploy runbook (`gh workflow run deploy.yml --ref main` in this repo), Cloud Run service name/project/region, Formspree form ID `xzdlajdd`, and the in-page i18n model (dictionaries carry only the `infra` block; localStorage-persisted switcher).

- [ ] **Step 2: Push to the target repo** (the `origin` remote `git@github.com:web-dev-studio/euhub-deploy.git` is already added locally)

**Prerequisite (user-side):** the repo must exist and the GitHub account `euhub-support` (the sandbox's SSH identity) needs write access — on 2026-07-11 both `git ls-remote` and the API returned not-found. Once granted:

```bash
cd /incubator/web/euhub-deploy
timeout 60 git push -u origin main
git ls-remote origin refs/heads/main   # verify — do NOT trust the push pipeline's exit code alone
```

Expected: `ls-remote` shows `refs/heads/main` at the local HEAD sha. (If SSH times out, `api.github.com`/SSH are known-flaky from this sandbox — retry.)

---

## Phase 2 — GCP provisioning

### Task 7: Artifact Registry, service accounts, WIF provider — ✅ DONE (2026-07-11, run by user via gcloud CLI on euhub-server)

**Files:** none (gcloud only). All in project `euhub-marketing` (`139826268276`).

- [x] **Step 1: Create the Artifact Registry repo**

```bash
gcloud artifacts repositories create euhub-infra-web \
  --repository-format=docker --location=europe-west1 --project=euhub-marketing \
  --description="infra.euhub-ai.com images"
```

- [x] **Step 2: Create the two service accounts**

```bash
gcloud iam service-accounts create euhub-infra-web-runtime  --project=euhub-marketing --display-name="infra-web Cloud Run runtime"
gcloud iam service-accounts create euhub-infra-web-deployer --project=euhub-marketing --display-name="infra-web GitHub deployer"
```

- [x] **Step 3: Grant the deployer least-privilege roles**

```bash
P=euhub-marketing
DEPLOYER=euhub-infra-web-deployer@$P.iam.gserviceaccount.com
RUNTIME=euhub-infra-web-runtime@$P.iam.gserviceaccount.com

# push images (scoped to the one AR repo, not project-wide)
gcloud artifacts repositories add-iam-policy-binding euhub-infra-web \
  --location=europe-west1 --project=$P \
  --member="serviceAccount:$DEPLOYER" --role="roles/artifactregistry.writer"

# deploy Cloud Run services
gcloud projects add-iam-policy-binding $P \
  --member="serviceAccount:$DEPLOYER" --role="roles/run.admin"

# deployer may attach the runtime SA to the service
gcloud iam service-accounts add-iam-policy-binding $RUNTIME --project=$P \
  --member="serviceAccount:$DEPLOYER" --role="roles/iam.serviceAccountUser"
```

- [x] **Step 4: Create the WIF provider for the new repo** in the existing `github` pool. **Use the attribute mapping recorded in Task 1 Step 4** — the command below assumes the standard mapping; adjust to match what `euhub-ai-web` actually uses.

**Note (hit during execution):** GCP's WIF provider `--display-name` has a **32-character limit**. `"GitHub web-dev-studio/euhub-deploy"` (34 chars) failed with `INVALID_ARGUMENT`. Fixed to the 27-char repo path alone:

```bash
gcloud iam workload-identity-pools providers create-oidc euhub-infra-web \
  --project=euhub-marketing --location=global --workload-identity-pool=github \
  --display-name="web-dev-studio/euhub-deploy" \
  --issuer-uri="https://token.actions.githubusercontent.com" \
  --attribute-mapping="google.subject=assertion.sub,attribute.repository=assertion.repository" \
  --attribute-condition="assertion.repository == 'web-dev-studio/euhub-deploy'"
```

- [x] **Step 5: Allow the repo's identity to impersonate the deployer SA**

```bash
gcloud iam service-accounts add-iam-policy-binding $DEPLOYER --project=euhub-marketing \
  --role="roles/iam.workloadIdentityUser" \
  --member="principalSet://iam.googleapis.com/projects/139826268276/locations/global/workloadIdentityPools/github/attribute.repository/web-dev-studio/euhub-deploy"
```

- [x] **Step 6: Verify**

```bash
gcloud iam workload-identity-pools providers describe euhub-infra-web \
  --project=euhub-marketing --location=global --workload-identity-pool=github --format="value(state)"
```

Expected: `ACTIVE`. **Not yet re-confirmed from this session** (gcloud auth here is expired) — Sonnet should re-run this verify command once authenticated, before proceeding to Task 8.

---

## Phase 3 — CI/CD + first deploy

### Task 8: Deploy workflow in the new repo

**Files:**
- Create: `.github/workflows/deploy.yml` (in `/incubator/web/euhub-deploy`)

- [ ] **Step 1: Write the workflow** — same shape as ai-studio's `deploy.yml` (manual `workflow_dispatch`), with new identifiers and **no IndexNow step** (noindex site). The workflow below omits the GTM env var on the assumption that prod's `NEXT_PUBLIC_GTM_ID` equals the code fallback `GTM-KMHTFB3N` — **check the Task 1 snapshot**: if prod's value differs, add `--set-env-vars="NEXT_PUBLIC_GTM_ID=<that value>"` to the `gcloud run deploy` step (as a repo Actions secret if you prefer, mirroring ai-studio):

```yaml
name: CI/CD Pipeline INFRA

on:
  workflow_dispatch:

permissions:
  contents: read
  id-token: write

env:
  PROJECT_ID: euhub-marketing
  REGION: europe-west1
  SERVICE_NAME: euhub-infra-web
  ARTIFACT_REGISTRY: europe-west1-docker.pkg.dev/euhub-marketing/euhub-infra-web
  IMAGE_NAME: euhub-infra-web
  RUNTIME_SERVICE_ACCOUNT: "euhub-infra-web-runtime@euhub-marketing.iam.gserviceaccount.com"

jobs:
  ci:
    name: Build & Push
    runs-on: ubuntu-latest
    outputs:
      image_digest: ${{ steps.build.outputs.digest }}

    steps:
      - uses: actions/checkout@v5

      - name: Authenticate to Google Cloud
        id: auth
        uses: google-github-actions/auth@v3
        with:
          workload_identity_provider: projects/139826268276/locations/global/workloadIdentityPools/github/providers/euhub-infra-web
          service_account: euhub-infra-web-deployer@euhub-marketing.iam.gserviceaccount.com
          token_format: access_token

      - name: Login to Artifact Registry
        uses: docker/login-action@v4
        with:
          registry: ${{ env.REGION }}-docker.pkg.dev
          username: oauth2accesstoken
          password: ${{ steps.auth.outputs.access_token }}

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v4

      - name: Build and Push Docker image
        id: build
        uses: docker/build-push-action@v7
        with:
          context: .
          push: true
          tags: |
            ${{ env.ARTIFACT_REGISTRY }}/${{ env.IMAGE_NAME }}:${{ github.sha }}
            ${{ env.ARTIFACT_REGISTRY }}/${{ env.IMAGE_NAME }}:latest
          cache-from: type=registry,ref=${{ env.ARTIFACT_REGISTRY }}/${{ env.IMAGE_NAME }}:buildcache
          cache-to: type=registry,ref=${{ env.ARTIFACT_REGISTRY }}/${{ env.IMAGE_NAME }}:buildcache,mode=max
          provenance: false

  cd:
    name: Deploy to Cloud Run
    needs: ci
    runs-on: ubuntu-latest

    steps:
      - name: Authenticate to Google Cloud
        uses: google-github-actions/auth@v3
        with:
          workload_identity_provider: projects/139826268276/locations/global/workloadIdentityPools/github/providers/euhub-infra-web
          service_account: euhub-infra-web-deployer@euhub-marketing.iam.gserviceaccount.com

      - name: Set up Cloud SDK
        uses: google-github-actions/setup-gcloud@v3

      - name: Deploy to Cloud Run
        run: |
          IMAGE="${{ env.ARTIFACT_REGISTRY }}/${{ env.IMAGE_NAME }}"
          DIGEST="${{ needs.ci.outputs.image_digest }}"

          gcloud run deploy ${{ env.SERVICE_NAME }} \
            --image="${IMAGE}@${DIGEST}" \
            --region=${{ env.REGION }} \
            --project=${{ env.PROJECT_ID }} \
            --platform=managed \
            --allow-unauthenticated \
            --service-account=${{ env.RUNTIME_SERVICE_ACCOUNT }} \
            --port=3000 \
            --memory=1Gi \
            --cpu=1 \
            --timeout=3600 \
            --min-instances=0 \
            --max-instances=5 \
            --quiet

          gcloud run services update-traffic ${{ env.SERVICE_NAME }} \
            --to-latest \
            --region=${{ env.REGION }} \
            --project=${{ env.PROJECT_ID }} \
            --quiet
```

(`gcloud run deploy` is create-or-update, so the exists/doesn't-exist branch from the original workflow is unnecessary; flags like `--allow-unauthenticated` are idempotent.)

- [ ] **Step 2: Commit + push**

```bash
cd /incubator/web/euhub-deploy
git add .github/workflows/deploy.yml
git commit -m "ci: manual Cloud Run deploy via WIF"
git push
```

### Task 9: First deploy + run.app verification

- [ ] **Step 1: Trigger the deploy**

```bash
cd /incubator/web/euhub-deploy
gh workflow run deploy.yml --ref main
sleep 20 && gh run list --workflow=deploy.yml --limit 1
gh run watch $(gh run list --workflow=deploy.yml --limit 1 --json databaseId -q '.[0].databaseId') --exit-status
```

Expected: both jobs green. Most likely first-run failure mode: WIF `attribute.repository` mismatch (compare Task 1 Step 4 mapping) or missing IAM propagation (wait 2 min, retry).

- [ ] **Step 2: Verify the service on its run.app URL**

```bash
URL=$(gcloud run services describe euhub-infra-web --region=europe-west1 --project=euhub-marketing --format="value(status.url)")
curl -sI $URL/ | grep -iE 'HTTP|x-robots-tag'
curl -s $URL/ | grep -oE '<title>[^<]*' | head -1
```

Expected: `200`, `x-robots-tag: noindex, nofollow`, the infra title. **Do not proceed to Phase 4 until this passes.**

---

## Phase 4 — Domain cutover

### Task 10: Re-point `infra.euhub-ai.com` to the new service

**Downtime note:** a Cloud Run domain mapping cannot be re-targeted in place — it must be deleted and recreated, giving a gap of roughly 1–15 minutes (the domain is already verified in this project and DNS doesn't change, so the cert usually re-issues fast, but budget for up to an hour). This is a low-traffic waitlist page; do it anyway at a quiet hour. **Rollback at any point:** recreate the mapping with `--service=euhub-ai-web` — the old service still serves `/infra` until Phase 5 is deployed, which is exactly why Phase 5 comes after this.

- [ ] **Step 1: Confirm prerequisites** — Task 9 Step 2 green; snapshot from Task 1 Step 3 saved.

- [ ] **Step 2: Re-point both hosts (D10) — delete old mappings, create new ones**

For `infra.euhub-ai.com` (mapping exists on `euhub-ai-web`):

```bash
gcloud beta run domain-mappings delete --domain=infra.euhub-ai.com \
  --region=europe-west1 --project=euhub-marketing --quiet

gcloud beta run domain-mappings create --service=euhub-infra-web \
  --domain=infra.euhub-ai.com --region=europe-west1 --project=euhub-marketing
```

For `deploy.euhub-ai.com` (state discovered in Task 1): if a mapping exists on another service, delete it the same way first; then:

```bash
gcloud beta run domain-mappings create --service=euhub-infra-web \
  --domain=deploy.euhub-ai.com --region=europe-west1 --project=euhub-marketing
```

(DNS for `deploy.` already CNAMEs `ghs.googlehosted.com` — verified 2026-07-11. If the create command reports the domain unverified, verify it in Search Console under the same account the project uses, or ask the user.)

- [ ] **Step 3: Poll until the cert is ready** (bounded loop — do not use `watch`, it never exits in a non-TTY sandbox)

```bash
for i in $(seq 1 20); do
  STATUS=$(gcloud beta run domain-mappings describe --domain=infra.euhub-ai.com \
    --region=europe-west1 --project=euhub-marketing \
    --format="csv[no-heading](status.conditions[].type,status.conditions[].status)")
  echo "[$i/20]"; echo "$STATUS"
  echo "$STATUS" | grep -q '^Ready,True' && break
  sleep 30
done
```

(One row per condition; break only on the `Ready` condition itself being `True` — `DomainRoutable` goes `True` long before the cert is provisioned, so don't match on any-condition-True.)

Expected: `Ready`/`CertificateProvisioned` reach `True` within the 10-minute loop. If not ready after the loop, re-run it once more (certs can take up to ~1h); if still stuck, check `status.conditions[].message` and verify DNS still CNAMEs to `ghs.googlehosted.com` — then escalate to the user rather than deleting/retrying the mapping.

- [ ] **Step 4: Verify live** (sandbox may not reach custom domains — then ask the user to run these from their machine and paste output)

```bash
for h in infra.euhub-ai.com deploy.euhub-ai.com; do
  echo "== $h =="
  curl -sI https://$h/ | grep -iE 'HTTP|x-robots-tag'
  curl -s https://$h/ | grep -oE '<title>[^<]*' | head -1
  curl -s https://$h/robots.txt
done
```

(Run the cert-readiness poll from Step 3 for `deploy.euhub-ai.com` too.)

Expected: `200` + `x-robots-tag: noindex, nofollow` + infra title + `Disallow: /`. Also have the user click-test: language switcher persists, theme toggle works, waitlist form submits (Formspree `xzdlajdd` — the origin is unchanged so no Formspree settings change is expected; if it 403s, add `infra.euhub-ai.com` to the form's allowed domains in the Formspree dashboard).

- [ ] **Step 5: Confirm apex + www were untouched**

```bash
gcloud beta run domain-mappings list --project=euhub-marketing --region=europe-west1
```

Expected: `euhub-ai.com` + `www.euhub-ai.com` → `euhub-ai-web`; `infra.euhub-ai.com` + `deploy.euhub-ai.com` → `euhub-infra-web`.

---

## Phase 5 — Remove infra from the main repo

Work in `/incubator/web/euhub-ai.com` on a branch. **Only start after Task 10 Step 4 passes.**

### Task 11: Strip infra code + add the path redirect

**Files:**
- Delete: `src/app/infra/` (3 files)
- Modify: `src/middleware.ts`, `next.config.ts`, `src/dictionaries/{en,sk,de}.json`

- [ ] **Step 1: Branch**

```bash
cd /incubator/web/euhub-ai.com
git pull  # local main can lag origin (deploys build remote main)
git switch -c chore/split-infra-repo
```

- [ ] **Step 2: Delete the route**

```bash
git rm -r src/app/infra
```

- [ ] **Step 3: Replace `src/middleware.ts` with the host-logic-free version** (full new content):

```ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const VALID_LOCALES = ['en', 'sk', 'de'];

export function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname;
    const locale = pathname.split('/')[1];

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-locale', VALID_LOCALES.includes(locale) ? locale : 'en');

    return NextResponse.next({
        request: { headers: requestHeaders },
    });
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)', '/'],
};
```

- [ ] **Step 4: Update `next.config.ts` `redirects()`** — remove both `missing` host guards, add the `/infra` → subdomain 301s **first** in the array (redirect order matters), and **keep** `infra` in the catch-all's negative lookahead (defense in depth):

```ts
  async redirects() {
    return [
      // The infra landing moved to its own service/repo (web-dev-studio/euhub-deploy).
      {
        source: '/infra',
        destination: 'https://infra.euhub-ai.com',
        permanent: true,
      },
      {
        source: '/infra/:path*',
        destination: 'https://infra.euhub-ai.com/:path*',
        permanent: true,
      },
      {
        source: '/',
        destination: '/en',
        permanent: true,
      },
      // Redirect any path that doesn't start with a locale to /en/path
      {
        source: '/:path((?!en|sk|de|api|_next|favicon.ico|robots.txt|infra|.*\\..*).*)',
        destination: '/en/:path*',
        permanent: true,
      },
    ];
  },
```

- [ ] **Step 5: Remove the `infra` block from all three dictionaries**

```bash
for l in en sk de; do
  node -e "
    const fs = require('fs');
    const p = 'src/dictionaries/$l.json';
    const d = JSON.parse(fs.readFileSync(p, 'utf8'));
    delete d.infra;
    fs.writeFileSync(p, JSON.stringify(d, null, 2) + '\n');
  "
done
git diff --stat src/dictionaries/
```

Expected: exactly 3 files changed, deletions only apart from possible EOF-newline noise. **Inspect `git diff src/dictionaries/en.json` and confirm only the `infra` block is gone** — if the diff shows whole-file reformatting, the indent doesn't match; restore and remove the block with a targeted edit instead.

- [ ] **Step 6: Grep for stragglers**

```bash
grep -rn "infra" src/ next.config.ts --include="*.ts" --include="*.tsx" --include="*.json" | grep -v "infrastructure\|Infrastruktur\|infraštrukt"
```

Expected: only the two `next.config.ts` redirect entries and the catch-all lookahead. Anything else (e.g. a dict straggler) — remove it.

### Task 12: Verify the trimmed main site locally

- [ ] **Step 1: Build**

Run: `npm run build` (repo convention; deploys build in Docker with bun, but local npm build is the pre-PR check).
Expected: succeeds; `/infra` no longer in the route list.

- [ ] **Step 2: Runtime checks via `next start`**

```bash
npm run start &
sleep 3
curl -sI http://localhost:3000/            | grep -E 'HTTP|location'   # 308 → /en
curl -sI http://localhost:3000/infra       | grep -E 'HTTP|location'   # 308 → https://infra.euhub-ai.com
curl -sI http://localhost:3000/en          | head -1                    # 200
curl -sI -H "Host: infra.euhub-ai.com" http://localhost:3000/ | grep -E 'HTTP|location'
curl -s http://localhost:3000/sitemap.xml | grep -c infra               # expect 0
```

Expected: the `Host: infra.euhub-ai.com` probe now behaves like the apex (308 → `/en`) — correct, because after cutover that host never reaches this service; the header check just proves no dead code path remains. Kill the server afterwards.

- [ ] **Step 3: Commit, PR, merge**

```bash
git add src/middleware.ts next.config.ts src/dictionaries/en.json src/dictionaries/sk.json src/dictionaries/de.json
git commit -m "chore: remove infra.euhub-ai.com route — moved to web-dev-studio/euhub-deploy (301 /infra -> subdomain)"
git push -u origin chore/split-infra-repo
gh pr create --title "chore: split infra.euhub-ai.com into its own repo/service" --body "<summary + Task 1 Step 3 snapshot + link to docs/superpowers/plans/2026-07-11-split-infra-repo.md>"
```

(Stage explicit paths only — shared-worktree rule. The `git rm` of `src/app/infra` is already staged.)

- [ ] **Step 4: After user/reviewer approval — merge and deploy prod manually**

```bash
gh pr merge --squash
gh workflow run deploy.yml --ref main   # in EUHUB-AI/ai-studio
gh run watch --exit-status <run-id>
```

- [ ] **Step 5: Live verification of the main site**

```bash
curl -sI https://euhub-ai-web-os5qn6ntga-ew.a.run.app/infra | grep -E 'HTTP|location'  # 308 → https://infra.euhub-ai.com
curl -sI https://euhub-ai.com/en | head -1                                             # 200 (or via run.app)
curl -s  https://euhub-ai.com/sitemap.xml | grep -c infra                              # 0
```

---

## Phase 6 — Docs + wrap-up

### Task 13: Documentation and hygiene

- [ ] **Step 1: ai-studio README** — add one line: infra landing lives in `web-dev-studio/euhub-deploy` (its own Cloud Run service `euhub-infra-web`); `/infra` 301s there.
- [ ] **Step 2: Update project memory** (`~/.claude/projects/-incubator-web-euhub-ai-com/memory/`) — record the split: repo, service, WIF provider, domain mapping move date, rollback knowledge now obsolete (middleware host logic gone), the Dockerfile `bun.lock*` fix.
- [ ] **Step 3: SEO hygiene notes** — no GSC action needed (site is noindex, never in sitemap); if Ahrefs re-crawls, `infra.` still resolves and still serves noindex — expected. The `docs/seo-indexation-report-2026-07-09.md` statement "noindex via middleware" is superseded (now via next.config header in the new repo) — add a one-line addendum.
- [ ] **Step 4: Final end-to-end checklist** (all must pass):

| Check | Expected |
|---|---|
| `https://infra.euhub-ai.com/` | 200, infra page, `x-robots-tag: noindex, nofollow` |
| `https://infra.euhub-ai.com/robots.txt` | `Disallow: /` |
| `https://deploy.euhub-ai.com/` | 200, same page, `x-robots-tag: noindex, nofollow` (D10) |
| `https://euhub-ai.com/infra` | 301/308 → `https://infra.euhub-ai.com` |
| `https://euhub-ai.com/` | 308 → `/en`, site normal |
| `https://euhub-ai.com/sitemap.xml` | no infra URLs (was already true) |
| Waitlist form on live subdomain | submits OK (Formspree `xzdlajdd`) |
| Language switcher + theme toggle on live subdomain | work, persist in localStorage |
| `gcloud beta run domain-mappings list` | apex+www → `euhub-ai-web`, infra → `euhub-infra-web` |
| ai-studio deploy still green | `gh run list` in ai-studio |

---

## Appendix A — Rollback matrix

| Failed at | Rollback |
|---|---|
| Phase 1–3 (new repo/service) | Nothing user-visible changed. Delete the Cloud Run service / AR repo / SAs / WIF provider if abandoning. |
| Phase 4 (cutover) | `gcloud beta run domain-mappings delete --domain=infra.euhub-ai.com ...` then `create --service=euhub-ai-web ...` — old service still serves `/infra` because Phase 5 hasn't shipped. |
| Phase 5 (after main cleanup deployed) | Either fix-forward in `infra-web`, or `git revert` the cleanup commit in ai-studio + `gh workflow run deploy.yml` + re-point the mapping back. |

## Appendix B — Deliberately out of scope / follow-ups

1. **Flip infra to indexable** (future, deliberate SEO decision): in `infra-web` remove the `X-Robots-Tag` header from `next.config.ts`, change `robots.ts` to allow + reference a new `sitemap.ts`, drop `robots: {index:false}` from `page.tsx` metadata, then submit in GSC.
2. **Backport the Dockerfile `bun.lockb*` → `bun.lock*` fix to ai-studio** so its Docker builds actually use the lockfile.
3. Staging/dev environments for `infra-web` — YAGNI for a waitlist one-pager; add later by cloning the deploy workflow pattern if needed.
4. Dedicated OG image for the infra brand (currently reuses the main site's `og.png`).
5. Consent UI localization on the new site (currently `en`, matching today's prod behavior).
6. `min-instances=1` for the main site (open item from the SEO plan — unrelated to this split).

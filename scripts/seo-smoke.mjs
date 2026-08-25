import process from 'node:process';

const args = process.argv.slice(2);
const baseIndex = args.indexOf('--base-url');
const baseUrl = (baseIndex >= 0 ? args[baseIndex + 1] : 'http://localhost:3000')?.replace(/\/$/, '');
const canonicalBase = 'https://ai.euhub.co';
const expectedLanguages = ['en', 'sk', 'de', 'x-default'];
const failures = [];

function fail(path, message) {
  failures.push(`${path}: ${message}`);
}

function stripHtml(html) {
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&(?:nbsp|amp|quot|#39);/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function attribute(tag, name) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = tag.match(new RegExp(`\\b${escaped}\\s*=\\s*["']([^"']*)["']`, 'i'));
  return match?.[1] ?? null;
}

function pageMinimum(path) {
  if (/^\/(en|sk|de)$/.test(path)) return 900;
  if (path.endsWith('/ai-act')) return 500;
  if (path.endsWith('/data-residency')) return 700;
  if (path.endsWith('/portability')) return 700;
  return 0;
}

async function fetchHtml(path) {
  const response = await fetch(`${baseUrl}${path}`, { redirect: 'follow' });
  return { response, html: await response.text() };
}

function parseSitemap(xml) {
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)]
    .map((match) => new URL(match[1]).pathname)
    .filter(Boolean);
}

function validateSchemas(path, html) {
  const scripts = [...html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  if (!scripts.length) {
    fail(path, 'missing JSON-LD');
    return;
  }
  for (const [, raw] of scripts) {
    try {
      JSON.parse(raw);
    } catch {
      fail(path, 'contains invalid JSON-LD');
    }
  }
}

async function validateInternalLinks(path, html) {
  const targets = new Set();
  for (const match of html.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>/gi)) {
    const href = match[1];
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) continue;
    const target = new URL(href, `${baseUrl}${path}`);
    if (target.origin === baseUrl) targets.add(`${target.pathname}${target.search}`);
  }

  await Promise.all([...targets].map(async (target) => {
    try {
      const response = await fetch(`${baseUrl}${target}`, { method: 'HEAD', redirect: 'follow' });
      if (response.status >= 400) fail(path, `internal target ${target} returned ${response.status}`);
    } catch (error) {
      fail(path, `internal target ${target} could not be fetched: ${error instanceof Error ? error.message : String(error)}`);
    }
  }));
}

async function validatePage(path) {
  const { response, html } = await fetchHtml(path);
  if (!response.ok) {
    fail(path, `returned ${response.status}`);
    return;
  }
  if (!response.headers.get('content-type')?.includes('text/html')) fail(path, 'does not return HTML');

  const htmlTag = html.match(/<html\b[^>]*>/i)?.[0] ?? '';
  const expectedLang = path.split('/')[1];
  if (attribute(htmlTag, 'lang') !== expectedLang) fail(path, `html lang is ${attribute(htmlTag, 'lang') ?? 'missing'}, expected ${expectedLang}`);

  const title = html.match(/<title>([^<]+)<\/title>/i)?.[1]?.trim();
  if (!title) fail(path, 'missing title');
  const descriptionTag = html.match(/<meta\b[^>]*name=["']description["'][^>]*>/i)?.[0] ?? '';
  if (!attribute(descriptionTag, 'content')) fail(path, 'missing meta description');
  const canonicalTag = html.match(/<link\b(?=[^>]*\brel=["']canonical["'])[^>]*>/i)?.[0] ?? '';
  const canonical = attribute(canonicalTag, 'href');
  if (!canonical) fail(path, 'missing canonical');
  else if (canonical !== `${canonicalBase}${path}`) fail(path, `canonical ${canonical} does not match ${canonicalBase}${path}`);

  const h1Count = [...html.matchAll(/<h1\b/gi)].length;
  if (h1Count !== 1) fail(path, `has ${h1Count} H1 elements`);

  const alternates = [...html.matchAll(/<link\b(?=[^>]*\brel=["']alternate["'])[^>]*>/gi)]
    .map((match) => attribute(match[0], 'hreflang') ?? attribute(match[0], 'hrefLang'));
  for (const language of expectedLanguages) {
    if (!alternates.includes(language)) fail(path, `missing ${language} hreflang alternate`);
  }

  for (const img of html.matchAll(/<img\b[^>]*>/gi)) {
    if (!attribute(img[0], 'alt')?.trim()) fail(path, 'contains an image without meaningful alt text');
  }

  validateSchemas(path, html);
  const minimum = pageMinimum(path);
  const words = stripHtml(html).split(/\s+/).filter(Boolean).length;
  if (words < minimum) fail(path, `has ${words} words, requires at least ${minimum}`);
  await validateInternalLinks(path, html);
}

if (!baseUrl) {
  console.error('Usage: npm run seo:smoke -- --base-url <origin>');
  process.exit(2);
}

const sitemapResponse = await fetch(`${baseUrl}/sitemap.xml`);
if (!sitemapResponse.ok) {
  console.error(`sitemap.xml returned ${sitemapResponse.status}`);
  process.exit(1);
}

const paths = parseSitemap(await sitemapResponse.text());
if (!paths.length) {
  console.error('sitemap.xml did not expose any URLs');
  process.exit(1);
}

await Promise.all(paths.map(validatePage));

if (failures.length) {
  console.error(`SEO smoke check failed with ${failures.length} issue(s):`);
  for (const message of failures) console.error(`- ${message}`);
  process.exit(1);
}

console.log(`SEO smoke check passed for ${paths.length} sitemap URLs at ${baseUrl}`);

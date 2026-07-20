// Submits all sitemap URLs to IndexNow (Bing/Yandex). Run after a production deploy.
// Usage: INDEXNOW_KEY=<key> node scripts/indexnow-submit.mjs
const HOST = 'ai.euhub.co'
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

// Submits the canonical sitemap URL set to IndexNow (Bing/Yandex) after a production deploy.
// Usage: INDEXNOW_KEY=<key> node scripts/indexnow-submit.mjs
const HOST = 'ai.euhub.co'
const KEY = process.env.INDEXNOW_KEY
if (!KEY) { console.error('Set INDEXNOW_KEY'); process.exit(1) }

const sitemapResponse = await fetch(`https://${HOST}/sitemap.xml`)
if (!sitemapResponse.ok) {
  console.error(`Sitemap returned ${sitemapResponse.status}`)
  process.exit(1)
}

const urlList = [...(await sitemapResponse.text()).matchAll(/<loc>([^<]+)<\/loc>/g)]
  .map((match) => match[1])
  .filter((url) => new URL(url).host === HOST)

if (!urlList.length) {
  console.error('Sitemap did not contain any canonical URLs for ai.euhub.co')
  process.exit(1)
}

const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host: HOST, key: KEY, keyLocation: `https://${HOST}/${KEY}.txt`, urlList }),
})
console.log('IndexNow response:', res.status, res.statusText)
if (res.status !== 200 && res.status !== 202) { console.error(await res.text()); process.exit(1) }

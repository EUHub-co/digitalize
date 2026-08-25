const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, HeadingLevel, BorderStyle, WidthType,
  ShadingType, VerticalAlign, PageNumber, PageBreak,
} = require('docx');
const fs = require('fs');

const OUTPUT = '/home/engineer/projects/euhub-co/digitalize/seo-final-reaudit-ai-euhub-co-2026-08-25.docx';
const C = { navy: '1B2A4A', blue: '2563EB', green: '16A34A', amber: 'D97706', red: 'DC2626', light: 'EFF6FF', paleGreen: 'F0FDF4', gray: 'E2E8F0', text: '1E293B', white: 'FFFFFF' };
const border = { style: BorderStyle.SINGLE, color: C.gray, size: 4 };
const tableBorders = { top: border, bottom: border, left: border, right: border, insideHorizontal: border, insideVertical: border };

function run(text, options = {}) {
  return new TextRun({ text: String(text), font: 'Arial', size: options.size ?? 20, bold: options.bold, italics: options.italics, color: options.color ?? C.text });
}
function para(text = '', options = {}) {
  return new Paragraph({ alignment: options.align, spacing: { before: options.before ?? 0, after: options.after ?? 130, line: options.line ?? 270 }, children: [run(text, options)] });
}
function h1(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { before: 260, after: 170 }, children: [run(text, { size: 48, bold: true, color: C.navy })] });
}
function h2(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 210, after: 110 }, children: [run(text, { size: 32, bold: true, color: C.blue })] });
}
function cell(value, options = {}) {
  return new TableCell({
    verticalAlign: VerticalAlign.CENTER,
    shading: options.fill ? { type: ShadingType.CLEAR, fill: options.fill } : undefined,
    margins: { top: 85, bottom: 85, left: 100, right: 100 },
    children: [para(value, { size: options.size ?? 16, bold: options.bold, color: options.color, align: options.align, after: 0 })],
  });
}
function grid(headers, rows, widths, statusColumn = -1) {
  return new Table({
    width: { size: 9360, type: WidthType.DXA }, columnWidths: widths, borders: tableBorders,
    rows: [
      new TableRow({ children: headers.map((value) => cell(value, { fill: C.navy, color: C.white, bold: true, align: AlignmentType.CENTER })) }),
      ...rows.map((row, rowIndex) => new TableRow({ children: row.map((value, columnIndex) => {
        const status = columnIndex === statusColumn;
        const fill = status ? (value === 'Good' || value === 'Strong' ? C.green : value === 'Needs Attention' ? C.amber : C.red) : (rowIndex % 2 ? 'F8F9FA' : undefined);
        return cell(value, { fill, color: status ? C.white : C.text, bold: status, align: status ? AlignmentType.CENTER : undefined });
      }) })),
    ],
  });
}
function box(text, fill = C.light) {
  return new Table({ width: { size: 9360, type: WidthType.DXA }, rows: [new TableRow({ children: [cell(text, { fill, size: 19 })] })] });
}

const pages = [
  ['/en', 'Homepage', '1,293 words; Organization, Person, Service schema'], ['/sk', 'Homepage', '1,318 words; localized entity graph'], ['/de', 'Homepage', '1,196 words; localized entity graph'],
  ['/en/ai-act', 'AI Act guide', '636 words; article + FAQPage'], ['/sk/ai-act', 'AI Act guide', '624 words; article + FAQPage'], ['/de/ai-act', 'AI Act guide', '644 words; article + FAQPage'],
  ['/en/data-residency', 'Residency guide', '998 words; table, 6 FAQs, 4 sources'], ['/sk/data-residency', 'Residency guide', '884 words; table, 6 FAQs, 4 sources'], ['/de/data-residency', 'Residency guide', '841 words; table, 6 FAQs, 4 sources'],
  ['/en/portability', 'Portability guide', '1,010 words; table + 6 FAQs'], ['/sk/portability', 'Portability guide', '894 words; table + 6 FAQs'], ['/de/portability', 'Portability guide', '843 words; table + 6 FAQs'],
  ['/en/privacy', 'Legal', '200; metadata/schema/hreflang clean'], ['/sk/privacy', 'Legal', '200; metadata/schema/hreflang clean'], ['/de/privacy', 'Legal', '200; metadata/schema/hreflang clean'],
  ['/en/terms', 'Legal', '200; metadata/schema/hreflang clean'], ['/sk/terms', 'Legal', '200; metadata/schema/hreflang clean'], ['/de/terms', 'Legal', '200; metadata/schema/hreflang clean'],
  ['/en/cookie', 'Legal', '200; metadata/schema/hreflang clean'], ['/sk/cookie', 'Legal', '200; metadata/schema/hreflang clean'], ['/de/cookie', 'Legal', '200; metadata/schema/hreflang clean'],
];
const finding = (signal, detail, status) => [signal, detail, status];

const header = new Header({ children: [new Table({ width: { size: 9360, type: WidthType.DXA }, borders: { bottom: { style: BorderStyle.SINGLE, color: C.navy, size: 8 } }, rows: [new TableRow({ children: [cell('ai.euhub.co', { bold: true, size: 14 }), cell('Final SEO / GEO / AEO Audit', { size: 14, align: AlignmentType.RIGHT })] })] })] });
const footer = new Footer({ children: [new Table({ width: { size: 9360, type: WidthType.DXA }, borders: { top: border }, rows: [new TableRow({ children: [cell('Claude Skill and Plugin by Alex Labat', { size: 13, color: '64748B' }), new TableCell({ margins: { top: 85, bottom: 85, left: 100, right: 100 }, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [run('Page ', { size: 13, color: '64748B' }), new TextRun({ children: [PageNumber.CURRENT], font: 'Arial', size: 13, color: '64748B' })] })] })] })] })] });

const cover = new Table({ width: { size: 9360, type: WidthType.DXA }, rows: [new TableRow({ children: [new TableCell({
  shading: { type: ShadingType.CLEAR, fill: C.navy }, margins: { top: 1500, bottom: 1450, left: 500, right: 500 }, children: [
    para('ai.euhub.co', { align: AlignmentType.CENTER, size: 72, bold: true, color: C.white, after: 170 }),
    para('SEO / GEO / AEO Audit Report', { align: AlignmentType.CENTER, size: 32, color: '93C5FD', after: 70 }),
    para('FULL AUDIT · FINAL PRODUCTION', { align: AlignmentType.CENTER, size: 18, bold: true, color: C.white, after: 350 }),
    new Table({ width: { size: 8360, type: WidthType.DXA }, rows: [new TableRow({ children: [['SEO', '9/10'], ['GEO', '8/10'], ['AEO', '9/10']].map(([label, score]) => new TableCell({ shading: { type: ShadingType.CLEAR, fill: C.green }, margins: { top: 160, bottom: 160, left: 80, right: 80 }, children: [para(label, { align: AlignmentType.CENTER, size: 16, bold: true, color: C.white, after: 20 }), para(score, { align: AlignmentType.CENTER, size: 56, bold: true, color: C.white, after: 10 }), para('Strong', { align: AlignmentType.CENTER, size: 15, italics: true, color: C.white, after: 0 })] })) })] }),
    para('Audit date: 25 August 2026', { align: AlignmentType.CENTER, size: 16, color: '94A3B8', before: 650, after: 20 }), para('Verified against the final live production revision', { align: AlignmentType.CENTER, size: 14, color: '94A3B8', after: 0 }),
  ],
})] })] });

const body = [
  h1('Executive Summary'),
  box('EUHub AI now has a strong, production-verified multilingual search foundation. All 21 sitemap URLs return 200 and pass the automated metadata, canonical, hreflang, language, image-alt, internal-link and JSON-LD checks. Marketing HTML is statically generated and publicly cacheable; the former thin data-residency and portability pages are now 841–1,010 words with semantic articles, accessible decision tables, six visible FAQs per locale and matching FAQPage schema. Mobile Lighthouse scored SEO 100 and performance 96. The remaining distance to an evidence-backed 10/10 is primarily authority and external validation: public author/reviewer credentials, broader primary-source coverage, approved standalone case evidence, Search Console/Bing indexation data and field Core Web Vitals.'),
  grid(['Dimension', 'Score', 'Status', 'Key takeaway'], [['SEO', '9/10', 'Strong', 'Technically excellent; external indexation and field CWV evidence remain.'], ['GEO', '8/10', 'Strong', 'Source-led content improved; expert identity and original proof need expansion.'], ['AEO', '9/10', 'Strong', 'Direct answers, questions, tables and matching FAQ schema are live.'], ['Combined', '26/30', 'Strong', 'Near the target without overstating unverified authority signals.']], [1500, 1000, 1300, 5560], 2),
  h2('Before vs After'),
  grid(['Signal', 'Before', 'Final production'], [['Live smoke failures', '42', '0'], ['HTML caching', '21/21 private/no-store', '21/21 public s-maxage'], ['Residency depth', '495–509 words', '841–998 words'], ['Portability depth', '247–264 words', '843–1,010 words'], ['Strategic article landmarks', '0 of 9', '9 of 9'], ['Guide comparison tables', '0', '6'], ['FAQPage guide families', 'AI Act only', 'AI Act, residency, portability'], ['IndexNow', 'Not run for failed release', 'Production workflow passed']], [3100, 2900, 3360]),
  h1('Pages Audited'), para('Full live crawl of every URL in sitemap.xml. Legal pages were checked for technical integrity; the twelve home and strategic pages received deeper content, authority and answer-format analysis.'),
  grid(['URL', 'Page type', 'Final live evidence'], pages, [2700, 1700, 4960]),
  h1('SEO Analysis'), para('Score: 9/10 · Strong', { bold: true, color: C.green }), h2('Technical On-Page'),
  grid(['Signal', 'Finding', 'Status'], [finding('Crawl and status', '21/21 sitemap URLs return 200. robots.txt allows public crawling and declares the canonical sitemap.', 'Good'), finding('Metadata', '21/21 have a title, description, canonical, Open Graph and Twitter Card set.', 'Good'), finding('International SEO', '21/21 have matching html lang plus reciprocal EN/SK/DE/x-default alternates in HTML and sitemap.', 'Good'), finding('Semantic structure', 'Every page has exactly one H1; all nine strategic guides now render as articles.', 'Good'), finding('Caching', 'All audited HTML returns s-maxage=31536000 instead of private/no-store.', 'Good'), finding('Security', 'HTTPS, HSTS, nosniff and SAMEORIGIN are active; CSP remains report-only.', 'Needs Attention')], [2200, 5600, 1560], 2),
  h2('Content Quality'),
  grid(['Signal', 'Finding', 'Status'], [finding('Homepage depth', 'Localized homepages contain 1,196–1,318 visible words with clear service, proof, team and contact sections.', 'Good'), finding('Guide depth', 'Residency and portability contain 841–1,010 words. AI Act pages contain 624–644 words and focused questions.', 'Good'), finding('Readability', 'Short paragraphs, meaningful section headings, lists, FAQs and responsive tables make the content scannable.', 'Good'), finding('Freshness', 'Strategic guides do not yet display reviewed dates; sitemap lastmod currently reflects builds rather than editorial dates.', 'Needs Attention')], [2200, 5600, 1560], 2),
  h2('Performance and Structured Data'),
  grid(['Signal', 'Finding', 'Status'], [finding('Mobile Lighthouse', 'Performance 96, SEO 100, accessibility 92, best practices 96. FCP 1.1s, LCP 2.6s, TBT 100ms, CLS 0.', 'Good'), finding('Schema validity', '21/21 contain parseable JSON-LD. Homepages expose Organization/Person/Service/WebSite; guides expose WebPage/Breadcrumb/FAQPage.', 'Good'), finding('Field CWV', 'CrUX/Search Console field evidence was not available in this audit; lab results cannot substitute for 75th-percentile field data.', 'Needs Attention')], [2200, 5600, 1560], 2),
  h1('GEO Analysis'), para('Score: 8/10 · Strong', { bold: true, color: C.green }), h2('E-E-A-T Assessment'),
  grid(['Signal', 'Finding', 'Status'], [finding('Organization clarity', 'EUHub AI is consistently identified with address, email, service scope, Person nodes and LinkedIn profile links.', 'Good'), finding('Expert identity', 'Team roles are public, but high-stakes guides lack approved full author/reviewer bylines, credentials and reviewed dates.', 'Needs Attention'), finding('First-party experience', 'The homepage contains the LKW-Control × FAIA engagement narrative and clearly labels simulated metrics/examples.', 'Good'), finding('Case evidence', 'Proof is embedded on the homepage; standalone approved methodology/outcome pages are not yet available.', 'Needs Attention')], [2200, 5600, 1560], 2),
  h2('Content for AI Synthesis'),
  grid(['Signal', 'Finding', 'Status'], [finding('Clear claims', 'Each guide leads with a direct explanation and maintains consistent EUHub AI entity naming.', 'Good'), finding('Primary sources', 'Residency guides link four authoritative sources including EUR-Lex, the European Commission and EDPB.', 'Good'), finding('Source coverage', 'AI Act and portability guides still lack visible primary-source lists.', 'Needs Attention'), finding('Discovery', 'robots.txt, sitemap.xml and llms.txt are accessible. IndexNow completed after the final release.', 'Good'), finding('AI visibility benchmark', 'No verified citation/mention dataset exists yet across Google AI features, ChatGPT Search, Perplexity and Gemini.', 'Needs Attention')], [2200, 5600, 1560], 2),
  h1('AEO Analysis'), para('Score: 9/10 · Strong', { bold: true, color: C.green }), h2('Answer Formats'),
  grid(['Signal', 'Finding', 'Status'], [finding('Direct answers', 'Residency and portability open with concise definition-style summaries before deeper sections.', 'Good'), finding('Natural questions', 'Each enriched guide exposes six conversational FAQ questions; AI Act uses question-led sections.', 'Good'), finding('Tables', 'All six residency/portability pages include a real table with a caption and scoped column headers.', 'Good'), finding('Lists', 'Procurement evidence, deployment controls and handover requirements are expressed as extractable lists.', 'Good'), finding('FAQ alignment', 'Visible FAQs and FAQPage JSON-LD are generated from the same typed content source.', 'Good'), finding('Voice/local signals', 'Conversational language, Slovak address and email are present; phone data is absent and should not be invented.', 'Needs Attention')], [2200, 5600, 1560], 2),
  h1('Priority Recommendations'),
  grid(['Priority', 'Issue', 'Dimension', 'Effort', 'Impact'], [['High', 'Verify Search Console and Bing properties; submit sitemap and record URL Inspection/index coverage for all language families.', 'SEO / GEO', 'Medium', 'High'], ['High', 'Publish approved full author/reviewer identities, credentials and reviewed dates on high-stakes guides.', 'GEO', 'Medium', 'High'], ['High', 'Add reviewed primary sources to AI Act and portability content; keep schema synchronized with visible content.', 'GEO / AEO', 'Medium', 'High'], ['Medium', 'Publish three client-approved standalone case studies or evidence notes with methodology and attributable outcomes.', 'GEO', 'High', 'High'], ['Medium', 'Collect field Core Web Vitals and remediate any page group that misses LCP/INP/CLS targets.', 'SEO', 'Medium', 'Medium'], ['Quick Win', 'Use genuine editorial modification dates in sitemap entries instead of the build timestamp.', 'SEO', 'Low', 'Medium'], ['Quick Win', 'Make the editorial policy publicly discoverable after legal/editorial approval.', 'GEO', 'Low', 'Medium']], [1300, 4100, 1500, 1100, 1360]),
  h1('What’s Working Well'),
  box('• The final production smoke test passes every one of the 21 sitemap URLs.\n\n• Mobile Lighthouse reports SEO 100 and performance 96, with CLS 0 and TBT 100ms.\n\n• Multilingual canonicals, lang attributes and reciprocal hreflang are complete in both page HTML and sitemap XML.\n\n• Strategic guide depth and answer extraction improved materially without padding: semantic articles, direct answers, useful tables, FAQs and matching schema are live.\n\n• Claims remain disciplined: simulated examples are labeled, and unsupported authors, credentials, phone numbers and client outcomes were not fabricated.', C.paleGreen),
  h1('10/10 Evidence Gate'),
  para('A score of 10/10 should be claimed only after external evidence closes the remaining gaps: verified Search Console/Bing coverage; sufficient CrUX field data; approved authors/reviewers and reviewed dates; expanded primary-source coverage; three approved standalone evidence notes; verified organization identity/sameAs facts; and a repeatable monthly AI citation benchmark. Rankings, rich results and AI citations cannot be guaranteed by technical implementation alone.'),
  h1('Glossary'), h2('SEO'), para('Search engine optimization: technical and editorial work that helps conventional search engines crawl, understand, index and rank a site.'), h2('GEO'), para('Generative engine optimization: clear, authoritative and source-backed content that AI-powered search systems can synthesize and cite accurately.'), h2('AEO'), para('Answer engine optimization: visible content structures—direct answers, questions, lists and tables—that search and voice systems can extract reliably.'),
];

const doc = new Document({
  creator: 'EUHub AI SEO/GEO/AEO audit', title: 'ai.euhub.co Final Full SEO/GEO/AEO Audit',
  sections: [
    { properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } }, children: [cover, new Paragraph({ children: [new PageBreak()] })] },
    { properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1080, right: 1440, bottom: 900, left: 1440 } } }, headers: { default: header }, footers: { default: footer }, children: body },
  ],
});

Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync(OUTPUT, buffer);
  console.log(`DOCX written: ${OUTPUT}`);
});

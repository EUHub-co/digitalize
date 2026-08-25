const {
  AlignmentType,
  BorderStyle,
  Document,
  ExternalHyperlink,
  Footer,
  Header,
  HeadingLevel,
  HeightRule,
  PageNumber,
  Packer,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableRow,
  TextRun,
  VerticalAlign,
  WidthType,
} = require("docx");
const fs = require("fs");

const OUTPUT = "/home/engineer/projects/euhub-co/digitalize/seo-audit-ai-euhub-co-2026-08-25.docx";
const DOMAIN = "ai.euhub.co";
const DATE = "25 August 2026";
const scores = { SEO: 7, GEO: 6, AEO: 6 };

const C = {
  navy: "1B2A4A",
  blue: "2563EB",
  lightBlue: "EFF6FF",
  paleBlue: "DBEAFE",
  sky: "93C5FD",
  green: "16A34A",
  paleGreen: "F0FDF4",
  amber: "D97706",
  paleAmber: "FFFBEB",
  red: "DC2626",
  orange: "EA580C",
  gray: "64748B",
  lightGray: "F8F9FA",
  border: "E2E8F0",
  text: "1E293B",
  white: "FFFFFF",
};

const noBorder = { style: BorderStyle.NONE, size: 0, color: C.white };
const borders = {
  top: { style: BorderStyle.SINGLE, size: 4, color: C.border },
  bottom: { style: BorderStyle.SINGLE, size: 4, color: C.border },
  left: { style: BorderStyle.SINGLE, size: 4, color: C.border },
  right: { style: BorderStyle.SINGLE, size: 4, color: C.border },
  insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: C.border },
  insideVertical: { style: BorderStyle.SINGLE, size: 4, color: C.border },
};

function scoreColor(score) {
  return score >= 8 ? C.green : score >= 5 ? C.amber : C.red;
}

function scoreStatus(score) {
  return score >= 8 ? "Strong" : score >= 5 ? "On Track" : "Needs Work";
}

function text(value, options = {}) {
  return new TextRun({
    text: String(value),
    font: "Arial",
    size: options.size || 22,
    bold: options.bold || false,
    italics: options.italics || false,
    color: options.color || C.text,
    break: options.break,
  });
}

function para(value = "", options = {}) {
  const children = Array.isArray(value) ? value : [text(value, options)];
  return new Paragraph({
    children,
    alignment: options.alignment,
    heading: options.heading,
    pageBreakBefore: options.pageBreakBefore,
    keepNext: options.keepNext,
    keepLines: options.keepLines,
    spacing: {
      before: options.before || 0,
      after: options.after === undefined ? 120 : options.after,
      line: options.line || 276,
    },
    border: options.border,
    shading: options.shading,
  });
}

function heading(value, level = HeadingLevel.HEADING_1, pageBreakBefore = false) {
  return para(value, { heading: level, pageBreakBefore, keepNext: true, after: level === HeadingLevel.HEADING_1 ? 180 : 100 });
}

function cell(content, options = {}) {
  const children = Array.isArray(content)
    ? content
    : [para(content, { bold: options.bold, color: options.color || C.text, alignment: options.alignment, after: 0 })];
  return new TableCell({
    children,
    width: options.width ? { size: options.width, type: WidthType.DXA } : undefined,
    shading: options.fill ? { fill: options.fill, type: ShadingType.CLEAR, color: "auto" } : undefined,
    verticalAlign: options.verticalAlign || VerticalAlign.CENTER,
    borders: options.borders || borders,
    margins: options.margins || { top: 120, bottom: 120, left: 120, right: 120 },
  });
}

function headerCell(label, width) {
  return cell([para(label, { bold: true, color: C.white, alignment: AlignmentType.CENTER, after: 0 })], { fill: C.navy, width });
}

function table(headers, rows, widths, options = {}) {
  const headerRow = new TableRow({
    tableHeader: true,
    cantSplit: true,
    children: headers.map((h, i) => headerCell(h, widths[i])),
  });
  const dataRows = rows.map((row, ri) => new TableRow({
    cantSplit: true,
    children: row.map((item, ci) => {
      const spec = typeof item === "object" && item !== null && !Array.isArray(item) ? item : { value: item };
      let content;
      if (spec.url) {
        content = [new Paragraph({
          spacing: { after: 0 },
          children: [new ExternalHyperlink({
            link: spec.url,
            children: [text(spec.label || spec.url, { color: C.blue, size: 18 })],
          })],
        })];
      } else {
        content = [para(spec.value ?? "", {
          bold: spec.bold,
          color: spec.color || C.text,
          alignment: spec.alignment,
          size: spec.size || 19,
          after: 0,
        })];
      }
      return cell(content, {
        width: widths[ci],
        fill: spec.fill || (options.alternate && ri % 2 ? C.lightGray : C.white),
        color: spec.color,
        alignment: spec.alignment,
      });
    }),
  }));
  return new Table({
    rows: [headerRow, ...dataRows],
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: widths,
    borders,
    layout: "fixed",
  });
}

function status(label) {
  const fill = label === "Good" ? C.green : label === "Missing" ? C.red : C.amber;
  return { value: label, fill, color: C.white, bold: true, alignment: AlignmentType.CENTER };
}

function priority(label) {
  const map = { Critical: C.red, High: C.orange, Medium: C.amber, "Quick Win": C.green };
  return { value: label, fill: map[label], color: C.white, bold: true, alignment: AlignmentType.CENTER };
}

function analysisSection(title, score, groups, pageBreakBefore = true) {
  const out = [
    heading(title, HeadingLevel.HEADING_1, pageBreakBefore),
    para(`${score}/10 · ${scoreStatus(score)}`, { bold: true, color: scoreColor(score), size: 26, after: 180 }),
  ];
  for (const group of groups) {
    out.push(heading(group.name, HeadingLevel.HEADING_2));
    out.push(table(["Signal", "Finding", "Status"], group.rows, [1850, 5810, 1700], { alternate: true }));
    out.push(para("", { after: 120 }));
  }
  return out;
}

function infoBox(children, fill = C.lightBlue) {
  return new Table({
    rows: [new TableRow({
      cantSplit: true,
      children: [cell(children, { fill, width: 9360, margins: { top: 240, bottom: 240, left: 260, right: 260 } })],
    })],
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [9360],
  });
}

const pageRows = [
  [
    { url: "https://ai.euhub.co/en", label: "/en" },
    "English homepage",
    "1,155 words; one H1; Organization, WebSite, Person and Service schema; complete social metadata.",
  ],
  [
    { url: "https://ai.euhub.co/en/ai-act", label: "/en/ai-act" },
    "Compliance guide",
    "538 words; question-led sections; FAQPage, WebPage and BreadcrumbList schema.",
  ],
  [
    { url: "https://ai.euhub.co/en/data-residency", label: "/en/data-residency" },
    "Trust / compliance",
    "418 words; specific DPA, hosting, transfer and security claims; no source citations.",
  ],
  [
    { url: "https://ai.euhub.co/en/portability", label: "/en/portability" },
    "Service differentiator",
    "166 words; strong checklist framing but materially thin for organic discovery.",
  ],
  [
    { url: "https://ai.euhub.co/sk", label: "/sk" },
    "Slovak homepage",
    "1,180 words; localized metadata and schema; one H1; complete hreflang set.",
  ],
  [
    { url: "https://ai.euhub.co/sk/ai-act", label: "/sk/ai-act" },
    "Compliance guide",
    "517 words; localized FAQPage schema and question headings.",
  ],
  [
    { url: "https://ai.euhub.co/sk/data-residency", label: "/sk/data-residency" },
    "Trust / compliance",
    "411 words; strong operational specificity; lacks citations and author/update signals.",
  ],
  [
    { url: "https://ai.euhub.co/sk/portability", label: "/sk/portability" },
    "Service differentiator",
    "180 words; title is 56 characters; content remains too shallow.",
  ],
  [
    { url: "https://ai.euhub.co/de", label: "/de" },
    "German homepage",
    "1,072 words; localized metadata and schema; one H1; complete hreflang set.",
  ],
  [
    { url: "https://ai.euhub.co/de/ai-act", label: "/de/ai-act" },
    "Compliance guide",
    "556 words; localized FAQPage schema and question headings.",
  ],
  [
    { url: "https://ai.euhub.co/de/data-residency", label: "/de/data-residency" },
    "Trust / compliance",
    "418 words; meta description is 160 characters; no external authoritative references.",
  ],
  [
    { url: "https://ai.euhub.co/de/portability", label: "/de/portability" },
    "Service differentiator",
    "177 words; title is 55 characters; content remains too shallow.",
  ],
];

const seoGroups = [
  {
    name: "Technical On-Page",
    rows: [
      ["Crawlability", "robots.txt allows all public paths, disallows only /private/, and points to the XML sitemap. No robots meta noindex was found on the 12 audited pages.", status("Good")],
      ["HTTP status & redirect", "All 12 audited pages return 200. The bare domain uses a permanent 308 redirect to /en.", status("Good")],
      ["Title tags", "All pages have unique localized titles (30–56 characters). Ten of 12 are shorter than the usual 50–60-character target, leaving keyword and value-proposition space unused.", status("Needs Attention")],
      ["Meta descriptions", "All 12 pages have unique localized descriptions of 141–160 characters. The copy is specific and generally within or near the recommended range.", status("Good")],
      ["Heading hierarchy", "Every page has exactly one descriptive H1 and logical H2 sections. Homepages use deeper H3 structure; inner guides remain simple and readable.", status("Good")],
      ["Canonical tags", "Every audited URL has the correct self-referencing canonical.", status("Good")],
      ["hreflang", "Every page exposes reciprocal EN, SK, DE and x-default alternates. HTML lang values also match each localized URL.", status("Good")],
      ["Mobile/accessibility", "Viewport metadata, semantic main/nav landmarks and a skip-to-content link are present. All 51 audited image instances have non-empty alt text.", status("Good")],
      ["Internal links", "All 21 unique internal page targets discovered in the crawl returned 200. Anchors are descriptive, though discovery relies heavily on the footer and homepage fragments.", status("Good")],
      ["Social metadata", "og:title, og:description, og:image, og:url and Twitter large-image fields are complete on all 12 pages. og:type is absent.", status("Needs Attention")],
      ["Response caching", "Static marketing pages return private, no-cache, no-store, max-age=0. This can prevent CDN/browser reuse and should be reviewed against performance goals.", status("Needs Attention")],
      ["Sitemap hygiene", "The sitemap is valid and includes all three language families, but legal pages receive the same 0.7 priority and monthly change frequency as strategic landing pages.", status("Needs Attention")],
    ],
  },
  {
    name: "Content Quality",
    rows: [
      ["Homepage depth", "Localized homepages contain 1,072–1,180 words and cover pain points, mechanism, capabilities, audiences, delivery, proof, team and conversion.", status("Good")],
      ["Guide depth", "EU AI Act pages reach 517–556 words. Data-residency pages are 411–418 words, while portability pages are only 166–180 words—well below competitive landing-page depth.", status("Needs Attention")],
      ["Topic signals", "The site consistently reinforces agentic AI, RAG, ERP/CRM integration, EU AI Act, GDPR, private-cloud/on-premise deployment and vendor portability.", status("Good")],
      ["Readability", "Short paragraphs, sectional headings, lists, steps and delivery checklists make the content highly scannable.", status("Good")],
      ["Freshness", "The sitemap has lastmod values, but meaningful pages show no visible publication/update date and no named content owner.", status("Needs Attention")],
      ["Search visibility sample", "Four web searches using site:ai.euhub.co and exact inner-page patterns returned no results on the audit date. This is a discovery warning, not proof of deindexing; confirm coverage and inspected URLs in Google Search Console and Bing Webmaster Tools.", status("Needs Attention")],
      ["Proof content", "The homepage names LKW-Control × FAIA and Medical Logistic and explains the five-agent solution. The proof remains a homepage section without a dated standalone case study, client quote, baseline or measured before/after result.", status("Needs Attention")],
      ["Editorial footprint", "No blog, resources hub or individually authored insight library appeared in navigation or sitemap, limiting long-tail reach and topical authority.", status("Missing")],
    ],
  },
  {
    name: "Structured Data",
    rows: [
      ["Homepage entity graph", "Valid JSON-LD declares Organization, WebSite, three Person entities and a Service with an offer catalog. Legal name, postal address, email, parent organization and individual LinkedIn sameAs links are present.", status("Good")],
      ["Inner-page markup", "All nine strategic inner pages include WebPage and BreadcrumbList markup with localized names, URLs and inLanguage values.", status("Good")],
      ["FAQ markup", "All three EU AI Act pages include syntactically valid FAQPage markup. The two marked questions match visible content.", status("Good")],
      ["Schema completeness", "No JSON parse errors were found. Organization lacks its own sameAs links, while content pages lack author, datePublished/dateModified and Article or TechArticle semantics.", status("Needs Attention")],
      ["Answer/process schemas", "No HowTo or SpeakableSpecification markup was detected. These are optional, but relevant only after equivalent visible answer/process content exists.", status("Missing")],
    ],
  },
];

const geoGroups = [
  {
    name: "E-E-A-T Assessment",
    rows: [
      ["Organization identity", "EUHub AI is linked to Engineers Incubator s.r.o., EUHUB.CO, a full street address and a consistent email through page copy and Organization schema.", status("Good")],
      ["People & leadership", "Three leaders are visible with roles, photos and LinkedIn links, but surnames are abbreviated and the site provides no bios, track records, qualifications or subject-matter ownership.", status("Needs Attention")],
      ["Authorship", "The compliance and infrastructure guides have no named author, reviewer or credential line.", status("Missing")],
      ["Contact signals", "Email and a Slovak postal address are repeated site-wide and encoded in schema. No telephone number is published.", status("Needs Attention")],
      ["Policies", "Localized privacy, terms and cookie pages exist and every audited page links to them.", status("Good")],
      ["Trust evidence", "Named partners/clients, a concrete deployment narrative and LinkedIn identities are present. Independent testimonials, certifications, awards, press references and verifiable outcome evidence were not found.", status("Needs Attention")],
    ],
  },
  {
    name: "Content for AI Synthesis",
    rows: [
      ["Clear claims", "Each page states its central promise immediately: operational AI implementation, EU AI Act readiness, EU data residency or no-lock-in portability.", status("Good")],
      ["Factual density", "The site supplies dates, penalty figures, GDPR articles, infrastructure regions, deployment controls and delivery windows that are easy for an answer engine to extract.", status("Good")],
      ["Source citation", "No compliance guide links to the EU regulation, European Commission, EDPB or another authoritative source. High-stakes legal and infrastructure claims therefore lack citation support.", status("Missing")],
      ["Comprehensiveness", "The AI Act guide covers applicability, risk, transparency, deliverables, dates and penalties. Portability pages do not answer implementation, migration, ownership, SLA, export-format or handover questions in enough depth.", status("Needs Attention")],
      ["Entity clarity", "EUHub AI, its legal entity, parent brand, people, services and operating geography are consistently identified.", status("Good")],
      ["Originality", "The FAIA five-agent story, diagnostic-first delivery model and deployment checklist create a distinct point of view, but results are partly projected or simulated rather than independently evidenced.", status("Needs Attention")],
      ["Freshness & provenance", "No visible updated dates, authors or reviewers appear on information that changes with regulation and infrastructure practice.", status("Missing")],
    ],
  },
  {
    name: "Technical GEO",
    rows: [
      ["HTTPS & headers", "HTTPS, HSTS, nosniff, SAMEORIGIN and a restrictive permissions policy are active. The Content Security Policy is report-only rather than enforced.", status("Good")],
      ["Server-readable HTML", "All audited content, headings, navigation and JSON-LD are present in the fetched HTML; the Next.js frontend is not hiding core copy behind client-only rendering.", status("Good")],
      ["AI crawl access", "robots.txt allows all public pages with no AI-crawler exclusions. /private/ is the sole disallowed path.", status("Good")],
      ["llms.txt", "A concise English llms.txt exists and summarizes the brand, services, compliance pages and contact details. It omits SK/DE alternatives and evidence/case-study resources.", status("Good")],
      ["Entity links", "Person sameAs links point to LinkedIn. The Organization entity has no company-level sameAs profiles or other authoritative entity references.", status("Needs Attention")],
      ["Structured depth", "Organization, Person, Service, WebPage, BreadcrumbList and FAQPage are useful foundations; authorship, dates and content-specific semantics are the main missing layers.", status("Needs Attention")],
    ],
  },
];

const aeoGroups = [
  {
    name: "Featured Snippet Eligibility",
    rows: [
      ["Direct answers", "All strategic inner pages place a concise proposition directly under the H1. AI Act question sections answer immediately in extractable prose.", status("Good")],
      ["Question headings", "The AI Act pages use two primary natural-language questions. Homepage, data-residency and portability sections are mostly declarative.", status("Needs Attention")],
      ["Definitions", "Core offers are described clearly, but few sections use concise definition patterns such as “EU data residency is…” or “Vendor-neutral AI means…”.", status("Needs Attention")],
      ["Lists and steps", "Every audited page uses lists; the homepage also exposes Audit → Pilot → Scale and delivery checklists that suit list snippets.", status("Good")],
      ["Tables", "No HTML comparison or decision table was found on any of the 12 pages, despite strong table opportunities around AI Act risk, deployment models and portability.", status("Missing")],
    ],
  },
  {
    name: "Structured Answer Formats",
    rows: [
      ["FAQPage schema", "The three AI Act pages mark up two visible questions each with acceptedAnswer content.", status("Good")],
      ["FAQ coverage", "Data residency, portability, implementation, security, pricing, timeline and procurement questions are not organized into FAQ blocks or marked up.", status("Needs Attention")],
      ["HowTo content", "The delivery process is described in steps, but no dedicated how-to page or HowTo markup exists. Markup should only follow genuinely instructional visible content.", status("Needs Attention")],
      ["Speakable markup", "No SpeakableSpecification was found. This is optional and should be limited to carefully selected concise answer sections if adopted.", status("Missing")],
    ],
  },
  {
    name: "Voice Search Readiness",
    rows: [
      ["Conversational language", "Copy is direct, plain and buyer-oriented across English, Slovak and German.", status("Good")],
      ["Long-tail coverage", "The AI Act page covers applicability and risk questions. Equivalent who/what/how/which questions are sparse for services, data location, deployment choice and migration.", status("Needs Attention")],
      ["Local signals", "Name, postal address and email are available and Organization schema includes a PostalAddress. A phone number and dedicated location/service-area content are absent.", status("Needs Attention")],
      ["Multilingual answers", "The same answer architecture is consistently localized across EN/SK/DE with matching hreflang and lang attributes.", status("Good")],
    ],
  },
];

const recommendationRows = [
  [priority("Critical"), "Open Google Search Console and Bing Webmaster Tools: submit the sitemap, inspect /en plus all nine strategic inner pages, request indexing, and resolve any discovered/crawled/canonical exclusion. The audit's sampled site searches returned no results.", "SEO", "Medium", "Very High"],
  [priority("High"), "Expand each portability page from 166–180 words to roughly 600–900 useful words with ownership terms, export formats, migration sequence, handover artifacts, model-switching example, FAQs and a comparison table.", "SEO · GEO · AEO", "Medium", "High"],
  [priority("High"), "Add inline links to the EU AI Act text, European Commission guidance, EDPB/GDPR materials and SCC sources; show a visible reviewed/updated date on compliance claims.", "GEO · SEO", "Low", "High"],
  [priority("High"), "Publish a standalone, indexable LKW-Control × FAIA case study with client-approved quote, baseline, measured outcome, timeframe, architecture, constraints and methodology; label simulated/projected metrics unambiguously.", "GEO · SEO", "High", "High"],
  [priority("High"), "Create full leadership profiles with full names, relevant expertise, past work, credentials, speaking/writing links and responsibility for content review. Connect them through Person and author/reviewer schema.", "GEO", "Medium", "High"],
  [priority("Medium"), "Expand data-residency pages beyond 411–418 words with a subprocessor summary, architecture diagram, deployment-option table, retention matrix, audit evidence and answers to procurement questions.", "SEO · GEO · AEO", "Medium", "High"],
  [priority("Medium"), "Build a small expert resource hub around implementation ROI, AI Act controls, RAG security, ERP/CRM integration and model portability; assign authors, dates and Article/TechArticle markup.", "SEO · GEO", "High", "High"],
  [priority("Quick Win"), "Turn buyer questions into visible 40–60-word answers and scoped FAQ blocks on data residency, portability and the homepage; add FAQPage only where visible Q&A meets search-engine eligibility rules.", "AEO", "Low", "Medium"],
  [priority("Quick Win"), "Lengthen short title tags with specific intent and geography where natural; add og:type and a company-level sameAs array. Keep localized titles distinct.", "SEO · GEO", "Low", "Medium"],
  [priority("Quick Win"), "Review no-store/private caching on static marketing pages, then measure CWV with PageSpeed Insights/Search Console field data before and after any cache change.", "SEO", "Low", "Medium"],
  [priority("Medium"), "Add concise decision tables for AI Act risk tiers, EU-only vs private-cloud vs on-premise deployment, and portable vs locked-in architecture.", "AEO · GEO", "Medium", "Medium"],
  [priority("Quick Win"), "Add company social profiles to Organization.sameAs and publish a business phone only if it is genuinely staffed; extend llms.txt with localized page families and the future evidence hub.", "GEO · AEO", "Low", "Medium"],
];

const strengths = [
  ["Multilingual architecture", "Reciprocal EN/SK/DE/x-default hreflang, localized canonicals, matching HTML lang and consistent page families across all 12 audited URLs."],
  ["Crawlable HTML", "Every audited page returned 200 with its core copy, headings, links and JSON-LD present in server-readable HTML."],
  ["Indexing controls", "robots.txt is permissive, the sitemap is discoverable, and no accidental noindex directive was found."],
  ["Metadata coverage", "Unique title and description tags, complete Open Graph/Twitter image fields and correct self-canonicals exist across the full strategic set."],
  ["Schema foundation", "Homepage entity graph connects Organization, WebSite, Person and Service; inner pages add WebPage/BreadcrumbList; AI Act adds FAQPage."],
  ["Content clarity", "The homepage communicates audience, pain, mechanism, deliverables, proof and conversion in 1,000+ words in every language."],
  ["Compliance specificity", "AI Act dates/penalties and data-residency deployment/DPA controls give answer engines extractable facts instead of vague positioning."],
  ["Accessible images", "All 51 image instances audited have non-empty alt text, including partner logos and leadership photos."],
  ["Link integrity", "All 21 unique internal page targets found during the crawl returned 200."],
  ["AI discovery", "llms.txt provides a concise machine-readable summary of services, compliance topics and contact information."],
];

const coverScoreCells = Object.entries(scores).map(([dimension, score]) => cell([
  para(dimension, { bold: true, color: C.white, size: 20, alignment: AlignmentType.CENTER, after: 80 }),
  para(`${score}/10`, { bold: true, color: C.white, size: 72, alignment: AlignmentType.CENTER, after: 60 }),
  para(scoreStatus(score), { italics: true, color: C.white, size: 18, alignment: AlignmentType.CENTER, after: 0 }),
], {
  fill: scoreColor(score),
  width: 3120,
  borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder },
  margins: { top: 260, bottom: 260, left: 120, right: 120 },
}));

const cover = new Table({
  width: { size: 12240, type: WidthType.DXA },
  columnWidths: [12240],
  borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder, insideHorizontal: noBorder, insideVertical: noBorder },
  rows: [new TableRow({
    height: { value: 15250, rule: HeightRule.EXACT },
    cantSplit: true,
    children: [cell([
      para("", { before: 1500, after: 0 }),
      para(DOMAIN, { bold: true, color: C.white, size: 72, alignment: AlignmentType.CENTER, after: 180 }),
      para("SEO / GEO / AEO Audit Report", { color: C.sky, size: 36, alignment: AlignmentType.CENTER, after: 100 }),
      para("FULL AUDIT", { bold: true, color: C.white, size: 22, alignment: AlignmentType.CENTER, after: 400 }),
      new Table({
        rows: [new TableRow({ cantSplit: true, children: coverScoreCells })],
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [3120, 3120, 3120],
        borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder, insideHorizontal: noBorder, insideVertical: noBorder },
      }),
      para("", { before: 1450, after: 0 }),
      para(DATE, { color: "94A3B8", size: 18, alignment: AlignmentType.CENTER, after: 40 }),
      para("Claude Skill and Plugin by Alex Labat", { color: "94A3B8", size: 18, alignment: AlignmentType.CENTER, after: 0 }),
    ], {
      fill: C.navy,
      width: 12240,
      borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder },
      margins: { top: 0, bottom: 0, left: 1440, right: 1440 },
      verticalAlign: VerticalAlign.CENTER,
    })],
  })],
});

const reportHeader = new Header({
  children: [new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [3400, 5960],
    borders: {
      top: noBorder,
      left: noBorder,
      right: noBorder,
      insideHorizontal: noBorder,
      insideVertical: noBorder,
      bottom: { style: BorderStyle.SINGLE, size: 8, color: C.navy },
    },
    rows: [new TableRow({ children: [
      cell([para(DOMAIN, { bold: true, color: C.navy, size: 18, after: 70 })], { width: 3400, borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder }, margins: { top: 40, bottom: 40, left: 0, right: 0 } }),
      cell([para("SEO / GEO / AEO Audit Report", { color: C.gray, size: 18, alignment: AlignmentType.RIGHT, after: 70 })], { width: 5960, borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder }, margins: { top: 40, bottom: 40, left: 0, right: 0 } }),
    ] })],
  })],
});

const reportFooter = new Footer({
  children: [new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [7000, 2360],
    borders: {
      bottom: noBorder,
      left: noBorder,
      right: noBorder,
      insideHorizontal: noBorder,
      insideVertical: noBorder,
      top: { style: BorderStyle.SINGLE, size: 6, color: C.border },
    },
    rows: [new TableRow({ children: [
      cell([para("Claude Skill and Plugin by Alex Labat", { color: C.gray, size: 18, after: 0 })], { width: 7000, borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder }, margins: { top: 80, bottom: 0, left: 0, right: 0 } }),
      cell([new Paragraph({ alignment: AlignmentType.RIGHT, spacing: { after: 0 }, children: [text("Page ", { color: C.gray, size: 18 }), new TextRun({ children: [PageNumber.CURRENT], font: "Arial", size: 18, color: C.gray })] })], { width: 2360, borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder }, margins: { top: 80, bottom: 0, left: 0, right: 0 } }),
    ] })],
  })],
});

const combined = scores.SEO + scores.GEO + scores.AEO;
const scoreRows = Object.entries(scores).map(([dimension, score]) => [
  dimension,
  { value: `${score}/10`, fill: scoreColor(score), color: C.white, bold: true, alignment: AlignmentType.CENTER },
  { value: scoreStatus(score), fill: scoreColor(score), color: C.white, bold: true, alignment: AlignmentType.CENTER },
  dimension === "SEO"
    ? "Strong multilingual on-page foundation; visibility, thin inner pages and static caching need attention."
    : dimension === "GEO"
      ? "Clear entity and factual signals; authorship, authoritative citations and verifiable evidence are the largest gaps."
      : "The AI Act guide is answer-ready; most other topics lack question-led answers, FAQs and tables.",
]);
scoreRows.push([
  { value: "Combined", bold: true, fill: C.lightBlue },
  { value: `${combined}/30`, bold: true, fill: C.lightBlue, alignment: AlignmentType.CENTER },
  { value: "Solid foundation", bold: true, fill: C.lightBlue, alignment: AlignmentType.CENTER },
  { value: "Prioritize index verification and evidence-rich content before broadening the publishing footprint.", bold: true, fill: C.lightBlue },
]);

const body = [
  heading("Executive Summary", HeadingLevel.HEADING_1),
  infoBox([
    para("EUHub AI has a technically disciplined multilingual foundation: all 12 strategic pages are crawlable, canonicalized, localized with reciprocal hreflang, and supported by useful schema. The homepage is substantial and commercially clear, while the AI Act guide is already well structured for direct answers. The most urgent uncertainty is index discovery—sampled site searches returned no results—followed by very thin portability pages, limited standalone proof, and uncited high-stakes compliance claims. The clearest growth opportunity is to turn the firm's real implementation expertise into authored, cited, evidence-rich resources and case studies that search engines and AI systems can confidently surface.", { after: 0, line: 300 }),
  ]),
  para("", { after: 160 }),
  table(["Dimension", "Score", "Status", "Key Takeaway"], scoreRows, [1300, 1250, 1600, 5210], { alternate: false }),
  para("", { after: 160 }),
  infoBox([
    para([text("Audit basis: ", { bold: true }), text("Live HTML crawl on 25 August 2026; homepage, robots.txt, sitemap.xml and llms.txt discovery; 12 meaningful EN/SK/DE pages; 21 unique internal page targets; a sampled web-index search. Legal/policy pages were verified as present and linked but excluded from content scoring, per full-audit scope.")], { after: 80 }),
    para([text("Not measured: ", { bold: true }), text("Core Web Vitals/field performance, JavaScript runtime behavior, mobile visual rendering, backlink profile, domain authority, conversion analytics and Search Console coverage. Use PageSpeed Insights, Chrome UX Report, Search Console, Bing Webmaster Tools and analytics for those signals.")], { after: 0 }),
  ], C.paleAmber),

  heading("Pages Audited", HeadingLevel.HEADING_1, true),
  para("All meaningful public pages in the sitemap were audited across the three language variants. Privacy, terms and cookie pages were confirmed but omitted from content scoring.", { after: 160 }),
  table(["URL", "Page Type", "Notes"], pageRows, [1900, 1900, 5560], { alternate: true }),

  ...analysisSection("SEO Analysis", scores.SEO, seoGroups, true),
  ...analysisSection("GEO Analysis", scores.GEO, geoGroups, true),
  ...analysisSection("AEO Analysis", scores.AEO, aeoGroups, true),

  heading("Priority Recommendations", HeadingLevel.HEADING_1, true),
  para("Sequenced by likely organic/AI-discovery impact, evidence gap and implementation effort.", { after: 160 }),
  table(["Priority", "Issue / Action", "Dimension", "Effort", "Impact"], recommendationRows, [1200, 4560, 1450, 950, 1200], { alternate: true }),

  heading("What's Working Well", HeadingLevel.HEADING_1, true),
  para("These are genuine strengths observed in the live crawl and should be preserved through future changes.", { after: 160 }),
  new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [2350, 7010],
    borders,
    rows: [
      new TableRow({ tableHeader: true, cantSplit: true, children: [headerCell("Strength", 2350), headerCell("Evidence", 7010)] }),
      ...strengths.map((row) => new TableRow({ cantSplit: true, children: [
        cell([para(row[0], { bold: true, color: C.green, size: 19, after: 0 })], { width: 2350, fill: C.paleGreen }),
        cell([para(row[1], { size: 19, after: 0 })], { width: 7010, fill: C.paleGreen }),
      ] })),
    ],
  }),

  heading("Glossary", HeadingLevel.HEADING_1, true),
  table(["Term", "Plain-English Definition"], [
    [{ value: "SEO", bold: true }, "Search Engine Optimization improves crawlability, relevance and authority so pages can rank in traditional organic search results."],
    [{ value: "GEO", bold: true }, "Generative Engine Optimization makes content clear, factual, authoritative and entity-rich so AI search systems can understand, synthesize and cite it."],
    [{ value: "AEO", bold: true }, "Answer Engine Optimization structures direct answers, lists, tables and question-led content for featured snippets, People Also Ask and voice/assistant responses."],
    [{ value: "E-E-A-T", bold: true }, "Experience, Expertise, Authoritativeness and Trustworthiness—the people, evidence, transparency and reputation signals supporting a site's claims."],
    [{ value: "hreflang", bold: true }, "Markup that tells search engines which language or regional version of a page should be served to a user."],
    [{ value: "Canonical", bold: true }, "A tag naming the preferred URL for a page, helping consolidate duplicate or alternate URL signals."],
    [{ value: "Structured data", bold: true }, "Machine-readable schema markup that describes organizations, people, services, pages, FAQs and other entities or relationships."],
  ], [1800, 7560], { alternate: true }),
  para("", { after: 160 }),
  infoBox([
    para("Recommended next checkpoint", { bold: true, color: C.navy, size: 26, after: 90 }),
    para("Re-run the crawl after index coverage is confirmed and the portability/citation work is live. Compare Search Console impressions, indexed-page count and query growth—not just the audit score.", { after: 0 }),
  ]),
];

const doc = new Document({
  creator: "OpenAI Codex using Claude Skill and Plugin by Alex Labat",
  title: `${DOMAIN} SEO / GEO / AEO Full Audit`,
  subject: "Full website audit",
  description: "Evidence-based SEO, GEO and AEO audit of ai.euhub.co",
  styles: {
    default: {
      document: { run: { font: "Arial", size: 22, color: C.text }, paragraph: { spacing: { line: 276, after: 120 } } },
      heading1: { run: { font: "Arial", size: 48, bold: true, color: C.navy }, paragraph: { spacing: { before: 80, after: 180 }, keepNext: true } },
      heading2: { run: { font: "Arial", size: 36, bold: true, color: C.blue }, paragraph: { spacing: { before: 160, after: 100 }, keepNext: true } },
      heading3: { run: { font: "Arial", size: 28, bold: true, color: C.text }, paragraph: { spacing: { before: 120, after: 80 }, keepNext: true } },
    },
  },
  sections: [
    {
      properties: {
        type: "nextPage",
        page: { size: { width: 12240, height: 15840 }, margin: { top: 0, right: 0, bottom: 0, left: 0, header: 0, footer: 0, gutter: 0 } },
      },
      children: [cover],
    },
    {
      properties: {
        page: { size: { width: 12240, height: 15840 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440, header: 650, footer: 650, gutter: 0 } },
      },
      headers: { default: reportHeader },
      footers: { default: reportFooter },
      children: body,
    },
  ],
});

Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync(OUTPUT, buffer);
  console.log(`DOCX written: ${OUTPUT} (${buffer.length} bytes)`);
});

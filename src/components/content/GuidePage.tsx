import type { ReactNode } from 'react';
import Link from 'next/link';
import type { GuideContent } from '../../lib/content-types';
import { DecisionTable } from './DecisionTable';
import { SourceList } from './SourceList';

const linkPattern = /\[([^\]]+)\]\(([^)]+)\)|([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;

function inlineContent(content: string): ReactNode[] {
  const parts: ReactNode[] = [];
  let cursor = 0;

  for (const match of content.matchAll(linkPattern)) {
    const index = match.index ?? 0;
    if (index > cursor) parts.push(content.slice(cursor, index));
    if (match[1] && match[2]) {
      const href = match[2];
      parts.push(href.startsWith('/')
        ? <Link key={`${href}-${index}`} href={href} className="text-[var(--primary)] hover:underline">{match[1]}</Link>
        : <a key={`${href}-${index}`} href={href} target="_blank" rel="noopener noreferrer" className="text-[var(--primary)] hover:underline">{match[1]}</a>);
    } else if (match[3]) {
      parts.push(<a key={`${match[3]}-${index}`} href={`mailto:${match[3]}`} className="text-[var(--primary)] hover:underline">{match[3]}</a>);
    }
    cursor = index + match[0].length;
  }

  if (cursor < content.length) parts.push(content.slice(cursor));
  return parts.length ? parts : [content];
}

function contentBlocks(content: string) {
  return content.split(/\n\s*\n/).filter(Boolean).map((block, index) => {
    const lines = block.split('\n').filter(Boolean);
    const bulletLines = lines.filter((line) => /^[•*-]\s+/.test(line));
    if (bulletLines.length === lines.length) {
      return <ul key={`${block}-${index}`} className="my-4 list-disc space-y-2 pl-6 text-[var(--muted-foreground)]">
        {bulletLines.map((line) => <li key={line}>{inlineContent(line.replace(/^[•*-]\s+/, ''))}</li>)}
      </ul>;
    }
    return <p key={`${block}-${index}`} className="mb-4 leading-relaxed text-[var(--muted-foreground)]">{inlineContent(block)}</p>;
  });
}

export function GuidePage({ content, lang, backHome }: { content: GuideContent; lang: string; backHome: string }) {
  return (
    <main id="main" className="min-h-screen bg-[var(--background)] pb-16 pt-[calc(var(--header-height)+2rem)] text-[var(--foreground)]">
      <article className="container mx-auto max-w-4xl px-4">
        <header className="mb-12">
          <h1 className="text-4xl font-bold md:text-5xl">{content.title}</h1>
          <p className="mt-3 max-w-3xl text-lg leading-relaxed text-[var(--muted-foreground)]">{content.directAnswer}</p>
          {content.updatedOn && <time dateTime={content.updatedOn} className="mt-4 block text-sm text-[var(--muted-foreground)]">Updated {content.updatedOn}</time>}
        </header>

        <div className="mb-8">
          <Link href={`/${lang}`} className="text-[var(--primary)] transition-colors hover:text-[var(--accent)]">← {backHome}</Link>
        </div>

        {content.sections.map((section) => (
          <section key={section.heading} className="mb-10">
            <h2 className="mb-4 text-2xl font-bold text-[var(--foreground)]">{section.heading}</h2>
            {contentBlocks(section.content)}
            {section.table && <DecisionTable table={section.table} />}
          </section>
        ))}

        {content.faqs?.length ? <section aria-labelledby="faq-heading" className="mt-12">
          <h2 id="faq-heading" className="text-2xl font-bold text-[var(--foreground)]">Frequently asked questions</h2>
          <div className="mt-5 space-y-6">
            {content.faqs.map((faq) => <section key={faq.question}>
              <h3 className="text-lg font-semibold text-[var(--foreground)]">{faq.question}</h3>
              <p className="mt-2 leading-relaxed text-[var(--muted-foreground)]">{faq.answer}</p>
            </section>)}
          </div>
        </section> : null}

        <SourceList citations={content.citations ?? []} />
      </article>
    </main>
  );
}

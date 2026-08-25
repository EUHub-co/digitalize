import type { Citation } from '../../lib/content-types';

export function SourceList({ citations, heading = 'Sources' }: { citations: Citation[]; heading?: string }) {
  if (!citations.length) return null;

  return (
    <section aria-labelledby="sources-heading" className="mt-12 border-t border-[var(--card-border)] pt-8">
      <h2 id="sources-heading" className="text-2xl font-bold text-[var(--foreground)]">{heading}</h2>
      <ol className="mt-4 list-decimal space-y-3 pl-5 text-[var(--muted-foreground)]">
        {citations.map((citation) => (
          <li key={citation.id}>
            <a href={citation.url} target="_blank" rel="noopener noreferrer" className="text-[var(--primary)] hover:underline">
              {citation.label}
            </a>
            {` — ${citation.publisher}`}
          </li>
        ))}
      </ol>
    </section>
  );
}

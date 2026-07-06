import { GlassCard } from '../shared/GlassCard';

// Renders nothing until dict.caseStudies.items has real entries.
// This guarantees no placeholder/fabricated results can ever ship to production:
// the section only appears once you fill in real, approved case studies.
// To add one, append an object to "caseStudies.items" in each dictionary
// (en/sk/de). See docs/case-study-template.md for the field reference.
export const CaseStudies = ({ lang, dict }: { lang: string, dict: any }) => {
    const items = dict.caseStudies?.items || [];
    if (!items.length) return null;

    // Proof strip: short, owner-verifiable facts only — never projections.
    const proofPoints: string[] = dict.caseStudies?.proofPoints?.length
        ? dict.caseStudies.proofPoints
        : [
            '5 specialised agents in production demo',
            '3 languages · 3 markets (EN/SK/DE)',
            'EU-hosted (europe-west1)',
        ];

    return (
        <section id="case-studies" className="relative py-24 bg-[var(--background)]">
            <div className="container mx-auto px-4">
                <div className="max-w-3xl mb-14">
                    <span className="text-[var(--primary)] font-mono text-sm tracking-widest uppercase mb-4 block">
                        {dict.caseStudies?.tag || 'Proof'}
                    </span>
                    <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-[var(--foreground)]">
                        {dict.caseStudies?.title}
                    </h2>
                    {dict.caseStudies?.subtitle && (
                        <p className="text-[var(--muted-foreground)] text-lg leading-relaxed mt-4 max-w-2xl">
                            {dict.caseStudies.subtitle}
                        </p>
                    )}
                </div>

                {/* Proof strip — lives inside the items guard above, so it can
                    never render without at least one real case study. */}
                <ul role="list" className="flex flex-wrap items-center gap-x-10 gap-y-3 border-y border-[var(--card-border)] py-4 mb-12">
                    {proofPoints.map((point, i) => (
                        <li key={i} className="flex items-center gap-2.5 font-mono text-xs uppercase tracking-widest text-[var(--muted-foreground)]">
                            <span aria-hidden className="h-1 w-1 rounded-full bg-[var(--primary)]" />
                            {point}
                        </li>
                    ))}
                </ul>

                <div role="list" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {items.map((item: any, i: number) => (
                        <GlassCard
                            key={i}
                            role="listitem"
                            className="p-8 flex flex-col border border-[var(--card-border)] bg-[var(--card-bg)] transition-all duration-300 hover:-translate-y-1 hover:border-[var(--primary)]/40"
                        >
                            {item.sector && (
                                <p className="text-xs font-mono uppercase tracking-widest text-[var(--primary)]">{item.sector}</p>
                            )}
                            {item.client && (
                                <h3 className="text-xl font-bold text-[var(--foreground)] mt-1.5">{item.client}</h3>
                            )}

                            {item.metric && (
                                <p className="text-3xl font-extrabold text-[var(--primary)] mt-5">{item.metric}</p>
                            )}
                            {item.metricLabel && (
                                <p className="text-xs text-[var(--muted-foreground)] uppercase tracking-wider mt-1">{item.metricLabel}</p>
                            )}

                            {item.challenge && (
                                <div className="mt-6">
                                    <p className="text-[10px] uppercase font-mono tracking-widest text-[var(--muted-foreground)] mb-1.5">{dict.caseStudies?.challengeLabel || 'Challenge'}</p>
                                    <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">{item.challenge}</p>
                                </div>
                            )}
                            {item.approach && (
                                <div className="mt-4">
                                    <p className="text-[10px] uppercase font-mono tracking-widest text-[var(--muted-foreground)] mb-1.5">{dict.caseStudies?.approachLabel || 'What we built'}</p>
                                    <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">{item.approach}</p>
                                </div>
                            )}
                            {item.result && (
                                <div className="mt-4">
                                    <p className="text-[10px] uppercase font-mono tracking-widest text-[var(--muted-foreground)] mb-1.5">{dict.caseStudies?.resultLabel || 'Result'}</p>
                                    <p className="text-sm text-[var(--foreground)] leading-relaxed">{item.result}</p>
                                </div>
                            )}

                            {item.quote && (
                                <blockquote className="mt-6 pt-6 border-t border-[var(--card-border)] text-sm italic text-[var(--foreground)] leading-relaxed">
                                    &ldquo;{item.quote}&rdquo;
                                    {item.quoteAuthor && (
                                        <footer className="mt-2 not-italic text-xs text-[var(--muted-foreground)]">&mdash; {item.quoteAuthor}</footer>
                                    )}
                                </blockquote>
                            )}
                        </GlassCard>
                    ))}
                </div>
            </div>
        </section>
    );
};

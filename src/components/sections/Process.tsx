import { GlassCard } from '../shared/GlassCard';

export const Process = ({ lang, dict }: { lang: string, dict: any }) => {
    const tiers = dict.process?.tiers || [];
    if (!tiers.length) return null;

    return (
        <section id="how-we-work" className="relative py-24 bg-[var(--background)]">
            <div className="container mx-auto px-4">
                <div className="max-w-3xl mb-14">
                    <span className="text-[var(--primary)] font-mono text-sm tracking-widest uppercase mb-4 block">
                        05 // {dict.process?.tag || 'How we work'}
                    </span>
                    <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-[var(--foreground)]">
                        {dict.process?.title}
                    </h2>
                    {dict.process?.subtitle && (
                        <p className="text-[var(--muted-foreground)] text-lg leading-relaxed mt-4 max-w-2xl">
                            {dict.process.subtitle}
                        </p>
                    )}
                </div>

                <div role="list" className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {tiers.map((tier: any, i: number) => (
                        <GlassCard
                            key={i}
                            role="listitem"
                            className="p-8 flex flex-col border border-[var(--card-border)] bg-[var(--card-bg)] transition-all duration-300 hover:-translate-y-1 hover:border-[var(--primary)]/40"
                        >
                            <div className="flex items-baseline justify-between gap-3">
                                <h3 className="text-2xl font-bold text-[var(--foreground)]">{tier.name}</h3>
                                {tier.timeline && (
                                    <span className="text-xs font-mono uppercase tracking-wider text-[var(--muted-foreground)]">{tier.timeline}</span>
                                )}
                            </div>
                            {tier.price && (
                                <p className="text-2xl font-extrabold text-[var(--primary)] mt-2">{tier.price}</p>
                            )}
                            {tier.summary && (
                                <p className="text-sm text-[var(--muted-foreground)] leading-relaxed mt-3">{tier.summary}</p>
                            )}
                            {tier.deliverables?.length > 0 && (
                                <>
                                    <p className="text-[10px] uppercase font-mono tracking-widest text-[var(--muted-foreground)] mt-6 mb-3">
                                        {dict.process?.deliverablesLabel || 'Deliverables'}
                                    </p>
                                    <ul className="space-y-2.5 text-sm text-[var(--foreground)]">
                                        {tier.deliverables.map((d: string, j: number) => (
                                            <li key={j} className="flex gap-2.5">
                                                <span aria-hidden className="text-[var(--primary)] font-bold">&#10003;</span>
                                                <span className="text-[var(--muted-foreground)]">{d}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </>
                            )}
                        </GlassCard>
                    ))}
                </div>
            </div>
        </section>
    );
};

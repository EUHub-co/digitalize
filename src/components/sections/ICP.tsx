import { GlassCard } from '../shared/GlassCard';

export const ICP = ({ lang, dict }: { lang: string, dict: any }) => {
    const items = dict.icp?.items || [];
    if (!items.length) return null;

    return (
        <section id="who-we-serve" className="relative py-24 bg-[var(--background)]">
            <div className="container mx-auto px-4">
                <div className="max-w-3xl mb-14">
                    <span className="text-[var(--primary)] font-mono text-sm tracking-widest uppercase mb-4 block">
                        04 // {dict.icp?.tag || "Who we're for"}
                    </span>
                    <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-[var(--foreground)]">
                        {dict.icp?.title}
                    </h2>
                    {dict.icp?.subtitle && (
                        <p className="text-[var(--muted-foreground)] text-lg leading-relaxed mt-4 max-w-2xl">
                            {dict.icp.subtitle}
                        </p>
                    )}
                </div>

                <div role="list" className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {items.map((item: any, i: number) => (
                        <GlassCard
                            key={i}
                            role="listitem"
                            className="p-8 border border-[var(--card-border)] bg-[var(--card-bg)] transition-all duration-300 hover:-translate-y-1 hover:border-[var(--primary)]/40"
                        >
                            <h3 className="text-xl font-bold text-[var(--foreground)]">{item.title}</h3>
                            {item.sector && (
                                <p className="text-xs font-mono uppercase tracking-widest text-[var(--primary)] mt-1.5">{item.sector}</p>
                            )}
                            <p className="text-sm text-[var(--muted-foreground)] leading-relaxed mt-5">{item.pain}</p>
                            <p className="text-sm text-[var(--foreground)] leading-relaxed mt-3 flex gap-2">
                                <span aria-hidden className="text-[var(--primary)] font-bold">&rarr;</span>
                                <span>{item.outcome}</span>
                            </p>
                        </GlassCard>
                    ))}
                </div>
            </div>
        </section>
    );
};

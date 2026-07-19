import Image from 'next/image';

export const Team = ({ lang, dict }: { lang: string, dict: any }) => {
    const photosByMemberName: Record<string, string> = {
        'Artashes A.': '/photos/artashes1.webp',
        'Mike G.': '/photos/mike1.webp',
        'Kateryna H.': '/photos/katka1.webp',
    };

    const members = dict.team?.members || [];

    return (
        <section id="team" className="relative py-24 bg-[#F4F3EF] dark:bg-[var(--background)]">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="max-w-3xl mb-14">
                    <span className="text-[var(--primary)] font-mono text-sm tracking-widest uppercase mb-4 block">
                        07 // {dict.team?.tag || 'Team'}
                    </span>
                    <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-[var(--foreground)]">
                        {dict.team?.title || 'The people behind your implementation'}
                    </h2>
                    {dict.team?.subtitle && (
                        <p className="text-[var(--muted-foreground)] text-lg leading-relaxed mt-4 max-w-2xl">
                            {dict.team.subtitle}
                        </p>
                    )}
                </div>

                {/* Cards */}
                <div role="list" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 lg:gap-8">
                    {members.map((member: any, index: number) => (
                        <div
                            key={index}
                            role="listitem"
                            className="group rounded-3xl bg-white dark:bg-[var(--card-bg)] border border-[var(--card-border)] p-4 shadow-[0_12px_32px_-14px_rgba(0,0,0,0.15)] dark:shadow-none transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_22px_44px_-18px_rgba(0,0,0,0.22)]"
                        >
                            {/* Photo */}
                            <div className="relative overflow-hidden rounded-2xl aspect-[4/5] bg-slate-100 dark:bg-[#0D0E15]">
                                <Image
                                    src={photosByMemberName[member.name] || `/team-${index + 1}.png`}
                                    alt={member.name}
                                    fill
                                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                                    className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
                                    priority={index === 0}
                                />
                                {member.badge && (
                                    <span className="absolute bottom-3 left-3 px-2.5 py-1 rounded-md text-[10px] font-mono font-semibold uppercase tracking-wider bg-white/85 dark:bg-black/55 text-slate-700 dark:text-slate-200 backdrop-blur-sm">
                                        {member.badge}
                                    </span>
                                )}
                            </div>

                            {/* Body */}
                            <div className="px-2 pt-5 pb-2">
                                <h3 className="text-xl font-bold text-[var(--foreground)]">{member.name}</h3>
                                <p className="text-sm text-[var(--muted-foreground)] mt-1">{member.role}</p>
                                {member.url && (
                                    <a
                                        href={member.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label={`${dict.team?.connect || 'Connect'} — ${member.name} (opens in a new tab)`}
                                        className="inline-flex items-center gap-1.5 mt-4 text-sm font-semibold text-amber-600 hover:text-amber-700 dark:text-amber-500 transition-colors"
                                    >
                                        {dict.team?.connect || 'Connect'}
                                        <span aria-hidden className="transition-transform group-hover:translate-x-1">→</span>
                                    </a>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

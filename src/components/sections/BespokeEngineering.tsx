import { AuditTrailCard } from './AuditTrailCard';

export const BespokeEngineering = ({ lang, dict }: { lang: string, dict: any }) => {
    // Default fallback content
    const steps = dict.engineering?.steps || [
        {
            num: "01",
            title: "Data Ingestion",
            desc: "Secure connection to your internal databases, ERP, or CRM via compliant API bridges."
        },
        {
            num: "02",
            title: "Model Tuning",
            desc: "Training foundational LLMs strictly on your operational data and brand guidelines."
        },
        {
            num: "03",
            title: "Workflow Orchestration",
            desc: "Designing logic trees where AI agents autonomously trigger and resolve multi-step tasks."
        },
        {
            num: "04",
            title: "Deployment & Scale",
            desc: "Containerized deployment of your custom web-app with monitoring and a 99.9% uptime target."
        }
    ];

    return (
        <section id="engineering" className="relative py-32 bg-[var(--background)] overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-[600px] bg-[var(--primary)] opacity-[0.03] blur-[150px] rounded-full pointer-events-none"></div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-20">
                    <span className="text-[var(--primary)] font-mono text-sm tracking-widest uppercase mb-4 block">
                        02 // {dict.engineering?.tag || 'Bespoke Engineering'}
                    </span>
                    <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                        {dict.engineering?.title || 'The Deployment Mechanism'}
                    </h2>
                </div>

                {/* 3-Column Layout: Left Steps -> Center Dashboard -> Right Steps */}
                <div className="group/steps flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-8 xl:gap-16">

                    {/* Left Steps */}
                    <div className="flex flex-col gap-10 lg:w-1/4 w-full">
                        {[steps[0], steps[1]].map((step) => (
                            <div key={step.num} className="group relative transition-all duration-500 opacity-100 group-hover/steps:[&:not(:hover)]:opacity-40 hover:scale-[1.02] border border-transparent hover:-translate-y-1 hover:bg-white dark:hover:bg-[rgba(255,255,255,0.02)] p-6 -mx-6 -my-4 rounded-2xl hover:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_0_30px_rgba(0,229,255,0.05)] hover:border-slate-100 dark:hover:border-[var(--card-border)] z-10 hover:z-30">
                                <div className="absolute inset-0 bg-gradient-to-r from-[var(--primary)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"></div>
                                <div className="relative">
                                    <div className="flex items-center gap-4 mb-3">
                                        <div className="text-2xl font-mono font-bold text-[#94A3B8] dark:text-[var(--card-border)] group-hover:text-[var(--primary)] transition-colors">{step.num}</div>
                                        <h3 className="text-xl font-bold text-[#1A1C28] dark:text-white">{step.title}</h3>
                                    </div>
                                    <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed pl-12">
                                        {step.desc}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Center: FAIA order-intake audit trail (decorative — simulated data, hidden from assistive tech) */}
                    <div aria-hidden="true" className="lg:w-2/4 w-full relative perspective-1000 transition-all duration-500 opacity-100 group-hover/steps:[&:not(:hover)]:opacity-40 z-20 hover:z-40">
                        <AuditTrailCard dict={dict} />
                    </div>

                    {/* Right Steps */}
                    <div className="flex flex-col gap-10 lg:w-1/4 w-full">
                        {[steps[2], steps[3]].map((step) => (
                            <div key={step.num} className="group relative transition-all duration-500 opacity-100 group-hover/steps:[&:not(:hover)]:opacity-40 hover:scale-[1.02] border border-transparent hover:-translate-y-1 hover:bg-white dark:hover:bg-[rgba(255,255,255,0.02)] p-6 -mx-6 -my-4 rounded-2xl hover:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_0_30px_rgba(123,97,255,0.05)] hover:border-slate-100 dark:hover:border-[var(--card-border)] z-10 hover:z-30">
                                <div className="absolute inset-0 bg-gradient-to-l from-[var(--secondary)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"></div>
                                <div className="relative text-left">
                                    <div className="flex items-center gap-4 mb-3">
                                        <div className="text-2xl font-mono font-bold text-[#94A3B8] dark:text-[var(--card-border)] group-hover:text-[var(--secondary)] transition-colors">{step.num}</div>
                                        <h3 className="text-xl font-bold text-[#1A1C28] dark:text-white">{step.title}</h3>
                                    </div>
                                    <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed pl-12 lg:pr-12">
                                        {step.desc}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                </div>
            </div>
        </section>
    );
};

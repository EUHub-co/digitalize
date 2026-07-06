'use client';

import { GlassCard } from '../shared/GlassCard';
import { useState, useEffect } from 'react';

export const Hero = ({ lang, dict }: { lang: string, dict: any }) => {
    const [step, setStep] = useState(0);

    useEffect(() => {
        let timeoutIds: NodeJS.Timeout[] = [];
        const runSequence = () => {
            setStep(0);
            timeoutIds.push(setTimeout(() => setStep(1), 1000));
            timeoutIds.push(setTimeout(() => setStep(2), 2500));
            timeoutIds.push(setTimeout(() => setStep(3), 4000));
            timeoutIds.push(setTimeout(runSequence, 8000));
        };
        runSequence();
        return () => timeoutIds.forEach(clearTimeout);
    }, []);

    return (
        <section className="relative min-h-[90vh] flex flex-col justify-center pt-[calc(var(--header-height)+4rem)] pb-24 overflow-hidden bg-transparent">
            {/* Background Elements - Mesh Gradient */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 bg-[var(--background)]">
                {/* Subtle mesh/glow effect matching Neo-Corporate aesthetic */}
                <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-[var(--primary)] opacity-[0.07] blur-[140px] mix-blend-screen"></div>
                <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[var(--secondary)] opacity-[0.05] blur-[120px] mix-blend-screen"></div>

                {/* Cyber grid lines for enterprise feel */}
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PHBhdGggZD0iTTAgMGg0MHY0MEgweiIgZmlsbD0ibm9uZSIvPPHBhdGggZD0iTTAgNDBoNDBNNDAgMHY0MCIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDMpIiBzdHJva2Utd2lkdGg9IjEiLz48L3N2Zz4=')] opacity-50"></div>

                {/* Bottom fade out to merge smoothly with next section */}
                <div className="absolute bottom-0 w-full h-48 bg-gradient-to-t from-[var(--background)] to-transparent"></div>
            </div>

            <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center flex-1">
                {/* Text Content */}
                <div className="lg:col-span-7 space-y-10 relative z-10">
                    <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-[var(--primary)] bg-[rgba(0,229,255,0.05)] text-[var(--primary)] text-sm font-mono uppercase tracking-widest backdrop-blur-sm">
                        <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--primary)] opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[var(--primary)]"></span>
                        </span>
                        {dict.hero?.badge || 'Enterprise AI Integrations • Q1 2026'}
                    </div>

                    <h1 className="text-5xl md:text-6xl lg:text-[5.5rem] font-extrabold leading-[1.1] tracking-tighter text-[var(--foreground)] drop-shadow-sm">
                        {dict.hero?.title || 'Eliminate Bottlenecks with Agentic AI'}
                    </h1>

                    <p className="text-xl md:text-2xl text-[var(--muted-foreground)] max-w-2xl leading-relaxed tracking-wide font-light">
                        {dict.hero?.subtitle || 'We audit your infrastructure and deploy custom autonomous web-apps that cut operational friction by up to 40%.'}
                    </p>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-5 pt-4">
                        <a href="#contact" className="btn btn-primary text-lg px-10 py-4 shadow-[0_0_20px_rgba(0,229,255,0.3)]">
                            {dict.hero?.primaryCta || 'Initiate AI Audit'}
                        </a>
                        <a href="#engineering" className="group self-start sm:self-auto inline-flex items-center gap-1.5 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
                            <span className="group-hover:underline underline-offset-4">{dict.hero?.secondaryCta || 'Or explore custom web-apps'}</span>
                            <span aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-0.5">→</span>
                        </a>
                    </div>
                </div>

                {/* Right Side Visual - High Fidelity Diagnostic Interface (decorative) */}
                <div aria-hidden="true" className="lg:col-span-5 relative hidden lg:block perspective-1000">
                    <GlassCard className="transform rotate-y-[-5deg] rotate-x-[5deg] transition-transform duration-700 hover:rotate-y-0 hover:rotate-x-0 relative z-10 border-[#2A2D3E] bg-[#0D0E15]/90 shadow-2xl backdrop-blur-xl text-slate-300">
                        <div className="flex items-center justify-between mb-6 border-b border-[#2A2D3E] pb-4">
                            <div className="flex gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                                <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                                <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                            </div>
                            <div className="text-xs text-slate-400 font-mono uppercase tracking-widest">{dict.hero?.terminal?.header || 'ops_audit.ts'}</div>
                        </div>

                        <div className="space-y-5 font-mono text-sm min-h-[220px]">
                            {step >= 1 && (
                                <div className="flex justify-between items-center group cursor-default animate-[fade-in-up_0.3s_ease-out_forwards]">
                                    <span className="text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{dict.hero?.terminal?.step1 || 'Mapping order-to-invoice workflow...'}</span>
                                    <span className="text-[var(--accent)] text-xs border border-[var(--accent)]/30 bg-[var(--accent)]/10 px-2 py-0.5 rounded">{dict.hero?.terminal?.step1Status || 'MANUAL HANDOFFS: 7'}</span>
                                </div>
                            )}
                            {step >= 2 && (
                                <div className="flex justify-between items-center group cursor-default animate-[fade-in-up_0.3s_ease-out_forwards]">
                                    <span className="text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{dict.hero?.terminal?.step2 || 'Locating repetitive manual tasks...'}</span>
                                    <span className="text-[var(--accent)] text-xs border border-[var(--accent)]/30 bg-[var(--accent)]/10 px-2 py-0.5 rounded">{dict.hero?.terminal?.step2Status || 'RECOVERABLE: 9 HRS/WEEK'}</span>
                                </div>
                            )}
                            {step >= 3 && (
                                <div className="flex justify-between items-center group cursor-default animate-[fade-in-up_0.3s_ease-out_forwards]">
                                    <span className="text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{dict.hero?.terminal?.step3 || 'Drafting automation roadmap...'}</span>
                                    <span className="text-[var(--primary)] text-xs animate-pulse">{dict.hero?.terminal?.step3Status || 'READY'}</span>
                                </div>
                            )}
                            {step < 3 && step > 0 && (
                                <div className="flex justify-start items-center animate-pulse">
                                    <div className="w-2 h-4 bg-slate-500 rounded-sm"></div>
                                </div>
                            )}

                            <div className={`mt-8 p-5 rounded-lg bg-[#1a1d29] border border-[#2A2D3E] relative overflow-hidden group shadow-inner transition-all duration-700 ${step >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                                <div className="absolute inset-0 bg-gradient-to-r from-[var(--primary)]/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                                <div className="text-slate-400 mb-3 text-xs uppercase tracking-widest">{dict.hero?.terminal?.comment || '// Projected Efficiency Delta'}</div>
                                <div className="flex items-end gap-3">
                                    <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] drop-shadow-sm">
                                        {dict.hero?.terminal?.delta || '+42%'}
                                    </div>
                                    <div className="text-sm text-slate-300 mb-1 pb-1 font-medium">{dict.hero?.terminal?.label || 'operational bandwidth'}</div>
                                </div>
                            </div>
                        </div>

                        {/* Custom CSS for animation inline */}
                        <style dangerouslySetInnerHTML={{
                            __html: `
                            @keyframes fade-in-up {
                                0% { opacity: 0; transform: translateY(10px); }
                                100% { opacity: 1; transform: translateY(0); }
                            }
                        `}} />
                    </GlassCard>

                    {/* Decorative node glows */}
                    <div className="absolute -top-12 -right-12 w-40 h-40 bg-[var(--primary)] rounded-full blur-[80px] opacity-30 mix-blend-screen pointer-events-none"></div>
                    <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-[var(--secondary)] rounded-full blur-[60px] opacity-20 mix-blend-screen pointer-events-none"></div>
                </div>
            </div>

            {/* Enterprise Trust Bar Marquee */}
            <div className="absolute bottom-0 left-0 w-full overflow-hidden border-t border-[var(--card-border)] bg-slate-50/80 dark:bg-[#151722]/90 backdrop-blur-md py-6 flex items-center z-20">
                <div className="flex justify-start items-center space-x-12 animate-[marquee_30s_linear_infinite] px-4">
                    {/* Repeated items for smooth scrolling */}
                    {[...Array(2)].map((_, j) => (
                        <div key={j} className="flex space-x-12 items-center min-w-max">
                            <span className="font-mono text-slate-600 dark:text-slate-400 text-sm font-bold">{dict.hero?.trustBar || 'PARTNERS & CLIENTS'}</span>
                            <span className="text-[var(--card-border)]">|</span>
                            {/* Partner Logos */}
                            <div className="flex items-center space-x-12 transition-all duration-500 grayscale opacity-40 hover:grayscale-0 hover:opacity-100">
                                <span className="font-heading font-bold text-xl text-slate-500 dark:text-slate-300 tracking-widest flex items-center">
                                    <span className="border-2 border-slate-500 dark:border-slate-300 px-1.5 mr-0.5 text-lg leading-none py-0.5">a</span>MARTINI
                                </span>
                                <img src="/partners/ccs.svg" alt="CCS" className="h-[28px] w-auto object-contain dark:invert" />
                                <img src="/partners/univera.svg" alt="UNIVERA" className="h-8 w-auto object-contain dark:invert" />
                                <img src="/partners/medicallogistic.png" alt="Medical Logistic" className="h-8 w-auto object-contain dark:invert" />
                                <img src="/partners/angemy.png" alt="ANGEMY" className="h-8 w-auto object-contain dark:invert" />
                            </div>
                            <span className="font-mono text-slate-600 dark:text-slate-400 text-sm font-bold border border-[var(--card-border)] px-3 py-1 rounded-full">{dict.hero?.uptimeBadge || '99.9% UPTIME'}</span>
                            <span className="text-[var(--card-border)]">|</span>
                        </div>
                    ))}
                </div>

                {/* CSS Animation defined locally for convenience if not in globals */}
                <style dangerouslySetInnerHTML={{
                    __html: `
                    @keyframes marquee {
                        0% { transform: translateX(0); }
                        100% { transform: translateX(-50%); }
                    }
                `}} />
            </div>
        </section>
    );
};

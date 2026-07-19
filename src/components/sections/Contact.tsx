'use client';

import { useEffect } from 'react';
import { GlassCard } from '../shared/GlassCard';
import { useForm, ValidationError } from '@formspree/react';

declare global {
    interface Window { dataLayer: Record<string, unknown>[]; }
}

export const Contact = ({ lang, dict }: { lang: string, dict: any }) => {
    const [state, handleSubmit] = useForm("xeelrddn");

    useEffect(() => {
        if (state.succeeded && typeof window !== 'undefined') {
            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push({ event: 'audit_initiated', form_id: 'xeelrddn' });
        }
    }, [state.succeeded]);

    // Metrics for social proof
    const metrics = [
        { value: dict.cta?.metric1Value || "2 weeks", label: dict.cta?.metric1 || "From audit to roadmap" },
        { value: "40%", label: dict.cta?.metric2 || "Less manual data entry" },
        { value: "24/7", label: dict.cta?.metric3 || "Autonomous Uptime" }
    ];

    return (
        <section id="contact" className="relative py-32 bg-[var(--background)] overflow-hidden">
            {/* Background Glow */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-96 bg-[var(--primary)] opacity-[0.05] blur-[150px] rounded-t-full pointer-events-none"></div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="max-w-5xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

                        {/* Left Side: Trust Metrics & Copy */}
                        <div className="space-y-10">
                            <div>
                                <span className="text-[var(--primary)] font-mono text-sm tracking-widest uppercase mb-4 block">
                                    08 // {dict.cta?.tag || 'Initiate Diagnostic'}
                                </span>
                                <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight mb-6">
                                    {dict.cta?.title || 'Stop bleeding capital on manual ops.'}
                                </h2>
                                <p className="text-[var(--muted-foreground)] text-lg leading-relaxed">
                                    {dict.contactSection?.intro || 'Don\'t let the competition outpace you. Get an audit of your infrastructure and find out where you are losing money.'}
                                </p>
                            </div>

                            {/* Trust Metrics Grid */}
                            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-[var(--card-border)]">
                                {metrics.map((metric, i) => (
                                    <div key={i}>
                                        <div className="text-3xl font-extrabold text-[var(--foreground)] mb-1">{metric.value}</div>
                                        <div className="text-xs font-mono text-[var(--primary)] uppercase tracking-wider">{metric.label}</div>
                                    </div>
                                ))}
                            </div>

                            {/* Contact Info */}
                            <div className="space-y-6 pt-6">
                                <div className="flex items-center gap-4 group">
                                    <div className="w-12 h-12 rounded-full border border-[var(--card-border)] bg-[rgba(21,23,34,0.6)] flex items-center justify-center text-[var(--primary)] group-hover:bg-[var(--primary)]/10 group-hover:border-[var(--primary)]/30 transition-all">
                                        <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-mono text-[var(--muted-foreground)] uppercase tracking-widest mb-1">{dict.contactSection?.directLine || 'Direct Line'}</div>
                                        <a href="mailto:hello@euhub-ai.com" className="text-lg font-medium hover:text-[var(--primary)] transition-colors">hello@euhub-ai.com</a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Side: Conversion Form */}
                        <div className="relative perspective-1000">
                            {state.succeeded ? (
                                <div role="status" aria-live="polite">
                                <GlassCard className="border-[var(--primary)]/30 bg-[rgba(21,23,34,0.8)] backdrop-blur-xl p-12 text-center transform transition-all duration-700">
                                    <div className="w-20 h-20 bg-[var(--primary)]/20 text-[var(--primary)] rounded-full flex items-center justify-center mx-auto mb-6">
                                        <svg aria-hidden="true" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                    </div>
                                    <h3 className="text-3xl font-bold mb-4">
                                        {dict.contactSection?.successTitle || 'Audit Initialized'}
                                    </h3>
                                    <p className="text-[var(--muted-foreground)] text-lg">
                                        {dict.contactSection?.successBody || 'Our engineers are analyzing your request. We will contact you within 24 hours.'}
                                    </p>
                                </GlassCard>
                                </div>
                            ) : (
                                <GlassCard className="border-[var(--card-border)] bg-[rgba(21,23,34,0.8)] backdrop-blur-xl p-8 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--primary)] rounded-full blur-[80px] opacity-10 pointer-events-none group-hover:opacity-20 transition-opacity duration-500"></div>

                                    <h3 className="text-2xl font-bold mb-6">
                                        {dict.contactSection?.formTitle || 'Request Diagnostic Audit'}
                                    </h3>

                                    <form onSubmit={handleSubmit} className="space-y-5">
                                        <div className="space-y-1">
                                            <label htmlFor="name" className="text-xs font-mono uppercase tracking-widest text-slate-500 dark:text-[var(--muted-foreground)] block">
                                                {dict.contactSection?.nameLabel || 'Name / Company'}
                                            </label>
                                            <input
                                                id="name"
                                                type="text"
                                                name="name"
                                                required
                                                aria-describedby="name-error"
                                                className="w-full px-4 py-3 rounded-lg bg-slate-50 dark:bg-[rgba(0,0,0,0.3)] border border-slate-200 dark:border-[var(--card-border)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)] text-[var(--foreground)] placeholder-slate-500 dark:placeholder-[var(--muted-foreground)] focus:outline-none transition-all"
                                                placeholder={dict.contactSection?.namePlaceholder || 'Your identifier'}
                                            />
                                            <ValidationError id="name-error" prefix="Name" field="name" errors={state.errors} className="text-[var(--status-danger)] text-sm mt-1" />
                                        </div>

                                        <div className="space-y-1">
                                            <label htmlFor="email" className="text-xs font-mono uppercase tracking-widest text-slate-500 dark:text-[var(--muted-foreground)] block">
                                                {dict.contactSection?.emailLabel || 'Work Email'}
                                            </label>
                                            <input
                                                id="email"
                                                type="email"
                                                name="email"
                                                required
                                                aria-describedby="email-error"
                                                className="w-full px-4 py-3 rounded-lg bg-slate-50 dark:bg-[rgba(0,0,0,0.3)] border border-slate-200 dark:border-[var(--card-border)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)] text-[var(--foreground)] placeholder-slate-500 dark:placeholder-[var(--muted-foreground)] focus:outline-none transition-all"
                                                placeholder="sysadmin@enterprise.com"
                                            />
                                            <ValidationError id="email-error" prefix="Email" field="email" errors={state.errors} className="text-[var(--status-danger)] text-sm mt-1" />
                                        </div>

                                        <div className="space-y-1">
                                            <label htmlFor="message" className="text-xs font-mono uppercase tracking-widest text-slate-500 dark:text-[var(--muted-foreground)] block">
                                                {dict.contactSection?.messageLabel || 'Problem Statement'}
                                            </label>
                                            <textarea
                                                id="message"
                                                name="message"
                                                rows={4}
                                                aria-describedby="message-error"
                                                className="w-full px-4 py-3 rounded-lg bg-slate-50 dark:bg-[rgba(0,0,0,0.3)] border border-slate-200 dark:border-[var(--card-border)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)] text-[var(--foreground)] placeholder-slate-500 dark:placeholder-[var(--muted-foreground)] focus:outline-none transition-all resize-none"
                                                placeholder={dict.contactSection?.messagePlaceholder || 'Which systems do you need to integrate?'}
                                            ></textarea>
                                            <ValidationError id="message-error" prefix="Message" field="message" errors={state.errors} className="text-[var(--status-danger)] text-sm mt-1" />
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={state.submitting}
                                            className="w-full relative flex items-center justify-center gap-2 bg-[#00E5FF] text-[#0D0E15] font-bold py-4 px-8 rounded-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(0,229,255,0.4)] disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                                        >
                                            <span className="relative z-10 flex items-center justify-center gap-2">
                                                {!state.submitting && (
                                                    <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                                                )}
                                                {state.submitting
                                                    ? (dict.contactSection?.submitting || 'Initializing...')
                                                    : (dict.cta?.button || 'Run Diagnostic')}
                                            </span>
                                        </button>
                                    </form>
                                </GlassCard>
                            )}
                        </div>

                    </div>
                </div>
            </div>
        </section>
    );
};

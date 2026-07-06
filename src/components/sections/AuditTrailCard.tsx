'use client';

import { useEffect, useRef, useState } from 'react';

// Decorative workflow audit-trail card: one order processed end-to-end by the
// FAIA agent, with a human-approval escalation as the hero moment. Purely
// illustrative (simulated data, aria-hidden) — nothing in here is clickable.

type AuditStep = { time?: string; title: string; detail?: string };
type AuditStat = { value: string; label: string };

// Dict steps arrays must keep this order: index 4 is the amber escalation row
// (the hero moment), index 5 the dimmed/pending final row.
const ESCALATION_INDEX = 4;
const PENDING_INDEX = 5;
const ROW_CADENCE_MS = 700;

// Fallbacks match engineering.audit in src/dictionaries/en.json exactly.
const FALLBACK_STEPS: AuditStep[] = [
    { time: '07:42:03', title: 'Order email received', detail: 'packaging wholesaler (DE) — PDF attached, 4 line items' },
    { time: '07:42:08', title: 'Line items extracted, delivery 14.07', detail: 'matched to ERP customer 10442' },
    { time: '07:42:11', title: 'Stock check: 3 of 4 items in Trnava warehouse', detail: '1 backordered — ETA 10.07' },
    { time: '07:42:14', title: 'Order confirmation drafted (DE)', detail: 'with partial-delivery option' },
    { time: '07:42:15', title: 'Escalated: partial availability', detail: 'waiting for dispatcher approval' },
    { time: '', title: 'Send confirmation · create delivery note' },
];

const FALLBACK_STATS: AuditStat[] = [
    { value: '27', label: 'orders processed today' },
    { value: '4', label: 'needed a human' },
    { value: '38 s', label: 'median handling' },
];

const StepIcon = ({ variant }: { variant: 'done' | 'escalated' | 'pending' }) => {
    if (variant === 'done') {
        return (
            <svg className="text-emerald-600 dark:text-emerald-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="m9 12 2 2 4-4" />
            </svg>
        );
    }
    if (variant === 'escalated') {
        return (
            <svg className="text-amber-600 dark:text-amber-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="10" y1="9" x2="10" y2="15" />
                <line x1="14" y1="9" x2="14" y2="15" />
            </svg>
        );
    }
    return (
        <svg className="text-[var(--muted-foreground)] opacity-60" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" strokeDasharray="3 3" />
        </svg>
    );
};

export const AuditTrailCard = ({ dict }: { dict: any }) => {
    const audit = dict.engineering?.audit || {};

    const appTitle = audit.appTitle || 'FAIA — Order intake';
    const statePill = audit.statePill || 'Waiting for approval — Dispatch';
    const connectedLabel = audit.connectedLabel || 'Connected:';
    const chips: string[] = [
        audit.chipErp || 'ERP — e.g. SAP Business One',
        audit.chipAccounting || 'Accounting — your current system',
        audit.chipInbox || 'Inbox — Outlook',
    ];
    const steps: AuditStep[] = (Array.isArray(audit.steps) && audit.steps.length) ? audit.steps : FALLBACK_STEPS;
    const stats: AuditStat[] = (Array.isArray(audit.stats) && audit.stats.length) ? audit.stats : FALLBACK_STATS;
    const simulatedTag = audit.simulatedTag || 'Simulated example';
    const caption = audit.caption || 'The agent team behind this — live demo below ↓';

    const [reduced, setReduced] = useState(false);
    const [started, setStarted] = useState(false);
    const [onScreen, setOnScreen] = useState(false);
    const [visibleRows, setVisibleRows] = useState(0);
    const [showStats, setShowStats] = useState(false);
    const rootRef = useRef<HTMLDivElement>(null);

    // Honour prefers-reduced-motion.
    useEffect(() => {
        if (typeof window === 'undefined' || !window.matchMedia) return;
        const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
        setReduced(mq.matches);
        const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
        mq.addEventListener('change', onChange);
        return () => mq.removeEventListener('change', onChange);
    }, []);

    // One observer, two jobs: start the reveal once at ~40% visibility, and
    // keep tracking on-screen state so the pill only pulses while visible.
    useEffect(() => {
        const el = rootRef.current;
        if (!el || typeof IntersectionObserver === 'undefined') {
            setStarted(true);
            setOnScreen(true);
            return;
        }
        const obs = new IntersectionObserver((entries) => {
            for (const entry of entries) {
                setOnScreen(entry.isIntersecting);
                if (entry.intersectionRatio >= 0.4) setStarted(true);
            }
        }, { threshold: [0, 0.4] });
        obs.observe(el);
        return () => obs.disconnect();
    }, []);

    // Sequential reveal (~700 ms cadence, ~4 s total), stat values last — then
    // the card is at rest. Reduced motion: full final state immediately.
    useEffect(() => {
        if (reduced) {
            setVisibleRows(steps.length);
            setShowStats(true);
            return;
        }
        if (!started) return;
        const timers: ReturnType<typeof setTimeout>[] = [];
        steps.forEach((_, i) => {
            timers.push(setTimeout(() => setVisibleRows(i + 1), (i + 1) * ROW_CADENCE_MS));
        });
        timers.push(setTimeout(() => setShowStats(true), (steps.length + 1) * ROW_CADENCE_MS));
        return () => timers.forEach(clearTimeout);
    }, [started, reduced, steps.length]);

    const pulsing = !reduced && onScreen;

    return (
        <div
            ref={rootRef}
            aria-hidden="true"
            className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] backdrop-blur-md overflow-hidden select-none cursor-default shadow-[0_10px_40px_rgba(0,0,0,0.08)] dark:shadow-[0_0_50px_rgba(0,229,255,0.08)]"
        >
            {/* App bar */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 px-4 md:px-5 py-3 border-b border-[var(--card-border)] bg-black/[0.02] dark:bg-white/[0.03]">
                <span className="flex items-center gap-2 min-w-0">
                    <svg className="shrink-0 text-[var(--muted-foreground)]" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <path d="M14 2v6h6" />
                    </svg>
                    <span className="text-[12px] font-semibold text-[var(--foreground)] whitespace-nowrap">{appTitle}</span>
                </span>
                <span
                    className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-medium text-amber-700 dark:text-amber-400 whitespace-nowrap"
                    style={{ animation: pulsing ? 'auditPillPulse 2s ease-in-out infinite' : 'none' }}
                >
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 dark:bg-amber-400 shrink-0"></span>
                    {statePill}
                </span>
            </div>

            {/* Connected-systems chip row */}
            <div className="flex flex-wrap items-center gap-1.5 px-4 md:px-5 py-2 border-b border-[var(--card-border)]">
                <span className="text-[10px] text-[var(--muted-foreground)] mr-0.5">{connectedLabel}</span>
                {chips.map((chip) => (
                    <span key={chip} className="rounded-full border border-[var(--card-border)] bg-black/[0.03] dark:bg-white/[0.04] px-2 py-0.5 text-[10px] leading-4 text-[var(--muted-foreground)] whitespace-nowrap">
                        {chip}
                    </span>
                ))}
            </div>

            {/* Main zone: timeline + stats rail */}
            <div className="flex flex-col lg:flex-row">
                <div className="lg:w-[70%] px-4 md:px-5 py-4 flex flex-col gap-2.5">
                    {steps.map((step, i) => {
                        const isEscalated = i === ESCALATION_INDEX;
                        const isPending = i === PENDING_INDEX;
                        const variant = isPending ? 'pending' : isEscalated ? 'escalated' : 'done';
                        const isVisible = i < visibleRows;
                        return (
                            <div
                                key={i}
                                className={[
                                    'flex items-start gap-2.5 py-1',
                                    isEscalated
                                        ? 'border-l-2 border-amber-500 dark:border-amber-400 bg-amber-500/[0.07] rounded-r-md -ml-0.5 pl-2'
                                        : 'pl-2',
                                    reduced ? '' : 'transition-all duration-500 ease-out',
                                    isVisible
                                        ? (isPending ? 'opacity-50 translate-y-0' : 'opacity-100 translate-y-0')
                                        : 'opacity-0 translate-y-2',
                                ].join(' ')}
                            >
                                <span className="font-mono text-[10px] tabular-nums text-[var(--muted-foreground)] w-[52px] shrink-0 pt-0.5">{step.time || ''}</span>
                                <span className="shrink-0 pt-0.5"><StepIcon variant={variant} /></span>
                                <span className="min-w-0">
                                    <span className={`block text-[13px] leading-snug ${isEscalated ? 'font-semibold text-amber-700 dark:text-amber-300' : 'text-[var(--foreground)]'}`}>
                                        {step.title}
                                    </span>
                                    {step.detail && (
                                        <span className="block text-[11px] leading-snug text-[var(--muted-foreground)] mt-0.5">{step.detail}</span>
                                    )}
                                </span>
                            </div>
                        );
                    })}
                </div>

                <div className="lg:w-[30%] border-t lg:border-t-0 lg:border-l border-[var(--card-border)] px-4 md:px-5 py-4 flex flex-col gap-3">
                    <div className="flex flex-row lg:flex-col gap-2.5">
                        {stats.map((stat, i) => (
                            <div key={i} className="flex-1 lg:flex-none rounded-lg border border-[var(--card-border)] bg-black/[0.02] dark:bg-white/[0.02] px-3 py-2.5">
                                <div className={`text-xl font-extrabold tracking-tight text-[var(--foreground)] ${reduced ? '' : 'transition-opacity duration-700'} ${showStats ? 'opacity-100' : 'opacity-0'}`}>
                                    {stat.value}
                                </div>
                                <div className="text-[10px] leading-tight text-[var(--muted-foreground)] mt-0.5">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                    <span className="self-start rounded border border-[var(--card-border)] px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-[var(--muted-foreground)]">
                        {simulatedTag}
                    </span>
                </div>
            </div>

            {/* Bottom caption — plain muted text, deliberately not link-styled */}
            <div className="px-4 md:px-5 py-3 border-t border-[var(--card-border)] text-center text-[11px] text-[var(--muted-foreground)]">
                {caption}
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes auditPillPulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.55; }
                }
            `}} />
        </div>
    );
};

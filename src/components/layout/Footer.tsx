'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export const Footer = ({ lang, dict }: { lang: string, dict: any }) => {
    const [mounted, setMounted] = useState(false);
    const { resolvedTheme } = useTheme();

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <footer className="border-t border-[var(--card-border)] bg-[var(--background)] pt-20 pb-10 relative overflow-hidden">
            {/* Subtle background glow */}
            <div className="absolute top-0 left-1/2 w-full h-px -translate-x-1/2 bg-gradient-to-r from-transparent via-[var(--primary)] to-transparent opacity-20"></div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    {/* Brand Column */}
                    <div className="col-span-1">
                        <Link href={`/${lang}`} className="relative w-[120px] h-[48px] flex-shrink-0 block mb-6 transition-transform hover:scale-105">
                            <Image
                                src={mounted ? (resolvedTheme === 'dark' ? '/logo_dark.webp' : '/logo_light.webp') : '/logo_light.webp'}
                                alt="EuHub AI"
                                fill
                                sizes="120px"
                                style={{ objectFit: 'contain' }}
                            />
                        </Link>
                        <p className="text-[var(--muted-foreground)] text-sm leading-relaxed max-w-sm">
                            {dict.footer?.tagline || "We engineer and deploy agentic AI systems that eliminate operational bottlenecks for Central European enterprises."}
                        </p>
                    </div>

                    {/* Solutions Column */}
                    <div>
                        <h4 className="font-bold mb-6 text-lg tracking-wide">{dict.footer?.solutions || 'Solutions'}</h4>
                        <ul className="space-y-3 text-sm text-[var(--muted-foreground)]">
                            <li><Link href={`/${lang}#diagnostic`} className="hover:text-[var(--primary)] transition-colors">{dict.nav?.diagnostic || 'The Diagnostic Audit'}</Link></li>
                            <li><Link href={`/${lang}#engineering`} className="hover:text-[var(--primary)] transition-colors">{dict.nav?.engineering || 'Bespoke Engineering'}</Link></li>
                            <li><Link href={`/${lang}#capabilities`} className="hover:text-[var(--primary)] transition-colors">{dict.nav?.capabilities || 'AI Capabilities'}</Link></li>
                        </ul>
                    </div>

                    {/* Company Column */}
                    <div>
                        <h4 className="font-bold mb-6 text-lg tracking-wide">{dict.footer?.company || 'Company'}</h4>
                        <ul className="space-y-3 text-sm text-[var(--muted-foreground)]">
                            <li><Link href={`/${lang}#team`} className="hover:text-[var(--primary)] transition-colors">{dict.nav?.team || 'Leadership & Team'}</Link></li>
                            <li><Link href={`/${lang}#contact`} className="hover:text-[var(--primary)] transition-colors">{dict.nav?.contact || 'Initiate Consultation'}</Link></li>
                            <li><Link href={`/${lang}/ai-act`} className="hover:text-[var(--primary)] transition-colors">{dict.footer?.aiAct || 'EU AI Act Readiness'}</Link></li>
                            <li><Link href={`/${lang}/data-residency`} className="hover:text-[var(--primary)] transition-colors">{dict.footer?.dataResidency || 'Data Residency & GDPR'}</Link></li>
                            <li><Link href={`/${lang}/portability`} className="hover:text-[var(--primary)] transition-colors">{dict.footer?.portability || 'No Lock-in & Portability'}</Link></li>
                        </ul>
                    </div>

                    {/* Contact Column */}
                    <div>
                        <h4 className="font-bold mb-4">{dict.nav?.contact || 'Contact'}</h4>
                        <ul className="space-y-2 text-[var(--muted-foreground)]">
                            <li>974 01, Banská Bystrica, Slovakia</li>
                            <li><a href="mailto:hello@euhub-ai.com" className="hover:text-[var(--primary)]">hello@euhub-ai.com</a></li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar: Copyright & GDPR */}
                <div className="border-t border-[var(--card-border)] pt-8 flex flex-col md:flex-row justify-between items-center gap-6 text-xs text-[var(--muted-foreground)]">
                    <p>&copy; {new Date().getFullYear()} EUHub-AI. {dict.footer?.rights || 'All rights reserved.'}</p>
                    <div className="flex flex-wrap justify-center gap-6">
                        <Link href={`/${lang}/privacy`} className="hover:text-[var(--foreground)] transition-colors">{dict.footer?.privacy || 'Privacy Policy'}</Link>
                        <Link href={`/${lang}/terms`} className="hover:text-[var(--foreground)] transition-colors">{dict.footer?.terms || 'Terms of Service'}</Link>
                        <Link href={`/${lang}/cookie`} className="hover:text-[var(--foreground)] transition-colors">{dict.footer?.cookies || 'Cookie Policy'}</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

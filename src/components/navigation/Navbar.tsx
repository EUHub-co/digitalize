'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { ThemeToggle } from './ThemeToggle';
import { LanguageSwitcher } from './LanguageSwitcher';

export const Navbar = ({ lang, dict }: { lang: string, dict: any }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const { resolvedTheme } = useTheme();

    const toggleMenu = () => setIsOpen(!isOpen);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Close the mobile menu on Escape (WCAG 2.1.2 / keyboard operability)
    useEffect(() => {
        if (!isOpen) return;
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setIsOpen(false); };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [isOpen]);

    return (
        <header className="fixed top-0 left-0 right-0 z-50">
            {/* Utility bar — stays visible at every breakpoint (language/theme controls
                must remain reachable without opening the hamburger menu); only the
                trust-line text collapses away on narrow screens. */}
            <div className="glass border-b border-[var(--card-border)]">
                <div className="container mx-auto px-4 h-[var(--header-utility-height)] flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.12em]">
                    <span className="hidden sm:inline text-[var(--muted-foreground)]">
                        {dict.nav?.trustLine || 'Strategic AI implementation partner · Central Europe'}
                    </span>
                    <div className="flex items-center gap-3 ml-auto">
                        <LanguageSwitcher lang={lang} />
                        <ThemeToggle />
                    </div>
                </div>
            </div>

            {/* Nav header */}
            <nav className="glass border-b border-[var(--card-border)] backdrop-blur-md">
                <div className="container mx-auto px-4 h-[var(--header-height)] grid grid-cols-[1fr_auto_1fr] items-center gap-4">
                    {/* Logo */}
                    <Link href={`/${lang}`} className="flex items-center gap-2.5 justify-self-start transition-transform hover:scale-105">
                        <span aria-hidden="true" className="inline-block h-9 w-1 shrink-0 rounded-full bg-gradient-to-b from-[var(--primary)] to-[var(--secondary)]"></span>
                        <span className="relative w-[120px] h-[48px] flex-shrink-0 block">
                            <Image
                                src={mounted ? (resolvedTheme === 'dark' ? '/logo_dark.webp' : '/logo_light.webp') : '/logo_light.webp'}
                                alt="EuHub AI"
                                fill
                                sizes="120px"
                                style={{ objectFit: 'contain' }}
                                priority
                            />
                        </span>
                    </Link>

                    {/* Desktop Nav Links (centered) */}
                    <div className="hidden md:flex items-center gap-8 justify-self-center">
                        <Link href={`/${lang}#diagnostic`} className="text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors tracking-wide">
                            {dict.nav?.diagnostic || 'The Diagnostic'}
                        </Link>
                        <Link href={`/${lang}#engineering`} className="text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors tracking-wide">
                            {dict.nav?.engineering || 'Bespoke Engineering'}
                        </Link>
                        <Link href={`/${lang}#capabilities`} className="text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors tracking-wide">
                            {dict.nav?.capabilities || 'Capabilities'}
                        </Link>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-4 justify-self-end">
                        <Link href={`/${lang}#contact`} className="hidden md:inline-flex btn btn-primary text-sm py-2 w-[190px] justify-center">
                            {dict.nav?.contact || 'Initiate Audit'}
                        </Link>

                        {/* Mobile Menu Button */}
                        <button className="md:hidden p-2 text-[var(--foreground)]" onClick={toggleMenu} aria-label="Toggle menu" aria-expanded={isOpen} aria-controls="mobile-menu">
                            <div className={`w-6 h-0.5 bg-current mb-1.5 transition-all ${isOpen ? 'rotate-45 translate-y-2' : ''}`}></div>
                            <div className={`w-6 h-0.5 bg-current mb-1.5 transition-all ${isOpen ? 'opacity-0' : ''}`}></div>
                            <div className={`w-6 h-0.5 bg-current transition-all ${isOpen ? '-rotate-45 -translate-y-2' : ''}`}></div>
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile Menu Dropdown */}
            {isOpen && (
                <div id="mobile-menu" className="md:hidden absolute top-full left-0 w-full glass border-b border-[var(--card-border)] p-6 shadow-2xl">
                    <div className="flex flex-col gap-6 text-center">
                        <Link href={`/${lang}#diagnostic`} onClick={toggleMenu} className="text-lg font-medium text-[var(--muted-foreground)] hover:text-[var(--primary)]">
                            {dict.nav?.diagnostic || 'The Diagnostic'}
                        </Link>
                        <Link href={`/${lang}#engineering`} onClick={toggleMenu} className="text-lg font-medium text-[var(--muted-foreground)] hover:text-[var(--primary)]">
                            {dict.nav?.engineering || 'Bespoke Engineering'}
                        </Link>
                        <Link href={`/${lang}#capabilities`} onClick={toggleMenu} className="text-lg font-medium text-[var(--muted-foreground)] hover:text-[var(--primary)]">
                            {dict.nav?.capabilities || 'Capabilities'}
                        </Link>
                        <Link href={`/${lang}#contact`} onClick={toggleMenu} className="btn btn-primary mx-auto w-[190px] text-center inline-flex justify-center">
                            {dict.nav?.contact || 'Initiate Audit'}
                        </Link>
                    </div>
                </div>
            )}
        </header>
    );
};

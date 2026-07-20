"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { ThemeToggle } from '../navigation/ThemeToggle';
import { LanguageSwitcher } from '../navigation/LanguageSwitcher';
import styles from './Header.module.css';

export default function Header({ dict, lang }: { dict: any, lang: string }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const { resolvedTheme } = useTheme();

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    // Avoid hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    // Close the mobile menu on Escape (keyboard operability)
    useEffect(() => {
        if (!isMenuOpen) return;
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setIsMenuOpen(false); };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [isMenuOpen]);

    return (
        <header className={`${styles.header} glass`}>
            <div className={`container ${styles.container}`}>
                <Link href={`/${lang}`} className={styles.logo}>
                    <Image
                        src={mounted ? (resolvedTheme === 'dark' ? '/logo_dark.webp' : '/logo_light.webp') : '/logo_light.webp'}
                        alt="EUHub AI"
                        fill
                        sizes="140px"
                        style={{ objectFit: 'contain' }}
                        priority
                    />
                </Link>

                <button
                    className={`${styles.hamburger} ${isMenuOpen ? styles.active : ''}`}
                    onClick={toggleMenu}
                    aria-label="Toggle menu"
                    aria-expanded={isMenuOpen}
                    aria-controls="mobile-nav"
                >
                    <span className={styles.bar}></span>
                    <span className={styles.bar}></span>
                    <span className={styles.bar}></span>
                </button>

                <nav id="mobile-nav" className={`${styles.nav} ${isMenuOpen ? styles.navOpen : ''}`}>
                    <Link href={`/${lang}#capabilities`} className={styles.link} onClick={() => setIsMenuOpen(false)}>Services</Link>
                    <Link href={`/${lang}#team`} className={styles.link} onClick={() => setIsMenuOpen(false)}>About</Link>
                    <Link href={`/${lang}#contact`} className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }} onClick={() => setIsMenuOpen(false)}>
                        Contact
                    </Link>

                    <div className={styles.mobileLang}>
                        <LanguageSwitcher lang={lang} />
                    </div>
                </nav>

                <div className={styles.desktopLang}>
                    <div className={styles.controls}>
                        <ThemeToggle />
                        <LanguageSwitcher lang={lang} />
                    </div>
                </div>
            </div>
        </header>
    );
}

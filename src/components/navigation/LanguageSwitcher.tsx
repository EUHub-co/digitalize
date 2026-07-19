'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './LanguageSwitcher.module.css';

const languages = [
    { code: 'en', label: 'EN', name: 'English' },
    { code: 'sk', label: 'SK', name: 'Slovenčina' },
    { code: 'de', label: 'DE', name: 'Deutsch' },
];

export const LanguageSwitcher = ({ lang }: { lang: string }) => {
    const pathname = usePathname();

    // Helper to switch language in the current URL path
    const switchLang = (newLang: string) => {
        if (!pathname) return `/${newLang}`;
        const segments = pathname.split('/');
        segments[1] = newLang; // Replace the locale segment
        return segments.join('/');
    };

    return (
        <div className={styles.group} role="group" aria-label="Language">
            {languages.map((language) => (
                <Link
                    key={language.code}
                    href={switchLang(language.code)}
                    className={styles.option}
                    aria-current={language.code === lang ? 'true' : undefined}
                    title={language.name}
                    onClick={() => {
                        try {
                            localStorage.setItem('i18n-choice', language.code);
                        } catch {
                            // localStorage can be unavailable (private mode, policy) — non-fatal.
                        }
                    }}
                >
                    {language.label}
                </Link>
            ))}
        </div>
    );
};

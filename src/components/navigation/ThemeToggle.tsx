"use client";

import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";
import { Monitor, Sun, Moon } from "lucide-react";
import styles from "./ThemeToggle.module.css";

// Labels are plain English literals (no dict lookup) — this repo has no
// a11y content bundle to source SK/DE strings from, matching the sibling
// EUHUB sites' ThemeSelector, which made the same call.
const options = [
    { mode: "system", label: "Use device appearance", Icon: Monitor },
    { mode: "light", label: "Use light appearance", Icon: Sun },
    { mode: "dark", label: "Use dark appearance", Icon: Moon },
] as const;

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const groupRef = useRef<HTMLDivElement>(null);

    // Avoid hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <div className={styles.placeholder} />;
    }

    const activeIndex = options.findIndex(({ mode }) => (mode === "system" ? theme === "system" : theme === mode));
    const checkedIndex = activeIndex === -1 ? 0 : activeIndex;

    // ARIA APG radiogroup pattern: roving tabindex (only the checked option
    // is tab-stoppable) plus Arrow-key navigation between options.
    const selectByIndex = (index: number) => {
        const wrapped = (index + options.length) % options.length;
        setTheme(options[wrapped].mode);
        groupRef.current?.querySelectorAll<HTMLButtonElement>('[role="radio"]')[wrapped]?.focus();
    };

    const onKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "ArrowRight" || e.key === "ArrowDown") {
            e.preventDefault();
            selectByIndex(checkedIndex + 1);
        } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
            e.preventDefault();
            selectByIndex(checkedIndex - 1);
        }
    };

    return (
        <div ref={groupRef} className={styles.group} role="radiogroup" aria-label="Appearance" onKeyDown={onKeyDown}>
            {options.map(({ mode, label, Icon }, index) => {
                const checked = index === checkedIndex;
                return (
                    <button
                        key={mode}
                        type="button"
                        role="radio"
                        aria-checked={checked}
                        aria-label={label}
                        title={label}
                        tabIndex={checked ? 0 : -1}
                        className={styles.option}
                        onClick={() => setTheme(mode)}
                    >
                        <Icon className={styles.icon} />
                    </button>
                );
            })}
        </div>
    );
}

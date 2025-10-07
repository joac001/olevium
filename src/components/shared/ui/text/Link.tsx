'use client';

import type { KeyboardEvent } from 'react';
import Box from '@/components/shared/ui/content/Box';

export interface LinkProps {
    text: string;
    url: string;
    newWindow?: boolean;
    icon?: string;
}

export default function Link({
    icon,
    text,
    url,
    newWindow = true,
}: LinkProps) {
    const normalizeUrl = (u: string) =>
        u.startsWith('http://') || u.startsWith('https://') ? u : `https://${u}`;

    const handleClick = () => {
        if (!url) return;
        const href = normalizeUrl(url);
        if (newWindow) {
            window.open(href, '_blank', 'noopener,noreferrer');
        } else {
            window.location.href = href;
        }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
        }
    };

    return (
        <Box
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            tabIndex={0}
            role="button"
            aria-label={`Open link to ${text}`}
            className={[
                'relative flex items-center w-fit gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-lg md:text-lg text-pretty select-none',
                'cursor-pointer transition-all duration-100 ease-in-out group',
                // chip + foco accesible
                'px-1 focus:outline-none focus:ring-2 focus:ring-[var(--interactive-ring)]',

            ].join(' ')}
        >
            <Box className='absolute bg-[var(--color-primary-soft)] opacity-0 w-full h-4 skew-x-[-15deg] hover:opacity-30 transition-all duration-100 ease-out origin-left' />
            {icon && <i className={`${icon} w-5 h-fit text-center`} aria-hidden />}
            <Box className="underline md:no-underline font-medium transition-all duration-200 ease-in-out">
                {text}
            </Box>
        </Box>
    );
}

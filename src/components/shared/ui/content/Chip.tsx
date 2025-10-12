'use client';

import clsx from 'clsx';
import { ColorKey } from "@/types/ColorKey";
interface ChipProps {
    text?: string;
    color?: ColorKey;
    icon?: string; // opcional: "fas fa-check"
    title?: string;
}

export default function Chip({
    text,
    color = 'neutral',
    icon,
    title,
}: ChipProps) {
    return (
        <span
            data-banner={color}
            title={title}
            className={clsx(
                'inline-flex items-center justify-center select-none rounded-full',
                text
                    ? 'h-6 md:h-7 px-2 md:px-3 text-xs md:text-sm gap-1.5'
                    : 'h-3 w-3 p-0 border-2 border-[color:var(--bn-ring)]',
                `bg-[var(--bn-surface)] text-[color:var(--bn-foreground)]`,
                'shadow-[0_6px_14px_-4px_var(--chip-shadow)]'
            )}
        >
            {icon && text && <i className={icon} aria-hidden />}
            {text ? text : null}
        </span>
    );
}

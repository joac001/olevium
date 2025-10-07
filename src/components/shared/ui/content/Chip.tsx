'use client';

import clsx from 'clsx';

type ColorKey =
    | 'primary'   // naranja (brand)
    | 'accent'    // azul
    | 'success'
    | 'warning'
    | 'danger'
    | 'info'
    | 'neutral';

interface ChipProps {
    text?: string;
    color?: ColorKey;
    hasShadow?: boolean;
    icon?: string; // opcional: "fas fa-check"
    title?: string;
}

export default function Chip({
    text,
    color = 'neutral',
    hasShadow = false,
    icon,
    title,
}: ChipProps) {
    const hasText = Boolean(text);
    return (
        <span
            data-banner={color}
            title={title}
            className={clsx(
                // layout
                'inline-flex items-center justify-center select-none rounded-full',
                hasText
                    ? 'h-6 md:h-7 px-2 md:px-3 text-xs md:text-sm gap-1.5'
                    : 'h-3 w-3 p-0',
                // skin vía CSS vars
                `${hasText ? 'bg-[var(--bn-surface)]' : 'bg-[var(--bn-border)]'} text-[color:var(--bn-foreground)] ring-1 ring-[var(--bn-border)]`,
                // sombra opcional
                hasShadow && 'shadow-[0_6px_14px_-4px_var(--chip-shadow)]'
            )}
        >
            {icon && hasText && <i className={icon} aria-hidden />}
            {hasText ? text : null}
        </span>
    );
}

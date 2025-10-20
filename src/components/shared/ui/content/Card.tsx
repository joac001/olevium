import type { CSSProperties, ReactNode } from "react";
import clsx from "clsx";

import Box from "@/components/shared/ui/content/Box";
import ActionButton, { type ActionButtonProps } from "@/components/shared/ui/buttons/ActionButton";
import Typography from "@/components/shared/ui/text/Typography";
import type { ColorKey } from "@/types/ColorKey";

interface CardProps {
    title?: string;
    subtitle?: string;
    eyebrow?: string;
    tone?: ColorKey;
    leadingIcon?: ReactNode;
    actions?: ActionButtonProps[];
    children: ReactNode;
    size?: "fit" | "full";
    className?: string;
}

export default function Card({
    title,
    subtitle,
    eyebrow,
    tone = "neutral",
    leadingIcon,
    actions,
    children,
    size = "full",
    className,
}: CardProps) {
    const panelStyle: CSSProperties = {
        backgroundColor: "var(--card-surface-base)",
        // backgroundImage: "var(--card-surface)",
        boxShadow: "var(--card-shadow, 0 24px 54px -28px rgba(4, 12, 32, 0.65))",
        borderColor: "var(--card-border, rgba(255,255,255,0.05))",
    };

    return (
        <Box
            data-card={tone}
            className={clsx(
                "group relative overflow-hidden rounded-3xl border bg-transparent text-[color:var(--text-primary)] transition-transform duration-200 ease-out",
                size === "full" ? "h-full w-full" : "w-fit",
                className,
            )}
            style={panelStyle}
        >
            <span
                aria-hidden
                className="pointer-events-none absolute inset-px rounded-[inherit] border border-[color:var(--card-border,rgba(255,255,255,0.05))] opacity-75"
            />
            <div className="relative z-[1] flex h-full flex-col gap-6 p-4 md:p-6 lg:p-7">
                {(leadingIcon || eyebrow || title || subtitle || actions?.length) && (
                    <header className="flex flex-wrap items-start justify-between gap-4">
                        <div className="flex flex-1 items-start gap-4">
                            {leadingIcon && (
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[color:var(--card-icon-bg)] text-[color:var(--card-icon-fg)] shadow-[0_18px_34px_-12px_var(--card-icon-shadow)]">
                                    {leadingIcon}
                                </div>
                            )}
                            <div className="flex min-w-0 flex-col gap-2">
                                {eyebrow && (
                                    <span className="text-[0.68rem] uppercase tracking-[0.28em] text-[color:var(--card-eyebrow)]">
                                        {eyebrow}
                                    </span>
                                )}
                                {title && (
                                    <Typography variant="h2" className="text-[color:var(--card-title)]">
                                        {title}
                                    </Typography>
                                )}
                                {subtitle && (
                                    <Typography variant="body" className="text-[color:var(--card-subtitle)]">
                                        {subtitle}
                                    </Typography>
                                )}
                            </div>
                        </div>
                        {actions?.length ? (
                            <div className="flex flex-col-reverse items-stretch justify-end gap-2 sm:flex-row sm:items-center">
                                {actions.map((action, index) => (
                                    <ActionButton
                                        key={`${action.icon}-${action.text ?? index}`}
                                        {...action}
                                        className={clsx("justify-center", action.className)}
                                    />
                                ))}
                            </div>
                        ) : null}
                    </header>
                )}

                <div className="flex flex-1 flex-col gap-4">
                    {children}
                </div>
            </div>
        </Box>
    );
}

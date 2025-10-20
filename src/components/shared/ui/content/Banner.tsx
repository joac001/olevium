import type { CSSProperties } from "react";
import clsx from "clsx";

import AccentSurface from "@/components/shared/ui/content/AccentSurface";
import Typography from "@/components/shared/ui/text/Typography";
import { ColorKey } from "@/types/ColorKey";

export interface BannerProps {
    icon: string;
    color: ColorKey;
    title: string;
    description: string;
}

export default function Banner({ icon, color, title, description }: BannerProps) {
    const bannerStyle: CSSProperties = {
        borderColor: "color-mix(in srgb, var(--bn-ring) 45%, transparent 55%)",
    };
    const iconStyle: CSSProperties = {
        backgroundImage: "linear-gradient(135deg, var(--bn-icon-from) 0%, var(--bn-icon-to) 100%)",
    };

    return (
        <AccentSurface
            tone={color}
            className={clsx(
                "flex w-full flex-col gap-3 rounded-[var(--radius-lg)] border p-3 shadow-[var(--elevation-low)] backdrop-blur-md sm:flex-row sm:items-center sm:gap-4 md:p-4",
            )}
            style={bannerStyle}
        >
            {/* Icono en pastilla */}
            <div
                className={clsx(
                    "flex h-10 w-10 items-center justify-center self-start rounded-[var(--radius-sm)] text-base text-[color:var(--bn-text)] shadow-[0_16px_32px_-18px_rgba(5,20,35,0.65)] sm:h-11 sm:w-11 sm:text-lg",
                )}
                style={iconStyle}
            >
                <i className={icon} />
            </div>

            {/* Texto */}
            <div className="flex flex-1 flex-col gap-1 text-left sm:gap-1.5">
                <Typography variant="h2" className="text-[color:var(--bn-text)] leading-tight">
                    {title}
                </Typography>
                <Typography variant="body" className="text-[color:var(--bn-text)] opacity-90">
                    {description}
                </Typography>
            </div>
        </AccentSurface>
    );
}

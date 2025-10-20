import type { CSSProperties, ReactNode } from "react";
import clsx from "clsx";

import Box from "@/components/shared/ui/content/Box";
import type { ColorKey } from "@/types/ColorKey";

interface AccentSurfaceProps {
    tone?: ColorKey;
    className?: string;
    children: ReactNode;
    as?: "div" | "span";
    style?: CSSProperties;
}

export default function AccentSurface({
    tone = "neutral",
    className,
    children,
    as = "div",
    style,
}: AccentSurfaceProps) {
    const Component = as === "span" ? "span" : "div";
    const baseStyle: CSSProperties = {
        backgroundColor: "var(--bn-surface)",
        borderColor: "color-mix(in srgb, var(--bn-ring) 45%, transparent 55%)",
        ...style,
    };

    return (
        <Box
            as={Component}
            data-banner={tone}
            className={clsx(
                "relative text-[color:var(--bn-text)]",
                className,
            )}
            style={baseStyle}
        >
            {children}
        </Box>
    );
}

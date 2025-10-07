'use client';

import { KeyboardEvent } from "react";
import Box from "@/components/shared/ui/content/Box";
import Tooltip from "@/components/shared/ui/text/Tooltip";

type ColorKey =
    | "primary"
    | "secondary" // alias -> accent
    | "accent"
    | "success"
    | "warning"
    | "error"     // alias -> danger
    | "danger"
    | "info"
    | "neutral";

export interface ActionButtonProps {
    icon: string;           // ej: "fas fa-plus"
    color?: ColorKey;       // default: accent (azul)
    text?: string;          // etiqueta (se oculta en mobile)
    onClick?: () => void;
    tooltip?: string;       // tooltip explícito (desktop); en mobile se usa el texto
    className?: string;     // opcional extra classes
}

const normalize = (c: ColorKey = "accent") =>
    c === "secondary" ? "accent" : c === "error" ? "danger" : c;

function ActionCore({
    icon,
    text,
    onClick,
    variant,
    className = "",
}: {
    icon: string;
    text?: string;
    onClick?: () => void;
    variant: Exclude<ColorKey, "secondary" | "error">;
    className?: string;
}) {
    const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onClick?.();
        }
    };

    return (
        <Box
            role="button"
            tabIndex={0}
            aria-label={text || "Acción"}
            data-variant={variant}
            onClick={onClick}
            onKeyDown={handleKeyDown}
            className={[
                "flex items-center w-fit h-fit min-w-0 rounded-full",
                "backdrop-blur-md",
                // colores vía variables de botón
                "bg-[var(--btn-bg)] hover:bg-[var(--btn-hover)] text-[color:var(--btn-foreground,var(--text-primary))]",
                "bg-[image:var(--btn-bg-gradient)]",
                // sizing
                "py-1 px-2 md:py-2 md:px-4",
                // efectos
                "transition-transform duration-100 ease-in-out hover:scale-105",
                className,
            ].join(" ")}
        >
            <i className={`${icon} text-md md:text-lg m-1`} aria-hidden="true" />
            {text && <Box className="hidden md:inline">{text}</Box>}
        </Box>
    );
}

export default function ActionButton({
    icon,
    color = "accent",
    text,
    onClick,
    tooltip,
    className,
}: ActionButtonProps) {
    const variant = normalize(color);

    const button = (
        <ActionCore
            icon={icon}
            text={text}
            onClick={onClick}
            variant={variant}
            className={className}
        />
    );

    // Si hay tooltip explícito, envolvemos en desktop
    if (tooltip) {
        return (
            <Tooltip content={tooltip} placement="left">
                {button}
            </Tooltip>
        );
    }

    // Sin tooltip explícito: en mobile mostramos tooltip con el texto
    return (
        <>
            <Box className="md:hidden">
                <Tooltip content={text || ""} placement="left">
                    {button}
                </Tooltip>
            </Box>
            <Box className="hidden md:block cursor-pointer">{button}</Box>
        </>
    );
}

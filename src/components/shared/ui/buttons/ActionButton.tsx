"use client";

import clsx from "clsx";

import Box from "@/components/shared/ui/content/Box";
import Tooltip from "@/components/shared/ui/text/Tooltip";
import { ColorKey } from "@/types/ColorKey";
import ButtonBase from "./ButtonBase";
export interface ActionButtonProps {
    icon: string;           // ej: "fas fa-plus"
    type?: ColorKey;       // default: accent (azul)
    text?: string;          // etiqueta (se oculta en mobile)
    onClick?: () => void;
    tooltip?: string;       // tooltip explícito (desktop); en mobile se usa el texto
    className?: string;     // opcional extra classes
    disabled?: boolean;
}

function ActionCore({
    icon,
    text,
    onClick,
    variant,
    className = "",
    disabled = false,
}: {
    icon: string;
    text?: string;
    onClick?: () => void;
    variant: ColorKey;
    className?: string;
    disabled?: boolean;
}) {
    return (
        <ButtonBase
            variant={variant}
            htmlType="button"
            onClick={onClick}
            disabled={disabled}
            className={clsx("min-w-0 px-3 py-2 text-sm font-medium tracking-tight md:px-3.5 md:py-2.5", className)}
            leadingIcon={<i className={clsx(icon, "text-base md:text-lg")} aria-hidden="true" />}
            ariaLabel={text || "Acción"}
        >
            {text && <span className="hidden whitespace-nowrap text-sm md:inline">{text}</span>}
        </ButtonBase>
    );
}

export default function ActionButton({
    icon,
    type = "accent",
    text,
    onClick,
    tooltip,
    className,
    disabled,
}: ActionButtonProps) {
    const button = (
        <ActionCore
            icon={icon}
            text={text}
            onClick={onClick}
            variant={type}
            className={className}
            disabled={disabled}
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
            <Box className="hidden md:block">{button}</Box>
        </>
    );
}

import Typography from "@/components/shared/ui/text/Typography";
import Box from "@/components/shared/ui/content/Box";

type ColorKey =
    | "primary"   // naranja (brand)
    | "accent"    // azul
    | "success"
    | "warning"
    | "danger"
    | "info"
    | "neutral";

export interface BannerProps {
    icon: string;       // clase completa: "fas fa-info-circle"
    color: ColorKey;
    title: string;
    description: string;
}

export default function Banner({ icon, color, title, description }: BannerProps) {
    return (
        <Box
            data-banner={color}
            className={[
                "flex w-full items-center gap-4 my-2",
                "rounded-2xl p-2 md:p-3",
                // colores/estilos via variables
                "bg-gradient-to-b from-[var(--bn-surface)]/80 to-[var(--bn-surface)]/60 text-[color:var(--text-inverted)]",
                "shadow-[0_10px_25px_-5px_rgba(0,0,0,.12),_0_8px_10px_-6px_rgba(0,0,0,.12)]",
            ].join(" ")}
        >
            {/* Barra decorativa izquierda */}
            {/* <span
                aria-hidden
                className={[
                    "pointer-events-none absolute inset-y-3 left-2 w-1.5 rounded-full",
                    "bg-gradient-to-b from-[var(--bn-bar-from)] to-[var(--bn-bar-to)]",
                    "shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]",
                ].join(" ")}
            /> */}

            {/* Icono en pastilla */}
            <div
                className={[
                    "flex items-center justify-center ml-2",
                    "h-11 w-11 md:h-12 md:w-12 rounded-xl text-[color:var(--text-inverted)] ring-1 ring-[var(--border-soft)]",
                    "bg-gradient-to-br from-[var(--bn-icon-from)] to-[var(--bn-icon-to)] opacity-70",
                    "shadow-[0_8px_20px_rgba(0,0,0,0.12)]",
                ].join(" ")}
            >
                <i className={icon} />
            </div>

            {/* Texto */}
            <div className="flex flex-col text-left">
                <Typography variant="subtitle">{title}</Typography>
                <Typography variant="body">{description}</Typography>
            </div>
        </Box>
    );
}

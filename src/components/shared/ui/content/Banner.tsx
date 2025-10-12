import Typography from "@/components/shared/ui/text/Typography";
import Box from "@/components/shared/ui/content/Box";
import { ColorKey } from "@/types/ColorKey";
export interface BannerProps {
    icon: string;
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
                "bg-gradient-to-b from-[var(--bn-surface)]/80 to-[var(--bn-surface)]/60 text-[color:var(--bn-text))]",
                "shadow-[0_10px_25px_-5px_rgba(0,0,0,.12),_0_8px_10px_-6px_rgba(0,0,0,.12)]",
            ].join(" ")}
        >

            {/* Icono en pastilla */}
            <div
                className={[
                    "flex items-center justify-center ml-2",
                    "h-11 w-11 md:h-12 md:w-12 rounded-xl text-[color:var(--bn-text)]",
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

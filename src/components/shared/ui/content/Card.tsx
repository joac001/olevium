import type { CSSProperties, ReactNode } from "react";
import { ActionButtonProps } from "@/components/shared/ui/buttons/ActionButton";
import ActionButton from "@/components/shared/ui/buttons/ActionButton";
import Typography from "@/components/shared/ui/text/Typography";
import Box from "@/components/shared/ui/content/Box";

interface CardProps {
    title: string;
    subtitle?: string;
    actions?: ActionButtonProps[];
    children: ReactNode;
    size?: 'fit' | 'full';
}

export default function Card({ title, subtitle, actions, children, size = 'full' }: CardProps) {
    const glassStyle: CSSProperties = {
        backgroundImage: 'var(--card-glass)',
        backgroundColor: 'var(--surface-tint)',
        // backdropFilter: 'blur(var(--glass-blur, 22px))'
    };

    return (
        <Box
            className={`flex ${size === 'full' ? 'w-full h-full' : 'w-fit h-fit'} rounded-2xl p-2 md:p-3 lg:p-4 shadow-[0_25px_45px_rgba(12,31,26,0.35)] md:hover:scale-101 md:hover:shadow-[0_30px_55px_rgba(12,31,26,0.45)] transition-all duration-200 ease-in-out`}
            style={glassStyle}
        >
            <Box className="flex flex-col w-full justify-between">
                <Box className="flex flex-col">
                    <Typography variant='h2'>{title}</Typography>
                    {subtitle && <Typography variant='subtitle'>{subtitle}</Typography>}
                </Box>
                {/* Children */}
                <Box className="flex flex-col space-y-2 mt-2 w-full">
                    {children}
                </Box>
            </Box>
            <Box className="flex flex-col items-end gap-1">
                {actions &&
                    actions.map((action, index) =>
                        <ActionButton key={index} icon={action.icon} color={action.color} text={action.text} onClick={action.onClick} tooltip={action.tooltip} />
                    )
                }
            </Box>
        </Box>
    );
}

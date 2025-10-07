'use client';
import type { ReactNode } from "react";
import Box from "@/components/shared/ui/content/Box";

interface ContainerProps {
    children: ReactNode;
    className?: string;
}


export default function Container({ children, className = "" }: ContainerProps) {
    const classes = `${className} flex flex-1 h-full flex-col overflow-y-auto p-2 md:p-3 lg:p-6 gap-1`.trim();

    return (
        <Box className={classes}>
            {children}
        </Box>
    );
}

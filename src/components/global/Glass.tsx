import { Box, BoxProps } from "@mui/material";
import { SxProps, Theme } from "@mui/system";
import React from "react";

interface GlassProps extends BoxProps {
    children: React.ReactNode;
    sx?: SxProps<Theme>;
}

export default function Glass({ children, sx = {}, ...props }: GlassProps) {
    return (
        <Box
            {...props}
            sx={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                paddingX: 2,
                borderRadius: 4,
                position: "relative",
                color: 'prim.contrastText',
                backgroundColor: "glass.main",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                overflow: "hidden",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                boxShadow: `
          0 0 0 1px rgba(255, 255, 255, 0.03) inset,
          0 4px 30px rgba(0, 0, 0, 0.2)
        `,
                backgroundImage: `
          linear-gradient(to top left, rgba(255,255,255,0.07), rgba(255,255,255,0) 40%),
          linear-gradient(to bottom right, rgba(255,255,255,0.05), rgba(255,255,255,0) 70%)
        `,
                transition: "all 300ms ease-in-out",
                ...sx,
            }}
        >
            {children}
        </Box>
    );
}

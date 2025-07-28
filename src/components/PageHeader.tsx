import { Box, Typography } from "@mui/material";
import Image from "next/image";
import Menu from "@/components/Menu";

export default function PageHeader() {
    return (
        <Box
            sx={{
                display: "flex",
                alignItems: "center",
                width: "100%",
                paddingX: 2,
            }}
        >
            <Menu />
            <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, justifyContent: 'center', userSelect: 'none' }}>
                <Image width={40} height={54} src="/logo.svg" alt="Olevium" />
                <Typography variant="olevium" sx={{ color: 'prim.main', marginLeft: 2 }}>
                    Olevium
                </Typography>
            </Box>
        </ Box>
    );
}
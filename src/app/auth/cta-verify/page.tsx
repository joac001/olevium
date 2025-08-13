'use client';
import { Box, Container, Typography } from "@mui/material";
import Image from "next/image";
import useAuthStore from "@/stores/auth";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { AuthStoreType } from "@/types/store";

export default function CTAVerify() {

    const router = useRouter();

    const { loggedIn, registeredUserName, registeredUserEmail } = useAuthStore() as AuthStoreType;

    useEffect(() => {
        if (loggedIn) {
            router.push('/');
        }
        if (!registeredUserName || !registeredUserEmail) {
            router.push('/auth');
        }
    }, [loggedIn, router, registeredUserName, registeredUserEmail]);

    return (
        <Container sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'start', mt: 10, height: '100vh' }}>
            <Typography variant="title" color="prim.contrastText" mb={10}>{registeredUserName} Revisa la casilla de {registeredUserEmail}</Typography>
            <Typography variant="title2" color="prim.contrastText" mb={5}>Hemos enviado un email para verificar tu cuenta. En caso de no encontrarlo revisa spam</Typography>
            <Box sx={{ transform: 'rotate(-15deg)', opacity: 0.5, mb: 10, userSelect: 'none' }}>
                <Image alt="" src="/email.svg" width={200} height={200} />
            </Box>
        </Container>
    );
}
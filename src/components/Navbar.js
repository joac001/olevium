'use client';
import React, { useState } from "react";
import Link from "next/link";

import { Box, IconButton, Tooltip, Typography } from "@mui/material";

import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from '@mui/icons-material/Close';
import SpaceDashboardIcon from '@mui/icons-material/SpaceDashboard';
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';

const navLinks = [
    { label: "Inicio", icon: <SpaceDashboardIcon />, href: "/" },
    { label: "Mis movimientos", icon: <CurrencyExchangeIcon />, href: "/transactions" },
    { label: 'Mis cuentas', icon: <AccountBalanceIcon />, href: "/accounts" },
    { label: 'Preferencias', icon: <AccountCircleIcon />, href: "/preferences" },
];

export default function Navbar() {
    const [open, setOpen] = useState(false);

    // TODO: Make it so the Navbar is not visible on the auth page

    return (
        <Box sx={{
            position: "fixed",
            top: 0,
            left: 0,
            height: "100vh",
            width: open ? 200 : 64,
            bgcolor: "background.paper",
            boxShadow: 3,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            alignContent: "center",
            zIndex: 1200,
            transition: "all 0.5s",
            pr: 2,
            transitionTimingFunction: "ease-in-out",
        }}>
            <Box
                sx={{
                    alignItems: open ? "end" : "center",
                    pt: 2,
                }}
            >
                <IconButton
                    onClick={() => setOpen((prev) => !prev)}
                    sx={{ mb: 2, gap: 2, pr: 2, justifyContent: open ? "end" : "center" }}
                    size="large"
                >
                    {open ? <CloseIcon /> : <MenuIcon />}
                </IconButton>
                <Box sx={{ flex: 1, display: "flex", flexDirection: "column", width: "100%", gap: 2, }}>
                    {navLinks.map((link) => (
                        <Tooltip key={link.href} title={link.label} placement="right" disableHoverListener={open}>
                            <Link
                                href={link.href}
                                style={{ textDecoration: "none", color: "inherit" }}
                            >
                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 2,
                                        px: 2,
                                        py: 1.5,
                                        borderRadius: '0 10px 10px 0',
                                        transition: "background 0.2s",
                                        cursor: "pointer",
                                        '&:hover': { bgcolor: "primary.main", color: "primary.contrastText" },
                                    }}
                                >
                                    {link.icon}
                                    {open && (
                                        <Typography
                                            variant="navigation"
                                            style={{
                                                opacity: open ? 1 : 0,
                                                transition: 'opacity 1s',
                                                visibility: open ? 'visible' : 'hidden',
                                                textWrap: 'nowrap',
                                            }}
                                        >
                                            {link.label}
                                        </Typography>
                                    )}
                                </Box>
                            </Link>
                        </Tooltip>
                    ))}
                </Box>
            </Box>
            <Tooltip key='/logout' title='Cerrar sesion' placement="right" disableHoverListener={open}>
                <Link
                    href='/logout'
                    style={{ textDecoration: "none", color: "inherit" }}
                >
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 2,
                            px: 2,
                            py: 1.5,
                            mb: 4,
                            borderRadius: '0 10px 10px 0',
                            transition: "background 0.2s",
                            cursor: "pointer",
                            '&:hover': { bgcolor: "status.error", opacity: .7, color: "primary.contrastText" },
                        }}
                    >
                        <LogoutIcon />
                        <Typography
                            variant="navigation"
                            style={{
                                opacity: open ? 1 : 0,
                                transition: 'opacity 1s',
                                visibility: open ? 'visible' : 'hidden',
                                textWrap: 'nowrap',
                            }}
                        >
                            Cerrar sesion
                        </Typography>
                    </Box>
                </Link>
            </Tooltip>
        </Box>
    );
}
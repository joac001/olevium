'use client';
import React, { useState } from "react";
import Link from "next/link";

import { Box, IconButton, Tooltip } from "@mui/material";

import SpaceDashboardIcon from '@mui/icons-material/SpaceDashboard';
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from '@mui/icons-material/Close';

const navLinks = [
    { label: "Inicio", icon: <SpaceDashboardIcon />, href: "/" },
    { label: "Mis movimientos", icon: <CurrencyExchangeIcon />, href: "/transactions" },
    { label: 'Mis cuentas', icon: <AccountBalanceIcon />, href: "/accounts" },
    { label: 'Preferencias', icon: <AccountCircleIcon />, href: "/preferences" },
];

export default function Navbar() {
    const [open, setOpen] = useState(false);

    return (
        <Box
            sx={{
                position: "fixed",
                top: 0,
                left: 0,
                height: "100vh",
                width: open ? 200 : 64,
                bgcolor: "background.paper",
                boxShadow: 3,
                display: "flex",
                flexDirection: "column",
                alignItems: open ? "end" : "center",
                zIndex: 1200,
                transition: "width 0.2s",
                pt: 2,
            }}
        >
            <IconButton
                onClick={() => setOpen((prev) => !prev)}
                sx={{ mb: 2, justifySelf: "center" }}
                size="large"
            >
                {open ? <CloseIcon /> : <MenuIcon />}
            </IconButton>
            <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 2, pr: 2, width: "100%", }}>
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
                                    <span style={{ marginLeft: 12, fontWeight: 500 }}>{link.label}</span>
                                )}
                            </Box>
                        </Link>
                    </Tooltip>
                ))}
            </Box>
        </Box>
    );
}
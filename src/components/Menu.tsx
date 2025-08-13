'use client';
import { Link, Box } from '@mui/material';
import MenuOutlinedIcon from '@mui/icons-material/MenuOutlined';
import Glass from "@/components/global/Glass";
import withAuth from '@/hoc/auth';

import { useState, useRef, useEffect } from "react";

import menuOptions from "@/types/menu";


const Menu = () => {
    // Referencia al contenedor del menú para detectar clics fuera
    const menuRef = useRef<HTMLDivElement>(null);

    const [menuOpen, setMenuOpen] = useState<boolean>(false);

    const handleMenuToggle = () => {
        if (menuOpen) {
            setTimeout(() => {
                setMenuOpen(false);
            }, 100);
        } else {
            setMenuOpen(true);
        }
    };

    useEffect(() => {
        if (!menuOpen) return;
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                handleMenuToggle();
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [menuOpen]);

    return (
        <Box style={{ position: 'relative', display: 'inline-block' }}>
            <Glass
                sx={{ flexDirection: 'column', padding: 1, cursor: 'pointer', zIndex: 20 }}
                onClick={(e) => {
                    e.stopPropagation();
                    handleMenuToggle();
                }}
                aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
                tabIndex={0}
                role="button"
            >
                <MenuOutlinedIcon />
            </Glass>


            <Glass
                ref={menuRef}
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'start',
                    textWrap: 'nowrap',
                    paddingY: 2,
                    paddingX: 1,
                    gap: 1,
                    position: 'absolute',
                    top: 0,
                    left: 60,
                    backgroundColor: 'glass.main',
                    visibility: menuOpen ? 'visible' : 'hidden',
                    opacity: menuOpen ? 1 : 0,
                    transition: 'visibility 0.3s, opacity 0.25s linear',
                    zIndex: 10,
                }}
                aria-hidden={!menuOpen}
            >
                {menuOptions.map((option) => (
                    <Link
                        key={option.href}
                        href={option.href}
                        sx={{
                            color: 'prim.contrastText',
                            textDecoration: 'none',
                            transition: 'color 0.2s',
                            padding: 1,
                            width: '100%',
                            '&:hover': {
                                bgcolor: 'glass.main',
                                borderRadius: 2,
                            },
                        }}
                        // onClick={handleMenuToggle}
                        tabIndex={menuOpen ? 0 : -1}
                    >
                        {option.label}
                    </Link>
                ))}
            </Glass>
        </Box>
    );
}

export default withAuth(Menu);
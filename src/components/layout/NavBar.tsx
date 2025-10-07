"use client";

import { useState, useRef, useEffect, type ComponentType, type SVGProps, type CSSProperties } from "react";
import { useRouter, usePathname } from "next/navigation";

import Box from "@/components/shared/ui/content/Box";
import Typography from "@/components/shared/ui/text/Typography";

/** Acepta ícono como clases (FA) o como componente React (Lucide u otros) */
type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;
type IconType = string | IconComponent;

export interface NavLink {
    icon: IconType;      // "fas fa-home"  O  un componente SVG
    label: string;
    href: string;
}

interface NavBarProps {
    title: string;
    links: NavLink[];
}

/** Renderiza ícono según el tipo recibido */
function RenderIcon({
    icon,
    className,
    size = 18,
}: {
    icon: IconType;
    className?: string;
    size?: number;
}) {
    if (typeof icon === "string") {
        return <i className={[icon, className].filter(Boolean).join(" ")} aria-hidden="true" />;
    }
    const SvgIcon = icon;
    return <SvgIcon className={className} width={size} height={size} />;
}

export default function NavBar({ title, links }: NavBarProps) {
    const [isOpen, setIsOpen] = useState(false);
    const navRef = useRef<HTMLDivElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const pathname = usePathname();

    const handleOpen = () => setIsOpen(v => !v);

    const handleOpenPage = (href: string) => {
        router.push(href);
        setIsOpen(false);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                isOpen &&
                navRef.current &&
                menuRef.current &&
                !navRef.current.contains(event.target as Node) &&
                !menuRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);

    // chips del menú
    const navLinkBase =
        "group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-150 ease-in-out select-none";
    const navLinkShown = "translate-x-0 opacity-100";
    const navLinkHidden = "-translate-x-full opacity-0";

    // estados visuales (usa tus tokens/variables)
    const navLinkActive =
        "text-[color:var(--color-primary-foreground)] shadow-[0_18px_32px_rgba(11,23,16,0.35)]";
    const navLinkInactive =
        "text-[color:var(--text-primary)] shadow-[0_10px_26px_rgba(11,23,16,0.32)] hover:shadow-[0_14px_32px_rgba(11,23,16,0.38)]";

    const shellGlassStyle: CSSProperties = {
        backgroundImage: 'var(--surface)',
        backgroundColor: 'var(--surface-tint)',
        backdropFilter: 'blur(var(--glass-blur, 18px))'
    };

    const chipBaseStyle: CSSProperties = {
        backdropFilter: 'blur(var(--glass-blur, 18px))',
        backgroundColor: 'var(--surface-tint)'
    };

    const inactiveChipStyle: CSSProperties = {
        ...chipBaseStyle,
        backgroundImage: 'var(--surface)'
    };

    const activeChipStyle: CSSProperties = {
        ...chipBaseStyle,
        backgroundImage: 'linear-gradient(135deg, color-mix(in srgb, var(--color-primary) 35%, transparent 65%) 0%, color-mix(in srgb, var(--color-primary) 82%, transparent 18%) 100%)'
    };

    return (
        <>
            {/* Top bar */}
            <div
                ref={navRef}
                className="sticky top-2 mb-2 z-navbar rounded-2xl mx-3 md:mx-4 text-[color:var(--text-primary)] shadow-[0_28px_48px_rgba(11,23,16,0.35)] transition-all duration-300"
                style={shellGlassStyle}
                role="navigation"
                aria-label="Barra de navegación"
            >
                <Box className="flex items-center justify-between p-3">
                    <Box className="flex items-center gap-3">
                        {/* Botón hamburguesa */}
                        <button
                            onClick={handleOpen}
                            aria-expanded={isOpen}
                            aria-controls="app-sidemenu"
                            aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
                            className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 group"
                        >
                            <div className="space-y-1">
                                <span
                                    className={`block w-4 h-0.5 bg-[color:var(--text-secondary)] transition-all duration-300 group-hover:bg-[var(--color-primary)] ${isOpen ? "rotate-45 translate-y-1.5" : ""
                                        }`}
                                />
                                <span
                                    className={`block w-4 h-0.5 bg-[color:var(--text-secondary)] transition-all duration-300 group-hover:bg-[var(--color-primary)] ${isOpen ? "opacity-0" : ""
                                        }`}
                                />
                                <span
                                    className={`block w-4 h-0.5 bg-[color:var(--text-secondary)] transition-all duration-300 group-hover:bg-[var(--color-primary)] ${isOpen ? "-rotate-45 -translate-y-1.5" : ""
                                        }`}
                                />
                            </div>
                        </button>

                        <Typography variant="h1">{title}</Typography>
                    </Box>

                    {/* status decorativo */}
                    {/*
                    <Box className="hidden md:flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[var(--color-primary)]" />
                        <div className="w-2 h-2 rounded-full bg-[var(--border-light)]" />
                        <div className="w-2 h-2 rounded-full bg-[var(--color-secondary)]" />
                    </Box> */}
                </Box>
            </div>

            {/* Side menu */}
            <div id="app-sidemenu" ref={menuRef} className="fixed top-20 left-2 z-navbar space-y-2">
                {links.map((link, index) => {
                    const isActive = pathname === link.href;

                    return (
                        <button
                            key={`${link.href}-${index}`}
                            onClick={() => handleOpenPage(link.href)}
                            className={[
                                navLinkBase,
                                isOpen ? navLinkShown : navLinkHidden,
                                isActive ? navLinkActive : navLinkInactive,
                                "hover:scale-105",
                            ].join(" ")}
                            style={{
                                transitionDelay: isOpen
                                    ? `${index * 40}ms`
                                    : `${(links.length - index) * 30}ms`,
                                ...(isActive ? activeChipStyle : inactiveChipStyle)
                            }}
                            aria-current={isActive ? "page" : undefined}
                        >
                            {/* Ícono: gris por defecto; blanco si activo */}
                            <RenderIcon
                                icon={link.icon}
                                className={[
                                    "group-hover:text-[color:var(--text-primary)]",
                                ].join(" ")}
                                size={18}
                            />

                            <Typography variant="link">{link.label}</Typography>
                            {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[var(--color-primary-foreground)]" />}
                        </button>
                    );
                })}
            </div>

            {/* Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-[1000]"
                    onClick={() => setIsOpen(false)}
                    aria-hidden
                />
            )}
        </>
    );
}

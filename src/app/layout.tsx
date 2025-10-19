import type { Metadata } from "next";
import "./globals.css";

import { Inter } from "next/font/google";
import { Providers } from "./providers";
import {NavBar, NavLink } from "@/components/layout/";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Cecilia AI",
  description: "Asistente inteligente automatizado",
  icons: [
    {
      rel: "icon",
      url: "/images/favicon.ico",
    },
  ],
};

const links: NavLink[] = [
  { icon: "fas fa-home", label: "Inicio", href: "/" } as NavLink,
  { icon: "fas fa-user", label: "Perfil", href: "/#perfil" } as NavLink,
  { icon: "fas fa-line-chart", label: "Estadisticas", href: "/#estadisticas" } as NavLink,
  { icon: "fas fa-commenting-o", label: "Whatsapp", href: "/#whatsapp" } as NavLink,
  { icon: "fas fa-cog", label: "Configuracion", href: "/#configuracion" } as NavLink,
  { icon: "fas fa-power-off", label: "Cerrar Sesion", href: "/#cerrar-sesion" } as NavLink,
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
        />
      </head>
      <body className={`${inter.className} antialiased`}>
        <Providers>
          <NavBar title="Olevium" links={links} />
          {children}
        </Providers>
      </body>
    </html>
  );
}

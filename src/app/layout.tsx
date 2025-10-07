import type { Metadata } from "next";
import "./globals.css";

import { Inter } from "next/font/google";

import { NotificationProvider } from "@/context/NotificationContext";
import { ModalProvider } from "@/context/ModalContext";
import NavBar, { NavLink } from "@/components/layout/NavBar";

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
  { icon: "fas fa-user", label: "Perfil", href: "/profile" } as NavLink,
  { icon: "fas fa-line-chart", label: "Estadisticas", href: "/stats" } as NavLink,
  { icon: "fas fa-commenting-o", label: "Whatsapp", href: "/wpp" } as NavLink,
  { icon: "fas fa-cog", label: "Configuracion", href: "/config" } as NavLink,
  { icon: "fas fa-power-off", label: "Cerrar Sesion", href: "/logout" } as NavLink,
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
        <>
          <NavBar title="Olevium" links={links} />
          <NotificationProvider>
            <ModalProvider>
              {children}
            </ModalProvider>
          </NotificationProvider>
        </>
      </body>
    </html>
  );
}

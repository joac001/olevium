import type { Metadata } from "next";
import "./globals.css";

import { Manrope } from "next/font/google";

import { NavBar, NavLink } from "@/components/layout/";
import { ClientProviders } from "@/components/providers/ClientProviders";

const manrope = Manrope({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Olevium",
  description: "Asistente financiero inteligente",
  icons: [
    {
      rel: "icon",
      url: "/images/favicon.ico",
    },
  ],
};

const links: NavLink[] = [
  { icon: "fas fa-home", label: "Inicio", href: "/" } as NavLink,
  { icon: "fas fa-wallet", label: "Cuentas", href: "/accounts" } as NavLink,
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
      <body className={`${manrope.className} antialiased`}>
        <ClientProviders>
          <NavBar title="Olevium" links={links} />
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}

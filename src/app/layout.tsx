import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeContextProvider } from "@/context/themeContext";
import theme from "@/utils/theme";
import PageHeader from "@/components/PageHeader";


const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Olevium",
  description: "Gestiona tus finanzas",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable}`} style={{ backgroundColor: theme.palette.bg.default, padding: '20px' }}>
        <ThemeContextProvider>
          <PageHeader />
          {children}
        </ThemeContextProvider>
      </body>
    </html>
  );
}

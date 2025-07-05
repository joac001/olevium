import { Inter } from "next/font/google";
import ThemeRegistry from "@/components/ThemeRegistry";
import Navbar from "@/components/Navbar";

const interSans = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata = {
  title: "Olevium",
  description: "Conoce tu bolsillo",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${interSans.variable}`} style={{ margin: 0, padding: 0 }}>
        <ThemeRegistry>
          <div style={{ display: "flex", minHeight: "100vh" }}>
            <Navbar />
            <main style={{ flex: 1, display: "flex", flexDirection: "column", marginLeft: 64, padding: 20 }}>
              {children}
            </main>
          </div>
        </ThemeRegistry>
      </body>
    </html>
  );
}

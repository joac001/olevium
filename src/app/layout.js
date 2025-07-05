import { Inter } from "next/font/google";
import ThemeRegistry from "@/components/ThemeRegistry";

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
      <body
        className={`${interSans.variable}`}
        style={{
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
        }}
      >
        <ThemeRegistry>
          <main style={{ flex: 1, display: "flex", flexDirection: "column", paddingTop: "70px" }}>
            {children}
          </main>
        </ThemeRegistry>
      </body>
    </html>
  );
}

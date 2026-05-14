import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/AppShell";
import { GameProvider } from "@/components/GameProvider";

const grotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-grotesk",
  display: "swap"
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap"
});

export const metadata: Metadata = {
  title: "Investor Quest",
  description: "Gamified stock research platform."
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#070712"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${grotesk.variable} ${inter.variable}`}
      suppressHydrationWarning
    >
      <body className="grain font-[var(--font-inter)]" suppressHydrationWarning>
        <GameProvider>
          <AppShell>{children}</AppShell>
        </GameProvider>
      </body>
    </html>
  );
}


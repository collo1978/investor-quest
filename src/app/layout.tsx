import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import { Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";
import { ClientAppRoot } from "@/components/ClientAppRoot";
import { REQUEST_PATHNAME_HEADER } from "@/lib/requestPathname";

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

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headerStore = await headers();
  const initialPathname = headerStore.get(REQUEST_PATHNAME_HEADER) ?? "";

  return (
    <html
      lang="en"
      className={`${grotesk.variable} ${inter.variable}`}
      suppressHydrationWarning
    >
      <head>
        <link
          rel="preload"
          href="/logos/investor-quest-logo.png"
          as="image"
          type="image/png"
        />
      </head>
      <body className="grain font-[var(--font-inter)]" suppressHydrationWarning>
        <ClientAppRoot initialPathname={initialPathname}>
          {children}
        </ClientAppRoot>
      </body>
    </html>
  );
}


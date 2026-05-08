import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "@/components/Providers";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Sonic Intelligence - AI Music Discovery",
  description: "Experience music discovery powered by Gemini 2.0 and Spotify.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className={`${inter.variable} font-sans bg-neutral-950 text-neutral-50 antialiased min-h-screen selection:bg-emerald-500/30 selection:text-emerald-400`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

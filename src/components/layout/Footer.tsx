"use client";

import { translations } from "@/lib/translations";

interface FooterProps {
  lang: "en" | "nl";
}

export function Footer({ lang }: FooterProps) {
  return (
    <footer className="z-10 w-full max-w-7xl mx-auto px-5 py-4 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-500">
      <p>© {new Date().getFullYear()} {translations[lang].copyright}</p>
      <div className="flex gap-5">
        <span>Next.js 16</span>
        <span>Tailwind CSS v4</span>
        <span>Gemini 2.5 Pro</span>
      </div>
    </footer>
  );
}

"use client";

import { signIn } from "next-auth/react";
import { Sparkles, LogIn } from "lucide-react";
import { translations } from "@/lib/translations";

interface LandingHeroProps {
  lang: "en" | "nl";
}

export function LandingHero({ lang }: LandingHeroProps) {
  return (
    <div className="flex-grow flex items-center justify-center">
      <div className="max-w-xl w-full text-center py-12 px-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-6 animate-pulse">
          <Sparkles className="w-3.5 h-3.5" /> Gemini 2.5 Pro Active
        </div>
        <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-tight mb-6">
          {lang === "nl" ? (
            <>
              Ontdek muziek via{" "}
              <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-purple-500 bg-clip-text text-transparent">
                natuurlijk gesprek
              </span>
            </>
          ) : (
            <>
              Discover Music Through{" "}
              <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-purple-500 bg-clip-text text-transparent">
                Natural Conversation
              </span>
            </>
          )}
        </h2>
        <p className="text-neutral-400 text-sm md:text-base mb-10 max-w-lg mx-auto leading-relaxed">
          {translations[lang].welcomeDesc}
        </p>
        <button
          onClick={() => signIn("spotify")}
          className="relative group inline-flex items-center gap-3 px-8 py-4 bg-emerald-500 text-black hover:bg-emerald-400 font-bold text-base rounded-full shadow-lg shadow-emerald-500/20 transition-all duration-300 hover:-translate-y-0.5 cursor-pointer"
        >
          <LogIn className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
          {translations[lang].connectSpotify}
        </button>
        <div className="mt-12 grid grid-cols-3 gap-4 border-t border-white/5 pt-8 max-w-lg mx-auto">
          <div className="text-center">
            <p className="text-lg font-bold text-white">Gemini 2.5</p>
            <p className="text-xs text-neutral-500">{translations[lang].coreAi}</p>
          </div>
          <div className="text-center border-x border-white/5">
            <p className="text-lg font-bold text-white">127.0.0.1</p>
            <p className="text-xs text-neutral-500">{translations[lang].secureRedirect}</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-white">Auth.js</p>
            <p className="text-xs text-neutral-500">{translations[lang].spotifyProvider}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

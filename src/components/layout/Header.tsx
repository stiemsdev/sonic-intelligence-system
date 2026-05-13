"use client";

import { useSession, signOut } from "next-auth/react";
import { Disc, PanelLeft, User, LogOut } from "lucide-react";
import { translations } from "@/lib/translations";

interface HeaderProps {
  activeTab: "chat" | "stats";
  setActiveTab: (tab: "chat" | "stats") => void;
  lang: "en" | "nl";
  setLang: (lang: "en" | "nl") => void;
  onShowMobileSessions: () => void;
}

export function Header({
  activeTab,
  setActiveTab,
  lang,
  setLang,
  onShowMobileSessions,
}: HeaderProps) {
  const { data: session } = useSession();

  return (
    <header className="z-20 w-full border-b border-white/5 bg-neutral-950/80 backdrop-blur-md sticky top-0">
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-14 flex items-center justify-between gap-3">
        {/* Left: logo + mobile sessions toggle */}
        <div className="flex items-center gap-2 min-w-0">
          {session && (
            <button
              onClick={onShowMobileSessions}
              className="md:hidden p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/5 transition-all flex-shrink-0"
              aria-label="Open chat history"
            >
              <PanelLeft className="w-4 h-4" />
            </button>
          )}
          <div className="p-1.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20 flex-shrink-0">
            <Disc className="w-4 h-4 text-emerald-400 animate-[spin_6s_linear_infinite]" />
          </div>
          <span className="font-extrabold text-sm tracking-tight bg-gradient-to-r from-white to-neutral-400 bg-clip-text text-transparent hidden sm:block">
            Sonic Intelligence
          </span>
        </div>

        {/* Centre: tab switcher — always visible when logged in */}
        {session && (
          <div className="flex gap-1 bg-white/5 p-1 rounded-full border border-white/5 flex-shrink-0">
            <button
              onClick={() => setActiveTab("chat")}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                activeTab === "chat"
                  ? "bg-emerald-500 text-black shadow-md"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              {translations[lang].aiChat}
            </button>
            <button
              onClick={() => setActiveTab("stats")}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                activeTab === "stats"
                  ? "bg-emerald-500 text-black shadow-md"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              {translations[lang].myStats}
            </button>
          </div>
        )}

        {/* Right: language toggle + profile + sign out */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Language Selector — desktop only */}
          <div className="hidden md:flex bg-white/5 p-0.5 rounded-full border border-white/5 flex-shrink-0">
            <button
              onClick={() => setLang("en")}
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                lang === "en" ? "bg-emerald-500 text-black shadow-md" : "text-neutral-500 hover:text-white"
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLang("nl")}
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                lang === "nl" ? "bg-emerald-500 text-black shadow-md" : "text-neutral-500 hover:text-white"
              }`}
            >
              NL
            </button>
          </div>

          {session && (
            <>
              {/* Profile pill — desktop only */}
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/5">
                {session.user?.image ? (
                  <img
                    src={session.user.image}
                    alt=""
                    className="w-5 h-5 rounded-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <User className="w-4 h-4 text-neutral-400" />
                )}
                <span className="text-xs font-medium text-neutral-300 max-w-[120px] truncate">
                  {session.user?.name ?? "Music Explorer"}
                </span>
              </div>

              {/* Sign out — hidden on mobile */}
              <button
                onClick={() => signOut()}
                className="hidden md:flex group items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-neutral-400 hover:text-white bg-white/5 hover:bg-red-500/10 border border-white/5 hover:border-red-500/20 transition-all"
              >
                <LogOut className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                <span className="hidden lg:inline">{translations[lang].signOut}</span>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

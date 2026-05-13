"use client";

import { useSession, signOut } from "next-auth/react";
import { Plus, X, MessageSquare, User, LogOut } from "lucide-react";
import { groupSessionsByDate } from "@/lib/chatHistory";
import type { ChatSession } from "@/lib/chatHistory";
import { SessionItem } from "./SessionItem";
import { translations } from "@/lib/translations";

interface SessionsPanelProps {
  sessions: ChatSession[];
  currentId: string;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  onClose?: () => void; // optional: used by the mobile overlay to close itself
  lang: "en" | "nl";
  onSetLang?: (l: "en" | "nl") => void;
}

export function SessionsPanel({
  sessions,
  currentId,
  onSelect,
  onNew,
  onDelete,
  onClose,
  lang,
  onSetLang,
}: SessionsPanelProps) {
  const { data: session } = useSession();
  const groups = groupSessionsByDate(sessions);

  return (
    <div className="glass-card rounded-2xl flex flex-col h-full overflow-hidden">
      {/* Header row */}
      <div className="p-3 border-b border-white/5 flex items-center gap-2 flex-shrink-0">
        <button
          onClick={onNew}
          className="flex-grow flex items-center gap-2 px-3 py-2.5
                     bg-emerald-500/10 hover:bg-emerald-500/20
                     border border-emerald-500/20 hover:border-emerald-500/40
                     rounded-xl text-xs font-semibold text-emerald-400
                     transition-all cursor-pointer group"
        >
          <Plus className="w-3.5 h-3.5 group-hover:rotate-90 transition-transform duration-200" />
          {translations[lang].newConversation}
        </button>
        {/* Close button — only shown inside the mobile overlay */}
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/5 transition-all flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Session list */}
      <div className="flex-grow overflow-y-auto p-2 space-y-4">
        {groups.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 gap-2 text-center px-3">
            <MessageSquare className="w-6 h-6 text-neutral-600" />
            <p className="text-[10px] text-neutral-500">{translations[lang].noConversations}</p>
          </div>
        ) : (
          groups.map(({ group, sessions: groupSessions }) => (
            <div key={group}>
              <p className="text-[9px] font-bold text-neutral-500 tracking-widest uppercase px-2 mb-1.5">
                {lang === "nl"
                  ? group === "Today"
                    ? "Vandaag"
                    : group === "Yesterday"
                    ? "Gisteren"
                    : group === "This week"
                    ? "Afgelopen 7 dagen"
                    : "Ouder"
                  : group}
              </p>
              <div className="space-y-0.5">
                {groupSessions.map((s) => (
                  <SessionItem
                    key={s.id}
                    session={s}
                    isActive={s.id === currentId}
                    onSelect={(id) => {
                      onSelect(id);
                      onClose?.();
                    }}
                    onDelete={onDelete}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Mobile Footer: visible inside drawer, hides in desktop sidebar layout */}
      {session && (
        <div className="md:hidden p-3 border-t border-white/5 bg-neutral-900/50 space-y-3 flex-shrink-0">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              {session.user?.image ? (
                <img
                  src={session.user.image}
                  alt=""
                  className="w-6 h-6 rounded-full border border-white/10"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-neutral-800 flex items-center justify-center">
                  <User className="w-3 h-3 text-neutral-500" />
                </div>
              )}
              <span className="text-xs font-bold text-neutral-200 truncate">
                {session.user?.name ?? "Explorer"}
              </span>
            </div>
            {onSetLang && (
              <div className="flex bg-neutral-800 p-0.5 rounded-lg border border-white/5 flex-shrink-0">
                <button
                  onClick={() => onSetLang("en")}
                  className={`px-2 py-1 rounded-md text-[9px] font-bold transition-all cursor-pointer ${
                    lang === "en" ? "bg-emerald-500 text-black" : "text-neutral-500 hover:text-white"
                  }`}
                >
                  EN
                </button>
                <button
                  onClick={() => onSetLang("nl")}
                  className={`px-2 py-1 rounded-md text-[9px] font-bold transition-all cursor-pointer ${
                    lang === "nl" ? "bg-emerald-500 text-black" : "text-neutral-500 hover:text-white"
                  }`}
                >
                  NL
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => signOut()}
            className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-red-500/10 border border-white/5 hover:border-red-500/20 text-neutral-400 hover:text-red-400 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            {translations[lang].signOut}
          </button>
        </div>
      )}
    </div>
  );
}

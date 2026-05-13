"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect, useCallback } from "react";
import { RefreshCw } from "lucide-react";
import type { UIMessage } from "ai";
import {
  getSessions,
  getSession,
  saveSession,
  deleteSession,
  generateSessionTitle,
  newSessionId,
  type ChatSession,
} from "@/lib/chatHistory";

import type { SpotifyTrack } from "@/types/spotify";
import { translations } from "@/lib/translations";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { LandingHero } from "@/components/landing/LandingHero";
import { StatsPanel } from "@/components/stats/StatsPanel";
import { ChatArea } from "@/components/chat/ChatArea";
import { SessionsPanel } from "@/components/sessions/SessionsPanel";

export default function Home() {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState<"chat" | "stats">("chat");
  const [topTracks, setTopTracks] = useState<SpotifyTrack[]>([]);
  const [loadingTracks, setLoadingTracks] = useState(false);

  // Bilingual state ("en" | "nl"), persists to localStorage or default to "en"
  const [lang, setLang] = useState<"en" | "nl">("en");

  useEffect(() => {
    const stored = localStorage.getItem("sonic_lang");
    if (stored === "en" || stored === "nl") setLang(stored);
  }, []);

  const handleSetLang = (l: "en" | "nl") => {
    setLang(l);
    localStorage.setItem("sonic_lang", l);
  };

  // Mobile sessions overlay
  const [showMobileSessions, setShowMobileSessions] = useState(false);

  // Session state
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>(() => newSessionId());

  useEffect(() => {
    setSessions(getSessions());
  }, []);

  const handleNew = useCallback(() => {
    setCurrentSessionId(newSessionId());
    setActiveTab("chat");
    setShowMobileSessions(false);
  }, []);

  const handleSelect = useCallback((id: string) => {
    setCurrentSessionId(id);
    setActiveTab("chat");
  }, []);

  const handleDelete = useCallback(
    (id: string) => {
      deleteSession(id);
      setSessions(getSessions());
      if (id === currentSessionId) setCurrentSessionId(newSessionId());
    },
    [currentSessionId]
  );

  const handleSessionUpdate = useCallback(
    (messages: UIMessage[]) => {
      const existing = getSession(currentSessionId);
      const updated: ChatSession = {
        id: currentSessionId,
        title: generateSessionTitle(messages),
        createdAt: existing?.createdAt ?? Date.now(),
        updatedAt: Date.now(),
        messages,
      };
      saveSession(updated);
      setSessions((prev) => {
        const idx = prev.findIndex((s) => s.id === currentSessionId);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = updated;
          return next;
        }
        return [updated, ...prev];
      });
    },
    [currentSessionId]
  );

  useEffect(() => {
    // Check if token exists on NextAuth session object.
    // casting required since session object custom properties
    const token = (session as any)?.accessToken;
    if (token) fetchTopTracks(token);
  }, [session]);

  const fetchTopTracks = async (token: string) => {
    setLoadingTracks(true);
    try {
      const res = await fetch("https://api.spotify.com/v1/me/top/tracks?limit=8", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setTopTracks(data.items ?? []);
      }
    } catch (err) {
      console.error("[fetchTopTracks]", err);
    } finally {
      setLoadingTracks(false);
    }
  };

  const currentSession = sessions.find((s) => s.id === currentSessionId);

  return (
    <div
      className={`relative flex flex-col bg-neutral-950 text-neutral-50 selection:bg-emerald-500/30 font-sans ${
        session ? "h-[100dvh] overflow-hidden" : "min-h-screen"
      }`}
    >
      {/* Blobs */}
      <div className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-500/5 blur-[120px] animate-pulse-slow pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-500/5 blur-[120px] animate-pulse-slow-delay pointer-events-none" />

      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        lang={lang}
        setLang={handleSetLang}
        onShowMobileSessions={() => setShowMobileSessions(true)}
      />

      {/* ── Body ── */}
      <main
        className={`z-10 flex-grow max-w-7xl w-full mx-auto p-3 md:p-5 min-h-0 flex flex-col ${
          session ? "overflow-hidden" : "items-stretch"
        }`}
      >
        {status === "loading" ? (
          <div className="flex-grow flex flex-col items-center justify-center gap-4">
            <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin" />
            <p className="text-sm text-neutral-400">{translations[lang].loadingSpotify}</p>
          </div>
        ) : !session ? (
          <LandingHero lang={lang} />
        ) : (
          /* ── App ── */
          <div className="flex-grow min-h-0 grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Sessions sidebar — desktop */}
            <div className="hidden md:block md:col-span-1 min-h-0">
              <SessionsPanel
                sessions={sessions}
                currentId={currentSessionId}
                onSelect={handleSelect}
                onNew={handleNew}
                onDelete={handleDelete}
                lang={lang}
                onSetLang={handleSetLang}
              />
            </div>

            {/* Main panel */}
            <div className="col-span-1 md:col-span-3 min-h-0 flex flex-col">
              {activeTab === "stats" ? (
                <StatsPanel
                  loadingTracks={loadingTracks}
                  topTracks={topTracks}
                  lang={lang}
                  onBackToChat={() => setActiveTab("chat")}
                />
              ) : (
                /* Chat — key forces remount on session switch */
                <ChatArea
                  key={currentSessionId}
                  sessionId={currentSessionId}
                  initialMessages={currentSession?.messages ?? []}
                  onSessionUpdate={handleSessionUpdate}
                  lang={lang}
                />
              )}
            </div>
          </div>
        )}
      </main>

      <Footer lang={lang} />

      {/* ── Mobile sessions overlay ── */}
      {showMobileSessions && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowMobileSessions(false)}
          />
          {/* Drawer */}
          <div className="absolute inset-y-0 left-0 w-72 max-w-[85vw]">
            <SessionsPanel
              sessions={sessions}
              currentId={currentSessionId}
              onSelect={handleSelect}
              onNew={handleNew}
              onDelete={handleDelete}
              onClose={() => setShowMobileSessions(false)}
              lang={lang}
              onSetLang={handleSetLang}
            />
          </div>
        </div>
      )}
    </div>
  );
}

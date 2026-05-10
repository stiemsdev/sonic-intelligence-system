"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useChat } from "@ai-sdk/react";
import { useState, useRef, useEffect, useCallback } from "react";
import {
  Sparkles,
  LogIn,
  LogOut,
  Disc,
  Compass,
  User,
  AlertCircle,
  RefreshCw,
  Send,
  ArrowRight,
  ExternalLink,
  Check,
  Plus,
  Trash2,
  MessageSquare,
  PanelLeft,
  X,
  Music,
} from "lucide-react";
import type { DynamicToolUIPart, UIMessage } from "ai";
import {
  getSessions,
  getSession,
  saveSession,
  deleteSession,
  generateSessionTitle,
  groupSessionsByDate,
  newSessionId,
  type ChatSession,
} from "@/lib/chatHistory";

// ─── Types ───────────────────────────────────────────────────────────────────

interface SpotifyTrack {
  id: string;
  name: string;
  artists: { name: string }[];
  album: { name: string; images: { url: string }[] };
  external_urls: { spotify: string };
  uri: string;
}

const translations = {
  en: {
    appTitle: "Sonic Intelligence",
    aiChat: "AI Chat",
    myStats: "My Stats",
    signOut: "Sign Out",
    welcomeTitle: "Discover Music Through Natural Conversation",
    welcomeDesc: "Connect your Spotify account to experience an immersive music curator powered by Gemini 2.5 Pro. No more static filters — just talk to your music.",
    connectSpotify: "Connect with Spotify",
    coreAi: "Core AI Engine",
    secureRedirect: "Secure Redirect",
    spotifyProvider: "Spotify Provider",
    newConversation: "New conversation",
    noConversations: "No conversations yet",
    howListen: "How would you like to listen today?",
    ambientExample: '"Ambient acoustic guitar for focusing", "Songs similar to what I listen to", or "A high-energy workout playlist".',
    inputPlaceholder: "Vibe check? Ask Gemini to curate your soundtrack…",
    insightsTitle: "Your Spotify Insights",
    insightsDesc: "Fetched via user-top-read scope",
    backToCuration: "Back to AI Conversational Curation",
    syncingSpotify: "Syncing with Spotify…",
    syncingSearch: "Syncing with Spotify Search…",
    playlistCreated: "Playlist Created!",
    openSpotify: "Open on Spotify",
    addedTracks: "Added tracks to your playlist!",
    loadingSpotify: "Synchronizing with Spotify…",
    copyright: "Sonic Intelligence POC.",
  },
  nl: {
    appTitle: "Sonic Intelligence",
    aiChat: "AI Chat",
    myStats: "Mijn Statistieken",
    signOut: "Uitloggen",
    welcomeTitle: "Ontdek muziek via natuurlijk gesprek",
    welcomeDesc: "Verbind je Spotify-account en ervaar een meeslepende muziekcurator aangedreven door Gemini 2.5 Pro. Geen statische filters meer — praat gewoon met je muziek.",
    connectSpotify: "Inloggen met Spotify",
    coreAi: "Kern AI-Engine",
    secureRedirect: "Beveiligde omleiding",
    spotifyProvider: "Spotify-provider",
    newConversation: "Nieuw gesprek",
    noConversations: "Nog geen gesprekken",
    howListen: "Hoe wil je vandaag luisteren?",
    ambientExample: '"Akoestische ambient gitaar om te focussen", "Nummers die lijken op wat ik luister", of "Een energieke afspeellijst voor het sporten".',
    inputPlaceholder: "Vibe check? Vraag Gemini om je soundtrack te cureren…",
    insightsTitle: "Jouw Spotify Inzichten",
    insightsDesc: "Opgehaald via de user-top-read scope",
    backToCuration: "Terug naar AI Conversatie-Curation",
    syncingSpotify: "Synchroniseren met Spotify…",
    syncingSearch: "Synchroniseren met Spotify Zoeken…",
    playlistCreated: "Afspeellijst aangemaakt!",
    openSpotify: "Openen op Spotify",
    addedTracks: "Nummers toegevoegd aan je afspeellijst!",
    loadingSpotify: "Synchroniseren met Spotify…",
    copyright: "Sonic Intelligence POC.",
  },
};


// ─── AlbumArt ─────────────────────────────────────────────────────────────────

/**
 * Renders album art with a Music icon fallback.
 *
 * Key: referrerPolicy="no-referrer" — Spotify's CDN silently blocks image
 * requests that carry a Referer header pointing to localhost/127.0.0.1.
 * Stripping the referrer lets the CDN serve the image unconditionally.
 */
function AlbumArt({ images, name, size = 9 }: {
  images?: { url: string }[];
  name: string;
  size?: number;
}) {
  const [failed, setFailed] = useState(false);

  // Prefer the smallest available image (last in Spotify's size-descending array)
  // for the tiny card thumbnails — faster, same quality at 36px display size.
  const imgArr = images ?? [];
  const url = (imgArr[imgArr.length - 1] ?? imgArr[0])?.url;

  const cls = `w-${size} h-${size} rounded-lg object-cover flex-shrink-0`;

  if (!url || failed) {
    return (
      <div className={`${cls} bg-neutral-800 border border-white/5 flex items-center justify-center`}>
        <Music className="w-4 h-4 text-neutral-500" />
      </div>
    );
  }

  return (
    <img
      src={url}
      alt={name}
      className={cls}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
    />
  );
}

// ─── TrackCard ───────────────────────────────────────────────────────────────

function TrackCard({ track }: { track: SpotifyTrack }) {
  return (
    <div className="flex items-center justify-between p-2 rounded-xl bg-neutral-900/60 hover:bg-neutral-900/90 border border-white/5 hover:border-white/10 transition-all">
      <div className="flex items-center gap-2.5 min-w-0">
        <AlbumArt images={track.album?.images} name={track.name} size={9} />
        <div className="text-left min-w-0">
          <p className="text-xs font-bold text-white truncate">{track.name}</p>
          <p className="text-[10px] text-neutral-400 truncate">
            {track.artists?.map((a) => a.name).join(", ")}
          </p>
        </div>
      </div>
      <a
        href={track.external_urls?.spotify}
        target="_blank"
        rel="noreferrer"
        className="p-1.5 bg-white/5 hover:bg-emerald-500 hover:text-black rounded-lg text-neutral-400 transition-all flex items-center justify-center flex-shrink-0 ml-2"
      >
        <ExternalLink className="w-3.5 h-3.5" />
      </a>
    </div>
  );
}

// ─── ToolInvocationPart ──────────────────────────────────────────────────────

function ToolInvocationPart({ part, lang }: { part: any; lang: "en" | "nl" }) {
  const toolName = part.type === "dynamic-tool" ? part.toolName : part.type.replace(/^tool-/, "");
  const { state } = part;

  if (state === "input-streaming" || state === "input-available") {
    return (
      <div className="mt-3 flex items-center gap-2 text-[10px] text-neutral-400 bg-white/5 px-2.5 py-1.5 rounded-lg border border-white/5 animate-pulse">
        <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-spin" />
        <span>
          {lang === "nl" ? "Synchroniseren met " : "Syncing with "}
          {toolName === "findMusic" ? (lang === "nl" ? "Spotify Zoeken" : "Spotify Search") : "Spotify"}…
        </span>
      </div>
    );
  }

  if (state === "output-error") {
    return (
      <div className="mt-3 flex items-center gap-2 text-[10px] text-red-400 bg-red-500/10 px-2.5 py-1.5 rounded-lg border border-red-500/20">
        <AlertCircle className="w-3.5 h-3.5" />
        <span>Error: {part.errorText}</span>
      </div>
    );
  }

  if (state === "output-available") {
    const output = part.output as Record<string, any>;

    if (output?.error) {
      return (
        <div className="mt-3 flex items-center gap-2 text-[10px] text-red-400 bg-red-500/10 px-2.5 py-1.5 rounded-lg border border-red-500/20">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>Spotify: {output.error}</span>
        </div>
      );
    }

    if (toolName === "getTopTracks" || toolName === "findMusic") {
      return (
        <div className="mt-3.5 grid gap-2">
          {output.tracks?.map((track: SpotifyTrack) => (
            <TrackCard key={track.id} track={track} />
          ))}
        </div>
      );
    }

    if (toolName === "createPlaylist") {
      return (
        <div className="mt-3.5 bg-purple-500/10 border border-purple-500/20 p-3.5 rounded-xl text-[11px] space-y-2">
          <p className="font-bold text-white flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" /> {lang === "nl" ? "Afspeellijst aangemaakt!" : "Playlist Created!"}
          </p>
          <p className="text-neutral-400">
            {lang === "nl" ? "Naam:" : "Name:"} <span className="text-neutral-200 font-semibold">{output.name}</span>
          </p>
          <a href={output.url} target="_blank" rel="noreferrer"
            className="inline-flex items-center gap-1 text-purple-400 hover:text-purple-300 font-bold underline">
            {lang === "nl" ? "Openen op Spotify" : "Open on Spotify"} <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      );
    }

    if (toolName === "addTracksToPlaylist") {
      return (
        <div className="mt-3.5 bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl text-[11px] flex items-center gap-2">
          <div className="p-1 bg-emerald-500/20 rounded-full text-emerald-400">
            <Check className="w-3.5 h-3.5" />
          </div>
          <p className="text-neutral-200">
            {lang === "nl" ? (
              <>
                <span className="text-emerald-400 font-bold">{output.count} nummers</span> toegevoegd aan je afspeellijst!
              </>
            ) : (
              <>
                Added <span className="text-emerald-400 font-bold">{output.count} tracks</span> to your playlist!
              </>
            )}
          </p>
        </div>
      );
    }
  }

  return null;
}

// ─── SessionItem ─────────────────────────────────────────────────────────────

/**
 * Delete button is ALWAYS visible (not hover-only) so it works on touch.
 * We use subtle opacity instead of display:none.
 */
function SessionItem({
  session,
  isActive,
  onSelect,
  onDelete,
}: {
  session: ChatSession;
  isActive: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div
      className={`group flex items-center rounded-xl transition-all ${
        isActive
          ? "bg-emerald-500/10 border border-emerald-500/20"
          : "hover:bg-white/5 border border-transparent"
      }`}
    >
      {/* Clickable title area */}
      <button
        onClick={() => onSelect(session.id)}
        className="flex-grow text-left px-3 py-2.5 min-w-0"
      >
        <p className={`text-[11px] font-medium truncate ${isActive ? "text-emerald-300" : "text-neutral-300"}`}>
          {session.title}
        </p>
        <p className="text-[9px] text-neutral-500 mt-0.5">
          {new Date(session.updatedAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </button>

      {/* Delete — always rendered, opacity fades in on group-hover (desktop)
          but stays visible at reduced opacity so touch users can always tap it */}
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(session.id); }}
        className="flex-shrink-0 p-1.5 mr-1.5 rounded-lg
                   text-neutral-600 hover:text-red-400 hover:bg-red-500/10
                   opacity-40 group-hover:opacity-100
                   transition-all"
        title="Delete conversation"
      >
        <Trash2 className="w-3 h-3" />
      </button>
    </div>
  );
}

// ─── SessionsPanel ───────────────────────────────────────────────────────────

function SessionsPanel({
  sessions,
  currentId,
  onSelect,
  onNew,
  onDelete,
  onClose,          // optional: used by the mobile overlay to close itself
  lang,
}: {
  sessions: ChatSession[];
  currentId: string;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  onClose?: () => void;
  lang: "en" | "nl";
}) {
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
                {lang === "nl" ? (group === "Today" ? "Vandaag" : group === "Yesterday" ? "Gisteren" : group === "Previous 7 Days" ? "Afgelopen 7 dagen" : "Ouder") : group}
              </p>
              <div className="space-y-0.5">
                {groupSessions.map((s) => (
                  <SessionItem
                    key={s.id}
                    session={s}
                    isActive={s.id === currentId}
                    onSelect={(id) => { onSelect(id); onClose?.(); }}
                    onDelete={onDelete}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ─── ChatArea ────────────────────────────────────────────────────────────────

function ChatArea({
  sessionId,
  initialMessages,
  onSessionUpdate,
  lang,
}: {
  sessionId: string;
  initialMessages: UIMessage[];
  onSessionUpdate: (messages: UIMessage[]) => void;
  lang: "en" | "nl";
}) {
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState("");

  const { messages, sendMessage, status } = useChat({
    id: sessionId,
    messages: initialMessages,
    body: { lang },
  });
  const isLoading = status === "streaming" || status === "submitted";

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Wrap in ref so the effect never needs to re-register when the callback identity changes
  const onSessionUpdateRef = useRef(onSessionUpdate);
  useEffect(() => { onSessionUpdateRef.current = onSessionUpdate; });

  useEffect(() => {
    if (messages.length > 0) onSessionUpdateRef.current(messages);
  }, [messages]); // safe: ref wrapper absorbs callback identity changes

  return (
    <div className="glass-card rounded-2xl flex flex-col h-full overflow-hidden border border-white/5">
      <div className="flex-grow overflow-y-auto p-4 md:p-5 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4 max-w-md mx-auto">
            <div className="p-3 bg-purple-500/10 rounded-full border border-purple-500/20 text-purple-400">
              <Compass className="w-6 h-6 animate-pulse" />
            </div>
            <h4 className="font-bold text-sm text-neutral-200">{translations[lang].howListen}</h4>
            <p className="text-xs text-neutral-400 leading-relaxed">
              {translations[lang].ambientExample}
            </p>
            <div className="w-full space-y-2 pt-2">
              {[
                { emoji: "📊", label: lang === "nl" ? "Analyseer mijn smaak" : "Analyze my taste", prompt: lang === "nl" ? "Wat zijn mijn favoriete nummers op Spotify?" : "What are my top favorite tracks on Spotify?" },
                { emoji: "🌃", label: lang === "nl" ? "Nachtelijke autorit vibe" : "Late night driving vibe", prompt: lang === "nl" ? "Beveel wat energieke synthwave-nummers aan voor een nachtelijke autorit." : "Recommend some energetic synthwave tracks for night driving." },
                { emoji: "📚", label: lang === "nl" ? "Maak een studieafspeellijst" : "Create a study playlist", prompt: lang === "nl" ? "Help me een ontspannen studieafspeellijst te maken genaamd 'Deep Focus Ambient'." : "Help me create a chill study playlist called 'Deep Focus Ambient'." },
              ].map(({ emoji, label, prompt }) => (
                <button key={label} onClick={() => sendMessage({ text: prompt })}
                  className="w-full text-left bg-white/3 hover:bg-white/7 border border-white/5 hover:border-white/10 p-2.5 rounded-xl text-xs text-neutral-200 transition-all cursor-pointer flex items-center justify-between group">
                  <span>{emoji} {label}</span>
                  <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div key={message.id} className={`flex flex-col ${message.role === "user" ? "items-end" : "items-start"}`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                message.role === "user"
                  ? "bg-emerald-500 text-black font-semibold shadow-md rounded-tr-none"
                  : "bg-white/5 text-neutral-200 rounded-tl-none border border-white/5"
              }`}>
                {message.parts.map((part, idx) => {
                  if (part.type === "text") {
                    // Strip any HTML tags the model might output despite instructions.
                    // This is a safety net — the system prompt already forbids it.
                    const safeText = part.text.replace(/<[^>]*>/g, "").trim();
                    return <p key={idx} className="whitespace-pre-wrap">{safeText}</p>;
                  }
                  if (part.type === "dynamic-tool" || part.type.startsWith("tool-")) return <ToolInvocationPart key={part.toolCallId} part={part as any} lang={lang} />;
                  return null;
                })}
              </div>
            </div>
          ))
        )}
        <div ref={chatEndRef} />
      </div>

      <div className="p-4 border-t border-white/5 bg-neutral-900/30 backdrop-blur-sm">
        <form onSubmit={(e) => { e.preventDefault(); if (!input.trim() || isLoading) return; sendMessage({ text: input }); setInput(""); }}
          className="flex gap-2.5">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={translations[lang].inputPlaceholder}
            className="flex-grow bg-white/5 hover:bg-white/7 focus:bg-white/10 border border-white/5 focus:border-emerald-500/30 px-4 py-3 rounded-xl text-xs text-neutral-100 placeholder-neutral-500 outline-none transition-all"
            disabled={isLoading}
          />
          <button type="submit" disabled={isLoading || !input.trim()}
            className="p-3 bg-emerald-500 text-black hover:bg-emerald-400 disabled:opacity-40 rounded-xl transition-all cursor-pointer flex items-center justify-center flex-shrink-0">
            {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Home ─────────────────────────────────────────────────────────────────────

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

  useEffect(() => { setSessions(getSessions()); }, []);

  const handleNew = useCallback(() => {
    setCurrentSessionId(newSessionId());
    setActiveTab("chat");
    setShowMobileSessions(false);
  }, []);

  const handleSelect = useCallback((id: string) => {
    setCurrentSessionId(id);
    setActiveTab("chat");
  }, []);

  const handleDelete = useCallback((id: string) => {
    deleteSession(id);
    setSessions(getSessions());
    if (id === currentSessionId) setCurrentSessionId(newSessionId());
  }, [currentSessionId]);

  const handleSessionUpdate = useCallback((messages: UIMessage[]) => {
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
      if (idx >= 0) { const next = [...prev]; next[idx] = updated; return next; }
      return [updated, ...prev];
    });
  }, [currentSessionId]);

  useEffect(() => {
    if (session?.accessToken) fetchTopTracks(session.accessToken);
  }, [session]);

  const fetchTopTracks = async (token: string) => {
    setLoadingTracks(true);
    try {
      const res = await fetch("https://api.spotify.com/v1/me/top/tracks?limit=8", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) { const data = await res.json(); setTopTracks(data.items ?? []); }
    } catch (err) { console.error("[fetchTopTracks]", err); }
    finally { setLoadingTracks(false); }
  };

  const currentSession = sessions.find((s) => s.id === currentSessionId);

  return (
    <div className={`relative flex flex-col bg-neutral-950 text-neutral-50 selection:bg-emerald-500/30 font-sans ${session ? "h-[100dvh] overflow-hidden" : "min-h-screen"}`}>
      {/* Blobs */}
      <div className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-500/5 blur-[120px] animate-pulse-slow pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-500/5 blur-[120px] animate-pulse-slow-delay pointer-events-none" />

      {/* ── Header ── */}
      <header className="z-20 w-full border-b border-white/5 bg-neutral-950/80 backdrop-blur-md sticky top-0">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-14 flex items-center justify-between gap-3">

          {/* Left: logo + mobile sessions toggle */}
          <div className="flex items-center gap-2 min-w-0">
            {/* Sessions toggle — mobile only */}
            {session && (
              <button
                onClick={() => setShowMobileSessions(true)}
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
                  activeTab === "chat" ? "bg-emerald-500 text-black shadow-md" : "text-neutral-400 hover:text-white"
                }`}
              >
                {translations[lang].aiChat}
              </button>
              <button
                onClick={() => setActiveTab("stats")}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                  activeTab === "stats" ? "bg-emerald-500 text-black shadow-md" : "text-neutral-400 hover:text-white"
                }`}
              >
                {translations[lang].myStats}
              </button>
            </div>
          )}

          {/* Right: language toggle + profile + sign out */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Language Selector */}
            <div className="flex bg-white/5 p-0.5 rounded-full border border-white/5 flex-shrink-0">
              <button
                onClick={() => handleSetLang("en")}
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                  lang === "en" ? "bg-emerald-500 text-black shadow-md" : "text-neutral-400 hover:text-white"
                }`}
              >
                EN
              </button>
              <button
                onClick={() => handleSetLang("nl")}
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                  lang === "nl" ? "bg-emerald-500 text-black shadow-md" : "text-neutral-400 hover:text-white"
                }`}
              >
                NL
              </button>
            </div>

            {session && (
              <>
                {/* Profile pill — desktop only */}
                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/5">
                  {session.user?.image
                    ? <img src={session.user.image} alt="" className="w-5 h-5 rounded-full object-cover" referrerPolicy="no-referrer" />
                    : <User className="w-4 h-4 text-neutral-400" />}
                  <span className="text-xs font-medium text-neutral-300 max-w-[120px] truncate">
                    {session.user?.name ?? "Music Explorer"}
                  </span>
                </div>

                {/* Sign out — always visible */}
                <button
                  onClick={() => signOut()}
                  className="group flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-neutral-400 hover:text-white bg-white/5 hover:bg-red-500/10 border border-white/5 hover:border-red-500/20 transition-all"
                >
                  <LogOut className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  <span className="hidden sm:inline">{translations[lang].signOut}</span>
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── Body ── */}
      <main className={`z-10 flex-grow max-w-7xl w-full mx-auto p-3 md:p-5 min-h-0 flex flex-col ${session ? "overflow-hidden" : "items-stretch"}`}>
        {status === "loading" ? (
          <div className="flex-grow flex flex-col items-center justify-center gap-4">
            <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin" />
            <p className="text-sm text-neutral-400">{translations[lang].loadingSpotify}</p>
          </div>
        ) : !session ? (

          /* ── Landing ── */
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
              <button onClick={() => signIn("spotify")}
                className="relative group inline-flex items-center gap-3 px-8 py-4 bg-emerald-500 text-black hover:bg-emerald-400 font-bold text-base rounded-full shadow-lg shadow-emerald-500/20 transition-all duration-300 hover:-translate-y-0.5 cursor-pointer">
                <LogIn className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                {translations[lang].connectSpotify}
              </button>
              <div className="mt-12 grid grid-cols-3 gap-4 border-t border-white/5 pt-8 max-w-lg mx-auto">
                <div className="text-center"><p className="text-lg font-bold text-white">Gemini 2.5</p><p className="text-xs text-neutral-500">{translations[lang].coreAi}</p></div>
                <div className="text-center border-x border-white/5"><p className="text-lg font-bold text-white">127.0.0.1</p><p className="text-xs text-neutral-500">{translations[lang].secureRedirect}</p></div>
                <div className="text-center"><p className="text-lg font-bold text-white">Auth.js</p><p className="text-xs text-neutral-500">{translations[lang].spotifyProvider}</p></div>
              </div>
            </div>
          </div>

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
              />
            </div>

            {/* Main panel */}
            <div className="col-span-1 md:col-span-3 min-h-0 flex flex-col">
              {activeTab === "stats" ? (

                /* Stats */
                <div className="glass-card rounded-2xl p-5 flex-grow flex flex-col overflow-y-auto">
                  <h3 className="text-lg font-bold mb-1 flex items-center gap-2 flex-shrink-0">
                    <Compass className="w-5 h-5 text-emerald-400" /> {translations[lang].insightsTitle}
                  </h3>
                  <p className="text-xs text-neutral-400 mb-5 flex-shrink-0">
                    {lang === "nl" ? "Opgehaald via " : "Fetched via "} <code className="text-neutral-300 bg-neutral-900 px-1 rounded">user-top-read</code> scope
                  </p>
                  {loadingTracks ? (
                    <div className="flex-grow flex items-center justify-center">
                      <RefreshCw className="w-6 h-6 text-neutral-400 animate-spin" />
                    </div>
                  ) : (
                    <div className="grid sm:grid-cols-2 gap-3 flex-grow content-start">
                      {topTracks.map((track, i) => (
                        <a key={track.id} href={track.external_urls.spotify} target="_blank" rel="noreferrer"
                          className="group flex items-center justify-between p-3 rounded-xl bg-white/3 hover:bg-white/7 border border-white/5 hover:border-white/10 transition-all">
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="text-xs font-extrabold text-neutral-500 group-hover:text-emerald-400 transition-colors w-4 flex-shrink-0">{i + 1}</span>
                            <AlbumArt images={track.album?.images} name={track.name} size={10} />
                            <div className="text-left min-w-0">
                              <p className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors line-clamp-1">{track.name}</p>
                              <p className="text-[10px] text-neutral-400 line-clamp-1">{track.artists.map((a) => a.name).join(", ")}</p>
                            </div>
                          </div>
                          <ExternalLink className="w-3.5 h-3.5 text-neutral-500 group-hover:text-neutral-300 transition-colors flex-shrink-0 ml-2" />
                        </a>
                      ))}
                    </div>
                  )}
                  <button onClick={() => setActiveTab("chat")}
                    className="mt-5 flex-shrink-0 w-full py-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-xs font-semibold transition-all cursor-pointer">
                    {translations[lang].backToCuration}
                  </button>
                </div>

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

      {/* Footer */}
      <footer className="z-10 w-full max-w-7xl mx-auto px-5 py-4 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-500">
        <p>© {new Date().getFullYear()} {translations[lang].copyright}</p>
        <div className="flex gap-5">
          <span>Next.js 16</span>
          <span>Tailwind CSS v4</span>
          <span>Gemini 2.5 Pro</span>
        </div>
      </footer>

      {/* ── Mobile sessions overlay ── */}
      {showMobileSessions && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowMobileSessions(false)} />
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
            />
          </div>
        </div>
      )}
    </div>
  );
}

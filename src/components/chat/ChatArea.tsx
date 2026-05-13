"use client";

import { useState, useRef, useEffect } from "react";
import { useChat } from "@ai-sdk/react";
import { Compass, ArrowRight, RefreshCw, Send } from "lucide-react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { ToolInvocationPart } from "./ToolInvocationPart";
import { translations } from "@/lib/translations";

interface ChatAreaProps {
  sessionId: string;
  initialMessages: UIMessage[];
  onSessionUpdate: (messages: UIMessage[]) => void;
  lang: "en" | "nl";
}

export function ChatArea({
  sessionId,
  initialMessages,
  onSessionUpdate,
  lang,
}: ChatAreaProps) {
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState("");

  const { messages, sendMessage, status } = useChat({
    id: sessionId,
    messages: initialMessages,
    transport: new DefaultChatTransport({
      body: { lang },
    }),
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
                  if (part.type === "dynamic-tool" || part.type.startsWith("tool-")) return <ToolInvocationPart key={(part as any).toolCallId} part={part as any} lang={lang} />;
                  return null;
                })}
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex flex-col items-start animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-none px-4 py-3.5 flex items-center gap-4 glow-purple/20 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-purple-500/5 to-transparent animate-pulse" />
              <div className="flex items-end gap-[3px] h-3.5 relative z-10">
                <div className="w-0.5 h-3 bg-emerald-400 rounded-full animate-audio-wave" style={{ animationDelay: '0ms' }} />
                <div className="w-0.5 h-4 bg-purple-400 rounded-full animate-audio-wave" style={{ animationDelay: '150ms' }} />
                <div className="w-0.5 h-2.5 bg-blue-400 rounded-full animate-audio-wave" style={{ animationDelay: '300ms' }} />
                <div className="w-0.5 h-4 bg-emerald-400 rounded-full animate-audio-wave" style={{ animationDelay: '450ms' }} />
                <div className="w-0.5 h-3 bg-purple-400 rounded-full animate-audio-wave" style={{ animationDelay: '600ms' }} />
              </div>
              <span className="text-[10px] font-black tracking-widest uppercase bg-gradient-to-r from-emerald-400 via-purple-400 to-blue-400 bg-clip-text text-transparent relative z-10">
                {lang === "nl" ? "Signaal Verwerken..." : "Synthesizing..."}
              </span>
            </div>
          </div>
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
            className="flex-grow min-w-0 bg-white/5 hover:bg-white/7 focus:bg-white/10 border border-white/5 focus:border-emerald-500/30 px-4 py-3 rounded-xl text-xs text-neutral-100 placeholder-neutral-500 outline-none transition-all"
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

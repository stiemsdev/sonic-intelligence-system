"use client";

import { Compass, RefreshCw, ExternalLink } from "lucide-react";
import { AlbumArt } from "@/components/shared/AlbumArt";
import type { SpotifyTrack } from "@/types/spotify";
import { translations } from "@/lib/translations";

interface StatsPanelProps {
  loadingTracks: boolean;
  topTracks: SpotifyTrack[];
  lang: "en" | "nl";
  onBackToChat: () => void;
}

export function StatsPanel({
  loadingTracks,
  topTracks,
  lang,
  onBackToChat,
}: StatsPanelProps) {
  return (
    <div className="glass-card rounded-2xl p-5 flex-grow flex flex-col overflow-y-auto">
      <h3 className="text-lg font-bold mb-1 flex items-center gap-2 flex-shrink-0">
        <Compass className="w-5 h-5 text-emerald-400" /> {translations[lang].insightsTitle}
      </h3>
      <p className="text-xs text-neutral-400 mb-5 flex-shrink-0">
        {lang === "nl" ? "Opgehaald via " : "Fetched via "}{" "}
        <code className="text-neutral-300 bg-neutral-900 px-1 rounded">user-top-read</code> scope
      </p>
      {loadingTracks ? (
        <div className="flex-grow flex items-center justify-center">
          <RefreshCw className="w-6 h-6 text-neutral-400 animate-spin" />
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3 flex-grow content-start">
          {topTracks.map((track, i) => (
            <a
              key={track.id}
              href={track.external_urls.spotify}
              target="_blank"
              rel="noreferrer"
              className="group flex items-center justify-between p-3 rounded-xl bg-white/3 hover:bg-white/7 border border-white/5 hover:border-white/10 transition-all"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-xs font-extrabold text-neutral-500 group-hover:text-emerald-400 transition-colors w-4 flex-shrink-0">
                  {i + 1}
                </span>
                <AlbumArt images={track.album?.images} name={track.name} size={10} />
                <div className="text-left min-w-0">
                  <p className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors line-clamp-1">
                    {track.name}
                  </p>
                  <p className="text-[10px] text-neutral-400 line-clamp-1">
                    {track.artists.map((a) => a.name).join(", ")}
                  </p>
                </div>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-neutral-500 group-hover:text-neutral-300 transition-colors flex-shrink-0 ml-2" />
            </a>
          ))}
        </div>
      )}
      <button
        onClick={onBackToChat}
        className="mt-5 flex-shrink-0 w-full py-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-xs font-semibold transition-all cursor-pointer"
      >
        {translations[lang].backToCuration}
      </button>
    </div>
  );
}

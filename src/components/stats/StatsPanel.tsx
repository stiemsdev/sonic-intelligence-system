"use client";

import { Sparkles, RefreshCw, ExternalLink, User, Music, MessageSquare } from "lucide-react";
import { AlbumArt } from "@/components/shared/AlbumArt";
import type { SpotifyTrack, SpotifyArtist, SpotifyPlaylist } from "@/types/spotify";
import { translations } from "@/lib/translations";

interface StatsPanelProps {
  loadingStats: boolean;
  topTracks: SpotifyTrack[];
  topArtists: SpotifyArtist[];
  userPlaylists: SpotifyPlaylist[];
  timeRange: "short_term" | "medium_term" | "long_term";
  onTimeRangeChange: (range: "short_term" | "medium_term" | "long_term") => void;
  lang: "en" | "nl";
  onBackToChat: () => void;
}

export function StatsPanel({
  loadingStats,
  topTracks,
  topArtists,
  userPlaylists,
  timeRange,
  onTimeRangeChange,
  lang,
  onBackToChat,
}: StatsPanelProps) {
  return (
    <div className="glass-card rounded-2xl p-5 flex-grow flex flex-col overflow-y-auto custom-scrollbar">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 flex-shrink-0">
        <div>
          <h3 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-400" /> {translations[lang].insightsTitle}
          </h3>
          <p className="text-xs text-neutral-400 mt-1">
            {translations[lang].insightsDesc}
          </p>
        </div>
        
        {/* Time range selector */}
        <div className="flex bg-white/5 p-1 rounded-lg border border-white/5 text-[10px] font-bold">
          {(["short_term", "medium_term", "long_term"] as const).map((r) => (
            <button
              key={r}
              onClick={() => onTimeRangeChange(r)}
              className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                timeRange === r
                  ? "bg-emerald-500 text-black shadow-sm"
                  : "text-neutral-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {r === "short_term"
                ? translations[lang].shortTerm
                : r === "medium_term"
                ? translations[lang].mediumTerm
                : translations[lang].longTerm}
            </button>
          ))}
        </div>
      </div>

      {loadingStats ? (
        <div className="flex-grow flex flex-col items-center justify-center gap-3 text-neutral-500">
          <RefreshCw className="w-8 h-8 animate-spin text-emerald-400" />
          <span className="text-xs animate-pulse">Synthesizing audio insights...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-grow content-start">
          {/* Top Artists */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 px-1">
              {translations[lang].topArtists}
            </h4>
            <div className="space-y-2">
              {topArtists.map((artist, i) => (
                <a key={artist.id} href={artist.external_urls.spotify} target="_blank" rel="noreferrer"
                  className="group flex items-center gap-3 p-2 rounded-xl bg-white/3 hover:bg-white/7 border border-white/5 hover:border-white/10 transition-all">
                  <span className="text-[10px] font-black text-neutral-600 group-hover:text-emerald-400 transition-colors w-4 text-center flex-shrink-0">{i + 1}</span>
                  <div className="relative w-10 h-10 flex-shrink-0 rounded-full overflow-hidden border border-white/10">
                    {artist.images?.[0]?.url ? (
                      <img src={artist.images[artist.images.length - 1].url} alt={artist.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-full h-full bg-neutral-800 flex items-center justify-center"><User className="w-4 h-4 text-neutral-500" /></div>
                    )}
                  </div>
                  <div className="min-w-0 flex-grow">
                    <p className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors truncate">{artist.name}</p>
                    <p className="text-[9px] text-neutral-500 truncate capitalize">{(artist.genres || []).slice(0, 2).join(" • ")}</p>
                  </div>
                  <ExternalLink className="w-3 h-3 text-neutral-600 group-hover:text-white opacity-0 group-hover:opacity-100 transition-all mr-2" />
                </a>
              ))}
            </div>
          </div>

          {/* Top Tracks */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 px-1">
              {translations[lang].topTracks}
            </h4>
            <div className="space-y-2">
              {topTracks.map((track, i) => (
                <a key={track.id} href={track.external_urls.spotify} target="_blank" rel="noreferrer"
                  className="group flex items-center gap-3 p-2 rounded-xl bg-white/3 hover:bg-white/7 border border-white/5 hover:border-white/10 transition-all">
                  <span className="text-[10px] font-black text-neutral-600 group-hover:text-emerald-400 transition-colors w-4 text-center flex-shrink-0">{i + 1}</span>
                  <AlbumArt images={track.album?.images} name={track.name} size={10} />
                  <div className="min-w-0 flex-grow">
                    <p className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors truncate">{track.name}</p>
                    <p className="text-[9px] text-neutral-500 truncate">{(track.artists || []).map(a => a.name).join(", ")}</p>
                  </div>
                  <ExternalLink className="w-3 h-3 text-neutral-600 group-hover:text-white opacity-0 group-hover:opacity-100 transition-all mr-2" />
                </a>
              ))}
            </div>
          </div>

          {/* Playlists */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 px-1">
              {translations[lang].myPlaylists}
            </h4>
            <div className="space-y-2">
              {userPlaylists.map((playlist) => (
                <a key={playlist.id} href={playlist.external_urls.spotify} target="_blank" rel="noreferrer"
                  className="group flex items-center gap-3 p-2 rounded-xl bg-white/3 hover:bg-white/7 border border-white/5 hover:border-white/10 transition-all">
                  <div className="relative w-10 h-10 flex-shrink-0 rounded-lg overflow-hidden border border-white/10">
                    {playlist.images?.[0]?.url ? (
                      <img src={playlist.images[0].url} alt={playlist.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-full h-full bg-neutral-800 flex items-center justify-center"><Music className="w-4 h-4 text-neutral-500" /></div>
                    )}
                  </div>
                  <div className="min-w-0 flex-grow">
                    <p className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors truncate">{playlist.name}</p>
                    <p className="text-[9px] text-neutral-500 truncate">{playlist.tracks?.total || 0} tracks • {playlist.owner?.display_name}</p>
                  </div>
                  <ExternalLink className="w-3 h-3 text-neutral-600 group-hover:text-white opacity-0 group-hover:opacity-100 transition-all mr-2" />
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
      
      <button onClick={onBackToChat}
        className="mt-6 flex-shrink-0 w-full py-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-xs font-semibold text-neutral-300 hover:text-white transition-all cursor-pointer flex items-center justify-center gap-2">
        <MessageSquare className="w-3.5 h-3.5" /> {translations[lang].backToCuration}
      </button>
    </div>
  );
}

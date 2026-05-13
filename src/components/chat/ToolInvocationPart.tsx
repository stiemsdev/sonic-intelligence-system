"use client";

import { Sparkles, AlertCircle, Check, ExternalLink } from "lucide-react";
import { TrackCard } from "@/components/shared/TrackCard";
import type { SpotifyTrack } from "@/types/spotify";

interface ToolInvocationPartProps {
  part: any;
  lang: "en" | "nl";
}

export function ToolInvocationPart({ part, lang }: ToolInvocationPartProps) {
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

    if (toolName === "getTopArtists") {
      return (
        <div className="mt-3 flex items-center gap-2 text-[10px] text-emerald-400 bg-emerald-500/10 px-2.5 py-1.5 rounded-lg border border-emerald-500/20">
          <Check className="w-3.5 h-3.5" />
          <span>{lang === "nl" ? "Jouw favoriete artiesten meegenomen in analyse" : "Analyzed your top artists for context"}</span>
        </div>
      );
    }

    if (toolName === "getUserPlaylists") {
      return (
        <div className="mt-3 flex items-center gap-2 text-[10px] text-emerald-400 bg-emerald-500/10 px-2.5 py-1.5 rounded-lg border border-emerald-500/20">
          <Check className="w-3.5 h-3.5" />
          <span>{lang === "nl" ? "Bestaande collecties en genres gescand" : "Scanned existing collections and styles"}</span>
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

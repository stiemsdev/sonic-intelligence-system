"use client";

import { ExternalLink } from "lucide-react";
import { AlbumArt } from "./AlbumArt";
import type { SpotifyTrack } from "@/types/spotify";

interface TrackCardProps {
  track: SpotifyTrack;
}

export function TrackCard({ track }: TrackCardProps) {
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

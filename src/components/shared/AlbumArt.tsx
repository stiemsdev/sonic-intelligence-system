"use client";

import { useState } from "react";
import { Music } from "lucide-react";

interface AlbumArtProps {
  images?: { url: string }[];
  name: string;
  size?: number;
}

/**
 * Renders album art with a Music icon fallback.
 *
 * Key: referrerPolicy="no-referrer" — Spotify's CDN silently blocks image
 * requests that carry a Referer header pointing to localhost/127.0.0.1.
 * Stripping the referrer lets the CDN serve the image unconditionally.
 */
export function AlbumArt({ images, name, size = 9 }: AlbumArtProps) {
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

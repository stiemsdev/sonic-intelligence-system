"use client";

import { Trash2 } from "lucide-react";
import type { ChatSession } from "@/lib/chatHistory";

interface SessionItemProps {
  session: ChatSession;
  isActive: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

/**
 * Delete button is ALWAYS visible (not hover-only) so it works on touch.
 * We use subtle opacity instead of display:none.
 */
export function SessionItem({
  session,
  isActive,
  onSelect,
  onDelete,
}: SessionItemProps) {
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

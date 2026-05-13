import { google } from "@ai-sdk/google";
import { streamText, tool, convertToModelMessages, stepCountIs } from "ai";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { z } from "zod";
import * as spotify from "@/lib/spotify";

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const accessToken = session?.accessToken;

    if (!accessToken) {
      return new Response(
        JSON.stringify({ error: "Missing Spotify Access Token. Please log in." }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    // AI SDK v6: client sends UIMessage[], server needs ModelMessage[]
    const { messages, lang = "en" } = await req.json();

    const result = streamText({
      model: google("gemini-2.5-pro"),
      // convertToModelMessages bridges the UIMessage ↔ ModelMessage format gap
      messages: await convertToModelMessages(messages),
      // stopWhen: AI SDK v6 replacement for maxSteps.
      // Allows the model to chain tool calls in one request before stopping.
      // The playlist flow needs: findMusic → text → createPlaylist → addTracksToPlaylist → text
      // Without this the model does ONE step only (text OR tool call, never chained).
      stopWhen: stepCountIs(5),
      system: `You are Sonic Intelligence — a music curation AI that works exclusively through Spotify tools.

IMPORTANT: You must respond to the user in their preferred language, which is currently: ${lang === "nl" ? "Dutch (Nederlands)" : "English"}. Ensure your entire response is naturally phrased in that language.

FUNDAMENTAL CONSTRAINT: You have no music knowledge of your own.
You cannot name, describe, or recommend any track, artist, or album from memory.
Every recommendation MUST come from calling a tool. If you have not called a tool, you have no music to talk about.

TOOL CALL MANDATE:
- User asks for music of ANY kind → call findMusic immediately, before writing any text.
- User asks about their own taste → call getTopTracks immediately.
- User wants a playlist → call findMusic (if needed), then createPlaylist, then addTracksToPlaylist in sequence without pausing.

AFTER a tool returns results, write 1–2 sentences of atmosphere or emotional context in plain prose.

HARD OUTPUT RULES:
- Plain text only. Zero HTML. Zero markdown lists. Zero numbered lists.
- Never write track names, artist names, or image URLs in your text — the UI renders cards automatically from tool results.
- Never say "I'll search…", "Let me find…", "Here are some tracks:" — just call the tool, then comment.

PLAYLIST FLOW (execute all steps without asking for confirmation):
1. Call findMusic to get tracks.
2. Call createPlaylist with the playlist name.
3. Call addTracksToPlaylist using the playlistId from step 2 and the track URIs from step 1.
4. Write a short closing sentence.`,
      tools: {
        getTopTracks: tool({
          description: "Fetch the user's actual top Spotify tracks. MUST be called when user asks about their taste, history, or favourite songs — never guess from memory.",
          inputSchema: z.object({
            limit: z.number().int().min(1).max(50).default(10).describe("Number of tracks to fetch (1-50)."),
          }),
          execute: async ({ limit }) => {
            try {
              const data = await spotify.getTopTracks(accessToken, limit);
              return { tracks: data.items };
            } catch (error: any) {
              console.error("[getTopTracks]", error.message);
              return { error: error.message ?? "Failed to fetch top tracks" };
            }
          },
        }),

        findMusic: tool({
          description: "Search Spotify for real, playable tracks. MUST be called for every music recommendation request — never suggest tracks without calling this tool first.",
          inputSchema: z.object({
            query: z.string().describe("Search query, e.g. 'ambient lofi study' or 'upbeat 80s synthwave'."),
            limit: z.number().int().min(1).max(50).default(8).describe("Number of tracks to return (1-50)."),
          }),
          execute: async ({ query, limit }) => {
            try {
              const data = await spotify.searchTracks(accessToken, query, limit);
              return { tracks: data.tracks.items };
            } catch (error: any) {
              console.error("[findMusic]", error.message);
              return { error: error.message ?? "Failed to search Spotify" };
            }
          },
        }),

        createPlaylist: tool({
          description: "Create a new public Spotify playlist for the user.",
          inputSchema: z.object({
            name: z.string().describe("Playlist name, e.g. 'Rainy Day Jazz'."),
            description: z.string().optional().describe("Short description of the playlist vibe."),
          }),
          execute: async ({ name, description }) => {
            try {
              const playlist = await spotify.createPlaylist(accessToken, name, description);
              return { playlistId: playlist.id, url: playlist.external_urls.spotify, name };
            } catch (error: any) {
              console.error("[createPlaylist]", error.message);
              return { error: error.message ?? "Failed to create playlist" };
            }
          },
        }),

        addTracksToPlaylist: tool({
          description: "Add tracks (by Spotify URI) to an existing playlist.",
          inputSchema: z.object({
            playlistId: z.string().describe("Target playlist ID."),
            trackUris: z
              .array(z.string())
              .describe("Array of Spotify track URIs, e.g. ['spotify:track:4iV5W9uYEdYUVa79Axb7Rh']."),
          }),
          execute: async ({ playlistId, trackUris }) => {
            try {
              await spotify.addTracksToPlaylist(accessToken, playlistId, trackUris);
              return { success: true, count: trackUris.length };
            } catch (error: any) {
              console.error("[addTracksToPlaylist]", error.message);
              return { error: error.message ?? "Failed to add tracks" };
            }
          },
        }),
      },
    });

    // AI SDK v6: toDataStreamResponse() is gone — use toUIMessageStreamResponse()
    return result.toUIMessageStreamResponse();
  } catch (error: any) {
    console.error("[POST /api/chat]", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

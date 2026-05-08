# Agent Specification: Spotify AI Discovery Experience (Gemini Edition)

## 1. Project Context
[cite_start]This is a **Creative AI Developer Assessment** for Incentro[cite: 1, 3]. [cite_start]The goal is to build an AI-powered music discovery POC within an **8-hour limit**[cite: 4, 10, 11].

[cite_start]**Core Goal:** Replace traditional filters with a natural language conversation interface[cite: 11, 14].

## 2. Tech Stack & AI Configuration
* **Framework:** Next.js 14+ (App Router).
* **Auth:** Auth.js (NextAuth.js) with Spotify Provider.
* **AI SDK:** Vercel AI SDK using `@ai-sdk/google` provider.
* **Model:** **Gemini 2.0 Flash** (Chosen for high speed, large context, and generous free tier).
* **Styling:** Tailwind CSS + Shadcn/UI.

## 3. Critical Configuration
* **Redirect URI:** `http://127.0.0.1:3000/api/auth/callback/spotify` (Pragmatic fix for Spotify Dashboard local URI validation).
* **API Key:** `GOOGLE_GENERATIVE_AI_API_KEY` (Generated via Google AI Studio linked to "Sonic Intelligence System" project).
* [cite_start]**Scopes:** `user-read-private`, `user-read-email`, `user-library-read`, `playlist-modify-public`[cite: 20].

## 4. Feature Roadmap
1.  **Auth Setup:** Secure Spotify login flow.
2.  **Gemini Integration:** Implement `streamText` with Gemini 2.0 Flash.
3.  [cite_start]**Tool Calling:** Define a `searchSpotify` tool so the AI can fetch real-time music data based on user mood/context[cite: 13, 19].
4.  **UI:** Chat-based interface with interactive track cards and playback embeds.

## [cite_start]5. Assessment Priorities [cite: 16]
* [cite_start]**Code Quality:** Clean structure in `/components`, `/lib`, and `/api`[cite: 17].
* [cite_start]**AI Application:** Focus on smart prompting and effective tool usage[cite: 19].
* [cite_start]**Pragmatism:** Document the choice for Gemini (free tier/speed) and the 127.0.0.1 redirect in the README[cite: 8, 18].

## Environment Variables (Strictly via .env.local)
The agent must use the following environment variables. Do NOT hardcode these values:
* `SPOTIFY_CLIENT_ID`
* `SPOTIFY_CLIENT_SECRET`
* `GOOGLE_GENERATIVE_AI_API_KEY`
* `NEXTAUTH_SECRET`
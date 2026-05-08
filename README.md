# Sonic Intelligence System 🎵🤖

Welcome to **Sonic Intelligence System**, a next-generation AI-powered music discovery experience built for the Incentro Creative AI Developer Assessment. 

This Proof of Concept (POC) replaces traditional music search bars and filters with a natural language conversation interface powered by **Gemini 2.0 Flash** and **Spotify API** integration.

---

## 🚀 Tech Stack

- **Framework:** Next.js 16 (App Router & Turbopack)
- **Auth:** Auth.js (NextAuth.js v4) with Spotify Provider
- **AI SDK:** Vercel AI SDK with Google Gemini 2.0 Flash (high speed, generous free tier)
- **Styling:** Tailwind CSS v4 (native CSS-first styling, glassmorphism, glowing micro-animations)
- **Language:** TypeScript

---

## 🛠️ Architecture & Folder Structure

We have initialized a clean and scalable Next.js folder structure:

```bash
sonic-intelligence-system/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   └── [...nextauth]/
│   │   │   │       └── route.ts       # Secure Spotify OAuth NextAuth configuration
│   │   │   └── chat/
│   │   │       └── route.ts           # AI Chat endpoint (ready for Gemini integration)
│   │   ├── globals.css                # Tailwind CSS v4 custom animations & utilities
│   │   ├── layout.tsx                 # Root layout with premium Inter typography
│   │   └── page.tsx                   # Sleek landing page & verification dashboard
│   ├── components/
│   │   └── Providers.tsx              # SessionProvider client-side wrapper
│   └── lib/
│       └── spotify.ts                 # Type-safe Spotify API fetch wrapper
├── .env.local                         # Environment variables
├── next.config.mjs                    # Next.js configurations
└── tsconfig.json                      # Custom TypeScript configuration
```

---

## 🔐 Core Features (Task 1 & 2 Completed)

### 1. Spotify OAuth Login Flow
- Integrates Auth.js (NextAuth) using the official **Spotify Provider**.
- Securely requests specific scopes to perform authorized actions:
  - `user-read-email` (for profile identification)
  - `user-top-read` (for personalized recommendations)
  - `playlist-modify-public` (for saving AI-generated playlists)
  - `user-read-private` / `user-library-read` (additional context)

### 2. Pragmatic Redirect Configuration
- Configured to redirect back to `http://127.0.0.1:3000/api/auth/callback/spotify`.
- *Why 127.0.0.1?* Spotify Developer Dashboard often enforces strict URI validation where `localhost` can fail or cause session mismatches. Using `127.0.0.1` is the industry-standard developer solution to guarantee stable local OAuth flows.

### 3. Beautiful Landing & Interactive Verification Dashboard
- **Rich Dark Aesthetics:** Sleek, immersive dark mode utilizing Tailwind CSS v4 gradients, glassmorphism (`glass-card`), and glowing micro-animations (`glow-green`, `glow-purple`).
- **Interactive Session Verification:**
  - If signed out, presents a premium landing view encouraging Spotify connection.
  - If signed in, displays user profile information (avatar, display name, email) and dynamically fetches the user's top 5 tracks in real-time to immediately prove that the `user-top-read` scope and session `accessToken` work perfectly!

---

## ⚡ Setup & Development

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Configure Environment Variables:**
   Create a `.env.local` file in the root directory:
   ```env
   SPOTIFY_CLIENT_ID='your_client_id'
   SPOTIFY_CLIENT_SECRET='your_client_secret'
   GOOGLE_GENERATIVE_AI_API_KEY='your_gemini_api_key'
   NEXTAUTH_URL=http://127.0.0.1:3000
   NEXTAUTH_SECRET='your_nextauth_secret_session_key'
   ```

3. **Run the Development Server:**
   ```bash
   npm run dev
   ```
   Open [http://127.0.0.1:3000](http://127.0.0.1:3000) in your browser.

4. **Production Build Verification:**
   ```bash
   npm run build
   ```

---

## ✨ Design Philosophy

- **Premium Feel:** Curated dark palette (`bg-neutral-950`) accented with Emerald green (`spotify`) and deep Purple neon highlights.
- **Dynamic Feedback:** Subtle spinning disk icon on the header and floating gradient background blobs create a responsive, living interface.
- **Zero Placeholders:** Active Spotify API integrations load actual user details to give a genuine production-ready feel from the very first step.

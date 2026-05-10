# 🎵 Sonic Intelligence: AI-Powered Music Discovery

**Sonic Intelligence** is een Proof of Concept (POC) die laat zien hoe de traditionele zoekbalk vervangen kan worden door een creatieve, AI-gestuurde dialoog. In plaats van te filteren op genre of jaar, praat de gebruiker met een muzikale curator die emotie, context en smaak begrijpt en direct vertaalt naar de Spotify-bibliotheek.

Dit project is gebouwd als onderdeel van het **Creative AI Developer Assessment voor Incentro**.

---

## 🚀 De Visie (Creative AI)

Als Creative AI Developer is het de uitdaging om de drempel tussen menselijke emotie en digitale data te verkleinen. **Sonic Intelligence** gebruikt de Google Gemini familie — en specifiek de geavanceerde **Gemini 2.5 Pro** in deze setup — om vage, emotionele of contextuele input ("*Ik heb een baaldag en zoek iets wat klinkt als een regenachtige zondag in Parijs*") om te zetten in concrete Spotify-queries en directe acties.

Het doel is niet slechts een chatbot die praat *over* muziek, maar een AI-agent die daadwerkelijk *acteert* in de audio-omgeving van de gebruiker.

---

## 🛠️ Tech Stack & Keuzes

Er is gekozen voor een moderne, "bleeding-edge" en robuuste stack gericht op performance en developer experience:

*   **Framework:** Next.js (App Router) & React — Voor optimale performance en gebruik van moderne server-side features en streaming API's.
*   **AI Engine:** **Google Gemini (Gemini 2.5 Pro)** — Gekozen vanwege de superieure redeneerkwaliteit, het enorme context window en de zeer stabiele tool-calling capaciteiten. De integratie is schaalbaar opgezet zodat er makkelijk geswitcht kan worden binnen de Gemini-modellen (zoals 2.0 Flash) afhankelijk van latency vs intelligentie-eisen.
*   **AI Orchestration:** **Vercel AI SDK** — Gebruikt voor de naadloze streaming van AI-responses naar de client en robuuste "Tool Calling" waarbij de AI zelfstandig de regie pakt over Spotify API-aanroepen.
*   **Authentication:** **NextAuth.js (Auth.js)** — Veilige OAuth-integratie met Spotify, inclusief het persistent maken van tokens voor server-side API gebruik.
*   **Styling:** **Tailwind CSS** — Toegepast in een "Glassmorphism" design met subtiele micro-animaties om een premium look & feel te bieden.
*   **Package Manager:** **pnpm** — Vanwege de strikte dependency resolution en snelheid ten opzichte van npm/yarn.

---

## 💡 Belangrijke Implementatie-details

### 1. Tool Calling (The Bridge)
In plaats van de AI simpelweg te laten hallucineren of praten, is er een functionele koppeling gemaakt via de Vercel AI SDK. Het model heeft toegang tot:
*   `findMusic`: Realtime Spotify-zoekopdrachten op basis van vibe/context.
*   `getTopTracks`: Inzicht in de daadwerkelijke smaak van de gebruiker (via `user-top-read`).
*   `createPlaylist` & `addTracksToPlaylist`: Kettingreacties waarbij de AI in één beurt een lijst vindt, een afspeellijst creëert en de tracks toevoegt, zónder dat de gebruiker tussendoor hoeft te klikken.

### 2. Multi-Session & Persistence
De applicatie houdt lokaal (via local storage) een geschiedenis bij van eerdere gesprekken. Gebruikers kunnen sessies teruglezen, verwijderen of nieuwe starten, wat zorgt voor een complete 'ChatGPT-achtige' ervaring.

### 3. Type Safety & Failsafes
Het project gebruikt TypeScript door de gehele stack. De API utilities in `src/lib/spotify.ts` vangen fouten af (zoals het retryen van playlist creation als een profiel op privaat staat) en valideren input via Zod schema's binnen de AI tools om runtime errors te voorkomen.

### 4. Meertaligheid (Internationalization)
Er is een naadloze EN/NL toggle geïmplementeerd. Niet alleen de interface vertaalt mee, maar ook de **system prompt** naar Gemini wordt dynamisch aangepast, zodat de AI antwoordt in de gekozen taal van de gebruiker.

---

## ⚙️ Installatie & Setup

1.  **Kloon de repository:**
    ```bash
    git clone https://github.com/stiemsdev/sonic-intelligence-system.git
    cd sonic-intelligence-system
    ```

2.  **Installeer dependencies:**
    Gebruik `pnpm` voor de installatie:
    ```bash
    pnpm install
    ```

3.  **Configureer Environment Variables:**
    Maak een `.env.local` bestand aan in de root en vul de volgende variabelen in:
    ```env
    SPOTIFY_CLIENT_ID="jouw_spotify_client_id"
    SPOTIFY_CLIENT_SECRET="jouw_spotify_client_secret"
    GOOGLE_GENERATIVE_AI_API_KEY="jouw_gemini_api_key"
    NEXTAUTH_SECRET="een_willekeurige_geheime_string"
    NEXTAUTH_URL="http://127.0.0.1:3000"
    ```

4.  **Draai de Development Server:**
    ```bash
    pnpm dev
    ```
    Bezoek vervolgens [http://127.0.0.1:3000](http://127.0.0.1:3000).

> [!IMPORTANT]
> **Redirect URI:** Gebruik specifiek `http://127.0.0.1:3000` in plaats van `localhost` in de Spotify Developer Dashboard instellingen. Spotify's OAuth validation is stabieler op het directe IP loopback-adres dan op de localhost hostname.

---

## 📝 Reflectie & Pragmatische Keuzes

Tijdens deze ontwikkeling binnen het tijdspan van het assessment is de nadruk gelegd op de balans tussen 'AI-creativiteit' en 'technische robuustheid':
*   **Modelkeuze:** Hoewel Flash extreem snel is, biedt Gemini 2.5 Pro net die extra laag finesse in het volgen van complexe tool-calling instructies (zoals het chainen van Playlist creation zonder tussenstop), wat de UX naar een hoger plan tilt.
*   **Referrer Policy:** Een praktisch detail is toegevoegd aan de `<img />` tags van album covers (`referrerPolicy="no-referrer"`), aangezien Spotify's CDN soms afbeeldingen blokkeert bij requests vanaf localhost omwille van CORS-policy issues.
*   **Zero-Maintenance Backend:** Door gebruik te maken van de Next.js API routes en de Vercel AI SDK, is er geen aparte server nodig; de volledige orchestration gebeurt via Serverless/Edge constructies.

---

## 📄 Licentie

Dit project valt onder de [MIT License](LICENSE).


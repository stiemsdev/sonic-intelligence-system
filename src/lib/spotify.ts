/**
 * Spotify API Utilities
 * Simple and robust fetch wrapper for Spotify API requests using NextAuth access tokens.
 */

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: { name: string }[];
  album: { name: string; images: { url: string }[] };
  external_urls: { spotify: string };
  uri: string;
}

export interface SpotifyProfile {
  id: string;
  display_name: string;
  email: string;
  images: { url: string }[];
}

/**
 * Helper to execute authorized fetches to the Spotify API
 */
async function spotifyFetch<T>(endpoint: string, accessToken: string, options: RequestInit = {}): Promise<T> {
  const url = endpoint.startsWith("http") ? endpoint : `https://api.spotify.com/v1${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => "Unknown error");
    throw new Error(`Spotify API Error [${response.status}]: ${errorBody}`);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json() as Promise<T>;
}

/**
 * Get the current user's profile
 */
export async function getProfile(accessToken: string): Promise<SpotifyProfile> {
  return spotifyFetch<SpotifyProfile>("/me", accessToken);
}

/**
 * Get the current user's top tracks
 */
export async function getTopTracks(accessToken: string, limit = 10): Promise<{ items: SpotifyTrack[] }> {
  return spotifyFetch<{ items: SpotifyTrack[] }>(`/me/top/tracks?limit=${limit}`, accessToken);
}

/**
 * Search tracks by query
 */
export async function searchTracks(accessToken: string, query: string, limit = 10): Promise<{ tracks: { items: SpotifyTrack[] } }> {
  const encodedQuery = encodeURIComponent(query);
  return spotifyFetch<{ tracks: { items: SpotifyTrack[] } }>(
    `/search?q=${encodedQuery}&type=track&limit=${limit}`,
    accessToken
  );
}

/**
 * Create a new playlist for the user
 */
export async function createPlaylist(
  accessToken: string,
  userId: string,
  name: string,
  description = "Created by Sonic Intelligence System AI"
): Promise<{ id: string; external_urls: { spotify: string } }> {
  try {
    return await spotifyFetch<{ id: string; external_urls: { spotify: string } }>(
      `/users/${userId}/playlists`,
      accessToken,
      {
        method: "POST",
        body: JSON.stringify({
          name,
          description,
          public: true,
        }),
      }
    );
  } catch (error) {
    console.warn("[createPlaylist] Failed with public: true, retrying with public: false...", error);
    return await spotifyFetch<{ id: string; external_urls: { spotify: string } }>(
      `/users/${userId}/playlists`,
      accessToken,
      {
        method: "POST",
        body: JSON.stringify({
          name,
          description,
          public: false,
        }),
      }
    );
  }
}

/**
 * Add tracks to an existing playlist
 */
export async function addTracksToPlaylist(
  accessToken: string,
  playlistId: string,
  trackUris: string[]
): Promise<{ snapshot_id: string }> {
  return spotifyFetch<{ snapshot_id: string }>(
    `/playlists/${playlistId}/tracks`,
    accessToken,
    {
      method: "POST",
      body: JSON.stringify({
        uris: trackUris,
      }),
    }
  );
}

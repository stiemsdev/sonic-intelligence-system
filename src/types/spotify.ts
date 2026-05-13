export interface SpotifyTrack {
  id: string;
  name: string;
  artists: { name: string }[];
  album: { name: string; images: { url: string }[] };
  external_urls: { spotify: string };
  uri: string;
}

export interface SpotifyArtist {
  id: string;
  name: string;
  images: { url: string }[];
  external_urls: { spotify: string };
  genres: string[];
}

export interface SpotifyPlaylist {
  id: string;
  name: string;
  images: { url: string }[];
  external_urls: { spotify: string };
  owner: { display_name: string };
  tracks: { total: number };
}

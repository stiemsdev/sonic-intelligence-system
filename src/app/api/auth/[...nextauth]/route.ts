import NextAuth from "next-auth";
import SpotifyProvider from "next-auth/providers/spotify";

// Extend NextAuth types to hold our access token
declare module "next-auth" {
  interface Session {
    accessToken?: string;
    error?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: number;
  }
}

export const authOptions = {
  providers: [
    SpotifyProvider({
      clientId: (process.env.SPOTIFY_CLIENT_ID || "").replace(/['"]/g, ""),
      clientSecret: (process.env.SPOTIFY_CLIENT_SECRET || "").replace(/['"]/g, ""),
      authorization: {
        params: {
          scope: "user-read-email playlist-modify-public playlist-modify-private playlist-read-private playlist-read-collaborative user-top-read user-read-private user-library-read user-follow-read",
          show_dialog: "true",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }: { token: any; account: any }) {
      // Persist the OAuth access_token and refresh_token to the token right after signin
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.expiresAt = account.expires_at;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      // Send properties to the client, like an access_token from a provider
      session.accessToken = token.accessToken;
      return session;
    },
  },
  secret: (process.env.NEXTAUTH_SECRET || "").replace(/['"]/g, ""),
  pages: {
    signIn: "/",
  },
  debug: true,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

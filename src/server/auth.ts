// import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { type GetServerSidePropsContext } from "next";
import {
  getServerSession,
  type DefaultSession,
  type NextAuthOptions,
  type TokenSet,
} from "next-auth";
import GoogleProvider from "next-auth/providers/google";

import { env } from "~/env.mjs";
// import { db } from "~/server/db";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: DefaultSession["user"] & {
      id: string;
      // ...other properties
      // role: UserRole;
    };
    token: TokenSet;
  }

  // interface User {
  //   // ...other properties
  //   // role: UserRole;
  // }
}

// const GOOGLE_AUTHORIZATION_URL =

/**
 * Takes a token, and returns a new token with updated
 * `accessToken` and `accessTokenExpires`. If an error occurs,
 * returns the old token and an error property
 */
async function refreshAccessToken(token: TokenSet) {
  try {
    const url = "https://oauth2.googleapis.com/token";
    if (token.refresh_token) {
      const options = {
        client_id: env.GOOGLE_CLIENT_ID,
        client_secret: env.GOOGLE_CLIENT_SECRET,
        grant_type: "refresh_token",
        refresh_token: token.refresh_token,
      };
      const qs = new URLSearchParams(options);

      const response = await fetch(`${url}?${qs.toString()}`, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        method: "POST",
      });

      const refreshedTokens = await response.json();

      if (!response.ok) {
        throw refreshedTokens;
      }

      return {
        ...token,
        access_token: refreshedTokens.access_token,
        access_token_expires: Date.now() + refreshedTokens.expires_in * 1000,
        refresh_token: refreshedTokens.refresh_token ?? token.refreshToken, // Fall back to old refresh token
      };
    }
  } catch (error) {
    console.log(error);

    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}

const scopes = [
  "https://www.googleapis.com/auth/youtube",
  "openid",
  "email",
  "profile",
];

const rootURL = "https://accounts.google.com/o/oauth2/v2/auth";

const options = {
  access_type: "offline",
  response_type: "code",
  prompt: "consent",
  // scope: scopes.join(" "),
};

const qs = new URLSearchParams(options);

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  callbacks: {
    jwt: ({ token, account }) => {
      if (account) {
        token = {
          ...token,
          access_token: account.access_token,
          access_token_expires: account.expires_at,
          refresh_token: account.refresh_token,
          scope: account.scope,
        };

        // Return previous token if the access token has not expired yet
        if (Date.now() < account.expires_at! * 1000) {
          return token;
        }
        return refreshAccessToken(token);
      }
      return token;
    },
    session: ({ session, token }) => {
      session = {
        ...session,
        token,
      };
      return session;
    },
    redirect: () => {
      return "/app";
    },
  },
  // adapter: PrismaAdapter(db),
  providers: [
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      authorization: {
        url: `${rootURL}?${qs.toString()}`,
        params: {
          scope: scopes.join(" "),
        },
      },
    }),
  ],
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = (ctx: {
  req: GetServerSidePropsContext["req"];
  res: GetServerSidePropsContext["res"];
}) => {
  return getServerSession(ctx.req, ctx.res, authOptions);
};

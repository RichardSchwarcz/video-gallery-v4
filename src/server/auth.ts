import type { NextApiRequest, NextApiResponse } from 'next'
import {
  getServerSession,
  type DefaultSession,
  type NextAuthOptions,
  type TokenSet,
} from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'

import { env } from '~/env.mjs'
import { prisma } from './db'

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: DefaultSession['user'] & {
      id: string
      // ...other properties
      // role: UserRole;
    }
    token: TokenSet
  }
}

/**
 * Takes a token, and returns a new token with updated
 * `accessToken` and `accessTokenExpires`. If an error occurs,
 * returns the old token and an error property
 */
async function refreshAccessToken(token: TokenSet) {
  try {
    const url = 'https://oauth2.googleapis.com/token'
    if (token.refresh_token) {
      const options = {
        client_id: env.GOOGLE_CLIENT_ID,
        client_secret: env.GOOGLE_CLIENT_SECRET,
        grant_type: 'refresh_token',
        refresh_token: token.refresh_token,
      }
      const qs = new URLSearchParams(options)

      const response = await fetch(`${url}?${qs.toString()}`, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        method: 'POST',
      })

      const refreshedTokens = (await response.json()) as TokenSet

      if (!response.ok) {
        throw refreshedTokens
      }

      return {
        ...token,
        access_token: refreshedTokens.access_token,
        access_token_expires: Date.now() + refreshedTokens.expires_in * 1000,
        refresh_token: refreshedTokens.refresh_token ?? token.refresh_token, // Fall back to old refresh token
      }
    }
  } catch (error) {
    console.log(error)

    return {
      ...token,
      error: 'RefreshAccessTokenError',
    }
  }
}

export function authOptionsWrapper(req: NextApiRequest, res: NextApiResponse) {
  const authOptions: NextAuthOptions = {
    session: {
      strategy: 'jwt',
    },
    callbacks: {
      signIn: async ({ profile }) => {
        /* 
        Session is returned when user is signed in and is giving a permission for youtube scope
        Session is needed to match youtube account to main account. Because these accounts could be different,
        there is a risk of duplication.
        */
        const session = await getServerSession(req, res, authOptions)

        // TODO uncomment when DB is available
        // const user = await prisma.user.findFirst({
        //   where: { email: { contains: profile?.email } },
        // });
        const user = true
        // !!!---------------------------------------------------

        if (profile) {
          if (!user && !session) {
            await prisma.user.create({
              data: {
                name: profile.name,
                email: profile.email,
                emailVerified: profile.email_verified,
                picture: profile.picture,
              },
            })
            return true
          }
          if (!user && session) {
            // find user id of main user which has active session
            const mainUser = await prisma.user.findFirst({
              where: { email: { contains: session.user.email } },
            })
            await prisma.youtubeAccount.create({
              data: {
                name: profile.name,
                email: profile.email,
                emailVerified: profile.email_verified,
                picture: profile.picture,
                userId: mainUser?.id,
              },
            })
            return true
          }
          return true
        }
        return true
      },
      jwt: ({ token, account }) => {
        if (account) {
          token = {
            ...token,
            access_token: account.access_token,
            access_token_expires: account.expires_at,
            refresh_token: account.refresh_token,
            scope: account.scope,
          }
        }
        if (Date.now() > token.access_token_expires) {
          // return refreshAccessToken(token)
          console.log('ta nemam')
        }
        return token
      },
      session: ({ session, token }) => {
        session = {
          ...session,
          token,
        }
        return session
      },
      redirect: () => {
        return '/app'
      },
    },
    providers: [
      GoogleProvider({
        clientId: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
      }),
    ],
  }
  return authOptions
}

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = (ctx: {
  req: NextApiRequest
  res: NextApiResponse
}) => {
  return getServerSession(
    ctx.req,
    ctx.res,
    authOptionsWrapper(ctx.req, ctx.res),
  )
}

// interface GoogleProfile {
//   iss: string;
//   azp: string;
//   aud: string;
//   sub: string;
//   email: string;
//   email_verified: boolean;
//   at_hash: string;
//   name: string;
//   picture: string;
//   given_name: string;
//   family_name: string;
//   locale: string;
//   iat: number;
//   exp: number;
// }

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
import { z } from 'zod'

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

const TokenSchema = z.object({
  access_token: z.string(),
  access_token_expires: z.number(),
  refresh_token: z.string(),
  scope: z.string(),
})
type TokenData = z.infer<typeof TokenSchema>

/**
 * Takes a token, and returns a new token with updated
 * `accessToken` and `accessTokenExpires`. If an error occurs,
 * returns the old token and an error property
 */
async function refreshAccessToken(token: TokenData) {
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

      const refreshedTokensSchema = z.object({
        access_token: z.string(),
        expires_in: z.number(),
        scope: z.string(),
        token_type: z.string(),
        id_token: z.string(),
      })

      const refreshedTokens = refreshedTokensSchema.safeParse(
        await response.json(),
      )

      if (refreshedTokens.success) {
        return {
          ...token,
          access_token: refreshedTokens.data.access_token,
          access_token_expires:
            Date.now() + refreshedTokens.data.expires_in * 1000,
        }
      }
    }
  } catch (error) {
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

        const profileSchema = z.object({
          name: z.string(),
          email: z.string().email(),
          email_verified: z.boolean(),
          picture: z.string().url(),
        })

        const profileData = profileSchema.parse(profile)

        const user = await prisma.user.findFirst({
          where: {
            OR: [
              {
                youtubeAccount: {
                  email: profileData.email,
                },
              },
              {
                email: profileData.email,
              },
            ],
          },
        })

        if (!user && !session) {
          await prisma.user.create({
            data: {
              name: profileData.name,
              email: profileData.email,
              emailVerified: profileData.email_verified,
              picture: profileData.picture,
            },
          })
          return true
        }

        if (!user && session) {
          // find user id of main user which has active session
          const email = session.user.email ?? ''

          const mainUser = await prisma.user.findFirst({
            where: { email: { contains: email } },
            select: { id: true },
          })

          await prisma.youtubeAccount.create({
            data: {
              name: profileData.name,
              email: profileData.email,
              emailVerified: profileData.email_verified,
              picture: profileData.picture,
              userId: mainUser?.id,
            },
          })
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

        const tokenData = TokenSchema.safeParse(token)

        if (tokenData.success) {
          if (Date.now() > tokenData.data.access_token_expires) {
            return refreshAccessToken(tokenData.data)
              .then((newToken) => {
                return newToken
              })
              .catch((error) => {
                console.log(error)
              })
          }
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

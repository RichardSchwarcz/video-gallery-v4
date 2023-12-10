import { createTRPCRouter, protectedProcedure } from '../trpc'
import { env } from '~/env.mjs'
import { prisma } from '~/server/db'
import { usersNotionAccessTokenSchema } from '~/lib/validations/user'
import { TRPCError } from '@trpc/server'

export const notionRouter = createTRPCRouter({
  getOAuthURL: protectedProcedure.query(() => {
    const rootURL = 'https://api.notion.com/v1/oauth/authorize'
    const options = {
      client_id: env.NOTION_CLIENT_ID,
      response_type: 'code',
      owner: 'user',
      redirect_uri: env.NOTION_REDIRECT_URI,
    }
    const qs = new URLSearchParams(options)
    const url = `${rootURL}?${qs.toString()}`

    return url
  }),
  getNotionToken: protectedProcedure.query(async ({ ctx }) => {
    try {
      const user = await prisma.user.findFirst({
        where: {
          OR: [
            {
              youtubeAccount: {
                email: ctx.session.user.email,
              },
            },
            {
              email: ctx.session.user.email,
            },
          ],
        },
        select: {
          notionAccessToken: true,
        },
      })

      const result = usersNotionAccessTokenSchema.safeParse(
        user?.notionAccessToken,
      )

      if (result.success) {
        return result.data.access_token
      }
      if (result.error) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Notion token not found',
        })
      }
    } catch (error) {
      if (error instanceof TRPCError && error.code === 'NOT_FOUND') {
        throw error
      }
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Something went wrong on our end',
        cause: error,
      })
    }
  }),
})

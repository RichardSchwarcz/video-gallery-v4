import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { idSchema } from '~/lib/validations/form'
import { NotionToken } from '~/lib/validations/user'
import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc'
import { prisma } from '~/server/db'

export const settingsRouter = createTRPCRouter({
  setIds: protectedProcedure
    .input(idSchema)
    .mutation(async ({ ctx, input }) => {
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
          id: true,
          notionMainDbId: true,
          notionSnapshotDbId: true,
          youtubePlaylistId: true,
        },
      })

      if (user) {
        const setSettings = await prisma.user.update({
          where: {
            id: user.id,
          },
          data: {
            notionMainDbId: input.notionMainDbId,
            notionSnapshotDbId: input.notionSnapshotDbId,
            youtubePlaylistId: input.youtubePlaylistId,
          },
        })
        return setSettings
      }
    }),
  getIds: protectedProcedure.query(async ({ ctx }) => {
    try {
      const userSettings = await prisma.user.findFirst({
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
          notionMainDbId: true,
          notionSnapshotDbId: true,
          youtubePlaylistId: true,
        },
      })

      const result = idSchema.safeParse(userSettings)

      if (result.success) {
        return {
          youtubePlaylistId: result.data.youtubePlaylistId,
          notionMainDbId: result.data.notionMainDbId,
          notionSnapshotDbId: result.data.notionSnapshotDbId,
        }
      }
      if (result.error) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Please set your URLs',
          cause: 'Zod error',
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
  hasSettings: protectedProcedure.query(async ({ ctx }) => {
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
          notionMainDbId: true,
          notionSnapshotDbId: true,
          youtubePlaylistId: true,
          notionAccessToken: true,
        },
      })

      const settingsSchema = idSchema.extend({
        notionAccessToken: NotionToken,
      })

      const result = settingsSchema.safeParse(user)
      if (result.success) {
        return true
      }
      if (result.error) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Please set your URLs and give consent',
          cause: 'Zod error',
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
  setLastSync: protectedProcedure.mutation(async ({ ctx }) => {
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
      })

      if (user) {
        const lastSync = await prisma.user.update({
          where: {
            id: user.id,
          },
          data: {
            lastSync: new Date(),
          },
        })

        if (lastSync) {
          return lastSync.createdAt
        }
      }
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Something went wrong on our end',
        cause: error,
      })
    }
  }),
  getLastSync: protectedProcedure.query(async ({ ctx }) => {
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
          lastSync: true,
        },
      })

      const lastSyncValidation = z.object({
        lastSync: z.date(),
      })

      const result = lastSyncValidation.safeParse(user)

      if (result.success) {
        return result.data.lastSync
      }
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Something went wrong on our end',
        cause: error,
      })
    }
  }),
})

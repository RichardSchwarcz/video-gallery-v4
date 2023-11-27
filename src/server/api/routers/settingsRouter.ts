import { z } from 'zod'
import { formSchema } from '~/lib/validations/form'
import { usersSettingsSchema } from '~/lib/validations/user'
import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc'
import { prisma } from '~/server/db'

export const settingsRouter = createTRPCRouter({
  setIds: protectedProcedure
    .input(formSchema)
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

      const result = usersSettingsSchema.safeParse(userSettings)

      if (result.success) {
        return {
          youtubePlaylistId: result.data.youtubePlaylistId,
          notionMainDbId: result.data.notionMainDbId,
          notionSnapshotDbId: result.data.notionSnapshotDbId,
        }
      }
      if (result.error) {
        return {
          message: 'Please fill in your IDs.',
        }
      }
    } catch (error) {
      // Handle database or other errors
      console.log(error)
    }
  }),
})

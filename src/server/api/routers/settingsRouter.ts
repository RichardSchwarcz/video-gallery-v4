import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc'
import { prisma } from '~/server/db'

export const settingsRouter = createTRPCRouter({
  setIds: protectedProcedure
    .input(
      z.object({
        youtubePlaylistId: z.string().min(34),
        notionMainDbId: z.string().min(32),
        notionSnapshotDbId: z.string().min(32),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      console.log({ input })
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
          settings: true,
          id: true,
        },
      })

      if (user?.settings) {
        // zod schema for input
        const schema = z.object({
          notionMainDbId: z.string().min(32),
          notionSnapshotDbId: z.string().min(32),
          youtubePlaylistId: z.string().min(34),
        })

        // validate input
        const validInput = schema.parse(input)

        const setSettings = await prisma.user.update({
          where: {
            id: user.id,
          },
          data: {
            settings: {
              update: {
                notionMainDbId: validInput.notionMainDbId,
                notionSnapshotDbId: validInput.notionSnapshotDbId,
                youtubePlaylistId: validInput.youtubePlaylistId,
              },
            },
          },
        })
        return setSettings
      }

      if (user && !user.settings) {
        // zod schema for input
        const schema = z.object({
          notionMainDbId: z.string().min(32),
          notionSnapshotDbId: z.string().min(32),
          youtubePlaylistId: z.string().min(34),
        })

        // validate input
        const validInput = schema.parse(input)
        const setSettings = await prisma.settings.create({
          data: {
            notionMainDbId: validInput.notionMainDbId,
            notionSnapshotDbId: validInput.notionSnapshotDbId,
            youtubePlaylistId: validInput.youtubePlaylistId,
            userId: user.id,
          },
        })
        return setSettings
      }
    }),
})

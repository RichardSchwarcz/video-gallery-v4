import { z } from 'zod'

const errorMessages = {
  youtube: 'Youtube playlist ID must be 34 characters long',
  notionMain: 'Notion database ID must be 32 characters long',
  notionSnapshot: 'Notion snapshot ID must be 32 characters long',
}

export const idSchema = z.object({
  youtubePlaylistId: z.string().length(34, {
    message: errorMessages.youtube,
  }),
  notionMainDbId: z.string().length(32, {
    message: errorMessages.notionMain,
  }),

  notionSnapshotDbId: z.string().length(32, {
    message: errorMessages.notionSnapshot,
  }),
})

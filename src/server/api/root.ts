import { createTRPCRouter } from '~/server/api/trpc'
import { youtubeRouter } from './routers/youtubeRouter'
import { notionRouter } from './routers/notionRouter'
import { settingsRouter } from './routers/settingsRouter'

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  youtube: youtubeRouter,
  notion: notionRouter,
  settings: settingsRouter,
})

// export type definition of API
export type AppRouter = typeof appRouter

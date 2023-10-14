import { youtubeRouter } from "~/server/api/routers/youtubeRouter";
import { createTRPCRouter } from "~/server/api/trpc";
import { notionRouter } from "./routers/notionRouter";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  youtube: youtubeRouter,
  notion: notionRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

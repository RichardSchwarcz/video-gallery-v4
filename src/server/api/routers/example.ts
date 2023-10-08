import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

export const exampleRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),

  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.db.example.findMany();
  }),

  getSecretMessage: protectedProcedure.query(() => {
    return "you can now see this secret message!";
  }),
  getYoutubeVideos: protectedProcedure.query(async ({ ctx }) => {
    const accessToken = ctx.session.token.access_token;
    try {
      const options = {
        part: "snippet",
        maxResults: "50",
        playlistId: "PLogYAbXxpcswCx7liCyjv05nGPggNiLOh",
      };

      const qs = new URLSearchParams(options);

      const rootURL = "https://www.googleapis.com/youtube/v3/playlistItems";

      const playlistItems = await fetch(`${rootURL}?${qs.toString()}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return (await playlistItems.json()) as string;
    } catch (error) {
      console.log(error);
    }
  }),
});

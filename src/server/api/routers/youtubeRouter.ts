import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { PLAYLIST_ID } from "~/server/constants";

export const youtubeRouter = createTRPCRouter({
  getYoutubeVideos: protectedProcedure.query(async ({ ctx }) => {
    const accessToken = ctx.session.token.access_token;
    try {
      const options = {
        part: "snippet",
        maxResults: "50",
        playlistId: PLAYLIST_ID,
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

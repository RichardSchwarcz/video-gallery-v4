import { PLAYLIST_ID } from "~/server/constants";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import type {
  PlaylistItem,
  RawPlaylistItem,
  RawVideoData,
  VideoDuration,
  VideosOptions,
} from "../types/videoTypes";
import { getYoutubeVideosRecursively } from "../services/youtubeAPIFunctions";
import {
  formatPlaylistItems,
  getVideosIds,
  getYoutubeVideosDuration,
} from "../utils/youtubeHelpers";
import {
  combineVideoArrays,
  formatSnapshotData,
  postDelayedRequests,
} from "../utils/syncHelpers";
import {
  postToNotionDatabase,
  postToNotionSnapshot,
} from "../services/notionAPIFunctions";
import type {
  CreatePageParameters,
  CreatePageResponse,
} from "@notionhq/client/build/src/api-endpoints";
import { Client } from "@notionhq/client";

export const notionRouter = createTRPCRouter({
  handleInitialLoad: protectedProcedure.query(async ({ ctx }) => {
    const accessToken = ctx.session.token.access_token;
    if (accessToken === undefined) {
      throw new Error("Unauthenticated");
    }

    try {
      // fetch all videos from playlist
      const videosOptions: VideosOptions = {
        part: "snippet",
        maxResults: "50",
        playlistId: PLAYLIST_ID,
      };

      const rawPlaylistItems: RawPlaylistItem[] =
        await getYoutubeVideosRecursively(
          accessToken,
          "playlistItems",
          videosOptions,
        );

      const formattedVideos: PlaylistItem[] =
        formatPlaylistItems(rawPlaylistItems);

      // fetch videos by ID. In playlist items there is no duration property
      const videosDataOptions: VideosOptions = {
        part: "contentDetails",
        maxResults: "50",
        id: getVideosIds(formattedVideos),
      };

      const rawVideosData: RawVideoData[] = await getYoutubeVideosRecursively(
        accessToken,
        "videos",
        videosDataOptions,
      );

      const durations: VideoDuration[] =
        getYoutubeVideosDuration(rawVideosData);

      const notionSnapshotData = formatSnapshotData(rawPlaylistItems);
      const notionMainData = combineVideoArrays(formattedVideos, durations);

      // load notion database
      console.log("Starting API requests...");
      try {
        const post = await postDelayedRequests(
          notionMainData,
          postToNotionDatabase,
          350,
        );
        console.log("API requests completed:", post);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        console.log("All operations completed.");
      }

      // create notion snapshot
      console.log("Starting API requests...");
      try {
        const post = await postDelayedRequests(
          notionSnapshotData,
          postToNotionSnapshot,
          350,
        );
        console.log("API requests completed:", post);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        console.log("All operations completed.");
      }
    } catch (error) {
      console.log(error);
    }
  }),
  createMockPage: protectedProcedure.query(async () => {
    await createMockNotionPage();
    return "hi";
  }),
});

export async function createMockNotionPage(): Promise<CreatePageResponse> {
  const access_token = "secret_Ek7ZLkFr6zGt6X7qQ48EMS4RT4rdtb3antoiPCvkGz0";
  const notion = new Client({ auth: access_token });
  const parameters: CreatePageParameters = {
    parent: {
      type: "database_id",
      database_id: "af3ab5736fb04ac6b861c251dd7df858",
    },
    properties: {
      Name: {
        title: [{ text: { content: "serus" } }],
      },
      Author: {
        rich_text: [
          {
            type: "text",
            text: {
              content: "ryso",
            },
          },
        ],
      },
      Duration: {
        rich_text: [{ type: "text", text: { content: "100" } }],
      },
    },
  };
  return await notion.pages.create(parameters);
}

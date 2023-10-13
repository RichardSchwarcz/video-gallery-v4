import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { getNotionData, getNotionIDs } from "../utils/notion";
import {
  findDeletedVideos,
  type DifferenceObject,
  findPlaylistItemsIDsInSnapshotToDelete,
  combineVideoArrays,
  formatSnapshotData,
  postDelayedRequests,
} from "../utils/syncHelpers";
import { PLAYLIST_ID } from "~/server/constants";
import {
  type PlaylistItem,
  type RawPlaylistItem,
  type RawVideoData,
  type VideoDuration,
  type VideosOptions,
} from "../types/videoTypes";
import {
  deleteYoutubePlaylistItem,
  getYoutubeVideos,
  getYoutubeVideosRecursively,
} from "../getYoutubeVideos";
import {
  formatPlaylistItems,
  getVideosIds,
  getYoutubeVideosDuration,
} from "../utils/youtubeHelpers";
import {
  archiveNotionPage,
  postToNotionDatabase,
  postToNotionSnapshot,
} from "../postToNotionDatabase";

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
  test: protectedProcedure.query(async ({ ctx }) => {
    const access_token = ctx.session.token.access_token;

    const videosOptions = {
      part: "snippet",
      maxResults: "50",
      playlistId: PLAYLIST_ID,
    };
    const qs = new URLSearchParams(videosOptions);
    return getYoutubeVideos(access_token, "playlistItems", qs);
  }),
  sync: protectedProcedure.query(async ({ ctx }) => {
    const accessToken = ctx.session.token.access_token;
    if (accessToken === undefined) {
      throw new Error("Unauthenticated");
    }

    const { mainData, snapshotData } = await getNotionData();
    const {
      notionMainDataIDs,
      notionMainVideosIDs,
      notionSnapshotDataIDs,
      notionSnapshotVideosIDs,
    } = getNotionIDs(mainData, snapshotData);
    // console.log("MAIN DATA ==========> ", mainData.results);

    //* compare main and snapshot -> see which videos have been deleted from main
    const difference: DifferenceObject = findDeletedVideos(
      notionMainDataIDs,
      notionSnapshotDataIDs,
    );

    //* get youtube videos in case something has been added
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
    //* compare with snapshot DB = see which videos are new
    const newRawPlaylistItems = rawPlaylistItems.filter(
      (video: RawPlaylistItem) => {
        return (
          !notionSnapshotVideosIDs.includes(video.snippet.resourceId.videoId) &&
          !notionMainVideosIDs.includes(video.snippet.resourceId.videoId)
        );
      },
    );

    // format new videos
    const newFormattedVideos: PlaylistItem[] =
      formatPlaylistItems(newRawPlaylistItems);
    console.log("these are all new formatted videos: ", newFormattedVideos);

    const isDeletedFromMain = difference.deletedFromMain.length > 0;
    const hasNewYoutubeVideos = newFormattedVideos.length > 0;
    const isDeletedFromSnapshot = difference.deletedFromSnapshot.length > 0;

    // -----------------------------------------------------------------------------------------
    //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    // eslint-disable-next-line prefer-const
    let messageObject = {};

    if (isDeletedFromMain) {
      //* get video ID as playlist item from snapshot data
      // each video in youtube playlist has its own unique ID for that playlist
      const playlistItemsIDsToDelete = findPlaylistItemsIDsInSnapshotToDelete(
        difference.deletedFromMain,
        snapshotData,
      );

      //* delete request to youtube playlist (remove videos deleted in notion)
      console.log("deleting from youtube");
      for (const item of playlistItemsIDsToDelete) {
        const qs = new URLSearchParams({ id: item });
        const res = await deleteYoutubePlaylistItem(accessToken, qs);

        if (res.status !== 204) {
          break;
        }
      }

      console.log("removing difference deleting from snapshot");
      const notionPagesIDs = difference.deletedFromMain.map(
        (page) => page.notionPageID,
      );
      void postDelayedRequests(notionPagesIDs, archiveNotionPage, 350);

      const message = {
        message_deleted: "deleted following videos from youtube playlist",
        videos_deleted: difference.deletedFromMain,
      };
      Object.assign(messageObject, message);
    }

    if (hasNewYoutubeVideos) {
      //* get durations for new videos
      const videosDataOptions: VideosOptions = {
        part: "contentDetails",
        maxResults: "50",
        id: getVideosIds(newFormattedVideos),
      };
      const rawVideosData: RawVideoData[] = await getYoutubeVideosRecursively<
        RawVideoData[]
      >(accessToken, "videos", videosDataOptions);

      const durations: VideoDuration[] =
        getYoutubeVideosDuration(rawVideosData);

      //* post to notion main DB (new video objects)
      console.log("posting new video to main - only add case");
      const newDataToMainDB = combineVideoArrays(newFormattedVideos, durations);
      void postDelayedRequests(newDataToMainDB, postToNotionDatabase, 350);

      //* post to notion snapshot DB (new video objects)
      console.log("posting new video to snapshot - only add case");
      const newDataToSnapshotDB = formatSnapshotData(newRawPlaylistItems);
      void postDelayedRequests(newDataToSnapshotDB, postToNotionSnapshot, 350);

      const message = {
        message_added_new: "new videos added",
        videos_added_new: newDataToMainDB,
      };
      Object.assign(messageObject, message);
    }

    const accidentallyDeletedFromSnapshot = rawPlaylistItems.filter(
      (video: RawPlaylistItem) => {
        return (
          !notionSnapshotVideosIDs.includes(video.snippet.resourceId.videoId) &&
          notionMainVideosIDs.includes(video.snippet.resourceId.videoId)
        );
      },
    );

    if (isDeletedFromSnapshot) {
      //* post to notion snapshot DB (new video objects)
      console.log(
        "posting new video to snapshot - only deleted from snapshot case",
      );
      const newDataToSnapshotDB = formatSnapshotData(
        accidentallyDeletedFromSnapshot,
      );
      console.log(
        "these are accidentally deleted videos from snapshot",
        newDataToSnapshotDB,
      );
      void postDelayedRequests(newDataToSnapshotDB, postToNotionSnapshot, 350);

      const message = {
        message_added_to_snapshot:
          "accidentally deleted videos added back to snapshot DB",
        videos_added_to_snapshot: newDataToSnapshotDB,
      };
      Object.assign(messageObject, message);
    }

    if (!isDeletedFromMain && !hasNewYoutubeVideos && !isDeletedFromSnapshot) {
      const message = {
        message: "everything is in sync!",
      };
      Object.assign(messageObject, message);
    }
    // res.json(messageObject)
  }),
});

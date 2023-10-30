import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { getNotionIDs } from "~/server/api/utils/notionHelpers";
import {
  findDeletedVideos,
  type DifferenceObject,
  findPlaylistItemsIDsInSnapshotToDelete,
  combineVideoArrays,
  formatSnapshotData,
  postDelayedRequests,
} from "~/server/api/utils/syncHelpers";
import { PLAYLIST_ID } from "~/server/constants";
import {
  type PlaylistItem,
  type RawPlaylistItem,
  type RawVideoData,
  type VideoDuration,
  type VideosOptions,
} from "~/server/api/types/videoTypes";
import {
  deleteYoutubePlaylistItem,
  getYoutubeVideosRecursively,
} from "~/server/api/services/youtubeAPIFunctions";
import {
  formatPlaylistItems,
  getVideosIds,
  getYoutubeVideosDuration,
} from "~/server/api/utils/youtubeHelpers";
import {
  archiveNotionPage,
  getNotionData,
  postToNotionDatabase,
  postToNotionSnapshot,
} from "~/server/api/services/notionAPIFunctions";
import EventEmitter from "events";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });
  if (!session) {
    res.redirect("/");
  }
  res.writeHead(200, {
    Connection: "keep-alive",
    "Content-Encoding": "none",
    "Cache-Control": "no-cache, no-transform",
    "Content-Type": "text/event-stream",
  });

  const stream = new EventEmitter();

  const accessToken = session?.token.access_token;
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
  const rawPlaylistItems: RawPlaylistItem[] = await getYoutubeVideosRecursively(
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
    await postDelayedRequests(notionPagesIDs, archiveNotionPage, 350);

    stream.on("isDeletedFromMain", function (event) {
      res.write(
        `event: ${event}\ndata: ${JSON.stringify({
          message_deleted: "deleted following videos from youtube playlist",
          videos_deleted: difference.deletedFromMain,
        })}\n\n`,
      );
    });
    stream.emit("isDeletedFromMain", "syncEvent");
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

    const durations: VideoDuration[] = getYoutubeVideosDuration(rawVideosData);

    //* post to notion main DB (new video objects)
    console.log("posting new video to main - only add case");
    const newDataToMainDB = combineVideoArrays(newFormattedVideos, durations);
    await postDelayedRequests(newDataToMainDB, postToNotionDatabase, 350);

    //* post to notion snapshot DB (new video objects)
    console.log("posting new video to snapshot - only add case");
    const newDataToSnapshotDB = formatSnapshotData(newRawPlaylistItems);
    await postDelayedRequests(newDataToSnapshotDB, postToNotionSnapshot, 350);

    stream.on("hasNewYoutubeVideos", function (event) {
      res.write(
        `event: ${event}\ndata: ${JSON.stringify({
          message_added_new: "new videos added",
          videos_added_new: newDataToMainDB,
        })}\n\n`,
      );
    });
    stream.emit("hasNewYoutubeVideos", "syncEvent");
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

    stream.on("isDeletedFromSnapshot", function (event) {
      res.write(
        `event: ${event}\ndata: ${JSON.stringify({
          message_added_to_snapshot:
            "accidentally deleted videos added back to snapshot DB",
          videos_added_to_snapshot: newDataToSnapshotDB,
        })}\n\n`,
      );
    });
    stream.emit("isDeletedFromSnapshot", "syncEvent");
  }

  if (!isDeletedFromMain && !hasNewYoutubeVideos && !isDeletedFromSnapshot) {
    stream.on("isSynced", function (event) {
      res.write(
        `event: ${event}\ndata: ${JSON.stringify({
          message: "everything is in sync!",
        })}\n\n`,
      );
    });
    stream.emit("isSynced", "syncEvent");
  }

  stream.on("done", function (event) {
    res.write(
      `event: ${event}\ndata: ${JSON.stringify({
        message: "Done!",
      })}\n\n`,
    );
  });
  stream.emit("done", "syncEvent");

  // res.end("done\n");
}

export default handler;

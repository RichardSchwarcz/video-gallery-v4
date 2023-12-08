import type { QueryDatabaseResponse } from '@notionhq/client/build/src/api-endpoints'
import {
  type RawPlaylistItem,
  type PlaylistItem,
  type VideoDuration,
  type VideoSchema,
} from '../types/videoTypes'
import type { Video, NotionDataIDs } from './notionHelpers'
import { getYoutubeVideoIDfromURL } from './youtubeHelpers'

export function findPlaylistItemsIDsInSnapshotToDelete(
  difference: NotionDataIDs[],
  notionSnapshotData: QueryDatabaseResponse,
): string[] {
  const videosIDs = difference.map((item) => item.youtubeVideoID)

  const snapshotDataToDelete = notionSnapshotData.results.filter(
    //@ts-expect-error not assignable parameter
    (video: Video) => {
      const URL: string = video.properties.URL.url
      const ID = getYoutubeVideoIDfromURL(URL)
      return ID ? videosIDs.includes(ID) : null
    },
  )

  const playlistItemsIDs: string[] = snapshotDataToDelete.map(
    //@ts-expect-error not assignable parameter
    (video: Video) => {
      return video.properties.PlaylistItemID.rich_text[0].text.content
    },
  )
  return playlistItemsIDs
}

// TODO check lodash/difference(by)
export function findDeletedVideos(
  mainData: NotionDataIDs[],
  snapshotData: NotionDataIDs[],
) {
  const difference: DifferenceObject = {
    deletedFromMain: [],
    deletedFromSnapshot: [],
  }

  const mainDBvideosID = mainData.map((mainItem) => {
    return mainItem.youtubeVideoID
  })

  const snapshotDBvideosID = snapshotData.map((snapshotItem) => {
    return snapshotItem.youtubeVideoID
  })

  // video deleted from main DB but still in snapshot
  snapshotData.forEach((snapshotItem) => {
    if (!mainDBvideosID.includes(snapshotItem.youtubeVideoID)) {
      difference.deletedFromMain.push(snapshotItem)
    }
  })

  // video deleted from snapshot but still in main DB
  mainData.forEach((mainItem) => {
    if (!snapshotDBvideosID.includes(mainItem.youtubeVideoID)) {
      difference.deletedFromSnapshot.push(mainItem)
    }
  })

  return difference
}

export type DifferenceObject = {
  deletedFromMain: NotionDataIDs[]
  deletedFromSnapshot: NotionDataIDs[]
}

export function combineVideoArrays(
  formattedVideos: PlaylistItem[],
  durations: VideoDuration[],
): VideoSchema[] {
  const combinedArray = []

  for (const videoInfo of formattedVideos) {
    const matchingDuration = durations.find(
      (duration: VideoDuration) => duration.id === videoInfo.videoId,
    )

    if (matchingDuration) {
      combinedArray.push({
        ...videoInfo,
        duration: matchingDuration.duration,
      })
    }
  }

  return combinedArray
}

export function formatSnapshotData(rawPlaylistItems: RawPlaylistItem[]) {
  return rawPlaylistItems.map((playlistItem: RawPlaylistItem) => {
    return {
      title: playlistItem.snippet.title,
      url: `https://www.youtube.com/watch?v=${playlistItem.snippet.resourceId.videoId}`,
      playlistItemId: playlistItem.id,
    }
  })
}

export type SnapshotData = ReturnType<typeof formatSnapshotData>

export async function postDelayedRequests<T, U>(
  dataArray: T[],
  requestFunction: (
    element: T,
    accessToken: string,
    notionDatabaseId: string,
  ) => Promise<U>,
  delayBetweenRequestsMs: number,
  accessToken: string,
  notionDatabaseId: string,
): Promise<U[]> {
  const result: U[] = []

  for (const element of dataArray) {
    const response = await requestFunction(
      element,
      accessToken,
      notionDatabaseId,
    )
    result.push(response)

    if (delayBetweenRequestsMs > 0) {
      await delay(delayBetweenRequestsMs)
    }
  }

  return result
}

async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

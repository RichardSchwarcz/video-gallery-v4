import type { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'
import { getNotionIDs } from '~/server/api/utils/notionHelpers'
import {
  findDeletedVideos,
  type DifferenceObject,
  findPlaylistItemsIDsInSnapshotToDelete,
  combineVideoArrays,
  formatSnapshotData,
  postDelayedRequests,
  type SnapshotData,
} from '~/server/api/utils/syncHelpers'
import type {
  ArchivedVideoInfo,
  PlaylistItem,
  RawPlaylistItem,
  RawVideoData,
  VideoDuration,
  VideoSchema,
  VideosOptions,
} from '~/server/api/types/videoTypes'
import {
  deleteYoutubePlaylistItem,
  getYoutubeVideosRecursively,
} from '~/server/api/services/youtubeAPIFunctions'
import {
  formatPlaylistItems,
  getVideosIds,
  getYoutubeVideoID,
  getYoutubeVideosDuration,
} from '~/server/api/utils/youtubeHelpers'
import {
  archiveNotionPage,
  getNotionData,
  postToNotionDatabase,
  postToNotionSnapshot,
} from '~/server/api/services/notionAPIFunctions'
import EventEmitter from 'events'
import { isYoutubeAuthorized } from '~/utils/auth'
import type { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints'
import { prisma } from '~/server/db'
import { NotionToken } from '~/lib/validations/user'
import { idSchema } from '~/lib/validations/form'

export type ResponseData = {
  newDataToSnapshotDB: SnapshotData
  newDataToMainDB: VideoSchema[]
  archivedVideoInfo: ArchivedVideoInfo[]
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req })
  if (!session) {
    res.redirect('/')
  }
  res.writeHead(200, {
    Connection: 'keep-alive',
    'Content-Encoding': 'none',
    'Cache-Control': 'no-cache, no-transform',
    'Content-Type': 'text/event-stream',
  })

  const stream = new EventEmitter()

  const accessToken = session?.token.access_token
  if (accessToken === undefined || !isYoutubeAuthorized(session)) {
    throw new Error('Unauthenticated')
  }

  const user = await prisma.user.findFirst({
    where: {
      OR: [
        {
          youtubeAccount: {
            email: session?.user.email,
          },
        },
        {
          email: session?.user.email,
        },
      ],
    },
    select: {
      notionAccessToken: true,
      notionMainDbId: true,
      notionSnapshotDbId: true,
      youtubePlaylistId: true,
    },
  })

  const settingsSchema = idSchema.extend({
    notionAccessToken: NotionToken,
  })

  const userData = settingsSchema.safeParse(user)

  if (!userData.success) {
    throw new Error('Please set your settings')
  }

  const notionAccessToken = userData.data.notionAccessToken.access_token

  stream.on('comparingDifference', function (event) {
    res.write(
      `event: ${event}\ndata: ${JSON.stringify({
        message: syncMessages.comparing,
      })}\n\n`,
    )
  })
  stream.emit('comparingDifference', 'syncEvent')

  const { mainData, snapshotData } = await getNotionData(
    notionAccessToken,
    userData.data.notionMainDbId,
    userData.data.notionSnapshotDbId,
  )

  const {
    notionMainDataIDs,
    notionMainVideosIDs,
    notionSnapshotDataIDs,
    notionSnapshotVideosIDs,
  } = getNotionIDs(mainData, snapshotData)

  //* compare main and snapshot -> see which videos have been deleted from main
  const difference: DifferenceObject = findDeletedVideos(
    notionMainDataIDs,
    notionSnapshotDataIDs,
  )

  //* get youtube videos in case something has been added
  const videosOptions: VideosOptions = {
    part: 'snippet',
    maxResults: '50',
    playlistId: userData.data.youtubePlaylistId,
  }
  const rawPlaylistItems: RawPlaylistItem[] = await getYoutubeVideosRecursively(
    accessToken,
    'playlistItems',
    videosOptions,
  )
  //* compare with snapshot DB = see which videos are new
  const newRawPlaylistItems = rawPlaylistItems.filter(
    (video: RawPlaylistItem) => {
      return (
        !notionSnapshotVideosIDs.includes(video.snippet.resourceId.videoId) &&
        !notionMainVideosIDs.includes(video.snippet.resourceId.videoId)
      )
    },
  )

  // format new videos
  const newFormattedVideos: PlaylistItem[] =
    formatPlaylistItems(newRawPlaylistItems)

  const isDeletedFromMain = difference.deletedFromMain.length > 0
  const hasNewYoutubeVideos = newFormattedVideos.length > 0
  const isDeletedFromSnapshot = difference.deletedFromSnapshot.length > 0

  // -----------------------------------------------------------------------------------------

  const data: ResponseData = {
    newDataToSnapshotDB: [],
    newDataToMainDB: [],
    archivedVideoInfo: [],
  }

  if (isDeletedFromMain) {
    //* get video ID as playlist item from snapshot data
    // each video in youtube playlist has its own unique ID for that playlist
    const playlistItemsIDsToDelete = findPlaylistItemsIDsInSnapshotToDelete(
      difference.deletedFromMain,
      snapshotData,
    )

    //* delete request to youtube playlist (remove videos deleted in notion)
    stream.on('deletingFromYoutube', function (event) {
      res.write(
        `event: ${event}\ndata: ${JSON.stringify({
          message: syncMessages.deleting,
        })}\n\n`,
      )
    })
    stream.emit('deletingFromYoutube', 'syncEvent')

    for (const item of playlistItemsIDsToDelete) {
      const qs = new URLSearchParams({ id: item })
      const res = await deleteYoutubePlaylistItem(accessToken, qs)

      if (res.status !== 204) {
        break
      }
    }

    const notionPagesIDs = difference.deletedFromMain.map(
      (page) => page.notionPageID,
    )
    const archivedPages = (await postDelayedRequests(
      notionPagesIDs,
      archiveNotionPage,
      350,
      notionAccessToken,
      '',
    )) as PageObjectResponse[]

    const getArchivedVideoInfo = async (
      archivedPages: PageObjectResponse[],
    ): Promise<ArchivedVideoInfo[]> => {
      const props = archivedPages.map((page) => page.properties)
      const info = await Promise.all(
        props.map(async (prop) => {
          if (prop.URL) {
            const url = prop.URL.url as string
            const id = getYoutubeVideoID(url)
            const baseURL =
              'https://noembed.com/embed?url=https://www.youtube.com/watch?v='
            return (await fetch(baseURL + id)).json()
          }
        }),
      )
      return info as ArchivedVideoInfo[]
    }

    const archivedVideoInfo = await getArchivedVideoInfo(archivedPages)

    stream.on('isDeletedFromMain', function (event) {
      res.write(
        `event: ${event}\ndata: ${JSON.stringify({
          message: syncMessages.deleted,
        })}\n\n`,
      )
    })
    stream.emit('isDeletedFromMain', 'syncEvent')

    data.archivedVideoInfo = archivedVideoInfo
  }

  if (hasNewYoutubeVideos) {
    //* get durations for new videos
    const videosDataOptions: VideosOptions = {
      part: 'contentDetails',
      maxResults: '50',
      id: getVideosIds(newFormattedVideos),
    }
    const rawVideosData: RawVideoData[] = await getYoutubeVideosRecursively<
      RawVideoData[]
    >(accessToken, 'videos', videosDataOptions)

    const durations: VideoDuration[] = getYoutubeVideosDuration(rawVideosData)

    //* post to notion main DB (new video objects)
    stream.on('addingToNotion', function (event) {
      res.write(
        `event: ${event}\ndata: ${JSON.stringify({
          message: syncMessages.adding,
        })}\n\n`,
      )
    })
    stream.emit('addingToNotion', 'syncEvent')

    const newDataToMainDB = combineVideoArrays(newFormattedVideos, durations)
    await postDelayedRequests(
      newDataToMainDB,
      postToNotionDatabase,
      350,
      notionAccessToken,
      userData.data.notionMainDbId,
    )

    //* post to notion snapshot DB (new video objects)
    const newDataToSnapshotDB = formatSnapshotData(newRawPlaylistItems)
    await postDelayedRequests(
      newDataToSnapshotDB,
      postToNotionSnapshot,
      350,
      notionAccessToken,
      userData.data.notionSnapshotDbId,
    )

    stream.on('hasNewYoutubeVideos', function (event) {
      res.write(
        `event: ${event}\ndata: ${JSON.stringify({
          message: syncMessages.added,
        })}\n\n`,
      )
    })
    stream.emit('hasNewYoutubeVideos', 'syncEvent')

    data.newDataToMainDB = newDataToMainDB
  }

  const accidentallyDeletedFromSnapshot = rawPlaylistItems.filter(
    (video: RawPlaylistItem) => {
      return (
        !notionSnapshotVideosIDs.includes(video.snippet.resourceId.videoId) &&
        notionMainVideosIDs.includes(video.snippet.resourceId.videoId)
      )
    },
  )

  if (isDeletedFromSnapshot) {
    //* post to notion snapshot DB (new video objects)

    stream.on('snapshotAdding', function (event) {
      res.write(
        `event: ${event}\ndata: ${JSON.stringify({
          message: syncMessages.snapshotAdding,
        })}\n\n`,
      )
    })
    stream.emit('snapshotAdding', 'syncEvent')

    const newDataToSnapshotDB = formatSnapshotData(
      accidentallyDeletedFromSnapshot,
    )

    void postDelayedRequests(
      newDataToSnapshotDB,
      postToNotionSnapshot,
      350,
      notionAccessToken,
      userData.data.notionSnapshotDbId,
    )

    stream.on('isDeletedFromSnapshot', function (event) {
      res.write(
        `event: ${event}\ndata: ${JSON.stringify({
          message: syncMessages.snapshot,
        })}\n\n`,
      )
    })
    stream.emit('isDeletedFromSnapshot', 'syncEvent')

    data.newDataToSnapshotDB = newDataToSnapshotDB
  }

  if (!isDeletedFromMain && !hasNewYoutubeVideos && !isDeletedFromSnapshot) {
    stream.on('isSynced', function (event) {
      res.write(
        `event: ${event}\ndata: ${JSON.stringify({
          message: syncMessages.synced,
        })}\n\n`,
      )
    })
    stream.emit('isSynced', 'syncEvent')
  }

  stream.on('done', function (event) {
    res.write(
      `event: ${event}\ndata: ${JSON.stringify({
        message: syncMessages.done,
        data: data,
      })}\n\n`,
    )
  })
  stream.emit('done', 'syncEvent')
}

export default handler

export const syncMessages = {
  comparing: 'Comparing differences',
  deleting: 'Deleting videos from YouTube playlist',
  adding: 'Adding videos to Notion database',
  synced: 'Everything is already in sync',
  done: 'Everything is in sync 🎉',
  snapshotAdding: 'Adding videos back to Notion snapshot database',

  deleted: 'Deleted these videos from youtube playlist',
  added: 'Added these videos to notion database',
  snapshot: 'Added these videos back to notion snapshot database',
} as const

export type TSyncMessages = (typeof syncMessages)[keyof typeof syncMessages]

export type EventSourceMessages =
  | {
      message: typeof syncMessages.deleted
    }
  | {
      message: typeof syncMessages.added
    }
  | {
      message: typeof syncMessages.snapshot
    }
  | {
      message: typeof syncMessages.comparing
    }
  | {
      message: typeof syncMessages.adding
    }
  | {
      message: typeof syncMessages.deleting
    }
  | {
      message: typeof syncMessages.snapshotAdding
    }
  | {
      message: typeof syncMessages.synced
    }

// const streamFunc = (
//   event: any,
//   res: NextApiResponse,
//   message: string,
//   data?,
// ) => {
//   res.write(
//     `event: ${event}\ndata: ${JSON.stringify({
//       message: syncMessage.synced,
//       data,
//     })}\n\n`,
//   );
// };

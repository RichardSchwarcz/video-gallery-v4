import { PLAYLIST_ID } from '~/server/constants'
import { createTRPCRouter, protectedProcedure } from '../trpc'
import type {
  PlaylistItem,
  RawPlaylistItem,
  RawVideoData,
  VideoDuration,
  VideosOptions,
} from '../types/videoTypes'
import { getYoutubeVideosRecursively } from '../services/youtubeAPIFunctions'
import {
  formatPlaylistItems,
  getVideosIds,
  getYoutubeVideosDuration,
} from '../utils/youtubeHelpers'
import {
  combineVideoArrays,
  formatSnapshotData,
  postDelayedRequests,
} from '../utils/syncHelpers'
import {
  postToNotionDatabase,
  postToNotionSnapshot,
} from '../services/notionAPIFunctions'
import { env } from '~/env.mjs'
import { prisma } from '~/server/db'
import { usersNotionAccessTokenSchema } from '../types/zodSchema'

export const notionRouter = createTRPCRouter({
  handleInitialLoad: protectedProcedure.query(async ({ ctx }) => {
    const accessToken = ctx.session.token.access_token
    if (accessToken === undefined) {
      throw new Error('Unauthenticated')
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          {
            youtubeAccount: {
              email: ctx.session.user.email,
            },
          },
          {
            email: ctx.session.user.email,
          },
        ],
      },
      select: {
        notionAccessToken: true,
      },
    })

    const usersNotionData = usersNotionAccessTokenSchema.parse(
      user?.notionAccessToken,
    )

    const notionAccessToken = usersNotionData.access_token

    try {
      // fetch all videos from playlist
      const videosOptions: VideosOptions = {
        part: 'snippet',
        maxResults: '50',
        playlistId: PLAYLIST_ID,
      }

      const rawPlaylistItems: RawPlaylistItem[] =
        await getYoutubeVideosRecursively(
          accessToken,
          'playlistItems',
          videosOptions,
        )

      const formattedVideos: PlaylistItem[] =
        formatPlaylistItems(rawPlaylistItems)

      // fetch videos by ID. In playlist items there is no duration property
      const videosDataOptions: VideosOptions = {
        part: 'contentDetails',
        maxResults: '50',
        id: getVideosIds(formattedVideos),
      }

      const rawVideosData: RawVideoData[] = await getYoutubeVideosRecursively(
        accessToken,
        'videos',
        videosDataOptions,
      )

      const durations: VideoDuration[] = getYoutubeVideosDuration(rawVideosData)

      const notionSnapshotData = formatSnapshotData(rawPlaylistItems)
      const notionMainData = combineVideoArrays(formattedVideos, durations)

      // load notion database
      console.log('Starting API requests...')
      try {
        const post = await postDelayedRequests(
          notionMainData,
          postToNotionDatabase,
          350,
          notionAccessToken,
        )
        console.log('API requests completed:', post)
      } catch (error) {
        console.error('Error:', error)
      } finally {
        console.log('All operations completed.')
      }

      // create notion snapshot
      console.log('Starting API requests...')
      try {
        const post = await postDelayedRequests(
          notionSnapshotData,
          postToNotionSnapshot,
          350,
          notionAccessToken,
        )
        console.log('API requests completed:', post)
      } catch (error) {
        console.error('Error:', error)
      } finally {
        console.log('All operations completed.')
      }
    } catch (error) {
      console.log(error)
    }
  }),
  getOAuthURL: protectedProcedure.query(() => {
    const rootURL = 'https://api.notion.com/v1/oauth/authorize'
    const options = {
      client_id: env.NOTION_CLIENT_ID,
      response_type: 'code',
      owner: 'user',
      redirect_uri: env.NOTION_REDIRECT_URI,
    }
    const qs = new URLSearchParams(options)
    const url = `${rootURL}?${qs.toString()}`

    return url
  }),
  getNotionToken: protectedProcedure.query(async ({ ctx }) => {
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          {
            youtubeAccount: {
              email: ctx.session.user.email,
            },
          },
          {
            email: ctx.session.user.email,
          },
        ],
      },
      select: {
        notionAccessToken: true,
      },
    })

    const usersNotionData = usersNotionAccessTokenSchema.parse(
      user?.notionAccessToken,
    )

    return usersNotionData.access_token
  }),
})

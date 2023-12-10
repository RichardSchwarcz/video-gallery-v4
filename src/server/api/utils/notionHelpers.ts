import type { QueryDatabaseResponse } from '@notionhq/client/build/src/api-endpoints'

export const getNotionIDs = (
  mainData: QueryDatabaseResponse,
  snapshotData: QueryDatabaseResponse,
) => {
  const notionMainDataIDs: NotionDataIDs[] = getNotionDataIDs(mainData)
  const notionMainVideosIDs = notionMainDataIDs.map(
    (video) => video.youtubeVideoID,
  )
  const notionSnapshotDataIDs: NotionDataIDs[] = getNotionDataIDs(snapshotData)
  const notionSnapshotVideosIDs = notionSnapshotDataIDs.map(
    (video) => video.youtubeVideoID,
  )

  return {
    notionMainDataIDs,
    notionMainVideosIDs,
    notionSnapshotDataIDs,
    notionSnapshotVideosIDs,
  }
}

export type Video = {
  id: string
  properties: {
    URL: { url: string }
    PlaylistItemID: {
      rich_text: [
        {
          text: {
            content: string
          }
        },
      ]
    }
  }
}

function getNotionDataIDs(notionData: QueryDatabaseResponse): NotionDataIDs[] {
  // @ts-expect-error not assignable parameter
  return notionData.results.map((video: Video) => {
    const notionPageID = video.id
    const url = video.properties.URL.url
    const regex = /(?:v=|\/)([a-zA-Z0-9_-]{11})/
    const match = url.match(regex)
    if (match) {
      const youtubeVideoID = match[1]
      return { notionPageID, youtubeVideoID }
    } else
      return {
        notionPageID: '',
        youtubeVideoID: '',
      }
  })
}

export type NotionDataIDs = {
  notionPageID: string
  youtubeVideoID?: string
}

export const getNotionDatabaseID = (url: string) => {
  const regex = /(?:\/)([a-zA-Z0-9_-]{32})/
  const match = url.match(regex)
  if (match) {
    const notionDatabaseID = match[1]
    return notionDatabaseID
  } else return ''
}

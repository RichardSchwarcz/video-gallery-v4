import { Client } from '@notionhq/client'
import {
  type CreatePageParameters,
  type CreatePageResponse,
} from '@notionhq/client/build/src/api-endpoints'
import { type VideoSchema } from '../types/videoTypes'

// ------------- FUNCTIONS ----------------

export async function getNotionData(
  access_token: string,
  mainDbId: string,
  snapshotDbId: string,
) {
  const notion = new Client({ auth: access_token })
  const mainData = await notion.databases.query({ database_id: mainDbId })

  const snapshotData = await notion.databases.query({
    database_id: snapshotDbId,
  })

  return {
    mainData,
    snapshotData,
  }
}

// ----------------------------------------------------------------

export async function postToNotionDatabase(
  video: VideoSchema,
  access_token: string,
  mainDbId: string,
): Promise<CreatePageResponse> {
  const notion = new Client({ auth: access_token })

  const parameters: CreatePageParameters = {
    parent: {
      type: 'database_id',
      database_id: mainDbId,
    },
    cover: {
      external: { url: `${video.thumbnail}` },
    },
    properties: {
      Name: {
        title: [{ text: { content: `${video.title}` } }],
      },
      Author: {
        rich_text: [
          {
            type: 'text',
            text: {
              content: `${video.videoOwnerChannelTitle}`,
            },
          },
        ],
      },
      URL: {
        url: `${video.url}`,
      },
      Duration: {
        rich_text: [{ type: 'text', text: { content: `${video.duration}` } }],
      },
    },
  }
  return await notion.pages.create(parameters)
}

// ----------------------------------------------------------------

export async function postToNotionSnapshot(
  video: {
    title: string
    url: string
    playlistItemId: string
  },
  access_token: string,
  snapshotDbId: string,
): Promise<CreatePageResponse> {
  const notion = new Client({ auth: access_token })
  const parameters: CreatePageParameters = {
    parent: {
      type: 'database_id',
      database_id: snapshotDbId,
    },
    properties: {
      Name: {
        title: [{ text: { content: `${video.title}` } }],
      },
      URL: {
        url: `${video.url}`,
      },
      PlaylistItemID: {
        rich_text: [
          { type: 'text', text: { content: `${video.playlistItemId}` } },
        ],
      },
    },
  }
  return await notion.pages.create(parameters)
}

// -------------------------------------------------------------------

export async function archiveNotionPage(
  pageId: string,
  access_token: string,
  _notionDatabaseId: string,
) {
  const notion = new Client({ auth: access_token })

  return notion.pages.update({
    page_id: pageId,
    archived: true,
  })
}

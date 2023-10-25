import { Client } from "@notionhq/client";
import {
  type CreatePageParameters,
  type CreatePageResponse,
} from "@notionhq/client/build/src/api-endpoints";
import { type VideoSchema } from "../types/videoTypes";
import { env } from "~/env.mjs";

// TODO get access token from DB when available
const access_token = env.NOTION_ACCESS_TOKEN;
const notion = new Client({ auth: access_token });

// ------------- FUNCTIONS ----------------

export async function getNotionData() {
  const databaseId = env.NOTION_DATABASE_ID;
  const mainData = await notion.databases.query({ database_id: databaseId });

  const snapshot_id = env.NOTION_SNAPSHOT_ID;
  const snapshotData = await notion.databases.query({
    database_id: snapshot_id,
  });

  return {
    mainData,
    snapshotData,
  };
}

// ----------------------------------------------------------------

export async function postToNotionDatabase(
  video: VideoSchema,
): Promise<CreatePageResponse> {
  const parameters: CreatePageParameters = {
    parent: {
      type: "database_id",
      database_id: env.NOTION_DATABASE_ID,
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
            type: "text",
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
        rich_text: [{ type: "text", text: { content: `${video.duration}` } }],
      },
    },
  };
  return await notion.pages.create(parameters);
}

// ----------------------------------------------------------------

export async function postToNotionSnapshot(video: {
  title: string;
  url: string;
  playlistItemId: string;
}): Promise<CreatePageResponse> {
  const parameters: CreatePageParameters = {
    parent: {
      type: "database_id",
      database_id: env.NOTION_SNAPSHOT_ID,
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
          { type: "text", text: { content: `${video.playlistItemId}` } },
        ],
      },
    },
  };
  return await notion.pages.create(parameters);
}

// -------------------------------------------------------------------

export async function archiveNotionPage(pageId: string) {
  return notion.pages.update({
    page_id: pageId,
    archived: true,
  });
}

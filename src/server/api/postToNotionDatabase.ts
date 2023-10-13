import { Client } from "@notionhq/client";
import {
  type CreatePageParameters,
  type CreatePageResponse,
} from "@notionhq/client/build/src/api-endpoints";
import { type VideoSchema } from "./types/videoTypes";
import { env } from "~/env.mjs";

const notion = new Client({ auth: process.env.NOTION_SECRET });

// ------------- FUNCTIONS ----------------

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

export async function archiveNotionPage(pageId: string) {
  return notion.pages.update({
    page_id: pageId,
    archived: true,
  });
}

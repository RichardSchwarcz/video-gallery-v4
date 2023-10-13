import { Client } from "@notionhq/client";
import { type QueryDatabaseResponse } from "@notionhq/client/build/src/api-endpoints";
import { env } from "~/env.mjs";

const notion = new Client({ auth: env.NOTION_SECRET });

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

export const getNotionIDs = (
  mainData: QueryDatabaseResponse,
  snapshotData: QueryDatabaseResponse,
) => {
  const notionMainDataIDs: NotionDataIDs[] = getNotionDataIDs(mainData);
  const notionMainVideosIDs = notionMainDataIDs.map(
    (video) => video.youtubeVideoID,
  );
  const notionSnapshotDataIDs: NotionDataIDs[] = getNotionDataIDs(snapshotData);
  const notionSnapshotVideosIDs = notionSnapshotDataIDs.map(
    (video) => video.youtubeVideoID,
  );

  return {
    notionMainDataIDs,
    notionMainVideosIDs,
    notionSnapshotDataIDs,
    notionSnapshotVideosIDs,
  };
};

function getNotionDataIDs(notionData): NotionDataIDs[] {
  return notionData.results.map((video: any) => {
    const notionPageID = video.id;
    const url = video.properties.URL.url;
    const regex = /(?:v=|\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    const youtubeVideoID = match[1];
    return { notionPageID, youtubeVideoID };
  });
}

export type NotionDataIDs = {
  notionPageID: string;
  youtubeVideoID?: string;
};

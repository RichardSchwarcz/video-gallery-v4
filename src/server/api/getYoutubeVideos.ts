import { type VideosOptions } from "./types/videoTypes";

const ENDPOINT = {
  playlistItems: "playlistItems",
  videos: "videos",
} as const;

type Endpoint = keyof typeof ENDPOINT;

// ------------- FUNCTIONS ----------------

export async function getYoutubeVideos<T>(
  accessToken: string,
  endpoint: Endpoint,
  qs: URLSearchParams,
): Promise<T> {
  const rootURL = `https://www.googleapis.com/youtube/v3/${endpoint}`;

  const res = await fetch(`${rootURL}?${qs.toString()}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  // console.log("RES================>", await res.json());

  if (!res.ok) {
    throw new Error(res.statusText);
  }

  return res.json() as Promise<T>;
}

export async function deleteYoutubePlaylistItem(
  accessToken: string,
  qs: URLSearchParams,
) {
  const rootURL = "https://www.googleapis.com/youtube/v3/playlistItems";

  const res = await fetch(`${rootURL}?${qs.toString()}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    method: "DELETE",
  });
  return res;
}

// ------------------------------------------

export function generateQueryString(options: VideosOptions): URLSearchParams {
  const commonOptions = {
    part: options.part,
    maxResults: options.maxResults,
  };

  let queryStringParams;

  if (options.id && options.id.length > 0) {
    queryStringParams = {
      ...commonOptions,
      id: options.id.join(","),
    };
  }

  if (options.playlistId) {
    queryStringParams = {
      ...commonOptions,
      playlistId: options.playlistId,
    };
  }

  if (!options.id && !options.playlistId) {
    throw new Error("Error : id or playlistId must be provided");
  }

  if (options.pageToken) {
    return new URLSearchParams({
      ...queryStringParams,
      pageToken: options.pageToken,
    });
  }

  return new URLSearchParams(queryStringParams);
}

// --------------------------------------------

export async function getYoutubeVideosRecursively<T>(
  accessToken: string,
  endpoint: Endpoint,
  options: VideosOptions,
  nextPageToken: string | undefined = undefined,
  allVideos: [] = [],
) {
  const options_ = {
    ...options,
    pageToken: nextPageToken,
  };

  try {
    const qs = generateQueryString(options_);

    type YoutubeVideos = {
      items: [];
      etag: string;
      kind: string;
      nextPageToken?: string;
    };

    const response = await getYoutubeVideos<YoutubeVideos>(
      accessToken,
      endpoint,
      qs,
    );
    const items = response.items || [];

    items.forEach((item) => {
      allVideos.push(item);
    });

    if (response.nextPageToken) {
      return getYoutubeVideosRecursively<T>(
        accessToken,
        endpoint,
        options_,
        response.nextPageToken,
        allVideos,
      );
    }

    return allVideos;
  } catch (error) {
    console.log("Error fetching youtube videos");
    throw error;
  }
}

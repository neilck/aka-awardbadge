"use server";

import { ChannelInfoResponse } from "./ChannelInfoResponse";

export async function getChannelInfo(handle: string) {
  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=snippet&forHandle=${handle}&key=${process.env.YOUTUBE_API_KEY}`,
      {
        method: "GET",
        headers: {
          "Accept": "application/json",
        },
        cache: "no-cache",
      }
    );

    if (!response) return undefined;

    const channelInfoRes = (await response.json()) as ChannelInfoResponse;
    if (!channelInfoRes.items || channelInfoRes.items.length == 0) {
      return undefined;
    }
    return channelInfoRes.items[0];
  } catch (error) {
    throw new Error(`Failed to fetch channel for handle ${handle}: ${error}`);
    return undefined;
  }
}

export async function verifySubscription(
  accessToken: string,
  channelId: string
) {
  console.log(
    `subscriptions.list accessToken: ${accessToken} channelId: ${channelId}`
  );

  if (!process.env.NEXTAUTH_URL) {
    throw Error("NEXTAUTH_URL not set");
  }

  if (!process.env.GOOGLE_REDIRECT_PATH) {
    throw Error("GOOGLE_REDIRECT_PATH not set");
  }

  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/subscriptions?part=id&mine=true&forChannelId=${channelId}`,
    {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Accept": "application/json",
      },
      cache: "no-cache",
    }
  );

  const responseData = await response.json();
  console.log(`subscriptions.list result: ${JSON.stringify(responseData)}`);

  if (responseData?.pageInfo?.totalResults) {
    if (responseData?.pageInfo?.totalResults == 1) {
      return true;
    }
  }

  return false;
}

export default getChannelInfo;

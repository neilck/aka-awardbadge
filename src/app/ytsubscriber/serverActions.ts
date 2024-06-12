"use server";

import getErrorMessage from "@/app/errors";
import { token, awardBadge } from "../actions/akaActions";
import { encrypt, decrypt } from "@/util/aes";
import { getConfigParamValue } from "../actions/configParams";
import { ChannelInfoResponse } from "./ChannelInfoResponse";

export interface LoadResult {
  isValidSession: boolean;
  error?: string;
  encryptedToken?: string;
  handle?: string;
}

export interface AwardBadgeResult {
  success: boolean;
  error?: string;
}

const aes_key = process.env.AES_KEY ?? "";

/**
 * Function to load session data using a session code.
 * @param code The session code to exchange for a token.
 * @returns A promise resolving to a LoadResult object.
 */
export const load = async (code: string): Promise<LoadResult> => {
  const loadResult: LoadResult = { isValidSession: false };

  if (code == "") {
    loadResult.error = "invalid code";
    return loadResult;
  }

  try {
    // exchange code for JSON web token
    const result = await token(code as string);

    if (result.error == "missing or invalid parameter") {
      let mesg = `Unable to get token using invalid code ${code}. Valid codes are generated by akaprofiles on redirect, and can expire.`;
      loadResult.error = mesg;
      return loadResult;
    }

    if (result.token != undefined && result.payload != undefined) {
      loadResult.isValidSession = true;

      // to prevent token being exposed client side, encrypt before returning
      // ecnrypted token will passed by client in subsequent server action calls
      if (aes_key == "") {
        const mesg = "AES_KEY environment variable not set";
        loadResult.error = mesg;
        return loadResult;
      }

      const encryptedToken = encrypt(aes_key, result.token);
      loadResult.encryptedToken = encryptedToken;

      const mesg = "Code successfully exchanged for token.";

      // parse config params
      const configParams = result.payload.configParams;
      const handle = getConfigParamValue("handle", configParams);
      loadResult.handle = handle;
    }
  } catch (error) {
    const myError = error as Error;
    const mesg = `ERROR: ${myError.message}`;
    loadResult.error = myError.message;
    return loadResult;
  }
  return loadResult;
};

/**
 * Function to award an auto badge to a user.
 * @param encryptedToken The encrypted token containing user session information.
 * @returns A promise resolving to an AwardBadgeResult object.
 */
export const doAwardBadge = async (
  encryptedToken: string,
  awardData?: { country?: string; region?: string; city?: string }
): Promise<AwardBadgeResult> => {
  const plaintoken = decrypt(aes_key, encryptedToken);

  if (!plaintoken) {
    return { success: false, error: "could not decrypt token" };
  }

  try {
    const result = await awardBadge(plaintoken, awardData);
    if (result.success) {
      return { success: true };
    } else {
      const mesg = `badge not awarded: ${result.message}`;
      return { success: false, error: mesg };
    }
  } catch (posterror) {
    const error = posterror as Error;
    const mesg = error.message;
    return { success: false, error: mesg };
  }
};

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

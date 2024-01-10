"use server";

import getErrorMessage from "@/app/errors";
import { UserParams } from "../config";

const api_key = process.env.AKA_API_KEY;
const loadConfigURL = process.env.AKA_LOAD_CONFIG_URL;
const awardBadgeURL = process.env.AKA_AWARD_BADGE_URL;

interface AkaPostData {
  session: string;
  awardtoken: string;
  awarddata?: object;
}

// return header with AKA_API_KEY authorization
const getAuthHeaders = () => {
  if (!api_key) {
    throw new Error("AKA_API_KEY not set.");
  }
  const authorization = `Bearer ${api_key}`;

  return {
    "Content-Type": "application/json",
    "Authorization": authorization,
  };
};

// award badge if eligible during user session
// session is unique to user
// awardToken is unique to badge within session
export const awardBadge = async (
  session: string,
  awardtoken: string,
  awarddata?: object
): Promise<{ success: boolean; badgeAwardId: string } | undefined> => {
  if (!awardBadgeURL) {
    throw new Error("AKA_AWARD_BADGE_URL not set");
  }

  let result: any = undefined;
  if (!awarddata) {
    result = await postAkaProfiles(awardBadgeURL, session, awardtoken);
  } else {
    result = await postAkaProfiles(
      awardBadgeURL,
      session,
      awardtoken,
      awarddata
    );
  }
  if (result === undefined) return result;

  return result as { success: boolean; badgeAwardId: string };
};

// gets user defined params
export const getConfig = async (
  session: string,
  awardtoken: string
): Promise<UserParams | undefined> => {
  if (!loadConfigURL) {
    throw new Error("AKA_LOAD_CONFIG_URL not set");
  }

  const result = await postAkaProfiles(loadConfigURL, session, awardtoken);
  if (result == undefined) return result;
  return result as UserParams;
};

// award badge if eligible during user session
// session is unique to user
// awardToken is unique to badge within session
export const postAkaProfiles = async (
  url: string,
  session: string,
  awardtoken: string,
  awarddata?: object
): Promise<object | undefined> => {
  try {
    const postData: AkaPostData = {
      session: session,
      awardtoken: awardtoken,
    };

    if (awarddata) {
      postData.awarddata = awarddata;
    }

    const response = await fetch(url, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(postData),
    });

    if (response.status == 200) {
      return response.json();
    } else {
      return undefined;
    }
  } catch (error) {
    throw new Error(`Error during ${url} request: ${getErrorMessage(error)}`);
  }
};

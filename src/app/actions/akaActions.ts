"use server";

import debug from "debug";
import getErrorMessage from "@/app/errors";
import { UserParams } from "../config";

const api_key = process.env.AKA_API_KEY;
const verifySessionURL = process.env.AKA_VERIFY_SESSION_URL;
const loadConfigURL = process.env.AKA_LOAD_CONFIG_URL;
const awardBadgeURL = process.env.AKA_AWARD_BADGE_URL;

const log = debug("akaActions:log");
const error = debug("akaActions:error");

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

// verify valid session
export const verifySession = async (
  session: string,
  awardtoken: string
): Promise<{ success: boolean; message: string } | undefined> => {
  if (!verifySessionURL) {
    error("AKA_VERIFY_SESSION_URL not set");
    throw new Error("AKA_VERIFY_SESSION_URL not set");
  }

  const result = await postAkaProfiles(verifySessionURL, session, awardtoken);
  return result as { success: boolean; message: string };
};

// gets user defined params
export const getConfig = async (
  session: string,
  awardtoken: string
): Promise<UserParams | undefined> => {
  if (!loadConfigURL) {
    error("AKA_LOAD_CONFIG_URL not set");
    throw new Error("AKA_LOAD_CONFIG_URL not set");
  }
  const result = await postAkaProfiles(loadConfigURL, session, awardtoken);
  if (result == undefined) return result;
  return result as UserParams;
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
    error("AKA_AWARD_BADGE_URL not set");
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

// award badge if eligible during user session
// session is unique to user
// awardToken is unique to badge within session
export const postAkaProfiles = async (
  url: string,
  session: string,
  awardtoken: string,
  awarddata?: object
): Promise<object | undefined> => {
  log(
    `postAkaProfiles called session: ${session}, awardtoken: ${awardtoken}, awarddata: ${awarddata} url: ${url}`
  );
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
      const json = await response.json();
      log(`postAkaProfiles returned ${response.status} ${response.statusText}`);
      log(`postAkaProfiles returned data ${JSON.stringify(json)}`);
      return json;
    } else {
      error(
        `postAkaProfiles returned ${response.status} ${response.statusText}`
      );
      return undefined;
    }
  } catch (myError) {
    error(`Error during ${url} request: ${getErrorMessage(myError)}`);
  }
};

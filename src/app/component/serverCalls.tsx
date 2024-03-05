/*
 *   Client to server calls via API route
 */
import { ConfigParam } from "../config";

// verify valid session
export const verifySession = async (
  session: string,
  awardtoken: string
): Promise<{ success: boolean; message: string }> => {
  let result = { success: false, message: "" };

  if (session && awardtoken) {
    // verifying session lets us know AKA Profiles is making the request
    const response = await fetch("/api/verifySession", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.NEXT_PUBLIC_APP_TOKEN}`,
      },
      body: JSON.stringify({ session: session, awardtoken: awardtoken }),
      cache: "no-cache",
    });

    if (response.ok) {
      const data = await response.json();
      return data;
    }
  }
  return result;
};

// gets configuration params
export const getConfig = async (identifier: string): Promise<ConfigParam[]> => {
  const response = await fetch(`/api/getConfig?identifier=${identifier}`, {
    headers: {
      "Authorization": `Bearer ${process.env.NEXT_PUBLIC_APP_TOKEN}`,
    },
    cache: "no-cache",
  });

  if (response.ok) {
    const data = await response.json();
    return data;
  } else {
    return [];
  }
};

// award badge if eligible during user session
// session is unique to user
// awardToken is unique to badge within session
export const awardBadge = async (
  session: string,
  awardtoken: string,
  awarddata?: object
): Promise<{ success: boolean; badgeAwardId: string }> => {
  const response = await fetch("/api/awardBadge", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.NEXT_PUBLIC_APP_TOKEN}`,
    },
    body: JSON.stringify({
      session: session,
      awardtoken: awardtoken,
      awarddate: awarddata,
    }),
    cache: "no-cache",
  });

  if (response.ok) {
    const data = await response.json();
    return data;
  }

  return { success: false, badgeAwardId: "" };
};

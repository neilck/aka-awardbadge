"use server";

export const postBadgeAward = async (
  session: string,
  awardtoken: string
): Promise<{ success: boolean; badgeAwardId: string }> => {
  const url = process.env.AKA_AWARDBADGE_ENDPOINT;
  console.log(url);
  if (url === undefined)
    throw Error("AKA_AWARDBADGE_ENDPOINT missing from env.");

  const api_key = process.env.AKA_API_KEY;
  if (api_key === undefined) throw Error("AKA_API_KEY missing from env.");

  const authorization = `Bearer ${process.env.AKA_API_KEY}`;
  try {
    const data = {
      session: session,
      awardtoken: awardtoken,
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": authorization,
      },
      body: JSON.stringify(data),
    });

    // { succces: boolean, badgeAwardId: string }
    return response.json();
  } catch (error) {
    console.error(`Error during ${url} request:`, error);
    throw error;
  }
};

"use server";

export const getCaptchaResult = async (token: string) => {
  const secret_key = process.env.RECAPTCHA_SECRETKEY_V2;
  const url = `https://www.google.com/recaptcha/api/siteverify?secret=${secret_key}&response=${token}`;

  try {
    const response = await fetch(url, { method: "POST" });
    const google_response = await response.json();
    return google_response;
  } catch (error) {
    console.error(`Error during ${url} request:`, error);
    throw error;
  }
};

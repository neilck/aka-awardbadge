"use server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  const secret_key = process.env.RECAPTCHA_SECRETKEY_V2;
  const url = `https://www.google.com/recaptcha/api/siteverify?secret=${secret_key}&response=${token}`;

  try {
    const response = await fetch(url, { method: "POST", cache: "no-cache" });
    const google_response = await response.json();
    return Response.json(google_response);
  } catch (error) {
    console.error(`Error during ${url} request:`, error);
    throw error;
  }
}

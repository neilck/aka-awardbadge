import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const secret_key = process.env.RECAPTCHA_SECRETKEY_V2;
  const params = request.nextUrl.searchParams;
  const token = params.get("token");

  const url = `https://www.google.com/recaptcha/api/siteverify?secret=${secret_key}&response=${token}`;

  const response = await fetch(url, { method: "POST" });
  const google_response = await response.json();
  return NextResponse.json(google_response);
}

import { NextRequest } from "next/server";
export const checkHeader = (req: NextRequest) => {
  const prefix = "Bearer ";

  const token = req.headers.get("Authorization");
  if (token == undefined || !token.startsWith(prefix)) {
    return false;
  }

  const key = token.slice(prefix.length);
  return key == process.env.NEXT_PUBLIC_APP_TOKEN;
};

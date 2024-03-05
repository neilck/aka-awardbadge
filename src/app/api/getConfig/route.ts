import { getConfig } from "@/app/actions/akaActions";
import { verify } from "crypto";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const identifier = searchParams.get("identifier");

  if (!identifier) {
    return Response.json(undefined);
  }

  const result = await getConfig(identifier);
  return Response.json(result);
}

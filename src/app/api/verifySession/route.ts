import { verifySession } from "@/app/actions/akaActions";
import { verify } from "crypto";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const session = searchParams.get("session");
  const awardtoken = searchParams.get("awardtoken");

  if (!session || !awardtoken) {
    return { success: false, message: "missing parameters" };
  }

  const result = await verifySession(session, awardtoken);
  if (!result) {
    return { success: false, message: "undefined" };
  }
  return Response.json(result);
}

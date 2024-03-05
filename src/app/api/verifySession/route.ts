import { verifySession } from "@/app/actions/akaActions";
import { verify } from "crypto";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const session = searchParams.get("session");
  const awardtoken = searchParams.get("awardtoken");

  let data = { success: false, message: "missing parameters" };
  if (!session || !awardtoken) {
    return Response.json(data);
  }

  const result = await verifySession(session, awardtoken);
  if (!result) {
    data = { success: false, message: "undefined" };
    return Response.json(data);
  }
  return Response.json(result);
}

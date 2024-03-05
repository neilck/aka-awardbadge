import { getConfig } from "@/app/actions/akaActions";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const identifier = searchParams.get("identifier");

  if (!identifier) {
    return Response.json(
      { mesg: "missing identifier parameter" },
      { status: 400 }
    );
  }

  const result = await getConfig(identifier);
  if (result) return Response.json(result);
  else return Response.json({ mesg: "not found" }, { status: 404 });
}

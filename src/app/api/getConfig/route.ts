import { checkHeader } from "../checkHeader";
import { getConfig } from "@/app/actions/akaActions";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  if (!checkHeader(request)) {
    return NextResponse.json({ success: false, message: "unauthorized" });
  }

  const { searchParams } = new URL(request.url);
  const identifier = searchParams.get("identifier");

  if (!identifier) {
    return NextResponse.json(
      { mesg: "missing identifier parameter" },
      { status: 400 }
    );
  }

  const result = await getConfig(identifier);
  if (result) return NextResponse.json(result);
  else return NextResponse.json({ mesg: "not found" }, { status: 404 });
}

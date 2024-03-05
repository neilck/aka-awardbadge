import { checkHeader } from "../checkHeader";
import { verifySession } from "@/app/actions/akaActions";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  if (req.method === "POST") {
    if (!checkHeader(req)) {
      return NextResponse.json({ success: false, message: "unauthorized" });
    }
    // Extract data from request body
    const { session, awardtoken } = await req.json();
    console.log(`verify session called ${session}`);

    const result = await verifySession(session, awardtoken);
    if (!result) {
      const data = { success: false, message: "undefined" };
      return NextResponse.json(data);
    }

    return NextResponse.json(result);
  } else {
    // Handle other HTTP methods
    const res = NextResponse.json({
      error: `Method ${req.method} not allowed`,
    });
  }
}

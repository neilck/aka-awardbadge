import { awardBadge } from "@/app/actions/akaActions";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  if (req.method === "POST") {
    // Extract data from request body
    const { session, awardtoken, awarddata } = await req.json();
    console.log(`verify session called ${session}`);

    const result = await awardBadge(session, awardtoken, awarddata);
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

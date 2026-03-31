import { NextRequest, NextResponse } from "next/server";
import { recordAnalyticsEvent } from "@/lib/commerce";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    await recordAnalyticsEvent(String(body.eventType ?? "unknown"), body.productId ? Number(body.productId) : undefined);
    return NextResponse.json({ recorded: true });
  } catch (error) {
    console.error("Analytics event record error:", error);
    return NextResponse.json({ error: "Failed to record event" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { bootstrapFirstAdmin } from "@/lib/admin-bootstrap";
import { isDatabaseConfigured } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    if (!isDatabaseConfigured()) {
      return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
    }

    const result = await bootstrapFirstAdmin(email);

    if (result.promoted && "user" in result) {
      return NextResponse.json({ promoted: true, user: result.user });
    }

    return NextResponse.json({ promoted: false, reason: result.reason });
  } catch (error) {
    console.error("Admin bootstrap error:", error);
    return NextResponse.json({ error: "Failed to bootstrap admin" }, { status: 500 });
  }
}

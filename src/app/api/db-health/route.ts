import { NextResponse } from "next/server";
import { getDatabaseHealth } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const report = await getDatabaseHealth();

  return NextResponse.json(report, {
    status: report.ok ? 200 : 503,
  });
}

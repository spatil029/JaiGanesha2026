import { NextResponse } from "next/server";
import { listLedger } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json(listLedger());
}

export async function POST() {
  return NextResponse.json(
    { error: "Entry creation is disabled. This dashboard is read-only." },
    { status: 403 },
  );
}

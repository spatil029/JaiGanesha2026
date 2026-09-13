import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ error: "Login is disabled." }, { status: 403 });
}

export async function GET() {
  return NextResponse.json({ error: "Login is disabled." }, { status: 403 });
}

export async function DELETE() {
  return NextResponse.json({ ok: true });
}

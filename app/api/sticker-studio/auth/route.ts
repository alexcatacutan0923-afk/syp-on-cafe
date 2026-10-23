
import { NextRequest, NextResponse } from "next/server";
import {
  clearStickerSession,
  setStickerSession,
  verifyPassword,
} from "@/lib/sticker-studio-server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const password =
      typeof body?.password === "string" ? body.password : "";

    if (!password || !verifyPassword(password)) {
      return NextResponse.json(
        { error: "Invalid password." },
        { status: 401 }
      );
    }

    await setStickerSession();

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Sticker Studio authentication is not configured." },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  await clearStickerSession();

  return NextResponse.json({ ok: true });
}

import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.BACKEND_URL ?? "http://localhost:5000";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const response = await fetch(`${BACKEND}/api/ai/chat`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Chat service unavailable";
    console.error("Chat proxy error:", message);
    // Return a graceful fallback so the bot never hard-crashes in the UI
    return NextResponse.json(
      { reply: "Sorry, I'm having trouble connecting right now. Please try again in a moment." },
      { status: 200 }
    );
  }
}

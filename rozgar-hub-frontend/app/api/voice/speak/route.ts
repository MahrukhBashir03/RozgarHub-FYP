import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { text, role } = (await req.json()) as { text: string; role?: string };

    if (!text) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY is not set in .env.local" },
        { status: 500 }
      );
    }

    const response = await fetch("https://api.openai.com/v1/audio/speech", {
      method:  "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type":  "application/json",
      },
      body: JSON.stringify({
        model: "tts-1",
        voice: role === "employer" ? "alloy" : "nova",
        input: text.slice(0, 4096),
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      const msg = (err as { error?: { message?: string } })?.error?.message
        ?? `OpenAI TTS error ${response.status}`;
      console.error("TTS error:", msg);
      return NextResponse.json({ error: msg }, { status: 500 });
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    return new NextResponse(buffer, {
      headers: {
        "Content-Type":   "audio/mpeg",
        "Content-Length": String(buffer.length),
      },
    });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "TTS failed";
    console.error("Speak error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * app/api/voice/speak/route.ts
 * ─────────────────────────────────────────────────────────────────
 * Secure server-side proxy for OpenAI Text-to-Speech
 * Keeps your OPENAI_API_KEY on the server — never exposed to browser
 *
 * POST /api/voice/speak
 *   Body: JSON { text: string, role: "worker"|"employer", lang?: "en"|"ur" }
 *   Returns: audio/mpeg stream (play directly in browser with Audio API)
 * ─────────────────────────────────────────────────────────────────
 */

import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 20;

// Voice selection: different voices for worker/employer feel
const VOICE_MAP: Record<string, string> = {
  worker:   "nova",   // Warm, friendly — good for Urdu-accented English
  employer: "onyx",   // Deeper, professional tone
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, role = "worker", lang = "en" } = body as {
      text: string;
      role?: "worker" | "employer";
      lang?: string;
    };

    // ── Validate ─────────────────────────────────────────────────
    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "No text provided" },
        { status: 400 }
      );
    }

    const MAX_CHARS = 4096; // OpenAI TTS limit
    const truncated = text.slice(0, MAX_CHARS);
    const voice = VOICE_MAP[role] ?? "nova";

    // ── Call OpenAI TTS ──────────────────────────────────────────
    const ttsRes = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "tts-1",       // tts-1-hd for higher quality (slower)
        input: truncated,
        voice,
        speed: 1.0,
        response_format: "mp3",
      }),
    });

    if (!ttsRes.ok) {
      const err = await ttsRes.json().catch(() => ({}));
      console.error("[TTS API Error]", err);
      return NextResponse.json(
        { error: "TTS service unavailable" },
        { status: 502 }
      );
    }

    // ── Stream audio back to browser ─────────────────────────────
    const audioBuffer = await ttsRes.arrayBuffer();

    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": audioBuffer.byteLength.toString(),
        "Cache-Control": "no-store",
      },
    });

  } catch (error) {
    console.error("[Speak Route Error]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
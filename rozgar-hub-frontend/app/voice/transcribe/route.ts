/**
 * app/api/voice/transcribe/route.ts
 * ─────────────────────────────────────────────────────────────────
 * Secure server-side proxy for OpenAI Whisper (Speech-to-Text)
 * Keeps your OPENAI_API_KEY on the server — never exposed to browser
 *
 * POST /api/voice/transcribe
 *   Body: FormData { audio: File, role: "worker"|"employer", lang?: string }
 *   Returns: { transcript: string }
 * ─────────────────────────────────────────────────────────────────
 */

import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs"; // Whisper needs Node.js (not Edge)
export const maxDuration = 30;   // Allow up to 30s for audio processing

export async function POST(req: NextRequest) {
  try {
    // ── 1. Parse incoming form data ──────────────────────────────
    const formData = await req.formData();
    const audioFile = formData.get("audio") as File | null;
    const role      = (formData.get("role") as string) ?? "worker";
    const lang      = (formData.get("lang") as string) ?? "en";

    if (!audioFile) {
      return NextResponse.json(
        { error: "No audio file provided" },
        { status: 400 }
      );
    }

    // ── 2. Validate size (OpenAI max is 25MB) ────────────────────
    const MAX_SIZE = 25 * 1024 * 1024;
    if (audioFile.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "Audio file too large. Max 25MB." },
        { status: 413 }
      );
    }

    // ── 3. Forward to OpenAI Whisper ─────────────────────────────
    const openAiForm = new FormData();
    openAiForm.append("file", audioFile, "audio.webm");
    openAiForm.append("model", "whisper-1");
    openAiForm.append("language", lang); // "en" or remove for auto-detect (supports Urdu)
    openAiForm.append(
      "prompt",
      `RozgarHub Pakistan employment portal. User is a ${role}. ` +
      `Context: job search, workers, employers, skills, location, salary in Pakistani Rupees.`
    );
    // response_format: "json" returns { text: "..." }
    openAiForm.append("response_format", "json");

    const whisperRes = await fetch(
      "https://api.openai.com/v1/audio/transcriptions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: openAiForm,
      }
    );

    if (!whisperRes.ok) {
      const err = await whisperRes.json().catch(() => ({}));
      console.error("[Whisper API Error]", err);
      return NextResponse.json(
        { error: "Transcription service unavailable. Please try again." },
        { status: 502 }
      );
    }

    const data = await whisperRes.json();
    const transcript: string = data.text?.trim() ?? "";

    if (!transcript) {
      return NextResponse.json(
        { error: "Could not understand audio. Please speak clearly and try again." },
        { status: 422 }
      );
    }

    return NextResponse.json({ transcript });

  } catch (error) {
    console.error("[Transcribe Route Error]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
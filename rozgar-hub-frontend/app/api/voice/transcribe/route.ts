import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData  = await req.formData();
    const audioFile = formData.get("audio") as File | null;
    const lang      = (formData.get("lang") as string) || "en";

    if (!audioFile || audioFile.size === 0) {
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY is not set in .env.local" },
        { status: 500 }
      );
    }

    // Read the audio bytes and re-package as a plain Blob so that the native
    // fetch FormData works reliably inside the Next.js App Router runtime.
    // (Using the OpenAI SDK's toFile() helper can silently fail in this env.)
    const arrayBuffer = await audioFile.arrayBuffer();
    const blob        = new Blob([arrayBuffer], { type: audioFile.type || "audio/webm" });

    const whisperForm = new FormData();
    whisperForm.append("file",  blob, "audio.webm");
    whisperForm.append("model", "whisper-1");
    if (lang === "ur") whisperForm.append("language", "ur");

    const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method:  "POST",
      headers: { "Authorization": `Bearer ${process.env.OPENAI_API_KEY}` },
      body:    whisperForm,
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errMsg = (result as { error?: { message?: string } })?.error?.message
        ?? `OpenAI Whisper error ${response.status}`;
      console.error("Whisper error:", errMsg);
      return NextResponse.json({ error: errMsg }, { status: 500 });
    }

    return NextResponse.json({ transcript: (result as { text: string }).text ?? "" });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Transcription failed";
    console.error("Transcribe error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

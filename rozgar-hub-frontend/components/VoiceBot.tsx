"use client";

/**
 * RozgarHub — VoiceBot Component (Secure Version)
 * ─────────────────────────────────────────────────────────────────
 * Floating voice-enabled AI assistant for RozgarHub.
 * All API calls go through secure Next.js server routes —
 * your OpenAI key and Botpress webhook are never exposed to the browser.
 *
 * FULL FLOW:
 *  1. User presses mic → browser records audio (MediaRecorder)
 *  2. Audio blob → POST /api/voice/transcribe → OpenAI Whisper → text
 *  3. Text → POST /api/voice/botpress → your Botpress bot → reply text
 *  4. Reply text → POST /api/voice/speak → OpenAI TTS → audio played back
 *  5. Fallback: browser SpeechSynthesis if server TTS fails
 *
 * SETUP:
 *  1. Copy the 3 API route files to:
 *       app/api/voice/transcribe/route.ts
 *       app/api/voice/speak/route.ts
 *       app/api/voice/botpress/route.ts
 *
 *  2. Add to .env.local (server-side, no NEXT_PUBLIC_ prefix needed):
 *       OPENAI_API_KEY=sk-...
 *       BOTPRESS_WEBHOOK_URL=https://webhook.botpress.cloud/...
 *
 *  3. Place this component once in your root layout (it floats):
 *       import VoiceBot from "@/components/VoiceBot";
 *       <VoiceBot userRole={user.role} userName={user.name} userId={user.id} />
 * ─────────────────────────────────────────────────────────────────
 */

import React, {
  useState, useRef, useEffect, useCallback, useReducer,
} from "react";

// ─── Types ────────────────────────────────────────────────────────
type UserRole = "worker" | "employer";

type BotState =
  | "idle"
  | "listening"
  | "transcribing"
  | "thinking"
  | "speaking"
  | "error";

interface Message {
  id: string;
  role: "user" | "bot";
  text: string;
  timestamp: Date;
  fromVoice?: boolean;
}

interface VoiceBotProps {
  userRole?: UserRole;
  userName?: string;
  userId?: string;
}

// ─── State reducer for messages ───────────────────────────────────
type MsgAction =
  | { type: "ADD"; msg: Message }
  | { type: "CLEAR" };

function messagesReducer(state: Message[], action: MsgAction): Message[] {
  if (action.type === "ADD") return [...state, action.msg];
  if (action.type === "CLEAR") return [];
  return state;
}

// ─── Helpers ──────────────────────────────────────────────────────
const uid = () => Math.random().toString(36).slice(2, 9);

const STATE_LABELS: Record<BotState, string> = {
  idle:         "Tap mic or type",
  listening:    "Listening… release to send",
  transcribing: "Understanding your voice…",
  thinking:     "Processing with AI…",
  speaking:     "Speaking response…",
  error:        "Something went wrong",
};

const SUGGESTIONS: Record<UserRole, string[]> = {
  worker: [
    "Find electrician jobs near me",
    "Show jobs above Rs 2000/day",
    "Mark me available tomorrow",
    "What is my current rating?",
  ],
  employer: [
    "Find a plumber available today",
    "Post a carpentry job",
    "Show top-rated workers near me",
    "Check my active job postings",
  ],
};

// ─── Main Component ───────────────────────────────────────────────
export default function VoiceBot({
  userRole = "worker",
  userName = "User",
  userId   = "guest",
}: VoiceBotProps) {
  const [isOpen,    setIsOpen]    = useState(false);
  const [botState,  setBotState]  = useState<BotState>("idle");
  const [messages,  dispatch]     = useReducer(messagesReducer, []);
  const [inputText, setInputText] = useState("");
  const [isMuted,   setIsMuted]   = useState(false);
  const [errorMsg,  setErrorMsg]  = useState("");
  const [waveform,  setWaveform]  = useState<number[]>([]);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef   = useRef<Blob[]>([]);
  const audioRef         = useRef<HTMLAudioElement | null>(null);
  const streamRef        = useRef<MediaStream | null>(null);
  const analyserRef      = useRef<AnalyserNode | null>(null);
  const animFrameRef     = useRef<number>(0);
  const messagesEndRef   = useRef<HTMLDivElement | null>(null);
  const conversationId   = useRef(`conv_${userId}_${Date.now()}`);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Cleanup
  useEffect(() => () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    audioRef.current?.pause();
    cancelAnimationFrame(animFrameRef.current);
  }, []);

  // Greeting on open
  useEffect(() => {
    if (!isOpen || messages.length > 0) return;
    const greeting = userRole === "worker"
      ? `Assalam-o-Alaikum ${userName}! Main aapka RozgarHub AI assistant hoon. Aap mujhse Urdu ya English mein baat kar sakte hain — mic dabayein ya likhein.`
      : `Welcome ${userName}! I'm your RozgarHub AI assistant. I can find workers, post jobs, and manage your listings. Press the mic or type below.`;
    dispatch({ type: "ADD", msg: { id: uid(), role: "bot", text: greeting, timestamp: new Date() } });
  }, [isOpen]);

  // ── Add message ───────────────────────────────────────────────
  const addMessage = useCallback((
    role: "user" | "bot", text: string, fromVoice = false
  ) => {
    dispatch({ type: "ADD", msg: { id: uid(), role, text, timestamp: new Date(), fromVoice } });
  }, []);

  // ── Waveform visualizer ───────────────────────────────────────
  const startWaveform = useCallback((stream: MediaStream) => {
    const ctx      = new AudioContext();
    const source   = ctx.createMediaStreamSource(stream);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 64;
    source.connect(analyser);
    analyserRef.current = analyser;

    const data = new Uint8Array(analyser.frequencyBinCount);
    const tick = () => {
      analyser.getByteFrequencyData(data);
      setWaveform(Array.from(data.slice(0, 12)));
      animFrameRef.current = requestAnimationFrame(tick);
    };
    tick();
  }, []);

  const stopWaveform = useCallback(() => {
    cancelAnimationFrame(animFrameRef.current);
    setWaveform([]);
  }, []);

  // ── TTS via server ────────────────────────────────────────────
  const speak = useCallback(async (text: string) => {
    if (isMuted) return;
    setBotState("speaking");

    try {
      const res = await fetch("/api/voice/speak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, role: userRole }),
      });

      if (!res.ok) throw new Error("TTS failed");

      const blob     = await res.blob();
      const url      = URL.createObjectURL(blob);
      const audio    = new Audio(url);
      audioRef.current = audio;

      audio.onended = () => { URL.revokeObjectURL(url); setBotState("idle"); };
      audio.onerror = () => setBotState("idle");
      await audio.play();

    } catch {
      // Browser fallback
      if ("speechSynthesis" in window) {
        const utt  = new SpeechSynthesisUtterance(text);
        utt.lang   = "en-PK";
        utt.rate   = 0.92;
        utt.pitch  = 1.05;
        utt.onend  = () => setBotState("idle");
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utt);
      } else {
        setBotState("idle");
      }
    }
  }, [isMuted, userRole]);

  // ── Send to Botpress via server ───────────────────────────────
  const sendToBotpress = useCallback(async (message: string): Promise<string> => {
    setBotState("thinking");
    try {
      const res = await fetch("/api/voice/botpress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message, userId, userRole, userName,
          conversationId: conversationId.current,
        }),
      });
      const data = await res.json();
      return data.reply ?? "I'm not sure how to help with that. Can you rephrase?";
    } catch {
      return "Connection error. Please check your internet and try again.";
    }
  }, [userId, userRole, userName]);

  // ── Process message ───────────────────────────────────────────
  const processMessage = useCallback(async (text: string, fromVoice = false) => {
    if (!text.trim()) return;
    setErrorMsg("");
    addMessage("user", text, fromVoice);
    setInputText("");

    const reply = await sendToBotpress(text);
    addMessage("bot", reply);
    await speak(reply);
  }, [addMessage, sendToBotpress, speak]);

  // ── Start recording ───────────────────────────────────────────
  const startRecording = useCallback(async () => {
    setErrorMsg("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      startWaveform(stream);

      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/webm";

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = e => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      recorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        stopWaveform();
        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        await transcribeAudio(blob);
      };

      recorder.start(100);
      setBotState("listening");
    } catch {
      setErrorMsg("Microphone access denied. Please allow mic permissions in your browser.");
      setBotState("error");
    }
  }, [startWaveform, stopWaveform]);

  // ── Stop recording ────────────────────────────────────────────
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state !== "inactive") {
      mediaRecorderRef.current?.stop();
    }
    setBotState("transcribing");
  }, []);

  // ── Transcribe via server ─────────────────────────────────────
  const transcribeAudio = useCallback(async (blob: Blob) => {
    try {
      const form = new FormData();
      form.append("audio", blob, "audio.webm");
      form.append("role", userRole);
      form.append("lang", "en"); // remove for Urdu auto-detect

      const res = await fetch("/api/voice/transcribe", {
        method: "POST",
        body: form,
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setErrorMsg(data.error ?? "Could not understand. Please try again.");
        setBotState("error");
        setTimeout(() => setBotState("idle"), 3000);
        return;
      }

      await processMessage(data.transcript, true);

    } catch {
      setErrorMsg("Transcription failed. Please try typing instead.");
      setBotState("error");
      setTimeout(() => setBotState("idle"), 3000);
    }
  }, [userRole, processMessage]);

  // ── Mic toggle ────────────────────────────────────────────────
  const handleMic = useCallback(() => {
    if (botState === "listening") stopRecording();
    else if (botState === "idle" || botState === "error") startRecording();
  }, [botState, startRecording, stopRecording]);

  const stopSpeaking = useCallback(() => {
    audioRef.current?.pause();
    window.speechSynthesis?.cancel();
    setBotState("idle");
  }, []);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim() && botState === "idle") processMessage(inputText.trim());
  }, [inputText, botState, processMessage]);

  const canInteract  = botState === "idle" || botState === "error";
  const isProcessing = botState === "transcribing" || botState === "thinking";

  // ── Render ────────────────────────────────────────────────────
  return (
    <>
      <div className="rh-root">
        {/* Trigger button */}
        {!isOpen && <span className="rh-badge">AI</span>}
        <button
          className={`rh-trigger ${isOpen ? "open" : ""}`}
          onClick={() => setIsOpen(v => !v)}
          aria-label="RozgarHub Voice Assistant"
        >
          {isOpen
            ? <CloseIcon />
            : <MicIcon size={26} />}
        </button>

        {isOpen && (
          <div className="rh-panel">

            {/* Header */}
            <div className="rh-header">
              <div className="rh-header-left">
                <div className="rh-avatar">
                  <BotIcon />
                  <span className="rh-online" />
                </div>
                <div>
                  <p className="rh-title">RozgarHub AI</p>
                  <p className="rh-subtitle">
                    {userRole === "worker" ? "Worker Assistant" : "Employer Assistant"}
                  </p>
                </div>
              </div>
              <button
                className={`rh-mute ${isMuted ? "muted" : ""}`}
                onClick={() => setIsMuted(v => !v)}
                title={isMuted ? "Unmute" : "Mute voice"}
              >
                {isMuted ? <MutedIcon /> : <SoundIcon />}
              </button>
            </div>

            {/* Messages */}
            <div className="rh-messages">
              {messages.map(msg => (
                <div key={msg.id} className={`rh-msg ${msg.role}`}>
                  {msg.role === "bot" && (
                    <div className="rh-msg-icon"><BotIcon small /></div>
                  )}
                  <div className="rh-bubble">
                    {msg.fromVoice && msg.role === "user" && <span className="rh-voice-tag">🎤 </span>}
                    {msg.text}
                    <span className="rh-time">
                      {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </div>
              ))}

              {/* Thinking dots */}
              {isProcessing && (
                <div className="rh-msg bot">
                  <div className="rh-msg-icon"><BotIcon small /></div>
                  <div className="rh-bubble rh-typing">
                    <span className="rh-dot" /><span className="rh-dot" /><span className="rh-dot" />
                    <span className="rh-typing-lbl">{STATE_LABELS[botState]}</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Error */}
            {errorMsg && (
              <div className="rh-error">
                <AlertIcon /> {errorMsg}
              </div>
            )}

            {/* Suggestions */}
            {messages.length <= 1 && canInteract && (
              <div className="rh-chips">
                {SUGGESTIONS[userRole].map(s => (
                  <button key={s} className="rh-chip" onClick={() => processMessage(s)}>
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Waveform visualizer */}
            {botState === "listening" && waveform.length > 0 && (
              <div className="rh-waveform">
                {waveform.map((v, i) => (
                  <div
                    key={i}
                    className="rh-bar"
                    style={{ height: `${Math.max(4, (v / 255) * 36)}px` }}
                  />
                ))}
              </div>
            )}

            {/* Status */}
            <div className="rh-status">
              <span className={`rh-status-dot s-${botState}`} />
              <span>{STATE_LABELS[botState]}</span>
              {botState === "speaking" && (
                <button className="rh-stop" onClick={stopSpeaking}>Stop</button>
              )}
            </div>

            {/* Controls */}
            <div className="rh-controls">
              <button
                className={`rh-mic ${botState === "listening" ? "rec" : ""} ${isProcessing || botState === "speaking" ? "dis" : ""}`}
                onClick={handleMic}
                disabled={isProcessing || botState === "speaking"}
                title={botState === "listening" ? "Stop" : "Speak"}
              >
                {botState === "listening" && <span className="rh-pulse" />}
                {botState === "listening" ? <StopIcon /> : <MicIcon size={22} />}
              </button>

              <form className="rh-form" onSubmit={handleSubmit}>
                <input
                  className="rh-input"
                  type="text"
                  placeholder={
                    userRole === "worker"
                      ? "Search jobs, ask anything…"
                      : "Find workers, post jobs…"
                  }
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  disabled={!canInteract}
                  maxLength={500}
                />
                <button
                  type="submit"
                  className="rh-send"
                  disabled={!inputText.trim() || !canInteract}
                >
                  <SendIcon />
                </button>
              </form>
            </div>

            <p className="rh-footer">
              OpenAI Whisper · Botpress · RozgarHub
            </p>
          </div>
        )}
      </div>

      {/* ── All styles ── */}
      <style>{`
        .rh-root{position:fixed;bottom:28px;right:28px;z-index:9999;font-family:'Segoe UI',system-ui,sans-serif}

        /* Trigger */
        .rh-trigger{width:60px;height:60px;border-radius:50%;background:linear-gradient(135deg,#1a56db,#0f3f9e);border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 20px rgba(26,86,219,.45);transition:transform .2s,box-shadow .2s;color:#fff;position:relative}
        .rh-trigger:hover{transform:scale(1.08);box-shadow:0 6px 28px rgba(26,86,219,.55)}
        .rh-trigger.open{background:linear-gradient(135deg,#374151,#1f2937)}
        .rh-badge{position:absolute;top:-4px;right:-4px;background:#ef4444;color:#fff;font-size:9px;font-weight:700;padding:2px 5px;border-radius:10px;pointer-events:none;letter-spacing:.5px}

        /* Panel */
        .rh-panel{position:absolute;bottom:72px;right:0;width:375px;max-height:610px;background:#fff;border-radius:20px;box-shadow:0 12px 48px rgba(0,0,0,.18),0 4px 16px rgba(26,86,219,.12);display:flex;flex-direction:column;overflow:hidden;animation:panelIn .25s cubic-bezier(.34,1.56,.64,1);border:1px solid rgba(26,86,219,.1)}
        @keyframes panelIn{from{opacity:0;transform:scale(.92) translateY(12px)}to{opacity:1;transform:scale(1) translateY(0)}}
        @media(max-width:420px){.rh-panel{width:calc(100vw - 32px);right:-14px}}

        /* Header */
        .rh-header{background:linear-gradient(135deg,#1a56db,#0f3f9e);padding:14px 16px;display:flex;align-items:center;justify-content:space-between;color:#fff}
        .rh-header-left{display:flex;align-items:center;gap:10px}
        .rh-avatar{width:38px;height:38px;background:rgba(255,255,255,.2);border-radius:50%;display:flex;align-items:center;justify-content:center;position:relative;color:#fff;flex-shrink:0}
        .rh-online{position:absolute;bottom:1px;right:1px;width:9px;height:9px;background:#22c55e;border-radius:50%;border:2px solid #1a56db}
        .rh-title{font-size:14px;font-weight:700;margin:0;letter-spacing:.2px}
        .rh-subtitle{font-size:11px;margin:0;opacity:.8}
        .rh-mute{background:rgba(255,255,255,.15);border:none;border-radius:8px;width:32px;height:32px;display:flex;align-items:center;justify-content:center;cursor:pointer;color:#fff;transition:background .15s}
        .rh-mute:hover{background:rgba(255,255,255,.25)}
        .rh-mute.muted{background:rgba(239,68,68,.4)}

        /* Messages */
        .rh-messages{flex:1;overflow-y:auto;padding:14px 14px 6px;display:flex;flex-direction:column;gap:10px;min-height:200px;max-height:300px;background:#f8fafc;scroll-behavior:smooth}
        .rh-messages::-webkit-scrollbar{width:4px}
        .rh-messages::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:4px}
        .rh-msg{display:flex;align-items:flex-end;gap:6px;animation:msgIn .2s ease}
        @keyframes msgIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        .rh-msg.user{flex-direction:row-reverse}
        .rh-msg-icon{width:26px;height:26px;background:linear-gradient(135deg,#1a56db,#0f3f9e);border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;flex-shrink:0}
        .rh-bubble{max-width:80%;padding:9px 12px;border-radius:14px;font-size:13px;line-height:1.55;position:relative}
        .rh-msg.bot .rh-bubble{background:#fff;color:#1e293b;border-bottom-left-radius:4px;box-shadow:0 1px 4px rgba(0,0,0,.07)}
        .rh-msg.user .rh-bubble{background:linear-gradient(135deg,#1a56db,#0f3f9e);color:#fff;border-bottom-right-radius:4px}
        .rh-time{display:block;font-size:10px;opacity:.5;margin-top:3px;text-align:right}
        .rh-voice-tag{font-size:12px}

        /* Typing */
        .rh-typing{display:flex;align-items:center;gap:4px;padding:12px 16px}
        .rh-dot{width:7px;height:7px;background:#94a3b8;border-radius:50%;animation:dotBounce 1.2s infinite}
        .rh-dot:nth-child(2){animation-delay:.2s}.rh-dot:nth-child(3){animation-delay:.4s}
        @keyframes dotBounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-6px)}}
        .rh-typing-lbl{font-size:11px;color:#64748b;margin-left:4px}

        /* Error */
        .rh-error{margin:0 14px 6px;background:#fef2f2;color:#dc2626;font-size:12px;padding:8px 10px;border-radius:8px;display:flex;align-items:center;gap:6px;border:1px solid #fecaca}

        /* Suggestions */
        .rh-chips{padding:4px 14px 8px;display:flex;flex-wrap:wrap;gap:6px;background:#f8fafc}
        .rh-chip{background:#eff6ff;color:#1a56db;border:1px solid #bfdbfe;border-radius:20px;font-size:11.5px;padding:5px 10px;cursor:pointer;transition:background .15s,transform .1s;white-space:nowrap}
        .rh-chip:hover{background:#dbeafe;transform:translateY(-1px)}

        /* Waveform */
        .rh-waveform{height:44px;background:#eff6ff;display:flex;align-items:center;justify-content:center;gap:3px;padding:0 14px;border-top:1px solid #e0ecff}
        .rh-bar{width:4px;background:linear-gradient(180deg,#1a56db,#60a5fa);border-radius:2px;transition:height .05s ease;min-height:4px}

        /* Status */
        .rh-status{padding:6px 14px;display:flex;align-items:center;gap:6px;font-size:11.5px;color:#64748b;background:#fff;border-top:1px solid #f1f5f9}
        .rh-status-dot{width:7px;height:7px;border-radius:50%;flex-shrink:0}
        .rh-status-dot.s-idle{background:#22c55e}
        .rh-status-dot.s-listening{background:#ef4444;animation:pulse .8s infinite}
        .rh-status-dot.s-transcribing,.rh-status-dot.s-thinking{background:#3b82f6;animation:pulse .8s infinite}
        .rh-status-dot.s-speaking{background:#8b5cf6;animation:pulse 1s infinite}
        .rh-status-dot.s-error{background:#ef4444}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.25}}
        .rh-stop{margin-left:auto;background:#fef2f2;color:#dc2626;border:1px solid #fecaca;border-radius:6px;font-size:11px;padding:2px 8px;cursor:pointer}

        /* Controls */
        .rh-controls{display:flex;align-items:center;gap:8px;padding:10px 12px;background:#fff;border-top:1px solid #f1f5f9}
        .rh-mic{width:48px;height:48px;border-radius:50%;background:linear-gradient(135deg,#1a56db,#0f3f9e);border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;color:#fff;flex-shrink:0;position:relative;transition:transform .15s,box-shadow .15s;box-shadow:0 2px 10px rgba(26,86,219,.35)}
        .rh-mic:hover:not(.dis){transform:scale(1.07)}
        .rh-mic.rec{background:linear-gradient(135deg,#ef4444,#dc2626);box-shadow:0 2px 10px rgba(239,68,68,.4)}
        .rh-mic.dis{opacity:.4;cursor:not-allowed}
        .rh-pulse{position:absolute;inset:-6px;border-radius:50%;border:2px solid #ef4444;animation:ring 1s ease-out infinite;pointer-events:none}
        @keyframes ring{0%{transform:scale(.9);opacity:.9}100%{transform:scale(1.55);opacity:0}}
        .rh-form{flex:1;display:flex;align-items:center;background:#f1f5f9;border-radius:24px;padding:0 4px 0 12px;border:1.5px solid transparent;transition:border-color .15s}
        .rh-form:focus-within{border-color:#1a56db;background:#fff}
        .rh-input{flex:1;border:none;background:transparent;font-size:13px;padding:10px 0;outline:none;color:#1e293b}
        .rh-input::placeholder{color:#94a3b8}
        .rh-input:disabled{cursor:not-allowed}
        .rh-send{width:34px;height:34px;background:linear-gradient(135deg,#1a56db,#0f3f9e);border:none;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;color:#fff;flex-shrink:0;transition:opacity .15s,transform .15s}
        .rh-send:disabled{opacity:.3;cursor:not-allowed}
        .rh-send:not(:disabled):hover{transform:scale(1.08)}
        .rh-footer{font-size:10px;color:#94a3b8;text-align:center;padding:5px 0 8px;margin:0;background:#fff}
      `}</style>
    </>
  );
}

// ─── Icon components ───────────────────────────────────────────────
function MicIcon({ size = 24 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width={size} height={size}>
      <path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="23" />
      <line x1="8" y1="23" x2="16" y2="23" />
    </svg>
  );
}
function StopIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <rect x="6" y="6" width="12" height="12" rx="2" />
    </svg>
  );
}
function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="22" height="22">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}
function BotIcon({ small }: { small?: boolean }) {
  const s = small ? 14 : 20;
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width={s} height={s}>
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}
function SendIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16">
      <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}
function SoundIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
      <path d="M11 5L6 9H2v6h4l5 4V5z" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14" /><path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
    </svg>
  );
}
function MutedIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
      <path d="M11 5L6 9H2v6h4l5 4V5z" /><line x1="23" y1="9" x2="17" y2="15" /><line x1="17" y1="9" x2="23" y2="15" />
    </svg>
  );
}
function AlertIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
      <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}
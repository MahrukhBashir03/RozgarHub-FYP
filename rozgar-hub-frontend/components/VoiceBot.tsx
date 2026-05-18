"use client";

import React, {
  useState, useRef, useEffect, useCallback, useReducer,
} from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
type UserRole = "worker" | "employer";

type BotState =
  | "idle"
  | "listening"
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

interface ActionData {
  type: "CREATE_JOB" | "FIND_JOBS" | "NAVIGATE";
  data: Record<string, unknown>;
}

interface VoiceBotProps {
  userRole?:  UserRole;
  userName?:  string;
  userId?:    string;
  userToken?: string;
}

type MsgAction = { type: "ADD"; msg: Message } | { type: "CLEAR" };

function messagesReducer(state: Message[], action: MsgAction): Message[] {
  if (action.type === "ADD")   return [...state, action.msg];
  if (action.type === "CLEAR") return [];
  return state;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const uid     = () => Math.random().toString(36).slice(2, 9);
const BACKEND = "http://localhost:5000";

const STATE_LABELS = {
  en: {
    idle:      "Tap mic or type",
    listening: "Listening… tap mic to stop",
    thinking:  "Processing with AI…",
    speaking:  "Speaking response…",
    error:     "Something went wrong",
  },
  ur: {
    idle:      "Mic dabayein ya likhein",
    listening: "Sun raha hoon…",
    thinking:  "Soch raha hoon…",
    speaking:  "Jawab de raha hoon…",
    error:     "Kuch ghalti ho gayi",
  },
} as const;

const SUGGESTIONS: Record<UserRole, { en: string[]; ur: string[] }> = {
  worker: {
    en: [
      "Find electrician jobs near me",
      "How do I apply for a job?",
      "Show plumber jobs in Lahore",
      "How does the OTP payment work?",
    ],
    ur: [
      "Mere paas electrician jobs dhundho",
      "Job ke liye apply kaise karoon?",
      "Lahore mein plumber jobs dikhao",
      "Payment kaise milti hai?",
    ],
  },
  employer: {
    en: [
      "Post a carpentry job in Karachi",
      "I need a plumber urgently",
      "How do I track my worker?",
      "Explain the payment process",
    ],
    ur: [
      "Carpenter ki job post karo",
      "Mujhe aaj plumber chahiye",
      "Apne worker ko kaise track karoon?",
      "Payment process samjhao",
    ],
  },
};

// ─── SpeechRecognition types (not present in all TypeScript DOM libs) ────────
interface SRErrorEvent extends Event {
  error: string;
}
interface SRResult {
  isFinal: boolean;
  [index: number]: { transcript: string };
}
interface SRResultEvent extends Event {
  resultIndex: number;
  results: SRResult[];
}
interface ISpeechRecognition extends EventTarget {
  lang:            string;
  continuous:      boolean;
  interimResults:  boolean;
  onstart:  (() => void) | null;
  onend:    (() => void) | null;
  onerror:  ((e: SRErrorEvent)  => void) | null;
  onresult: ((e: SRResultEvent) => void) | null;
  start(): void;
  stop():  void;
  abort(): void;
}
declare global {
  interface Window {
    SpeechRecognition:       new () => ISpeechRecognition;
    webkitSpeechRecognition: new () => ISpeechRecognition;
  }
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function VoiceBot({
  userRole  = "worker",
  userName  = "User",
  userId    = "guest",
  userToken,
}: VoiceBotProps) {
  const [isOpen,        setIsOpen]        = useState(false);
  const [botState,      setBotState]      = useState<BotState>("idle");
  const [messages,      dispatch]         = useReducer(messagesReducer, []);
  const [inputText,     setInputText]     = useState("");
  const [isMuted,       setIsMuted]       = useState(false);
  const [errorMsg,      setErrorMsg]      = useState("");
  const [lang,          setLang]          = useState<"en" | "ur">("en");
  const [pendingAction, setPendingAction] = useState<ActionData | null>(null);
  const [isConfirming,  setIsConfirming]  = useState(false);
  const [liveText,      setLiveText]      = useState(""); // interim speech text

  const recognitionRef  = useRef<ISpeechRecognition | null>(null);
  const messagesEndRef  = useRef<HTMLDivElement | null>(null);
  const synthRef        = useRef<SpeechSynthesisUtterance | null>(null);

  // ── Auto-scroll ───────────────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Cleanup on unmount ────────────────────────────────────────────
  useEffect(() => () => {
    recognitionRef.current?.abort();
    window.speechSynthesis?.cancel();
  }, []);

  // ── Greeting on open ──────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen || messages.length > 0) return;
    const greeting = userRole === "worker"
      ? `Assalam-o-Alaikum ${userName}! Main aapka RozgarHub AI assistant hoon. Mic dabayein ya likhein — Urdu aur English dono chalti hai.`
      : `Welcome ${userName}! I'm your RozgarHub AI. I can post jobs, find workers, and explain the platform. Press the mic or type below.`;
    dispatch({ type: "ADD", msg: { id: uid(), role: "bot", text: greeting, timestamp: new Date() } });
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  const labels = STATE_LABELS[lang];

  // ── Helpers ───────────────────────────────────────────────────────
  const addMessage = useCallback((role: "user" | "bot", text: string, fromVoice = false) => {
    dispatch({ type: "ADD", msg: { id: uid(), role, text, timestamp: new Date(), fromVoice } });
  }, []);

  const getHistory = useCallback(() =>
    messages.slice(-8).map(m => ({ role: m.role, text: m.text })),
  [messages]);

  // ── Text-to-Speech (browser built-in, no API key) ─────────────────
  const speak = useCallback((text: string) => {
    if (isMuted || !("speechSynthesis" in window)) {
      setBotState("idle");
      return;
    }
    window.speechSynthesis.cancel();
    setBotState("speaking");

    const utt   = new SpeechSynthesisUtterance(text);
    utt.lang    = lang === "ur" ? "ur-PK" : "en-US";
    utt.rate    = 0.92;
    utt.pitch   = 1.05;
    utt.volume  = 1;

    // Pick a good voice if available
    const voices     = window.speechSynthesis.getVoices();
    const preferred  = lang === "ur"
      ? voices.find(v => v.lang.startsWith("ur"))
      : voices.find(v => v.lang.startsWith("en") && v.name.includes("Female"))
        ?? voices.find(v => v.lang.startsWith("en"));
    if (preferred) utt.voice = preferred;

    utt.onend  = () => setBotState("idle");
    utt.onerror = () => setBotState("idle");
    synthRef.current = utt;
    window.speechSynthesis.speak(utt);
  }, [isMuted, lang]);

  const stopSpeaking = useCallback(() => {
    window.speechSynthesis?.cancel();
    setBotState("idle");
  }, []);

  // ── Call AI backend ───────────────────────────────────────────────
  const sendToAI = useCallback(async (
    message: string
  ): Promise<{ reply: string; action?: ActionData }> => {
    setBotState("thinking");
    try {
      const res = await fetch("/api/voice/botpress", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message, userId, userRole, userName, lang,
          history: getHistory(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      return {
        reply:  data.reply  ?? "I'm not sure how to help. Can you rephrase?",
        action: data.action,
      };
    } catch {
      return { reply: "Koi masla aa gaya. Dobara koshish karein. / Something went wrong, please try again." };
    }
  }, [userId, userRole, userName, lang, getHistory]);

  // ── Handle action from AI ─────────────────────────────────────────
  const handleAction = useCallback((action: ActionData) => {
    if (action.type === "CREATE_JOB" || action.type === "FIND_JOBS" || action.type === "NAVIGATE") {
      setPendingAction(action);
    }
  }, []);

  // ── Process message end-to-end ────────────────────────────────────
  const processMessage = useCallback(async (text: string, fromVoice = false) => {
    if (!text.trim()) return;
    setErrorMsg("");
    setPendingAction(null);
    addMessage("user", text, fromVoice);
    setInputText("");
    setLiveText("");

    try {
      const { reply, action } = await sendToAI(text);
      addMessage("bot", reply);
      if (action) handleAction(action);
      speak(reply);
    } catch {
      setBotState("idle");
    }
  }, [addMessage, sendToAI, handleAction, speak]);

  // ── Confirm pending action ────────────────────────────────────────
  const confirmAction = useCallback(async () => {
    if (!pendingAction || isConfirming) return;

    if (pendingAction.type === "CREATE_JOB") {
      setIsConfirming(true);
      try {
        const d = pendingAction.data as {
          category: string; title: string; location: string;
          budget: number; urgency: string; description: string;
        };
        const payload = {
          employer:    userId,
          category:    d.category    || "other",
          title:       d.title       || `${d.category} job`,
          location:    d.location    || "Pakistan",
          budget:      d.budget      || 0,
          urgency:     d.urgency     || "flexible",
          description: d.description || "",
          status:      "active",
        };
        const res = await fetch(`${BACKEND}/api/jobs`, {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Job creation failed");

        const created = await res.json();

        // Update localStorage so employer profile sees it immediately
        try {
          const key      = `myposts_${userId}`;
          const existing = JSON.parse(localStorage.getItem(key) || "[]");
          const newPost  = {
            id: created._id, backendId: created._id,
            ...payload,
            status:    "live",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          localStorage.setItem(key, JSON.stringify([newPost, ...existing]));
        } catch (_) {}

        setPendingAction(null);
        const msg = lang === "ur"
          ? "Zabardast! Job post ho gayi. Aapko profile page par le ja raha hoon…"
          : "Done! Job posted. Taking you to your profile now…";
        addMessage("bot", msg);
        speak(msg);
        setTimeout(() => { window.location.href = "/employer/profile"; }, 1500);

      } catch {
        const msg = lang === "ur"
          ? "Job post karne mein masla hua. Dobara koshish karein."
          : "Failed to post the job. Please try again.";
        addMessage("bot", msg);
        speak(msg);
      } finally {
        setIsConfirming(false);
      }

    } else if (pendingAction.type === "FIND_JOBS") {
      const { category, location } = pendingAction.data as { category: string; location: string };
      setPendingAction(null);
      const msg = lang === "ur"
        ? `Browse Jobs tab mein jayein aur${category ? ` "${category}"` : " apni skill"} ke jobs dhundhin.${location ? ` ${location} mein available jobs mil sakti hain.` : ""}`
        : `Go to the Browse Jobs tab${category ? ` and search for "${category}"` : ""}${location ? ` in ${location}` : ""}. Active jobs matching your skill are listed there.`;
      addMessage("bot", msg);
      speak(msg);

    } else if (pendingAction.type === "NAVIGATE") {
      const { url, instructions } = pendingAction.data as { url: string; instructions: string };
      setPendingAction(null);
      const msg = instructions || (lang === "ur" ? "Aapko us page par le ja raha hoon…" : "Taking you there now…");
      addMessage("bot", msg);
      speak(msg);
      setTimeout(() => { window.location.href = url; }, 1200);
    }
  }, [pendingAction, isConfirming, userId, lang, addMessage, speak]);

  const cancelAction = useCallback(async () => {
    setPendingAction(null);
    const msg = lang === "ur"
      ? "Theek hai, cancel kar diya. Kuch aur chahiye?"
      : "Got it, cancelled. Is there anything else I can help with?";
    addMessage("bot", msg);
    speak(msg);
  }, [lang, addMessage, speak]);

  // ── Speech Recognition (browser built-in, no API key) ────────────
  const startListening = useCallback(() => {
    const SR = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!SR) {
      setErrorMsg("Voice not supported in this browser. Please use Chrome or Edge, or type your message.");
      setBotState("error");
      setTimeout(() => setBotState("idle"), 4000);
      return;
    }

    setErrorMsg("");
    const recognition       = new SR();
    recognitionRef.current  = recognition;
    // Always use en-US — more reliable; romanized Urdu is captured well too
    recognition.lang        = "en-US";
    recognition.continuous  = false;
    recognition.interimResults = true;

    recognition.onstart  = () => setBotState("listening");
    recognition.onerror  = (e: SRErrorEvent) => {
      const msg = e.error === "not-allowed"
        ? "Microphone access denied. Please allow mic in browser settings."
        : e.error === "no-speech"
        ? "No speech detected. Please try again."
        : e.error === "network"
        ? (lang === "ur"
            ? "Mic se network masla hua. Niche text likhein ya dobara try karein."
            : "Speech recognition network error. Please type your message below.")
        : `Voice error: ${e.error}. Please type your message below.`;
      setErrorMsg(msg);
      setBotState("error");
      setLiveText("");
      setTimeout(() => { setBotState("idle"); setErrorMsg(""); }, 4500);
    };
    recognition.onresult = (e: SRResultEvent) => {
      let interim = "";
      let final   = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) final   += e.results[i][0].transcript;
        else                       interim += e.results[i][0].transcript;
      }
      setLiveText(final || interim);
      if (final) {
        recognition.stop();
        processMessage(final.trim(), true);
      }
    };
    recognition.onend = () => {
      setLiveText("");
      if (botState === "listening") setBotState("idle");
    };

    recognition.start();
  }, [lang, botState, processMessage]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setBotState("idle");
    setLiveText("");
  }, []);

  const handleMic = useCallback(() => {
    if (botState === "listening") stopListening();
    else if (botState === "idle" || botState === "error") startListening();
  }, [botState, startListening, stopListening]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim() && (botState === "idle" || botState === "error")) processMessage(inputText.trim());
  }, [inputText, botState, processMessage]);

  const canInteract  = botState === "idle" || botState === "error";
  const isProcessing = botState === "thinking";

  // ─── Render ───────────────────────────────────────────────────────
  return (
    <>
      <div className="rh-root">
        {!isOpen && <span className="rh-badge">AI</span>}
        <button
          className={`rh-trigger ${isOpen ? "open" : ""}`}
          onClick={() => setIsOpen(v => !v)}
          aria-label="RozgarHub Voice Assistant"
        >
          {isOpen ? <CloseIcon /> : <MicIcon size={26} />}
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
              <div className="rh-header-right">
                <button
                  className={`rh-lang-btn ${lang === "ur" ? "active" : ""}`}
                  onClick={() => setLang(v => v === "en" ? "ur" : "en")}
                  title="Toggle Urdu / English"
                >
                  {lang === "en" ? "اردو" : "EN"}
                </button>
                <button
                  className={`rh-mute ${isMuted ? "muted" : ""}`}
                  onClick={() => setIsMuted(v => !v)}
                  title={isMuted ? "Unmute voice" : "Mute voice"}
                >
                  {isMuted ? <MutedIcon /> : <SoundIcon />}
                </button>
              </div>
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
                    <span className="rh-typing-lbl">{labels.thinking}</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Live speech preview */}
            {botState === "listening" && liveText && (
              <div className="rh-live-text">🎤 {liveText}</div>
            )}

            {/* Error */}
            {errorMsg && (
              <div className="rh-error"><AlertIcon /> {errorMsg}</div>
            )}

            {/* Suggestions */}
            {messages.length <= 1 && canInteract && (
              <div className="rh-chips">
                {SUGGESTIONS[userRole][lang].map(s => (
                  <button key={s} className="rh-chip" onClick={() => processMessage(s)}>
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Action confirmation bar */}
            {pendingAction && (
              <div className={`rh-action-bar ${pendingAction.type === "CREATE_JOB" ? "green" : pendingAction.type === "NAVIGATE" ? "purple" : "blue"}`}>
                {pendingAction.type === "CREATE_JOB" && (() => {
                  const d = pendingAction.data as { category: string; title: string; location: string; budget: number };
                  return (
                    <>
                      <div className="rh-action-info">
                        <span className="rh-action-icon">📋</span>
                        <div>
                          <p className="rh-action-title">{d.title || d.category} · {d.location || "Pakistan"}</p>
                          <p className="rh-action-sub">Rs. {d.budget ? d.budget.toLocaleString() : "TBD"}/day</p>
                        </div>
                      </div>
                      <div className="rh-action-btns">
                        <button className="rh-btn-cancel" onClick={cancelAction} disabled={isConfirming}>Cancel</button>
                        <button className="rh-btn-confirm green" onClick={confirmAction} disabled={isConfirming}>
                          {isConfirming ? "Posting…" : "✓ Post Job"}
                        </button>
                      </div>
                    </>
                  );
                })()}
                {pendingAction.type === "FIND_JOBS" && (() => {
                  const d = pendingAction.data as { category: string; location: string };
                  return (
                    <>
                      <div className="rh-action-info">
                        <span className="rh-action-icon">🔍</span>
                        <p className="rh-action-title">
                          {lang === "ur" ? "Jobs mil gayi" : "Jobs found"}
                          {d.category ? ` · ${d.category}` : ""}
                          {d.location ? ` · ${d.location}` : ""}
                        </p>
                      </div>
                      <div className="rh-action-btns">
                        <button className="rh-btn-cancel" onClick={() => setPendingAction(null)}>Dismiss</button>
                        <button className="rh-btn-confirm blue" onClick={confirmAction}>✓ Got it</button>
                      </div>
                    </>
                  );
                })()}
                {pendingAction.type === "NAVIGATE" && (() => {
                  const d = pendingAction.data as { label: string; description: string; instructions: string };
                  return (
                    <>
                      <div className="rh-action-info">
                        <span className="rh-action-icon">🗺️</span>
                        <div>
                          <p className="rh-action-title">{d.label}</p>
                          <p className="rh-action-sub" style={{ color: "#6366f1" }}>{d.description}</p>
                        </div>
                      </div>
                      <div className="rh-action-btns">
                        <button className="rh-btn-cancel" onClick={cancelAction}>Cancel</button>
                        <button className="rh-btn-confirm blue" onClick={confirmAction}>Go →</button>
                      </div>
                    </>
                  );
                })()}
              </div>
            )}

            {/* Status bar */}
            <div className="rh-status">
              <span className={`rh-status-dot s-${botState}`} />
              <span>{labels[botState as keyof typeof labels]}</span>
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
                      ? (lang === "ur" ? "Jobs dhundho, kuch poochho…" : "Search jobs, ask anything…")
                      : (lang === "ur" ? "Workers dhundho, job post karo…" : "Find workers, post jobs…")
                  }
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  disabled={!canInteract}
                  maxLength={500}
                />
                <button type="submit" className="rh-send" disabled={!inputText.trim() || !canInteract}>
                  <SendIcon />
                </button>
              </form>
            </div>

            <p className="rh-footer">Speech (en) · Groq AI · RozgarHub — reply in {lang === "ur" ? "Urdu" : "English"}</p>
          </div>
        )}
      </div>

      {/* ── Styles ── */}
      <style>{`
        .rh-root{position:fixed;bottom:28px;left:28px;z-index:9999;font-family:'Segoe UI',system-ui,sans-serif}
        .rh-trigger{width:60px;height:60px;border-radius:50%;background:linear-gradient(135deg,#1a56db,#0f3f9e);border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 20px rgba(26,86,219,.45);transition:transform .2s,box-shadow .2s;color:#fff;position:relative}
        .rh-trigger:hover{transform:scale(1.08);box-shadow:0 6px 28px rgba(26,86,219,.55)}
        .rh-trigger.open{background:linear-gradient(135deg,#374151,#1f2937)}
        .rh-badge{position:absolute;top:-4px;left:-4px;background:#ef4444;color:#fff;font-size:9px;font-weight:700;padding:2px 5px;border-radius:10px;pointer-events:none;letter-spacing:.5px}
        .rh-panel{position:absolute;bottom:72px;left:0;width:375px;max-height:630px;background:#fff;border-radius:20px;box-shadow:0 12px 48px rgba(0,0,0,.18),0 4px 16px rgba(26,86,219,.12);display:flex;flex-direction:column;overflow:hidden;animation:panelIn .25s cubic-bezier(.34,1.56,.64,1);border:1px solid rgba(26,86,219,.1)}
        @keyframes panelIn{from{opacity:0;transform:scale(.92) translateY(12px)}to{opacity:1;transform:scale(1) translateY(0)}}
        @media(max-width:420px){.rh-panel{width:calc(100vw - 32px);left:-14px}}
        .rh-header{background:linear-gradient(135deg,#1a56db,#0f3f9e);padding:14px 16px;display:flex;align-items:center;justify-content:space-between;color:#fff}
        .rh-header-left{display:flex;align-items:center;gap:10px}
        .rh-header-right{display:flex;align-items:center;gap:8px}
        .rh-avatar{width:38px;height:38px;background:rgba(255,255,255,.2);border-radius:50%;display:flex;align-items:center;justify-content:center;position:relative;color:#fff;flex-shrink:0}
        .rh-online{position:absolute;bottom:1px;right:1px;width:9px;height:9px;background:#22c55e;border-radius:50%;border:2px solid #1a56db}
        .rh-title{font-size:14px;font-weight:700;margin:0;letter-spacing:.2px}
        .rh-subtitle{font-size:11px;margin:0;opacity:.8}
        .rh-lang-btn{background:rgba(255,255,255,.15);border:none;border-radius:8px;padding:4px 9px;font-size:12px;font-weight:700;cursor:pointer;color:#fff;transition:background .15s;letter-spacing:.3px}
        .rh-lang-btn:hover,.rh-lang-btn.active{background:rgba(255,255,255,.32)}
        .rh-mute{background:rgba(255,255,255,.15);border:none;border-radius:8px;width:32px;height:32px;display:flex;align-items:center;justify-content:center;cursor:pointer;color:#fff;transition:background .15s}
        .rh-mute:hover{background:rgba(255,255,255,.25)}
        .rh-mute.muted{background:rgba(239,68,68,.4)}
        .rh-messages{flex:1;overflow-y:auto;padding:14px 14px 6px;display:flex;flex-direction:column;gap:10px;min-height:200px;max-height:300px;background:#f8fafc;scroll-behavior:smooth}
        .rh-messages::-webkit-scrollbar{width:4px}
        .rh-messages::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:4px}
        .rh-msg{display:flex;align-items:flex-end;gap:6px;animation:msgIn .2s ease}
        @keyframes msgIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        .rh-msg.user{flex-direction:row-reverse}
        .rh-msg-icon{width:26px;height:26px;background:linear-gradient(135deg,#1a56db,#0f3f9e);border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;flex-shrink:0}
        .rh-bubble{max-width:82%;padding:9px 12px;border-radius:14px;font-size:13px;line-height:1.55;position:relative}
        .rh-msg.bot  .rh-bubble{background:#fff;color:#1e293b;border-bottom-left-radius:4px;box-shadow:0 1px 4px rgba(0,0,0,.07)}
        .rh-msg.user .rh-bubble{background:linear-gradient(135deg,#1a56db,#0f3f9e);color:#fff;border-bottom-right-radius:4px}
        .rh-time{display:block;font-size:10px;opacity:.5;margin-top:3px;text-align:right}
        .rh-voice-tag{font-size:12px}
        .rh-typing{display:flex;align-items:center;gap:4px;padding:12px 16px}
        .rh-dot{width:7px;height:7px;background:#94a3b8;border-radius:50%;animation:dotBounce 1.2s infinite}
        .rh-dot:nth-child(2){animation-delay:.2s}.rh-dot:nth-child(3){animation-delay:.4s}
        @keyframes dotBounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-6px)}}
        .rh-typing-lbl{font-size:11px;color:#64748b;margin-left:4px}
        .rh-live-text{margin:0 14px 4px;background:#eff6ff;color:#1a56db;font-size:12px;padding:7px 10px;border-radius:8px;border:1px solid #bfdbfe;font-style:italic}
        .rh-error{margin:0 14px 6px;background:#fef2f2;color:#dc2626;font-size:12px;padding:8px 10px;border-radius:8px;display:flex;align-items:center;gap:6px;border:1px solid #fecaca}
        .rh-chips{padding:4px 14px 8px;display:flex;flex-wrap:wrap;gap:6px;background:#f8fafc}
        .rh-chip{background:#eff6ff;color:#1a56db;border:1px solid #bfdbfe;border-radius:20px;font-size:11.5px;padding:5px 10px;cursor:pointer;transition:background .15s,transform .1s;white-space:nowrap}
        .rh-chip:hover{background:#dbeafe;transform:translateY(-1px)}
        .rh-action-bar{margin:0 12px 8px;border-radius:12px;padding:10px 12px;display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap}
        .rh-action-bar.green{background:#f0fdf4;border:1px solid #bbf7d0}
        .rh-action-bar.blue{background:#eff6ff;border:1px solid #bfdbfe}
        .rh-action-bar.purple{background:#f5f3ff;border:1px solid #ddd6fe}
        .rh-action-info{display:flex;align-items:center;gap:8px;flex:1;min-width:0}
        .rh-action-icon{font-size:18px;flex-shrink:0}
        .rh-action-title{font-size:13px;font-weight:600;color:#1e293b;margin:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .rh-action-sub{font-size:11px;color:#16a34a;margin:2px 0 0}
        .rh-action-btns{display:flex;gap:6px;flex-shrink:0}
        .rh-btn-cancel{background:#fff;border:1px solid #d1d5db;color:#374151;border-radius:8px;font-size:12px;padding:5px 10px;cursor:pointer;transition:background .15s}
        .rh-btn-cancel:hover{background:#f9fafb}
        .rh-btn-confirm{border:none;color:#fff;border-radius:8px;font-size:12px;font-weight:600;padding:5px 12px;cursor:pointer;transition:opacity .15s}
        .rh-btn-confirm.green{background:linear-gradient(135deg,#16a34a,#15803d)}
        .rh-btn-confirm.blue{background:linear-gradient(135deg,#1a56db,#0f3f9e)}
        .rh-btn-confirm:disabled{opacity:.55;cursor:not-allowed}
        .rh-btn-confirm:not(:disabled):hover{opacity:.88}
        .rh-status{padding:6px 14px;display:flex;align-items:center;gap:6px;font-size:11.5px;color:#64748b;background:#fff;border-top:1px solid #f1f5f9}
        .rh-status-dot{width:7px;height:7px;border-radius:50%;flex-shrink:0}
        .rh-status-dot.s-idle{background:#22c55e}
        .rh-status-dot.s-listening{background:#ef4444;animation:pulse .8s infinite}
        .rh-status-dot.s-thinking{background:#3b82f6;animation:pulse .8s infinite}
        .rh-status-dot.s-speaking{background:#8b5cf6;animation:pulse 1s infinite}
        .rh-status-dot.s-error{background:#ef4444}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.25}}
        .rh-stop{margin-left:auto;background:#fef2f2;color:#dc2626;border:1px solid #fecaca;border-radius:6px;font-size:11px;padding:2px 8px;cursor:pointer}
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

// ─── Icons ────────────────────────────────────────────────────────────────────
function MicIcon({ size = 24 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width={size} height={size}>
      <path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="23" />
      <line x1="8"  y1="23" x2="16" y2="23" />
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
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}
function SoundIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
      <path d="M11 5L6 9H2v6h4l5 4V5z" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
    </svg>
  );
}
function MutedIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
      <path d="M11 5L6 9H2v6h4l5 4V5z" />
      <line x1="23" y1="9" x2="17" y2="15" />
      <line x1="17" y1="9" x2="23" y2="15" />
    </svg>
  );
}
function AlertIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8"  x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

/**
 * /api/voice/botpress
 *
 * Primary AI brain for VoiceBot.
 *
 * Strategy:
 *  1. If BOTPRESS_WEBHOOK_URL is set  → forward message to Botpress, parse reply.
 *  2. If BOTPRESS_WEBHOOK_URL is NOT set → fall back to our Groq-based /api/ai/chat.
 *
 * In both cases we also run lightweight local intent detection on the user's
 * message so action cards (CREATE_JOB, FIND_JOBS) work without an extra round-trip.
 *
 * Always returns: { reply: string, action?: { type, data } }
 */

import { NextRequest, NextResponse } from "next/server";

const BOTPRESS_URL = process.env.BOTPRESS_WEBHOOK_URL;
const BACKEND      = process.env.BACKEND_URL ?? "http://localhost:5000";
const GROQ_KEY     = process.env.GROQ_API_KEY;

// ─── Types ────────────────────────────────────────────────────────────────────
interface ActionData {
  type: "CREATE_JOB" | "FIND_JOBS" | "NAVIGATE";
  data: Record<string, unknown>;
}

// ─── Local keyword helpers ────────────────────────────────────────────────────
const CATEGORIES = [
  "electrician", "plumber", "carpenter", "painter", "cleaner",
  "driver", "mason", "welder", "tailor", "gardener", "cook", "security",
];

const CATEGORY_ALIASES: Record<string, string> = {
  electric: "electrician", bijli: "electrician",
  plumb: "plumber", paani: "plumber", pipe: "plumber",
  carpent: "carpenter", wood: "carpenter", lakri: "carpenter",
  paint: "painter", rang: "painter",
  clean: "cleaner", safai: "cleaner",
  driv: "driver", car: "driver", gaari: "driver",
  mason: "mason", raaj: "mason", cement: "mason",
  weld: "welder",
  tailor: "tailor", darzi: "tailor",
  garden: "gardener", mali: "gardener",
  cook: "cook", bawarchi: "cook", khana: "cook",
  secur: "security", guard: "security", chowkidar: "security",
};

const PAKISTAN_CITIES = [
  "karachi", "lahore", "islamabad", "rawalpindi", "peshawar",
  "quetta", "faisalabad", "multan", "hyderabad", "sialkot",
];

function extractCategory(msg: string): string {
  const lower = msg.toLowerCase();
  for (const cat of CATEGORIES) {
    if (lower.includes(cat)) return cat;
  }
  for (const [alias, cat] of Object.entries(CATEGORY_ALIASES)) {
    if (lower.includes(alias)) return cat;
  }
  return "";
}

function extractLocation(msg: string): string {
  const lower = msg.toLowerCase();
  for (const city of PAKISTAN_CITIES) {
    if (lower.includes(city)) return city.charAt(0).toUpperCase() + city.slice(1);
  }
  return "";
}

function extractBudget(msg: string): number {
  const match = msg.match(/(?:rs\.?|pkr|rupees?|روپے)?\s*(\d[\d,]*)\s*(?:\/day|per day|\/din)?/i);
  return match ? parseInt(match[1].replace(/,/g, ""), 10) : 0;
}

/**
 * Detect intent from the user's raw message.
 * Returns an ActionData if a clear intent is found, otherwise null.
 */
function detectLocalIntent(
  message:  string,
  userRole: string,
  lang = "en"
): ActionData | null {
  const lower = message.toLowerCase();
  const ur = lang === "ur";

  // ── EMPLOYER intents ────────────────────────────────────────────────────────
  if (userRole === "employer") {
    // "How to post a job" — guidance navigation
    const isHowTo   = /\b(how|kaise|guide|samjhao|batao|explain|step|process|procedure|walk)\b/i.test(lower);
    const isJobWord = /\b(job|kaam|work|naukri|post|hire|worker|banda|kaam)\b/i.test(lower);
    if (isHowTo && isJobWord) {
      return {
        type: "NAVIGATE",
        data: {
          url:          "/employer/profile",
          label:        ur ? "نوکری پوسٹ کریں" : "Post a Job",
          description:  ur ? "Find Worker صفحے پر جا رہے ہیں…" : "Opening Find Worker page…",
          instructions: ur
            ? "Find Worker tab mein: category chunein (e.g. Plumber), title likhein, location aur budget daalein, phir Post Job dabayein."
            : "On Find Worker: pick a category (e.g. Plumber), write a title, set location & budget, then tap Post Job.",
        },
      };
    }

    // Direct job post with details provided in message
    const isDirectPost =
      /\b(post|create|daalna|add|hire|need|want|chahiye|lagao)\b/i.test(lower) &&
      /\b(job|kaam|work|naukri|plumber|electrician|carpenter|painter|cleaner|driver|mason|welder|tailor|gardener|cook|security|guard)\b/i.test(lower);
    if (isDirectPost) {
      const category = extractCategory(lower);
      const location = extractLocation(lower);
      const budget   = extractBudget(lower);
      return {
        type: "CREATE_JOB",
        data: {
          category:    category || "other",
          title:       category ? `${category.charAt(0).toUpperCase() + category.slice(1)} job` : "Job",
          location:    location || "",
          budget:      budget   || 0,
          urgency:     /urgent|jaldi|abhi|aaj|today/i.test(lower) ? "today" : "flexible",
          description: "",
        },
      };
    }
  }

  // ── WORKER intents ──────────────────────────────────────────────────────────
  if (userRole === "worker") {
    // Password change
    if (/\b(password|pasword|pass)\b/i.test(lower) && /\b(change|badal|update|reset|new|naya)\b/i.test(lower)) {
      return {
        type: "NAVIGATE",
        data: {
          url:          "/worker/profile?tab=profile",
          label:        ur ? "پاس ورڈ تبدیل کریں" : "Change Password",
          description:  ur ? "Profile Settings کھل رہا ہے…" : "Opening Profile Settings…",
          instructions: ur
            ? "Profile tab mein Security section tak scroll karein aur naya password enter karein."
            : "In the Profile tab, scroll to the Security section and enter your new password.",
        },
      };
    }

    // Profile photo / picture
    if (/\b(photo|picture|pic|image|tasveer|selfie|avatar)\b/i.test(lower) &&
        /\b(upload|change|update|add|set|lagao)\b/i.test(lower)) {
      return {
        type: "NAVIGATE",
        data: {
          url:          "/worker/profile?tab=profile",
          label:        ur ? "پروفائل فوٹو اپلوڈ کریں" : "Upload Profile Photo",
          description:  ur ? "Profile Settings کھل رہا ہے…" : "Opening Profile Settings…",
          instructions: ur
            ? "Profile tab mein apni photo par camera icon dabayein aur nai photo select karein."
            : "In the Profile tab, tap the camera icon on your photo, then select a new image.",
        },
      };
    }

    // Driving license upload
    if (/\b(driving|license|licence|gadi|car|drive)\b/i.test(lower) &&
        /\b(upload|add|update|submit|lagao)\b/i.test(lower)) {
      return {
        type: "NAVIGATE",
        data: {
          url:          "/worker/profile?tab=profile",
          label:        ur ? "ڈرائیونگ لائسنس اپلوڈ کریں" : "Upload Driving License",
          description:  ur ? "Profile Settings کھل رہا ہے…" : "Opening Profile Settings…",
          instructions: ur
            ? "Profile tab mein Driver License section mein 'Upload License' dabayein."
            : "In the Profile tab, find the Driver License section and tap Upload License.",
        },
      };
    }

    // Analytics / earnings / dashboard
    if (/\b(analytic|earning|income|paise|kamai|stat|dashboard|report|history|performance)\b/i.test(lower)) {
      return {
        type: "NAVIGATE",
        data: {
          url:          "/worker/profile?tab=analytics",
          label:        ur ? "Analytics Dashboard" : "Analytics Dashboard",
          description:  ur ? "Analytics tab کھل رہا ہے…" : "Opening Analytics…",
          instructions: ur
            ? "Analytics tab mein apni kamai, job history aur performance stats dekhein."
            : "The Analytics tab shows your total earnings, job history, and performance stats.",
        },
      };
    }

    // Browse / find jobs → navigate to Browse tab
    const isFindJob =
      /\b(find|search|dhundh|dhundo|show|dikhao|chahiye|looking|browse|want|kaam)\b/i.test(lower) &&
      /\b(job|kaam|work|naukri)\b/i.test(lower);
    if (isFindJob) {
      const category = extractCategory(lower);
      const location = extractLocation(lower);
      return {
        type: "NAVIGATE",
        data: {
          url:          "/worker/profile?tab=browse",
          label:        ur ? "Jobs تلاش کریں" : "Browse Jobs",
          description:  ur ? "Browse Jobs tab کھل رہا ہے…" : "Opening Browse Jobs…",
          instructions: ur
            ? `Browse Jobs tab mein${category ? ` "${category}"` : " apni skill"} ke liye jobs dekhein aur Apply Now dabayein.${location ? ` ${location} mein search kar sakte hain.` : ""}`
            : `In Browse Jobs${category ? `, search for "${category}"` : ""} and tap Apply Now on any matching job.${location ? ` Filter by ${location} if needed.` : ""}`,
          category, location,
        },
      };
    }
  }

  return null;
}

// ─── Botpress reply extractor ─────────────────────────────────────────────────
function extractBotpressReply(data: unknown): string {
  if (typeof data === "string") return data;

  // Array of message objects (Botpress classic format)
  if (Array.isArray(data)) {
    const texts = data
      .map((m: Record<string, unknown>) => {
        if (typeof m?.text === "string") return m.text;
        if (typeof (m?.payload as Record<string, unknown>)?.text === "string")
          return (m.payload as Record<string, unknown>).text as string;
        return "";
      })
      .filter(Boolean);
    return texts.join(" ") || "";
  }

  // Single object shapes
  const obj = data as Record<string, unknown>;
  if (typeof obj?.text   === "string") return obj.text;
  if (typeof obj?.reply  === "string") return obj.reply;
  if (typeof obj?.message === "string") return obj.message;
  if ((obj?.payload as Record<string, unknown>)?.text)
    return (obj.payload as Record<string, unknown>).text as string;

  // responses array (Botpress v12)
  if (Array.isArray(obj?.responses)) {
    const first = (obj.responses as Record<string, unknown>[])[0];
    if (first?.payload) return (first.payload as Record<string, unknown>).text as string ?? "";
    if (first?.text)    return first.text as string;
  }

  // messages array
  if (Array.isArray(obj?.messages)) {
    const first = (obj.messages as Record<string, unknown>[])[0];
    if (first?.payload) return (first.payload as Record<string, unknown>).text as string ?? "";
    if (first?.text)    return first.text as string;
  }

  return "";
}

// ─── Route handler ────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const {
    message        = "",
    userId         = "guest",
    userRole       = "worker",
    userName       = "User",
    conversationId,
    lang           = "en",
    history        = [],
  } = await req.json().catch(() => ({}));

  // Detect action intent from the raw user message (no API call needed)
  const localAction = detectLocalIntent(message, userRole, lang);

  // ── Path A: Botpress ─────────────────────────────────────────────────────────
  if (BOTPRESS_URL) {
    try {
      const bpRes = await fetch(BOTPRESS_URL, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type:           "text",
          text:           message,
          payload:        { text: message },
          userId:         userId,
          conversationId: conversationId ?? `conv_${userId}`,
          metadata:       { userRole, userName, lang },
        }),
      });

      if (!bpRes.ok) {
        throw new Error(`Botpress responded with HTTP ${bpRes.status}`);
      }

      const bpData  = await bpRes.json().catch(() => null);
      const bpReply = bpData ? extractBotpressReply(bpData) : "";

      const reply = bpReply ||
        (lang === "ur"
          ? "Main samajh nahi paya. Dobara bolein please."
          : "I didn't get a response. Please try again.");

      return NextResponse.json({ reply, ...(localAction ? { action: localAction } : {}) });

    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Botpress error";
      console.error("Botpress error:", msg);
      // Fall through to Groq fallback below
    }
  }

  // ── Path B: backend relay ─────────────────────────────────────────────────────
  try {
    const groqRes = await fetch(`${BACKEND}/api/ai/chat`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, userRole, userId, userName, lang, history }),
      signal: AbortSignal.timeout(8000),
    });

    if (groqRes.ok) {
      const groqData = await groqRes.json().catch(() => ({ reply: "" }));
      const finalAction = groqData.action ?? localAction ?? undefined;
      return NextResponse.json({
        reply:  groqData.reply ?? localFallbackReply(message, userRole, lang),
        ...(finalAction ? { action: finalAction } : {}),
      });
    }
    throw new Error(`Backend returned ${groqRes.status}`);

  } catch {
    // ── Path C: direct Groq call when backend is unreachable ─────────────────
    if (GROQ_KEY) {
      try {
        const isUrdu    = lang === "ur";
        const langNote  = isUrdu
          ? "Respond in simple Romanized Urdu mixed with English."
          : "Respond in clear, simple English for Pakistani blue-collar users.";
        const sysPrompt = userRole === "employer"
          ? `You are RozgarHub AI for EMPLOYER "${userName}". ${langNote} Help with posting jobs, finding workers, OTP payments, and platform questions. Reply in 1-2 sentences. Return JSON: {"reply":"..."}`
          : `You are RozgarHub AI for WORKER "${userName}". ${langNote} Help with finding jobs, applying, OTP payments, and platform questions. Reply in 1-2 sentences. Return JSON: {"reply":"..."}`;

        const gRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method:  "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${GROQ_KEY}` },
          body: JSON.stringify({
            model: "llama-3.1-8b-instant",
            max_tokens: 200,
            response_format: { type: "json_object" },
            messages: [
              { role: "system", content: sysPrompt },
              { role: "user",   content: message },
            ],
          }),
          signal: AbortSignal.timeout(7000),
        });

        if (gRes.ok) {
          const gData = await gRes.json().catch(() => null);
          const raw   = gData?.choices?.[0]?.message?.content?.trim() ?? "";
          const parsed = raw ? JSON.parse(raw.match(/\{[\s\S]*\}/)?.[0] ?? "{}") : {};
          const reply  = parsed.reply || localFallbackReply(message, userRole, lang);
          return NextResponse.json({ reply, ...(localAction ? { action: localAction } : {}) });
        }
      } catch { /* fall through */ }
    }

    const reply = localFallbackReply(message, userRole, lang);
    return NextResponse.json(
      { reply, ...(localAction ? { action: localAction } : {}) },
      { status: 200 }
    );
  }
}

// ─── Local fallback replies when backend/Groq is unavailable ─────────────────
function localFallbackReply(message: string, userRole: string, lang: string): string {
  const lower = message.toLowerCase();
  const ur = lang === "ur";

  if (userRole === "worker") {
    if (/apply|application|kaise|how/i.test(lower))
      return ur
        ? "Job ke liye apply karne ke liye Browse Jobs tab mein jayein, job select karein, aur apna rate deke Apply Now dabayein."
        : "To apply: go to Browse Jobs, select a job, enter your rate and tap Apply Now. The employer will review your application.";
    if (/pay|payment|paise|salary|OTP/i.test(lower))
      return ur
        ? "Kaam mukammal hone ke baad OTP system se payment milti hai — employer OTP enter karta hai aur aapki payment unlock hoti hai."
        : "After completing the job, the employer enters an OTP to unlock your payment. Funds are released instantly.";
    if (/profile|CNIC|verify/i.test(lower))
      return ur
        ? "Apna profile mukammal karein: CNIC documents upload karein, skill add karein, aur availability post karein taa ke zyada jobs milein."
        : "Complete your profile by uploading CNIC, adding your skill, and posting availability — this gets you more job requests.";
    return ur
      ? "RozgarHub par Browse Jobs tab mein jayein aur apni skill ke mutabiq jobs dhundhin. Apply karein aur employer se rabta ho jaye ga."
      : "Browse Jobs tab shows available jobs matching your skill. Apply with your rate and wait for the employer to accept!";
  } else {
    if (/post|job|hire|kaam|naukri|chahiye/i.test(lower))
      return ur
        ? "Find Worker tab mein jayein, job ki details bharein (category, title, location, budget) aur Post Job dabayein — nearby workers ko turant notification milegi."
        : "Go to Find Worker tab, fill in job details (category, title, location, budget) and press Post Job — nearby workers will be notified instantly.";
    if (/track|worker|location|kahan/i.test(lower))
      return ur
        ? "Jab worker confirm ho jaye, Job Tracker khud hi khul jata hai jahan aap worker ki real-time location dekh sakte hain."
        : "Once a worker is confirmed, the Job Tracker opens automatically showing their real-time location and job status.";
    if (/pay|payment|OTP|paise/i.test(lower))
      return ur
        ? "Kaam mukammal hone ke baad worker OTP maangta hai — aap woh OTP enter karein taa ke payment release ho."
        : "When work is done, enter the OTP to release payment to the worker. This protects both parties.";
    return ur
      ? "RozgarHub par Find Worker tab se koi bhi job post karein — electrician, plumber, carpenter — sab kuch! Workers turant apply karein ge."
      : "Use Find Worker to post any job — electrician, plumber, driver, and more. Workers near you will apply within minutes!";
  }
}

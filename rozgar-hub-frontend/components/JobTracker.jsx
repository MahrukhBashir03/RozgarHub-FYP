"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import {
  CheckCircle, Clock, MapPin, Phone, DollarSign,
  Star, AlertCircle, ChevronRight, MessageCircle,
  Send, X, Navigation, Shield, Eye, EyeOff
} from "lucide-react";

const JobMap = dynamic(() => import("@/components/JobMap"), { ssr: false });

/*
  JobTracker — shared between EmployerDashboard & WorkerDashboard
  Props:
    role          : "employer" | "worker"
    job           : { requestId, title, category, workLocation, lat, lng }
    worker        : { workerId, workerName, workerPhone, workerRating, price }
    employer      : { employerId, employerName, employerPhone }
    agreedPrice   : number
    socket        : socket.io socket instance
    onJobComplete : () => void
    lang          : "en" | "ur"
    t             : translations object
*/

const STEPS_EN = [
  { key: "confirmed",       label: "Job Confirmed",      icon: "✅", desc: "Worker is on the way" },
  { key: "worker_arrived",  label: "Worker Arrived",     icon: "📍", desc: "Worker reached the job site" },
  { key: "in_progress",     label: "Work In Progress",   icon: "🔧", desc: "Job is underway" },
  { key: "pending_payment", label: "Work Completed",     icon: "🎉", desc: "Awaiting payment from employer" },
  { key: "payment_sent",    label: "Payment Sent",       icon: "💸", desc: "Employer sent payment" },
  { key: "completed",       label: "Job Completed",      icon: "⭐", desc: "All done!" },
];

const STEPS_UR = [
  { key: "confirmed",       label: "نوکری کی تصدیق",     icon: "✅", desc: "کارکن راستے میں ہے" },
  { key: "worker_arrived",  label: "کارکن پہنچ گیا",     icon: "📍", desc: "کارکن کام کی جگہ پہنچ گیا" },
  { key: "in_progress",     label: "کام جاری ہے",        icon: "🔧", desc: "کام ہو رہا ہے" },
  { key: "pending_payment", label: "کام مکمل",           icon: "🎉", desc: "ادائیگی کا انتظار ہے" },
  { key: "payment_sent",    label: "ادائیگی بھیج دی",    icon: "💸", desc: "آجر نے ادائیگی بھیج دی" },
  { key: "completed",       label: "نوکری مکمل",         icon: "⭐", desc: "سب کام ہو گیا!" },
];

const STEP_ORDER = ["confirmed","worker_arrived","in_progress","pending_payment","payment_sent","completed"];

// ── Generate 6-digit OTP ──────────────────────────────────────
function generateOTP() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export default function JobTracker({ role, job, worker, employer, agreedPrice, socket, onJobComplete, lang = "en", t = {} }) {
  const STEPS = lang === "ur" ? STEPS_UR : STEPS_EN;

  // 🔴 DEBUG: Log props on mount
  useEffect(() => {
    console.log("🎬 JobTracker Component Mounted:");
    console.log("   Role:", role);
    console.log("   Worker:", worker);
    console.log("   Employer:", employer);
    console.log("   Job:", job);
    console.log("   Socket connected:", socket?.connected);
  }, []);

  const [currentStep, setCurrentStep]     = useState("confirmed");
  const [otp, setOtp]                     = useState("");
  const [enteredOtp, setEnteredOtp]       = useState("");
  const [rating, setRating]               = useState(0);
  const [hoverRating, setHoverRating]     = useState(0);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);
  const [elapsed, setElapsed]             = useState(0);
  const timerRef                          = useRef(null);
  const startTimeRef                      = useRef(Date.now());

  // ── Real-time tracking ──
  const [workerLiveLocation, setWorkerLiveLocation] = useState(null);
  const [workerAddress, setWorkerAddress]           = useState("");
  const [distanceEta, setDistanceEta]               = useState(null);

  // ── Chat ──
  const [showChat, setShowChat]     = useState(false);
  const [messages, setMessages]     = useState([]);
  const [msgInput, setMsgInput]     = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const [chatLang, setChatLang]     = useState("en"); // Chat language separate from UI
  const chatEndRef                  = useRef(null);

  // ── OTP Payment ──
  const [paymentOtp, setPaymentOtp]       = useState(null); // employer holds this
  const [otpInput, setOtpInput]           = useState("");
  const [otpError, setOtpError]           = useState("");
  const [otpVisible, setOtpVisible]       = useState(false);
  const [showOtpModal, setShowOtpModal]   = useState(false);
  const [otpSent, setOtpSent]             = useState(false);

  // ── Elapsed timer ──
  useEffect(() => {
    if (currentStep === "in_progress") {
      startTimeRef.current = Date.now();
      timerRef.current = setInterval(() => setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000)), 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [currentStep]);

  // ── Socket listeners ──
  useEffect(() => {
    if (!socket) {
      console.error("⚠️ Socket not connected in JobTracker!");
      return;
    }
    console.log("🔌 JobTracker socket initialized | Role:", role, "Connected:", socket.connected);

    socket.on("worker_arrived",          () => setCurrentStep("worker_arrived"));
    socket.on("job_started",             () => setCurrentStep("in_progress"));
    socket.on("job_completed_by_worker", () => setCurrentStep("pending_payment"));
    socket.on("payment_otp_sent",        (data) => {
      // Worker receives OTP notification (employer sent it via socket)
      if (role === "worker") {
        setShowOtpModal(true);
        setOtpSent(true);
      }
    });
    socket.on("payment_confirmed",       () => { setCurrentStep("completed"); setShowOtpModal(false); });
    socket.on("job_cancelled",           () => onJobComplete && onJobComplete());

    // ── Chat ──
    socket.on("job_chat_message", (msg) => {
      setMessages(prev => [...prev, msg]);
      if (!showChat) setUnreadCount(c => c + 1);
    });

    // ── Real-time worker location (employer side) ──
    if (role === "employer") {
      socket.on("worker_location_update", async (data) => {
        console.log("📥 EMPLOYER RECEIVED worker_location_update:", data);
        if (data.workerId === worker?.workerId) {
          console.log("✅ Location matches expected worker, updating state");
          setWorkerLiveLocation({ lat: data.lat, lng: data.lng });
          if (job?.lat && job?.lng) {
            const dist = calcDistance(data.lat, data.lng, job.lat, job.lng);
            console.log(`📏 Distance calculated: ${dist.toFixed(2)}km, ETA: ${calcEta(dist)}`);
            setDistanceEta({ distance: dist.toFixed(1), eta: calcEta(dist) });
          }
          // Reverse geocode for street name
          try {
            const res  = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${data.lat}&lon=${data.lng}&zoom=18`);
            const json = await res.json();
            const a    = json.address || {};
            const road = a.road || a.pedestrian || a.path || "";
            const area = a.suburb || a.neighbourhood || a.city || "";
            const addr = road ? `${road}${area ? ", " + area : ""}` : json.display_name?.split(",")[0] || "";
            console.log("🏘️ Address resolved:", addr);
            setWorkerAddress(addr);
          } catch (err) {
            console.warn("⚠️ Could not reverse geocode address:", err.message);
          }
        } else {
          console.log("❌ Worker ID mismatch. Expected:", worker?.workerId, "Received:", data.workerId);
        }
      });
    }

    return () => {
      socket.off("worker_arrived");
      socket.off("job_started");
      socket.off("job_completed_by_worker");
      socket.off("payment_otp_sent");
      socket.off("payment_confirmed");
      socket.off("job_cancelled");
      socket.off("job_chat_message");
      socket.off("worker_location_update");
    };
  }, [socket, showChat, role, worker, job]);

  // ── Scroll chat to bottom ──
  useEffect(() => {
    if (showChat) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
      setUnreadCount(0);
    }
  }, [messages, showChat]);

  // ── Worker: broadcast GPS every 3s ──
  useEffect(() => {
    if (role !== "worker" || !socket || currentStep === "completed") return;
    if (!navigator.geolocation) return;
    
    // 🔴 DEBUG: Check if required data is present
    if (!worker?.workerId || !employer?.employerId) {
      console.warn("⚠️ GPS broadcast waiting for data | worker:", worker, "| employer:", employer);
      return;
    }

    console.log("🚀 GPS broadcast started | role:", role, "socket connected:", socket.connected, "step:", currentStep);

    // Use watchPosition for CONTINUOUS and RELIABLE location updates
    // This is much better than getCurrentPosition for tracking
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const payload = {
          workerId:   worker?.workerId,
          employerId: employer?.employerId,
          lat:        pos.coords.latitude,
          lng:        pos.coords.longitude,
          accuracy:   pos.coords.accuracy,
        };
        
        console.log("📍 GPS location obtained:", payload.lat.toFixed(4), payload.lng.toFixed(4));
        socket.emit("worker_location_update", payload);
      },
      (err) => {
        // Silently handle errors - don't spam console
        if (err.code === 1) {
          console.warn("⚠️ Location permission denied. Please enable in browser settings.");
        } else if (err.code === 2) {
          console.warn("⚠️ Location service unavailable - trying again...");
        }
        // Ignore timeout errors (code 3) - watchPosition will keep retrying
      },
      { 
        enableHighAccuracy: false,     // ← CRITICAL: Disable for speed
        maximumAge: 30000,             // Use cached location up to 30 seconds old
        timeout: 10000                 // Quick timeout per attempt, but watchPosition keeps retrying
      }
    );

    // Cleanup: stop watching position
    return () => {
      console.log("🛑 GPS broadcast stopped");
      navigator.geolocation.clearWatch(watchId);
    };
  }, [role, socket, currentStep, worker, employer]);

  // ── Helpers ──
  const calcDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371, dLat = (lat2-lat1)*Math.PI/180, dLng = (lng2-lng1)*Math.PI/180;
    const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  };
  const calcEta = (km) => {
    const min = Math.round(km / 30 * 60);
    if (min < 1) return lang === "ur" ? "ابھی پہنچ رہا ہے" : "Arriving now";
    if (min < 60) return lang === "ur" ? `~${min} منٹ` : `~${min} min`;
    return `~${Math.floor(min/60)}h ${min%60}m`;
  };
  const fmtTime = (s) => `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;

  // ── Actions ──
  const handleWorkerArrived = () => {
    socket.emit("worker_arrived", { requestId: job.requestId, employerId: employer?.employerId });
    setCurrentStep("worker_arrived");
  };
  const handleStartJob = () => {
    socket.emit("job_started", { requestId: job.requestId, employerId: employer?.employerId, workerId: worker?.workerId });
    setCurrentStep("in_progress");
  };
  const handleWorkerDone = () => {
    socket.emit("job_completed_by_worker", { requestId: job.requestId, employerId: employer?.employerId });
    setCurrentStep("pending_payment");
  };

  // Employer generates OTP and sends to worker via socket
  const handleInitiatePayment = () => {
    const otp = generateOTP();
    setPaymentOtp(otp);
    setCurrentStep("payment_sent");
    socket.emit("payment_otp_sent", {
      requestId:  job.requestId,
      workerId:   worker?.workerId,
      employerId: employer?.employerId,
      otp,                          // NOTE: in production, send OTP server-side only
      amount:     agreedPrice,
    });
    // Also send via SMS in production. For now, display it to employer.
  };

  // Worker enters OTP → employer confirms payment
  const handleVerifyOtp = () => {
    if (otpInput.length !== 6) { setOtpError(lang === "ur" ? "6 ہندسے درج کریں" : "Enter 6-digit OTP"); return; }
    socket.emit("verify_payment_otp", {
      requestId: job.requestId,
      employerId: employer?.employerId,
      otp: otpInput,
    });
    // For demo: verify locally (in production, verify server-side)
    // We'll listen to payment_confirmed socket event
    setOtpError("");
    // Optimistic: server will emit payment_confirmed if correct
  };

  // ── Chat ──
  const sendMessage = () => {
    if (!msgInput.trim()) return;
    const msg = {
      from:      role,
      fromName:  role === "employer" ? employer?.employerName : worker?.workerName,
      text:      msgInput.trim(),
      time:      new Date().toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" }),
      requestId: job.requestId,
    };
    socket.emit("job_chat_message", {
      ...msg,
      toId: role === "employer" ? worker?.workerId : employer?.employerId,
    });
    setMessages(prev => [...prev, msg]);
    setMsgInput("");
  };

  const handleRatingSubmit = () => {
    setRatingSubmitted(true);
    socket.emit("job_rating", { requestId: job.requestId, rating, role });
    setTimeout(() => onJobComplete && onJobComplete(), 1800);
  };

  const stepIndex   = STEP_ORDER.indexOf(currentStep);
  const isCompleted = currentStep === "completed";
  const otherName   = role === "employer" ? worker?.workerName  : employer?.employerName;
  const otherPhone  = role === "employer" ? worker?.workerPhone : employer?.employerPhone;
  const otherPartyId = role === "employer" ? worker?.workerId : employer?.employerId;

  return (
    <div style={{ maxWidth:580, margin:"0 auto", fontFamily:lang==="ur"?"'Noto Nastaliq Urdu',serif":"'Outfit',sans-serif", position:"relative" }}>
      <style>{`
        @keyframes pulse2{0%,100%{transform:scale(1)}50%{transform:scale(1.08)}}
        @keyframes slideUp2{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin2{to{transform:rotate(360deg)}}
        @keyframes pop{0%{transform:scale(0.7);opacity:0}60%{transform:scale(1.15)}100%{transform:scale(1);opacity:1}}
        @keyframes fadeIn2{from{opacity:0}to{opacity:1}}
        @keyframes gpsBlip{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.8);opacity:0}}
        .tracker-btn{transition:all .18s;cursor:pointer}
        .tracker-btn:hover{opacity:.88;transform:translateY(-1px)}
        .star-btn{cursor:pointer;transition:transform .12s}
        .star-btn:hover{transform:scale(1.25)}
        .chat-msg-in{animation:slideUp2 .2s ease-out}
      `}</style>

      {/* ═══ HEADER ═══ */}
      <div style={{ background:"linear-gradient(135deg,#0b1526 0%,#1a3255 100%)", borderRadius:22, padding:"24px 24px 20px", marginBottom:14, boxShadow:"0 8px 32px rgba(11,21,38,.28)", animation:"slideUp2 .4s ease-out" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ width:10, height:10, borderRadius:"50%", background:isCompleted?"#60a5fa":"#22c55e", animation:isCompleted?"none":"pulse2 2s infinite" }} />
            <span style={{ fontSize:11, fontWeight:800, color:isCompleted?"#60a5fa":"#22c55e", textTransform:"uppercase", letterSpacing:".1em" }}>
              {isCompleted ? (lang==="ur"?"مکمل":"Completed") : (lang==="ur"?"لائیو ٹریکنگ":"Live Tracking")}
            </span>
          </div>
          {/* Chat button */}
          <button onClick={() => { setShowChat(true); setUnreadCount(0); }}
            style={{ display:"flex", alignItems:"center", gap:6, padding:"7px 14px", borderRadius:20, border:"1.5px solid rgba(255,255,255,.15)", background:"rgba(255,255,255,.08)", color:"#fff", fontSize:12, fontWeight:700, cursor:"pointer", position:"relative" }}>
            <MessageCircle size={14} />
            {lang==="ur"?"چیٹ":"Chat"}
            {unreadCount > 0 && (
              <span style={{ position:"absolute", top:-6, right:-6, width:16, height:16, background:"#ef4444", borderRadius:"50%", fontSize:9, color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:900 }}>{unreadCount}</span>
            )}
          </button>
        </div>

        <h2 style={{ color:"#fff", fontSize:20, fontWeight:900, margin:"0 0 6px" }}>{job?.title || "Job in Progress"}</h2>
        <div style={{ display:"flex", alignItems:"center", gap:6, color:"rgba(255,255,255,.45)", fontSize:12.5 }}>
          <MapPin size={13} /><span>{job?.workLocation || "—"}</span>
        </div>

        <div style={{ display:"flex", gap:10, marginTop:18 }}>
          <div style={{ flex:1, background:"rgba(255,255,255,.07)", borderRadius:14, padding:"12px 16px" }}>
            <div style={{ fontSize:10, color:"rgba(255,255,255,.4)", fontWeight:700, textTransform:"uppercase", letterSpacing:".07em", marginBottom:3 }}>
              {lang==="ur"?"طے شدہ قیمت":"Agreed Price"}
            </div>
            <div style={{ fontSize:22, fontWeight:900, color:"#fff" }}>Rs. {agreedPrice || "—"}</div>
          </div>
          {currentStep === "in_progress" && (
            <div style={{ background:"rgba(255,255,255,.07)", borderRadius:14, padding:"12px 16px", minWidth:100 }}>
              <div style={{ fontSize:10, color:"rgba(255,255,255,.35)", marginBottom:3 }}>{lang==="ur"?"وقت گزرا":"Elapsed"}</div>
              <div style={{ fontSize:22, fontWeight:800, color:"#60a5fa", fontVariantNumeric:"tabular-nums" }}>{fmtTime(elapsed)}</div>
            </div>
          )}
          {/* Live ETA badge for employer */}
          {role === "employer" && distanceEta && currentStep !== "completed" && (
            <div style={{ background:"rgba(34,197,94,.15)", border:"1.5px solid rgba(34,197,94,.3)", borderRadius:14, padding:"12px 16px", minWidth:100 }}>
              <div style={{ fontSize:10, color:"#22c55e", fontWeight:700, textTransform:"uppercase", marginBottom:3 }}>
                {lang==="ur"?"وقت":"ETA"}
              </div>
              <div style={{ fontSize:16, fontWeight:800, color:"#22c55e" }}>{distanceEta.eta}</div>
              <div style={{ fontSize:10, color:"rgba(34,197,94,.6)", marginTop:2 }}>{distanceEta.distance} km</div>
            </div>
          )}
        </div>
      </div>

      {/* ═══ OTHER PARTY CARD ═══ */}
      <div style={{ background:"#fff", borderRadius:18, padding:"16px 20px", marginBottom:14, boxShadow:"0 2px 14px rgba(0,0,0,.06)", animation:"slideUp2 .45s ease-out" }}>
        <div style={{ display:"flex", alignItems:"center", gap:14 }}>
          <div style={{ width:50, height:50, borderRadius:"50%", background:role==="employer"?"linear-gradient(135deg,#3b82f6,#6d28d9)":"linear-gradient(135deg,#f59e0b,#ef4444)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, fontWeight:900, color:"#fff", flexShrink:0 }}>
            {otherName?.charAt(0)?.toUpperCase() || "?"}
          </div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:15, fontWeight:800, color:"#0f172a" }}>{otherName || "—"}</div>
            <div style={{ fontSize:12, color:"#64748b", marginTop:2 }}>
              {role==="employer" ? `⭐ ${worker?.workerRating||"4.8"} · ${job?.category||"Worker"}` : (lang==="ur"?"آجر":"Employer")}
            </div>
          </div>
          <div style={{ display:"flex", gap:8 }}>
            {otherPhone && (
              <a href={`tel:${otherPhone}`}
                style={{ display:"flex", alignItems:"center", gap:5, padding:"9px 14px", background:"#f0fdf4", borderRadius:12, textDecoration:"none", color:"#16a34a", fontWeight:700, fontSize:13 }}>
                <Phone size={14} />
                {lang==="ur"?"کال":"Call"}
              </a>
            )}
            <button onClick={() => { setShowChat(true); setUnreadCount(0); }}
              style={{ display:"flex", alignItems:"center", gap:5, padding:"9px 14px", background:"#eff6ff", borderRadius:12, border:"none", color:"#3b82f6", fontWeight:700, fontSize:13, cursor:"pointer" }}>
              <MessageCircle size={14} />
              {lang==="ur"?"چیٹ":"Chat"}
            </button>
          </div>
        </div>

        {/* Live worker street address for employer */}
        {role === "employer" && workerAddress && currentStep !== "completed" && (
          <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:12, padding:"8px 12px", background:"#f0fdf4", borderRadius:10, border:"1px solid #bbf7d0" }}>
            <div style={{ width:8, height:8, borderRadius:"50%", background:"#22c55e", animation:"gpsBlip 2s infinite", flexShrink:0 }} />
            <div>
              <div style={{ fontSize:10, color:"#16a34a", fontWeight:800, textTransform:"uppercase", letterSpacing:".05em" }}>
                {lang==="ur"?"کارکن ابھی یہاں ہے":"Worker is currently at"}
              </div>
              <div style={{ fontSize:12.5, fontWeight:600, color:"#0f172a", marginTop:1 }}>{workerAddress}</div>
            </div>
          </div>
        )}
      </div>

      {/* ═══ LIVE MAP ═══ */}
      {job?.lat && job?.lng && (
        <div style={{ background:"#fff", borderRadius:18, padding:"20px", marginBottom:14, boxShadow:"0 2px 14px rgba(0,0,0,.06)", animation:"slideUp2 .5s ease-out" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
            <div style={{ fontSize:14, fontWeight:800, color:"#0f172a", display:"flex", alignItems:"center", gap:8 }}>
              <Navigation size={16} color="#3b82f6" />
              {lang==="ur"?"لائیو ٹریکنگ":"Live Tracking"}
            </div>
            {role === "employer" && workerLiveLocation && (
              <span style={{ display:"flex", alignItems:"center", gap:5, background:"#f0fdf4", border:"1px solid #bbf7d0", borderRadius:20, padding:"4px 10px", fontSize:11, fontWeight:800, color:"#16a34a" }}>
                <span style={{ width:6, height:6, borderRadius:"50%", background:"#22c55e", display:"inline-block", animation:"gpsBlip 1.5s infinite" }} />
                LIVE
              </span>
            )}
          </div>
          <JobMap
            lat={job.lat} lng={job.lng} height={260}
            label={lang==="ur"?"کام کی جگہ":"Job Location"}
            showWorkerLocation={role === "worker"}
            workerId={role === "worker" ? (worker?.workerId || null) : null}
            employerId={employer?.employerId || null}
            showLiveWorkerLocation={role === "employer"}
            liveWorkerId={role === "employer" ? worker?.workerId : null}
          />
          {role === "worker" && (
            <p style={{ fontSize:11.5, color:"#16a34a", fontWeight:700, textAlign:"center", marginTop:8, display:"flex", alignItems:"center", justifyContent:"center", gap:5 }}>
              <span style={{ width:7, height:7, borderRadius:"50%", background:"#22c55e", display:"inline-block", animation:"gpsBlip 2s infinite" }} />
              {lang==="ur"?"آپ کی لائیو لوکیشن آجر کو دکھائی جا رہی ہے":"Your live location is visible to the employer"}
            </p>
          )}
        </div>
      )}

      {/* ═══ PROGRESS STEPS ═══ */}
      <div style={{ background:"#fff", borderRadius:18, padding:"20px", marginBottom:14, boxShadow:"0 2px 14px rgba(0,0,0,.06)", animation:"slideUp2 .52s ease-out" }}>
        <div style={{ fontSize:11, fontWeight:800, color:"#94a3b8", textTransform:"uppercase", letterSpacing:".08em", marginBottom:16 }}>
          {lang==="ur"?"پروگریس":"Progress"}
        </div>
        {STEPS.map((step, idx) => {
          const done   = idx < stepIndex;
          const active = STEP_ORDER[idx] === currentStep;
          return (
            <div key={step.key} style={{ display:"flex", gap:14 }}>
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center", width:28, flexShrink:0 }}>
                <div style={{ width:28, height:28, borderRadius:"50%", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", background:done?"#22c55e":active?"linear-gradient(135deg,#3b82f6,#6d28d9)":"#f1f5f9", border:active?"3px solid #bfdbfe":"none", fontSize:14, transition:"all .3s", animation:active?"pop .35s ease-out":"none", boxShadow:active?"0 0 0 4px rgba(59,130,246,.12)":"none" }}>
                  {done ? "✓" : active ? <div style={{ width:9, height:9, borderRadius:"50%", background:"#fff" }} /> : <div style={{ width:8, height:8, borderRadius:"50%", background:"#cbd5e1" }} />}
                </div>
                {idx < STEPS.length-1 && <div style={{ width:2, height:32, background:done?"#22c55e":"#e2e8f0", marginTop:3, transition:"background .5s", borderRadius:2 }} />}
              </div>
              <div style={{ paddingBottom:idx < STEPS.length-1?18:0, paddingTop:2 }}>
                <div style={{ fontSize:13.5, fontWeight:active?800:done?600:500, color:done?"#16a34a":active?"#1d4ed8":"#94a3b8", transition:"all .3s" }}>
                  {step.icon} {step.label}
                </div>
                {active && <div style={{ fontSize:11.5, color:"#64748b", marginTop:2, animation:"slideUp2 .3s" }}>{step.desc}</div>}
              </div>
            </div>
          );
        })}
      </div>

      {/* ═══ ACTION CARD ═══ */}
      {!isCompleted && (
        <div style={{ background:"#fff", borderRadius:18, padding:"20px", marginBottom:14, boxShadow:"0 2px 14px rgba(0,0,0,.06)", animation:"slideUp2 .55s ease-out" }}>
          <ActionPanel
            role={role} currentStep={currentStep} lang={lang}
            onWorkerArrived={handleWorkerArrived}
            onStartJob={handleStartJob}
            onWorkerDone={handleWorkerDone}
            onInitiatePayment={handleInitiatePayment}
            paymentOtp={paymentOtp}
            agreedPrice={agreedPrice}
          />
        </div>
      )}

      {/* ═══ WORKER: OTP Entry Modal ═══ */}
      {role === "worker" && showOtpModal && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.65)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:500, padding:24, backdropFilter:"blur(6px)" }}>
          <div style={{ background:"#fff", borderRadius:24, padding:"32px 28px", maxWidth:380, width:"100%", textAlign:"center", animation:"pop .35s ease-out" }}>
            <div style={{ width:72, height:72, borderRadius:"50%", background:"linear-gradient(135deg,#f59e0b,#d97706)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 18px", fontSize:30 }}>
              💸
            </div>
            <h3 style={{ fontSize:20, fontWeight:900, color:"#0f172a", marginBottom:6 }}>
              {lang==="ur"?"ادائیگی کی تصدیق":"Confirm Payment"}
            </h3>
            <p style={{ fontSize:13, color:"#64748b", marginBottom:6 }}>
              {lang==="ur"
                ? `آجر نے Rs. ${agreedPrice} کا OTP بھیجا ہے۔ OTP درج کریں:`
                : `Employer sent Rs. ${agreedPrice}. Enter the OTP they show you:`}
            </p>
            <div style={{ background:"#fef3c7", borderRadius:12, padding:"10px 16px", marginBottom:20, border:"1.5px solid #fcd34d", fontSize:12.5, color:"#92400e", fontWeight:600 }}>
              🔒 {lang==="ur"
                ? "OTP صرف آجر کے پاس ہے۔ رقم ملنے کے بعد ہی درج کریں۔"
                : "OTP is only with the employer. Enter it only after receiving cash."}
            </div>

            <div style={{ position:"relative", marginBottom:14 }}>
              <input
                type={otpVisible ? "text" : "password"}
                value={otpInput}
                onChange={e => { setOtpInput(e.target.value.replace(/\D/g,"").slice(0,6)); setOtpError(""); }}
                placeholder="• • • • • •"
                maxLength={6}
                style={{ width:"100%", padding:"16px 48px 16px 16px", borderRadius:14, border:`2px solid ${otpError?"#ef4444":"#e2e8f0"}`, fontSize:24, fontWeight:800, textAlign:"center", letterSpacing:8, outline:"none", boxSizing:"border-box", fontFamily:"monospace" }}
              />
              <button onClick={() => setOtpVisible(v => !v)}
                style={{ position:"absolute", right:14, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:"#64748b" }}>
                {otpVisible ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {otpError && <p style={{ fontSize:12, color:"#ef4444", marginBottom:10, fontWeight:600 }}>{otpError}</p>}

            <button onClick={handleVerifyOtp} disabled={otpInput.length !== 6}
              style={{ width:"100%", padding:"14px", borderRadius:14, border:"none", background:otpInput.length===6?"linear-gradient(135deg,#22c55e,#16a34a)":"#e2e8f0", color:otpInput.length===6?"#fff":"#94a3b8", fontSize:15, fontWeight:800, cursor:otpInput.length===6?"pointer":"not-allowed", marginBottom:10, transition:"all .2s" }}>
              {lang==="ur"?"تصدیق کریں":"Verify & Confirm"}
            </button>
            <button onClick={() => setShowOtpModal(false)}
              style={{ width:"100%", padding:"11px", borderRadius:12, border:"1.5px solid #e2e8f0", background:"#f8fafc", color:"#64748b", fontSize:13, fontWeight:600, cursor:"pointer" }}>
              {lang==="ur"?"ابھی نہیں":"Not yet"}
            </button>
          </div>
        </div>
      )}

      {/* ═══ RATING ═══ */}
      {isCompleted && (
        <div style={{ background:"#fff", borderRadius:18, padding:"28px 24px", boxShadow:"0 2px 14px rgba(0,0,0,.06)", textAlign:"center", animation:"pop .45s ease-out" }}>
          {ratingSubmitted ? (
            <div>
              <div style={{ fontSize:52, marginBottom:10 }}>🎉</div>
              <h3 style={{ fontSize:19, fontWeight:900, color:"#0f172a", marginBottom:6 }}>{lang==="ur"?"شکریہ!":"Thank You!"}</h3>
              <p style={{ color:"#64748b", fontSize:13.5 }}>{lang==="ur"?"آپ کی رائے محفوظ ہو گئی۔":"Your rating has been saved."}</p>
            </div>
          ) : (
            <div>
              <div style={{ fontSize:44, marginBottom:12 }}>⭐</div>
              <h3 style={{ fontSize:18, fontWeight:800, color:"#0f172a", marginBottom:6 }}>{lang==="ur"?"تجربہ کیسا رہا؟":"How was your experience?"}</h3>
              <p style={{ color:"#64748b", fontSize:13, marginBottom:20 }}>
                {role==="employer" ? (lang==="ur"?`${worker?.workerName} کو ریٹ کریں`:`Rate ${worker?.workerName||"the worker"}`) : (lang==="ur"?"اس نوکری کو ریٹ کریں":"Rate this job")}
              </p>
              <div style={{ display:"flex", justifyContent:"center", gap:10, marginBottom:22 }}>
                {[1,2,3,4,5].map(n => (
                  <button key={n} className="star-btn"
                    onMouseEnter={() => setHoverRating(n)} onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(n)}
                    style={{ background:"none", border:"none", fontSize:34, color:(hoverRating||rating)>=n?"#f59e0b":"#e2e8f0", transition:"color .15s" }}>★</button>
                ))}
              </div>
              <button className="tracker-btn" onClick={handleRatingSubmit} disabled={rating===0}
                style={{ padding:"13px 32px", borderRadius:13, border:"none", background:rating===0?"#e2e8f0":"linear-gradient(135deg,#3b82f6,#2563eb)", color:rating===0?"#94a3b8":"#fff", fontSize:14, fontWeight:700, width:"100%" }}>
                {lang==="ur"?"ریٹنگ جمع کریں":"Submit Rating"}
              </button>
            </div>
          )}
        </div>
      )}

      {/* ═══ CHAT PANEL ═══ */}
      {showChat && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.5)", display:"flex", alignItems:"flex-end", justifyContent:"flex-end", zIndex:1500, padding:20, backdropFilter:"blur(4px)" }}>
          <div style={{ background:"#fff", borderRadius:24, width:"100%", maxWidth:420, height:"80vh", display:"flex", flexDirection:"column", boxShadow:"0 24px 60px rgba(0,0,0,.3)", animation:"slideUp2 .3s ease-out" }}>
            {/* Chat header */}
            <div style={{ background:"linear-gradient(135deg,#0f172a,#1e3a5f)", padding:"18px 20px", borderRadius:"24px 24px 0 0", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                <div style={{ width:38, height:38, borderRadius:"50%", background:"linear-gradient(135deg,#3b82f6,#6d28d9)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, fontWeight:800, color:"#fff" }}>
                  {otherName?.charAt(0)?.toUpperCase()||"?"}
                </div>
                <div>
                  <div style={{ fontSize:14, fontWeight:800, color:"#fff" }}>{otherName||"—"}</div>
                  <div style={{ fontSize:11, color:"rgba(255,255,255,.4)" }}>
                    {chatLang==="ur"?"آن لائن":"Online"}
                  </div>
                </div>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <button 
                  onClick={() => setChatLang(chatLang === "en" ? "ur" : "en")}
                  style={{ background:"rgba(255,255,255,.15)", border:"1px solid rgba(255,255,255,.3)", borderRadius:8, padding:"6px 12px", cursor:"pointer", color:"#fff", fontSize:11, fontWeight:700, transition:"all 0.2s" }}>
                  {chatLang === "en" ? "العربية" : "English"}
                </button>
                <button onClick={() => setShowChat(false)} style={{ background:"rgba(255,255,255,.1)", border:"none", borderRadius:10, padding:8, cursor:"pointer" }}>
                  <X size={16} color="#fff" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div style={{ flex:1, overflowY:"auto", padding:"16px 16px 8px", display:"flex", flexDirection:"column", gap:10 }}>
              {messages.length === 0 && (
                <div style={{ textAlign:"center", color:"#94a3b8", fontSize:13, marginTop:40 }}>
                  {chatLang==="ur"?"کوئی پیغام نہیں۔ بات شروع کریں!":"No messages yet. Say hello!"}
                </div>
              )}
              {messages.map((msg, i) => {
                const isMine = msg.from === role;
                return (
                  <div key={i} className="chat-msg-in"
                    style={{ display:"flex", flexDirection:"column", alignItems:isMine?"flex-end":"flex-start" }}>
                    <div style={{ maxWidth:"75%", padding:"10px 14px", borderRadius:isMine?"18px 18px 4px 18px":"18px 18px 18px 4px", background:isMine?"linear-gradient(135deg,#3b82f6,#2563eb)":"#f1f5f9", color:isMine?"#fff":"#0f172a", fontSize:13.5, fontWeight:500, lineHeight:1.45 }}>
                      {msg.text}
                    </div>
                    <div style={{ fontSize:10, color:"#94a3b8", marginTop:3, paddingInline:4 }}>{msg.time}</div>
                  </div>
                );
              })}
              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <div style={{ padding:"12px 16px", borderTop:"1px solid #e2e8f0", display:"flex", gap:10, alignItems:"center" }}>
              <input
                value={msgInput}
                onChange={e => setMsgInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && sendMessage()}
                placeholder={chatLang==="ur"?"پیغام لکھیں...":"Type a message..."}
                style={{ flex:1, padding:"11px 14px", borderRadius:22, border:"1.5px solid #e2e8f0", fontSize:14, outline:"none", background:"#f8fafc", fontFamily:"inherit" }}
              />
              <button onClick={sendMessage}
                style={{ width:42, height:42, borderRadius:"50%", border:"none", background:"linear-gradient(135deg,#3b82f6,#2563eb)", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", flexShrink:0 }}>
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Action Panel ────────────────────────────────────────────── */
function ActionPanel({ role, currentStep, lang, onWorkerArrived, onStartJob, onWorkerDone, onInitiatePayment, paymentOtp, agreedPrice }) {
  const [showOtpDisplay, setShowOtpDisplay] = useState(false);
  const isUrdu = lang === "ur";

  if (role === "worker") {
    if (currentStep === "confirmed") return (
      <ActionBtn color="linear-gradient(135deg,#3b82f6,#2563eb)" onClick={onWorkerArrived} icon="📍"
        label={isUrdu?"میں پہنچ گیا":"I Have Arrived"} sub={isUrdu?"آجر کو مطلع کریں":"Notify the employer you're at the site"} />
    );
    if (currentStep === "worker_arrived") return (
      <ActionBtn color="linear-gradient(135deg,#f59e0b,#d97706)" onClick={onStartJob} icon="🔧"
        label={isUrdu?"کام شروع کریں":"Start Work"} sub={isUrdu?"ٹائمر شروع ہو جائے گا":"Timer starts when you tap"} />
    );
    if (currentStep === "in_progress") return (
      <ActionBtn color="linear-gradient(135deg,#22c55e,#16a34a)" onClick={onWorkerDone} icon="✅"
        label={isUrdu?"کام مکمل کر دیا":"Mark Work as Done"} sub={isUrdu?"آجر سے ادائیگی کا انتظار ہوگا":"Employer will be asked to pay"} />
    );
    if (currentStep === "pending_payment") return (
      <WaitingBadge icon="💸" label={isUrdu?"ادائیگی کا انتظار ہے...":"Waiting for payment..."} sub={isUrdu?"جب آجر ادائیگی کرے گا آپ کو اطلاع ملے گی":"You'll be notified when employer initiates payment"} />
    );
    if (currentStep === "payment_sent") return (
      <div style={{ textAlign:"center", padding:"8px 0" }}>
        <div style={{ fontSize:32, marginBottom:8 }}>💸</div>
        <p style={{ fontWeight:700, color:"#0f172a", fontSize:14, marginBottom:4 }}>
          {isUrdu?"آجر نے ادائیگی شروع کی":"Employer sent payment"}
        </p>
        <p style={{ fontSize:12.5, color:"#64748b" }}>
          {isUrdu?"آجر سے OTP لیں اور درج کریں":"Get the OTP from the employer and enter it"}
        </p>
      </div>
    );
  }

  if (role === "employer") {
    if (currentStep === "confirmed") return (
      <WaitingBadge icon="🚗" label={isUrdu?"کارکن آ رہا ہے...":"Worker is on the way..."} sub={isUrdu?"پہنچنے پر آپ کو اطلاع ملے گی":"You'll be notified when worker arrives"} />
    );
    if (currentStep === "worker_arrived") return (
      <WaitingBadge icon="📍" label={isUrdu?"کارکن پہنچ گیا!":"Worker has arrived!"} sub={isUrdu?"کارکن کے کام شروع کرنے کا انتظار کریں":"Waiting for worker to start the job"} color="#22c55e" />
    );
    if (currentStep === "in_progress") return (
      <WaitingBadge icon="🔧" label={isUrdu?"کام جاری ہے...":"Work in progress..."} sub={isUrdu?"جب کارکن مکمل کرے گا آپ کو اطلاع ملے گی":"Worker will notify you when done"} />
    );
    if (currentStep === "pending_payment") return (
      <div>
        <div style={{ background:"#fef3c7", borderRadius:12, padding:"10px 14px", marginBottom:14, display:"flex", gap:8, alignItems:"flex-start", fontSize:12.5, color:"#92400e", fontWeight:600 }}>
          <Shield size={15} style={{ flexShrink:0, marginTop:1 }} />
          <span>{isUrdu?"کام مکمل ہو گیا۔ ادائیگی کرنے کے لیے نیچے بٹن دبائیں — ایک OTP بنے گا جو کارکن کو دیں۔":"Work is done. Tap below — an OTP will be generated. Show it to the worker after handing over cash."}</span>
        </div>
        <ActionBtn color="linear-gradient(135deg,#f59e0b,#d97706)" onClick={onInitiatePayment} icon="🔐"
          label={isUrdu?`Rs. ${agreedPrice} — OTP بنائیں`:`Generate OTP for Rs. ${agreedPrice}`}
          sub={isUrdu?"رقم دینے کے بعد OTP کارکن کو دکھائیں":"Show OTP to worker after giving cash"} />
      </div>
    );
    if (currentStep === "payment_sent" && paymentOtp) return (
      <div style={{ background:"#fff", borderRadius:14, border:"2px solid #22c55e", padding:20, textAlign:"center" }}>
        <div style={{ fontSize:11, fontWeight:800, color:"#16a34a", textTransform:"uppercase", letterSpacing:".08em", marginBottom:10 }}>
          🔐 {isUrdu?"ادائیگی OTP":"Payment OTP"}
        </div>
        <div style={{ fontSize:11, color:"#64748b", marginBottom:12 }}>
          {isUrdu?"یہ OTP کارکن کو رقم دینے کے بعد دکھائیں":"Show this OTP to the worker after handing over cash"}
        </div>
        <div style={{ display:"flex", justifyContent:"center", gap:8, marginBottom:14 }}>
          {paymentOtp.split("").map((digit, i) => (
            <div key={i} style={{ width:40, height:52, borderRadius:10, background:"#f0fdf4", border:"2px solid #22c55e", display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, fontWeight:900, color:"#15803d", fontFamily:"monospace" }}>
              {digit}
            </div>
          ))}
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:6, justifyContent:"center", fontSize:12, color:"#64748b" }}>
          <Shield size={13} color="#16a34a" />
          {isUrdu?"OTP صرف ایک بار استعمال ہوتا ہے":"OTP is single-use only"}
        </div>
        <WaitingBadge icon="✅" label={isUrdu?"کارکن کی تصدیق کا انتظار ہے":"Waiting for worker to verify"} sub="" color="#16a34a" />
      </div>
    );
  }

  return null;
}

function ActionBtn({ color, onClick, icon, label, sub }) {
  return (
    <button className="tracker-btn" onClick={onClick}
      style={{ width:"100%", padding:"15px 20px", borderRadius:14, border:"none", background:color, color:"#fff", display:"flex", alignItems:"center", gap:14, cursor:"pointer", boxShadow:"0 4px 18px rgba(0,0,0,.15)" }}>
      <span style={{ fontSize:26 }}>{icon}</span>
      <div style={{ textAlign:"left" }}>
        <div style={{ fontSize:15, fontWeight:800 }}>{label}</div>
        {sub && <div style={{ fontSize:11.5, opacity:.75, marginTop:2 }}>{sub}</div>}
      </div>
      <ChevronRight size={18} style={{ marginLeft:"auto", opacity:.7 }} />
    </button>
  );
}

function WaitingBadge({ icon, label, sub, color = "#3b82f6" }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:14, padding:"14px 16px", background:`${color}0f`, borderRadius:14, border:`1.5px solid ${color}33` }}>
      <div style={{ fontSize:28, animation:"pulse2 2.5s infinite" }}>{icon}</div>
      <div>
        <div style={{ fontSize:14, fontWeight:700, color:"#0f172a" }}>{label}</div>
        {sub && <div style={{ fontSize:12, color:"#64748b", marginTop:3 }}>{sub}</div>}
      </div>
      <div style={{ marginLeft:"auto", width:20, height:20, borderWidth:"2.5px", borderStyle:"solid", borderTopColor:"transparent", borderRightColor:color, borderBottomColor:color, borderLeftColor:color, borderRadius:"50%", animation:"spin2 1s linear infinite", flexShrink:0 }} />
    </div>
  );
}

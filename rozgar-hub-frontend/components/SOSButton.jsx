"use client";
import { useState, useEffect, useRef, useCallback } from "react";

// CRITICAL: Always use the full backend URL.
// Relative paths like "/api/sos/trigger" go to Next.js (port 3000),
// not Express (port 5000) — causing the "Unexpected token '<'" JSON error.
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function SOSButton({ socket, jobRequestId, employerId }) {
  const [phase,     setPhase]     = useState("idle"); // idle | countdown | active | cancelled
  const [countdown, setCountdown] = useState(5);
  const [sosId,     setSosId]     = useState(null);
  const [location,  setLocation]  = useState(null);
  const [locError,  setLocError]  = useState(null);
  const [sending,   setSending]   = useState(false);

  const timerRef         = useRef(null);
  const locationWatchRef = useRef(null);
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const getLocation = () =>
    new Promise((resolve, reject) => {
      if (!navigator.geolocation) { reject(new Error("Geolocation not supported.")); return; }
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy }),
        (err) => reject(err),
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });

  const activateSOS = useCallback(async () => {
    setSending(true);
    try {
      let loc = { lat: 0, lng: 0, accuracy: null };
      try { loc = await getLocation(); setLocation(loc); setLocError(null); }
      catch { setLocError("Could not get precise location."); }

      const res = await fetch(`${API}/api/sos/trigger`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          lat: loc.lat, lng: loc.lng, accuracy: loc.accuracy,
          jobRequestId: jobRequestId || null,
          employerId:   employerId   || null,
        }),
      });

      // Guard: if we got HTML back, Next.js intercepted the request
      const contentType = res.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        throw new Error(`Got HTML not JSON (status ${res.status}). NEXT_PUBLIC_API_URL="${API}"`);
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);

      setSosId(data.sosId);
      setPhase("active");

      // Socket emit so admin sees it in real time
      if (socket) {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        socket.emit("sos_trigger", {
          workerId: user._id || user.id, workerName: user.name, workerPhone: user.phone,
          lat: loc.lat, lng: loc.lng, sosId: data.sosId, jobRequestId, employerId,
        });
      }

      // Live location updates every 30s
      locationWatchRef.current = setInterval(async () => {
        try {
          const updated = await getLocation();
          setLocation(updated);
          const user = JSON.parse(localStorage.getItem("user") || "{}");
          if (socket) socket.emit("sos_location_update", { sosId: data.sosId, workerId: user._id || user.id, lat: updated.lat, lng: updated.lng });
          await fetch(`${API}/api/sos/${data.sosId}/location`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
            body: JSON.stringify({ lat: updated.lat, lng: updated.lng }),
          });
        } catch {}
      }, 30000);

    } catch (err) {
      console.error("SOS trigger failed:", err.message);
      setLocError(err.message.includes("HTML")
        ? `Config error: ${err.message}`
        : "Failed to send SOS. Please call 1122 or 15 directly.");
      setPhase("idle");
    } finally {
      setSending(false);
    }
  }, [token, jobRequestId, employerId, socket]);

  const startCountdown = () => {
    if (phase !== "idle") return;
    setPhase("countdown"); setCountdown(5);
    let remaining = 5;
    timerRef.current = setInterval(() => {
      remaining -= 1; setCountdown(remaining);
      if (remaining <= 0) { clearInterval(timerRef.current); activateSOS(); }
    }, 1000);
  };

  const cancelCountdown = () => { clearInterval(timerRef.current); setPhase("idle"); setCountdown(5); };

  const cancelSOS = async () => {
    clearInterval(locationWatchRef.current);
    if (sosId && token) {
      try {
        await fetch(`${API}/api/sos/${sosId}/cancel`, {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (socket) {
          const user = JSON.parse(localStorage.getItem("user") || "{}");
          socket.emit("sos_cancel", { sosId, workerId: user._id || user.id });
        }
      } catch {}
    }
    setSosId(null); setPhase("cancelled");
    setTimeout(() => setPhase("idle"), 3000);
  };

  useEffect(() => () => { clearInterval(timerRef.current); clearInterval(locationWatchRef.current); }, []);

  if (phase === "cancelled") return (
    <div style={S.wrapper}>
      <div style={{ ...S.btn, background: "#6b7280", cursor: "default", animation: "none" }}>
        <span style={{ fontSize: 22 }}>✓</span>
        <span style={{ fontWeight: 700 }}>SOS Cancelled</span>
      </div>
    </div>
  );

  if (phase === "active") return (
    <div style={S.wrapper}>
      <style>{kf}</style>
      <div style={{ textAlign: "center" }}>
        <div style={{ ...S.btn, background: "#991b1b", animation: "sosPulse 1.2s ease-in-out infinite", cursor: "default" }}>
          <span style={{ fontSize: 24 }}>🚨</span>
          <span style={{ fontWeight: 800, fontSize: 15 }}>SOS ACTIVE</span>
        </div>
        <p style={S.helper}>Emergency contacts notified. Live location being shared.</p>
        {location && <p style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}>📍 {location.lat.toFixed(5)}, {location.lng.toFixed(5)}</p>}
        <button onClick={cancelSOS} style={S.cancelBtn}>I am safe — Cancel SOS</button>
      </div>
    </div>
  );

  if (phase === "countdown") return (
    <div style={S.wrapper}>
      <style>{kf}</style>
      <div style={{ textAlign: "center" }}>
        <div style={{ ...S.btn, background: "#b91c1c", animation: "sosPulse .6s ease-in-out infinite", cursor: "pointer" }} onClick={cancelCountdown}>
          <span style={{ fontSize: 28, fontWeight: 900, lineHeight: 1 }}>{countdown}</span>
          <span style={{ fontWeight: 700, fontSize: 13 }}>Tap to cancel</span>
        </div>
        <p style={S.helper}>SOS activates in {countdown}s… tap to cancel</p>
      </div>
    </div>
  );

  return (
    <div style={S.wrapper}>
      <style>{kf}</style>
      <div style={{ textAlign: "center" }}>
        <button onClick={startCountdown} disabled={sending} style={S.btn} title="Press to trigger emergency SOS">
          <span style={{ fontSize: 26 }}>🆘</span>
          <span style={{ fontWeight: 800, fontSize: 14, letterSpacing: ".5px" }}>{sending ? "Activating..." : "SOS"}</span>
        </button>
        <p style={S.helper}>Press for emergency<br />Notifies contacts + shares location</p>
        {locError && <p style={{ color: "#ef4444", fontSize: 11, marginTop: 4, maxWidth: 200, textAlign: "center" }}>{locError}</p>}
      </div>
    </div>
  );
}

const kf = `@keyframes sosPulse {
  0%,100% { box-shadow: 0 0 0 0 rgba(220,38,38,.6), 0 4px 20px rgba(220,38,38,.4); transform: scale(1); }
  50%      { box-shadow: 0 0 0 16px rgba(220,38,38,0), 0 4px 30px rgba(220,38,38,.6); transform: scale(1.05); }
}`;

const S = {
  wrapper: { display: "flex", justifyContent: "center", padding: "12px 0" },
  btn: {
    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
    width: 90, height: 90, borderRadius: "50%",
    background: "linear-gradient(135deg,#dc2626,#991b1b)", color: "#fff",
    border: "3px solid rgba(255,255,255,.25)", cursor: "pointer", gap: 4,
    boxShadow: "0 4px 20px rgba(220,38,38,.5)", transition: "transform .15s",
    animation: "sosPulse 2.5s ease-in-out infinite", outline: "none", userSelect: "none",
  },
  helper: { fontSize: 11, color: "#9ca3af", marginTop: 8, lineHeight: 1.5, textAlign: "center" },
  cancelBtn: {
    marginTop: 12, padding: "8px 20px", borderRadius: 20,
    border: "1.5px solid #6b7280", background: "transparent",
    color: "#6b7280", fontSize: 12, fontWeight: 700, cursor: "pointer",
  },
};
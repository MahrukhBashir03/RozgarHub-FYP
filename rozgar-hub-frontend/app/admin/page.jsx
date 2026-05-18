"use client";
import { useEffect, useState, useRef } from "react";

const API         = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000") + "/api/admin";
const SOCKET_URL  = process.env.NEXT_PUBLIC_API_URL  || "http://localhost:5000";
const SOS_API     = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000") + "/api/sos";

// ── helper ───────────────────────────────────────────────────────────────────
function hasDriverSkill(user) {
  if (user.role !== "worker" || !Array.isArray(user.skills)) return false;
  return user.skills.some(s => {
    if (!s) return false;
    if (typeof s === "string") return s.toLowerCase() === "driver";
    const slug = typeof s.slug === "string" ? s.slug.toLowerCase() : "";
    const name = typeof s.name === "string" ? s.name.toLowerCase() : "";
    return slug === "driver" || name === "driver";
  });
}

// ── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, color }) {
  const colors = {
    blue:   { bg: "#EBF3FF", text: "#1A56DB", border: "#BFDBFE" },
    green:  { bg: "#ECFDF5", text: "#065F46", border: "#A7F3D0" },
    purple: { bg: "#F5F3FF", text: "#5B21B6", border: "#DDD6FE" },
    amber:  { bg: "#FFFBEB", text: "#92400E", border: "#FDE68A" },
    red:    { bg: "#FEF2F2", text: "#991B1B", border: "#FECACA" },
  };
  const c = colors[color] || colors.blue;
  return (
    <div style={{ background: c.bg, border: `1px solid ${c.border}`, borderRadius: 14, padding: "18px 20px", display: "flex", alignItems: "center", gap: 14 }}>
      <div style={{ width: 44, height: 44, borderRadius: 12, background: "#fff", border: `1px solid ${c.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{icon}</div>
      <div>
        <div style={{ fontSize: 26, fontWeight: 800, color: c.text, lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 12, color: c.text, opacity: 0.7, marginTop: 4, fontWeight: 600 }}>{label}</div>
      </div>
    </div>
  );
}

// ── Doc Pill ─────────────────────────────────────────────────────────────────
function DocPill({ icon, label, hasDoc, onClick }) {
  return (
    <button onClick={hasDoc ? onClick : undefined} title={hasDoc ? `View ${label}` : `${label} not uploaded`}
      style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, border: hasDoc ? "1px solid #A7F3D0" : "1px solid #E5E7EB", background: hasDoc ? "#ECFDF5" : "#F9FAFB", color: hasDoc ? "#065F46" : "#9CA3AF", cursor: hasDoc ? "pointer" : "default", transition: "all .15s" }}>
      <span style={{ fontSize: 12 }}>{icon}</span> {label}
      {hasDoc && <span style={{ fontSize: 10, marginLeft: 2 }}>↗</span>}
    </button>
  );
}

// ── Document Viewer Modal ─────────────────────────────────────────────────────
function DocViewerModal({ url, label, onClose }) {
  const isImage = /\.(jpg|jpeg|png|webp|gif)$/i.test(url);
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 24 }} onClick={onClose}>
      <div style={{ background: "#1e293b", borderRadius: 16, overflow: "hidden", maxWidth: 700, width: "100%", maxHeight: "90vh", display: "flex", flexDirection: "column", boxShadow: "0 40px 100px rgba(0,0,0,.6)" }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: "14px 20px", background: "#0f172a", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,.08)" }}>
          <span style={{ color: "#e2e8f0", fontWeight: 700, fontSize: 15 }}>📎 {label}</span>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <a href={url} target="_blank" rel="noreferrer" style={{ padding: "6px 14px", borderRadius: 8, background: "#3b82f6", color: "#fff", fontSize: 12, fontWeight: 700, textDecoration: "none" }}>Open Original ↗</a>
            <button onClick={onClose} style={{ background: "rgba(255,255,255,.1)", border: "none", color: "#fff", width: 30, height: 30, borderRadius: 8, cursor: "pointer", fontSize: 18, lineHeight: 1 }}>×</button>
          </div>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: 20, background: "#1e293b", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {isImage
            ? <img src={url} alt={label} style={{ maxWidth: "100%", maxHeight: "70vh", objectFit: "contain", borderRadius: 10 }} />
            : <div style={{ textAlign: "center", padding: 40 }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>📄</div>
                <p style={{ color: "#94a3b8", fontSize: 14 }}>PDF Document — cannot preview inline.</p>
                <a href={url} target="_blank" rel="noreferrer" style={{ display: "inline-block", marginTop: 16, padding: "10px 24px", borderRadius: 10, background: "#3b82f6", color: "#fff", fontWeight: 700, textDecoration: "none", fontSize: 14 }}>Open PDF ↗</a>
              </div>}
        </div>
      </div>
    </div>
  );
}

// ── User Detail Modal ─────────────────────────────────────────────────────────
function UserModal({ user, onClose, onVerify, onDelete, actionLoading }) {
  const [docViewer, setDocViewer] = useState(null);
  const isDriverWorker = hasDriverSkill(user);
  const docs = [
    { key: "profilePhoto", label: "Profile Photo", icon: "📷" },
    { key: "cnicFront",    label: "CNIC Front",    icon: "🪪" },
    { key: "cnicBack",     label: "CNIC Back",     icon: "🪪" },
    ...(isDriverWorker ? [{ key: "drivingLicense", label: "Driving License", icon: "🚗" }] : []),
  ];
  const uploadedDocs = docs.filter(d => user.documents?.[d.key]);
  const infoItems = [
    { label: "Phone",          value: user.phone || "—" },
    { label: "CNIC",           value: user.cnic  || "—" },
    { label: "Email Verified", value: user.isEmailVerified ? "✅ Yes" : "❌ No" },
    { label: "Admin Verified", value: user.isVerified      ? "✅ Yes" : "⏳ Pending" },
    { label: "Joined",         value: new Date(user.createdAt).toLocaleDateString("en-PK") },
    { label: "Skills", value: Array.isArray(user.skills) && user.skills.length ? user.skills.map(s => { if (!s) return null; if (typeof s === "string") return s; return s.name || s.slug || null; }).filter(Boolean).join(", ") : "—" },
  ];

  return (
    <>
      <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,.7)", backdropFilter: "blur(6px)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }} onClick={onClose}>
        <div style={{ background: "#fff", borderRadius: 24, width: "100%", maxWidth: 660, maxHeight: "92vh", overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 40px 100px rgba(0,0,0,.25)" }} onClick={e => e.stopPropagation()}>
          <div style={{ background: "linear-gradient(135deg,#0f172a,#1e3a5f)", padding: "22px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              {user.documents?.profilePhoto
                ? <img src={user.documents.profilePhoto} alt={user.name} style={{ width: 52, height: 52, borderRadius: "50%", objectFit: "cover", border: "2px solid rgba(255,255,255,.3)", cursor: "pointer" }} onClick={() => setDocViewer({ url: user.documents.profilePhoto, label: "Profile Photo" })} />
                : <div style={{ width: 52, height: 52, borderRadius: "50%", flexShrink: 0, background: user.role === "worker" ? "linear-gradient(135deg,#22c55e,#16a34a)" : "linear-gradient(135deg,#3b82f6,#2563eb)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 800, color: "#fff" }}>{user.name?.charAt(0).toUpperCase()}</div>}
              <div>
                <div style={{ fontSize: 18, fontWeight: 800, color: "#fff" }}>{user.name}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,.5)", marginTop: 2 }}>{user.email}</div>
                <div style={{ marginTop: 6, display: "flex", gap: 6 }}>
                  <span style={{ padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: user.role === "worker" ? "rgba(34,197,94,.2)" : "rgba(59,130,246,.2)", color: user.role === "worker" ? "#86efac" : "#93c5fd" }}>{user.role === "worker" ? "Worker" : "Employer"}</span>
                  <span style={{ padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: user.isVerified ? "rgba(16,185,129,.2)" : "rgba(245,158,11,.2)", color: user.isVerified ? "#6ee7b7" : "#fcd34d" }}>{user.isVerified ? "✓ Verified" : "⏳ Pending"}</span>
                  {isDriverWorker && <span style={{ padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: "rgba(234,179,8,.2)", color: "#fde047" }}>🚗 Driver</span>}
                </div>
              </div>
            </div>
            <button onClick={onClose} style={{ background: "rgba(255,255,255,.1)", border: "none", color: "#fff", width: 36, height: 36, borderRadius: 10, cursor: "pointer", fontSize: 20, lineHeight: 1 }}>×</button>
          </div>
          <div style={{ overflowY: "auto", flex: 1, padding: 28 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 28 }}>
              {infoItems.map(info => (
                <div key={info.label} style={{ background: "#f8fafc", borderRadius: 10, padding: "12px 14px", border: "1px solid #f1f5f9" }}>
                  <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 4 }}>{info.label}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#0f172a" }}>{info.value}</div>
                </div>
              ))}
            </div>
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <h4 style={{ fontSize: 13, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: ".06em", margin: 0 }}>Uploaded Documents</h4>
                <span style={{ fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: uploadedDocs.length >= docs.length ? "#dcfce7" : "#fef3c7", color: uploadedDocs.length >= docs.length ? "#166534" : "#92400e" }}>{uploadedDocs.length} / {docs.length} uploaded</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {docs.map(doc => {
                  const url = user.documents?.[doc.key];
                  const isImage = url && /\.(jpg|jpeg|png|webp|gif)$/i.test(url);
                  return (
                    <div key={doc.key} style={{ border: url ? "1.5px solid #a7f3d0" : "1.5px dashed #e2e8f0", borderRadius: 14, overflow: "hidden", background: url ? "#f0fdf4" : "#fafafa" }}>
                      <div style={{ padding: "10px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: url ? "1px solid #bbf7d0" : "1px solid #f1f5f9", background: url ? "#dcfce7" : "#f8fafc" }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: url ? "#166534" : "#94a3b8" }}>{doc.icon} {doc.label}</span>
                        {url ? <span style={{ fontSize: 11, color: "#16a34a", fontWeight: 700 }}>✅ Uploaded</span> : <span style={{ fontSize: 11, color: "#d1d5db", fontWeight: 700 }}>❌ Missing</span>}
                      </div>
                      {url ? (
                        <div style={{ position: "relative", cursor: "pointer" }} onClick={() => setDocViewer({ url, label: doc.label })}>
                          {isImage
                            ? <img src={url} alt={doc.label} style={{ width: "100%", height: 110, objectFit: "cover", display: "block" }} />
                            : <div style={{ height: 80, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, background: "#f0fdf4" }}><span style={{ fontSize: 28 }}>📄</span><span style={{ fontSize: 11, color: "#16a34a", fontWeight: 700 }}>PDF — click to view ↗</span></div>}
                        </div>
                      ) : (
                        <div style={{ height: 80, display: "flex", alignItems: "center", justifyContent: "center", background: "#f9fafb" }}><span style={{ fontSize: 12, color: "#d1d5db", fontWeight: 600 }}>Not submitted</span></div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            <div style={{ background: user.isVerified ? "#f0fdf4" : "#fffbeb", border: `1.5px solid ${user.isVerified ? "#a7f3d0" : "#fde68a"}`, borderRadius: 14, padding: "16px 18px", marginBottom: 18 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: user.isVerified ? "#166534" : "#92400e", marginBottom: 4 }}>{user.isVerified ? "✅ This account is currently verified" : "⏳ This account is awaiting verification"}</div>
              <div style={{ fontSize: 12, color: "#64748b" }}>{user.isVerified ? "User can access all platform features." : `Documents uploaded: ${uploadedDocs.map(d => d.label).join(", ") || "None"}. Review documents above before verifying.`}</div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => onVerify(user._id, user.isVerified)} disabled={actionLoading === user._id}
                style={{ flex: 1, padding: "14px", borderRadius: 12, border: "none", fontSize: 14, fontWeight: 700, cursor: "pointer", background: user.isVerified ? "linear-gradient(135deg,#f59e0b,#d97706)" : "linear-gradient(135deg,#22c55e,#16a34a)", color: "#fff", opacity: actionLoading === user._id ? .6 : 1, transition: "opacity .2s" }}>
                {actionLoading === user._id ? "Processing..." : user.isVerified ? "⚠️ Remove Verification" : "✅ Verify This Account"}
              </button>
              <button onClick={() => onDelete(user._id)} style={{ padding: "14px 20px", borderRadius: 12, border: "1.5px solid #fecaca", background: "#fef2f2", color: "#ef4444", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>🗑</button>
            </div>
          </div>
        </div>
      </div>
      {docViewer && <DocViewerModal url={docViewer.url} label={docViewer.label} onClose={() => setDocViewer(null)} />}
    </>
  );
}

// ── Table styles ─────────────────────────────────────────────────────────────
const T = {
  table: { background: "#fff", borderRadius: 16, overflow: "hidden", border: "1px solid #e2e8f0", boxShadow: "0 1px 4px rgba(0,0,0,.05)" },
  thead: { display: "grid", padding: "10px 18px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0", fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: ".06em" },
  row:   { display: "grid", padding: "12px 18px", alignItems: "center", borderBottom: "1px solid #f1f5f9", fontSize: 12, transition: "background .1s" },
  empty: { textAlign: "center", padding: 40, color: "#94a3b8", fontSize: 13 },
  btn:   { padding: "5px 10px", borderRadius: 7, border: "none", fontSize: 11, fontWeight: 700, cursor: "pointer" },
};

// ── SOS Dashboard (replaces FraudDashboard for SOS-only view) ────────────────
function SOSDashboard() {
  const [sosEvents,  setSosEvents]  = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [sosBanner,  setSosBanner]  = useState(null); // live incoming SOS
  const socketRef = useRef(null);
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  // ── Load existing SOS events from DB ──────────────────────────
  useEffect(() => {
    loadSOS();
  }, []);

  async function loadSOS() {
    setLoading(true);
    try {
      const res  = await fetch(`${SOS_API}/all`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setSosEvents(Array.isArray(data) ? data : []);
    } catch (e) { console.error("SOS load error:", e); }
    setLoading(false);
  }

  // ── Connect socket and join admins room ────────────────────────
  useEffect(() => {
    // Dynamically import so it only runs client-side
    import("socket.io-client").then(({ io }) => {
      const s = io(SOCKET_URL, { transports: ["websocket", "polling"] });
      socketRef.current = s;

      s.on("connect", () => {
        console.log("[Admin Socket] Connected:", s.id);
        // Join admin room so socketHandler.js forwards SOS events here
        s.emit("join_admin");
      });

      // ── Worker pressed SOS → show instantly ───────────────────
      s.on("sos_triggered", (data) => {
        console.log("[Admin] 🚨 SOS received:", data);

        // Show alert banner
        setSosBanner(data);

        // Add to list immediately (before DB refresh)
        setSosEvents(prev => {
          if (prev.some(e => String(e._id) === String(data.sosId))) return prev;
          return [{
            _id:              data.sosId,
            worker:           { name: data.workerName, phone: data.workerPhone },
            location:         { lat: data.lat, lng: data.lng, address: data.address || "" },
            status:           "active",
            contactsNotified: [],
            createdAt:        data.timestamp || new Date().toISOString(),
          }, ...prev];
        });
      });

      // ── Worker cancelled SOS ───────────────────────────────────
      s.on("sos_cancelled", ({ sosId }) => {
        setSosEvents(prev => prev.map(e => String(e._id) === String(sosId) ? { ...e, status: "cancelled" } : e));
        setSosBanner(prev => prev && String(prev.sosId) === String(sosId) ? null : prev);
      });

      // ── Live location update ───────────────────────────────────
      s.on("sos_location_update", ({ sosId, lat, lng }) => {
        setSosEvents(prev => prev.map(e =>
          String(e._id) === String(sosId)
            ? { ...e, location: { ...e.location, lat, lng } }
            : e
        ));
      });
    }).catch(err => console.error("Socket import error:", err));

    return () => { socketRef.current?.disconnect(); };
  }, []);

  async function resolveSOS(sosId) {
    try {
      await fetch(`${SOS_API}/${sosId}/resolve`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });
      setSosEvents(prev => prev.map(e => e._id === sosId ? { ...e, status: "resolved" } : e));
      if (sosBanner && String(sosBanner.sosId) === String(sosId)) setSosBanner(null);
    } catch {}
  }

  const activeSosCount = sosEvents.filter(e => e.status === "active").length;

  if (loading) return (
    <div style={{ textAlign: "center", padding: 60, color: "#94a3b8" }}>
      <div style={{ width: 36, height: 36, border: "3px solid #dc2626", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 12px" }} />
      Loading SOS events...
    </div>
  );

  return (
    <div>
      {/* ── Live SOS Alert Banner ── */}
      {sosBanner && (
        <div style={{ background: "linear-gradient(135deg,#7f1d1d,#dc2626)", borderRadius: 16, padding: "18px 24px", marginBottom: 20, display: "flex", alignItems: "center", gap: 16, animation: "fadeIn .3s", border: "2px solid #fca5a5" }}>
          <div style={{ fontSize: 36, animation: "sosPulse 1s infinite" }}>🚨</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 900, color: "#fff", marginBottom: 4 }}>LIVE SOS ALERT — {sosBanner.workerName}</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,.8)" }}>📞 {sosBanner.workerPhone || "—"} &nbsp;|&nbsp; 📍 {sosBanner.lat?.toFixed(5)}, {sosBanner.lng?.toFixed(5)}</div>
          </div>
          {sosBanner.lat && (
            <a href={`https://maps.google.com/?q=${sosBanner.lat},${sosBanner.lng}`} target="_blank" rel="noreferrer"
              style={{ padding: "9px 18px", borderRadius: 10, background: "#fff", color: "#dc2626", fontWeight: 800, fontSize: 13, textDecoration: "none", flexShrink: 0 }}>
              📍 Open Map
            </a>
          )}
          <button onClick={() => setSosBanner(null)} style={{ background: "rgba(255,255,255,.15)", border: "none", color: "#fff", width: 32, height: 32, borderRadius: 8, cursor: "pointer", fontSize: 18, flexShrink: 0 }}>×</button>
        </div>
      )}

      {/* ── Stats row ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 20 }}>
        {[
          { icon: "🔴", label: "Active SOS",    val: activeSosCount,                                    bg: "#fef2f2", text: "#991b1b" },
          { icon: "✅", label: "Resolved",       val: sosEvents.filter(e => e.status === "resolved").length,  bg: "#f0fdf4", text: "#166534" },
          { icon: "📋", label: "Total Events",   val: sosEvents.length,                                  bg: "#eff6ff", text: "#1d4ed8" },
        ].map(s => (
          <div key={s.label} style={{ background: s.bg, borderRadius: 14, padding: "16px 20px", border: `1px solid ${s.text}22`, display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ fontSize: 28 }}>{s.icon}</div>
            <div>
              <div style={{ fontSize: 28, fontWeight: 900, color: s.text, lineHeight: 1 }}>{s.val}</div>
              <div style={{ fontSize: 12, color: s.text, opacity: .8, fontWeight: 600, marginTop: 2 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Toolbar ── */}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginBottom: 14 }}>
        <button onClick={loadSOS} style={{ padding: "8px 18px", borderRadius: 10, border: "1px solid #e2e8f0", background: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>↺ Refresh</button>
      </div>

      {/* ── SOS Events Table ── */}
      <div style={T.table}>
        <div style={{ ...T.thead, gridTemplateColumns: "1.5fr 1.2fr 1fr 1fr 1.2fr 1fr" }}>
          <span>Worker</span><span>Location</span><span>Status</span><span>Contacts</span><span>Time</span><span>Actions</span>
        </div>
        {sosEvents.length === 0 && <div style={T.empty}>No SOS events yet</div>}
        {sosEvents.map(e => (
          <div key={e._id} style={{ ...T.row, gridTemplateColumns: "1.5fr 1.2fr 1fr 1fr 1.2fr 1fr", background: e.status === "active" ? "#fff1f2" : "#fff" }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 13, color: "#0f172a" }}>{e.worker?.name || "—"}</div>
              <div style={{ fontSize: 11, color: "#94a3b8" }}>{e.worker?.phone || "—"}</div>
            </div>
            <div style={{ fontSize: 11 }}>
              {e.location?.address || (e.location?.lat ? `${Number(e.location.lat).toFixed(4)}, ${Number(e.location.lng).toFixed(4)}` : "—")}
              {e.location?.lat && (
                <a href={`https://maps.google.com/?q=${e.location.lat},${e.location.lng}`} target="_blank" rel="noreferrer"
                  style={{ marginLeft: 4, color: "#3b82f6", fontSize: 10 }}>📍 Map</a>
              )}
            </div>
            <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, width: "fit-content", background: e.status === "active" ? "#fef2f2" : e.status === "resolved" ? "#dcfce7" : "#f1f5f9", color: e.status === "active" ? "#dc2626" : e.status === "resolved" ? "#166534" : "#64748b" }}>
              {e.status === "active" ? "🔴 ACTIVE" : e.status === "resolved" ? "✅ Resolved" : "Cancelled"}
            </span>
            <span style={{ fontSize: 12, color: "#374151" }}>{e.contactsNotified?.length || 0} notified</span>
            <div style={{ fontSize: 11, color: "#94a3b8" }}>
              {new Date(e.createdAt).toLocaleString("en-PK", { dateStyle: "short", timeStyle: "short" })}
            </div>
            <div>
              {e.status === "active" && (
                <button onClick={() => resolveSOS(e._id)} style={{ ...T.btn, background: "#dcfce7", color: "#166534" }}>✅ Resolve</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main Admin Panel ──────────────────────────────────────────────────────────
export default function AdminPanel() {
  const [users,         setUsers]         = useState([]);
  const [stats,         setStats]         = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [filter,        setFilter]        = useState("all");
  const [search,        setSearch]        = useState("");
  const [selected,      setSelected]      = useState(null);
  const [actionLoading, setActionLoading] = useState("");
  const [docViewer,     setDocViewer]     = useState(null);
  const [activeTab,     setActiveTab]     = useState("users");

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const [usersRes, statsRes] = await Promise.all([
        fetch(`${API}/users`).then(r => r.json()),
        fetch(`${API}/stats`).then(r => r.json()),
      ]);
      setUsers(Array.isArray(usersRes) ? usersRes : []);
      setStats(statsRes);
    } catch (err) { console.error(err); }
    setLoading(false);
  }

  async function handleVerify(userId, currentStatus) {
    setActionLoading(userId);
    try {
      const endpoint = currentStatus ? "unverify" : "verify";
      const res  = await fetch(`${API}/users/${userId}/${endpoint}`, { method: "PATCH" });
      const data = await res.json();
      if (res.ok) {
        setUsers(prev => prev.map(u => u._id === userId ? { ...u, isVerified: !currentStatus } : u));
        if (selected?._id === userId) setSelected(prev => ({ ...prev, isVerified: !currentStatus }));
      } else { alert(data.error); }
    } catch { alert("Failed to update"); }
    setActionLoading("");
  }

  async function handleDelete(userId) {
    if (!confirm("Delete this user permanently? This cannot be undone.")) return;
    setActionLoading(userId);
    try {
      const res = await fetch(`${API}/users/${userId}`, { method: "DELETE" });
      if (res.ok) {
        setUsers(prev => prev.filter(u => u._id !== userId));
        if (selected?._id === userId) setSelected(null);
      }
    } catch { alert("Failed to delete"); }
    setActionLoading("");
  }

  const FILTERS = [
    { id: "all",      label: "All Users" },
    { id: "pending",  label: "⏳ Pending" },
    { id: "verified", label: "✅ Verified" },
    { id: "worker",   label: "Workers" },
    { id: "employer", label: "Employers" },
  ];

  const filtered = users.filter(u => {
    const matchFilter = filter === "all" ? true : filter === "worker" ? u.role === "worker" : filter === "employer" ? u.role === "employer" : filter === "pending" ? !u.isVerified : filter === "verified" ? u.isVerified : true;
    const matchSearch = !search || u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase()) || u.cnic?.includes(search);
    return matchFilter && matchSearch;
  });

  const pendingCount = users.filter(u => !u.isVerified).length;

  return (
    <div style={{ minHeight: "100vh", background: "#f1f5f9", fontFamily: "'Outfit', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        @keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes sosPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.15)}}
        ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:6px}
        .row-hover:hover{background:#f8fafc!important}
        .filter-btn:hover{opacity:.85}
      `}</style>

      {/* Header */}
      <header style={{ background: "linear-gradient(135deg,#0b1526 0%,#1a3255 100%)", padding: "0 32px", height: 72, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,.08)", position: "sticky", top: 0, zIndex: 50, boxShadow: "0 2px 20px rgba(0,0,0,.3)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 }}>
            <img src="/logo.png" alt="RozgarHub" style={{ width: 36, height: 36, objectFit: "contain" }} onError={e => { e.target.style.display = "none"; e.target.parentElement.innerHTML = "🛡️"; }} />
          </div>
          <div>
            <div style={{ fontSize: 19, fontWeight: 900, color: "#fff", letterSpacing: "-.3px", display: "flex", alignItems: "center", gap: 8 }}>
              Rozgar<span style={{ color: "#22c55e" }}>Hub</span>
              <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: ".15em", background: "linear-gradient(135deg,#3b82f6,#8b5cf6)", padding: "2px 8px", borderRadius: 6, color: "#fff" }}>ADMIN</span>
            </div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,.35)", marginTop: 1 }}>User Verification & Management Portal</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {pendingCount > 0 && (
            <div style={{ background: "rgba(245,158,11,.12)", border: "1px solid rgba(245,158,11,.25)", borderRadius: 22, padding: "6px 16px", fontSize: 12, fontWeight: 700, color: "#fbbf24", display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#f59e0b", display: "inline-block", boxShadow: "0 0 6px #f59e0b" }} />
              {pendingCount} pending review
            </div>
          )}
          <div style={{ width: 1, height: 28, background: "rgba(255,255,255,.1)" }} />
          <div style={{ display: "flex", gap: 4, background: "rgba(255,255,255,.06)", borderRadius: 10, padding: 4 }}>
            {[{ id: "users", label: "👥 Users" }, { id: "sos", label: "🚨 SOS Events" }].map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)} style={{ padding: "6px 16px", borderRadius: 7, border: "none", fontSize: 12, fontWeight: 700, cursor: "pointer", transition: "all .15s", background: activeTab === t.id ? "#fff" : "transparent", color: activeTab === t.id ? "#0f172a" : "rgba(255,255,255,.6)" }}>{t.label}</button>
            ))}
          </div>
          <button onClick={fetchData} style={{ background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.12)", color: "#e2e8f0", padding: "8px 18px", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 7 }}>
            <span style={{ fontSize: 14 }}>↺</span> Refresh
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 10, padding: "7px 14px" }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 6px #22c55e" }} />
            <span style={{ fontSize: 12, color: "rgba(255,255,255,.6)", fontWeight: 600 }}>Admin Online</span>
          </div>
        </div>
      </header>

      <div style={{ padding: "28px 32px", maxWidth: 1280, margin: "0 auto" }}>
        {stats && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 14, marginBottom: 28, animation: "fadeIn .4s" }}>
            <StatCard icon="👥" label="Total Users"  value={stats.total}     color="blue"   />
            <StatCard icon="🔧" label="Workers"      value={stats.workers}   color="green"  />
            <StatCard icon="🏢" label="Employers"    value={stats.employers} color="purple" />
            <StatCard icon="✅" label="Verified"     value={stats.verified}  color="green"  />
            <StatCard icon="⏳" label="Pending"      value={stats.pending}   color="amber"  />
          </div>
        )}

        {/* SOS Tab */}
        {activeTab === "sos" && <SOSDashboard />}

        {/* Users Tab */}
        {activeTab === "users" && (
          <>
            <div style={{ background: "#fff", borderRadius: 16, padding: "14px 18px", marginBottom: 18, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", boxShadow: "0 1px 4px rgba(0,0,0,.06)", border: "1px solid #e2e8f0" }}>
              <input placeholder="Search by name, email or CNIC..." value={search} onChange={e => setSearch(e.target.value)}
                style={{ flex: 1, minWidth: 220, padding: "9px 14px", borderRadius: 10, border: "1.5px solid #e2e8f0", fontSize: 13, outline: "none", fontFamily: "'Outfit', sans-serif", color: "#0f172a" }} />
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {FILTERS.map(f => (
                  <button key={f.id} className="filter-btn" onClick={() => setFilter(f.id)}
                    style={{ padding: "7px 15px", borderRadius: 20, border: "none", fontSize: 12, fontWeight: 700, cursor: "pointer", transition: "all .15s", background: filter === f.id ? "#0f172a" : "#f1f5f9", color: filter === f.id ? "#fff" : "#64748b" }}>
                    {f.label}
                  </button>
                ))}
              </div>
              <span style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600, whiteSpace: "nowrap" }}>{filtered.length} result{filtered.length !== 1 ? "s" : ""}</span>
            </div>

            {loading ? (
              <div style={{ textAlign: "center", padding: 80, color: "#94a3b8", background: "#fff", borderRadius: 18 }}>
                <div style={{ width: 40, height: 40, border: "3px solid #3b82f6", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 14px" }} />
                <p style={{ fontSize: 14 }}>Loading users...</p>
              </div>
            ) : (
              <div style={{ background: "#fff", borderRadius: 18, overflow: "hidden", border: "1px solid #e2e8f0", boxShadow: "0 1px 6px rgba(0,0,0,.06)" }}>
                <div style={{ display: "grid", gridTemplateColumns: "2.2fr 2fr 100px 200px 120px 180px", padding: "11px 20px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0", fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: ".08em" }}>
                  <span>User</span><span>Contact</span><span>Role</span><span>Documents</span><span>Status</span><span>Actions</span>
                </div>
                {filtered.length === 0 ? (
                  <div style={{ textAlign: "center", padding: 60, color: "#94a3b8" }}><div style={{ fontSize: 40, marginBottom: 10 }}>🔍</div><p style={{ fontWeight: 600, fontSize: 14 }}>No users found</p></div>
                ) : filtered.map((u, i) => {
                  const isDriverRow = hasDriverSkill(u);
                  const docList = [
                    { key: "profilePhoto", icon: "📷", label: "Photo" },
                    { key: "cnicFront",    icon: "🪪", label: "CNIC F" },
                    { key: "cnicBack",     icon: "🪪", label: "CNIC B" },
                    ...(isDriverRow ? [{ key: "drivingLicense", icon: "🚗", label: "License" }] : []),
                  ];
                  const uploadedCount = docList.filter(d => u.documents?.[d.key]).length;
                  return (
                    <div key={u._id} className="row-hover" style={{ display: "grid", gridTemplateColumns: "2.2fr 2fr 100px 200px 120px 180px", padding: "14px 20px", alignItems: "center", borderBottom: i < filtered.length - 1 ? "1px solid #f1f5f9" : "none", animation: "fadeIn .3s", transition: "background .15s", background: !u.isVerified ? "#fffdf0" : "#fff" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        {u.documents?.profilePhoto
                          ? <img src={u.documents.profilePhoto} alt={u.name} style={{ width: 38, height: 38, borderRadius: "50%", objectFit: "cover", flexShrink: 0, border: "2px solid #e2e8f0", cursor: "pointer" }} onClick={() => setDocViewer({ url: u.documents.profilePhoto, label: `${u.name} — Profile Photo` })} />
                          : <div style={{ width: 38, height: 38, borderRadius: "50%", flexShrink: 0, background: u.role === "worker" ? "linear-gradient(135deg,#22c55e,#16a34a)" : "linear-gradient(135deg,#3b82f6,#2563eb)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 800, color: "#fff" }}>{u.name?.charAt(0).toUpperCase()}</div>}
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>{u.name}{isDriverRow && <span style={{ marginLeft: 6, fontSize: 11, fontWeight: 700, color: "#ca8a04", background: "#fef9c3", padding: "1px 7px", borderRadius: 10 }}>🚗 Driver</span>}</div>
                          <div style={{ fontSize: 11, color: "#94a3b8" }}>Joined {new Date(u.createdAt).toLocaleDateString("en-PK")}</div>
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: 13, color: "#475569", fontWeight: 500 }}>{u.email}</div>
                        <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{u.phone || "—"} · {u.cnic || "—"}</div>
                      </div>
                      <span style={{ padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700, background: u.role === "worker" ? "#dcfce7" : "#eff6ff", color: u.role === "worker" ? "#166534" : "#1d4ed8", width: "fit-content" }}>{u.role === "worker" ? "Worker" : "Employer"}</span>
                      <div style={{ display: "flex", gap: 4, flexWrap: "wrap", alignItems: "center" }}>
                        {docList.map(doc => u.documents?.[doc.key] && (
                          <DocPill key={doc.key} icon={doc.icon} label={doc.label} hasDoc onClick={() => setDocViewer({ url: u.documents[doc.key], label: `${u.name} — ${doc.label === "Photo" ? "Profile Photo" : doc.label === "CNIC F" ? "CNIC Front" : doc.label === "CNIC B" ? "CNIC Back" : "Driving License"}` })} />
                        ))}
                        {uploadedCount === 0 && <span style={{ fontSize: 11, color: "#f59e0b", fontWeight: 700 }}>⚠ No docs</span>}
                        {uploadedCount > 0 && <span style={{ fontSize: 10, color: "#94a3b8", marginLeft: 2 }}>{uploadedCount}/{docList.length}</span>}
                      </div>
                      <span style={{ padding: "4px 12px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: u.isVerified ? "#dcfce7" : "#fef3c7", color: u.isVerified ? "#166534" : "#92400e", width: "fit-content" }}>{u.isVerified ? "✅ Verified" : "⏳ Pending"}</span>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button onClick={() => setSelected(u)} style={{ padding: "6px 12px", borderRadius: 8, border: "1.5px solid #e2e8f0", background: "#f8fafc", color: "#475569", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>👁 View</button>
                        <button onClick={() => handleVerify(u._id, u.isVerified)} disabled={actionLoading === u._id} style={{ padding: "6px 12px", borderRadius: 8, border: "none", fontSize: 12, fontWeight: 700, cursor: "pointer", background: u.isVerified ? "#fef3c7" : "#dcfce7", color: u.isVerified ? "#92400e" : "#166534", opacity: actionLoading === u._id ? .5 : 1 }}>{actionLoading === u._id ? "..." : u.isVerified ? "Unverify" : "✅ Verify"}</button>
                        <button onClick={() => handleDelete(u._id)} disabled={actionLoading === u._id} style={{ padding: "6px 10px", borderRadius: 8, border: "none", background: "#fef2f2", color: "#ef4444", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>🗑</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {selected && <UserModal user={selected} onClose={() => setSelected(null)} onVerify={handleVerify} onDelete={handleDelete} actionLoading={actionLoading} />}
      {docViewer && <DocViewerModal url={docViewer.url} label={docViewer.label} onClose={() => setDocViewer(null)} />}
    </div>
  );
}
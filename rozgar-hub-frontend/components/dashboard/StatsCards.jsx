"use client";

/**
 * StatsCards — receives pre-computed stats as props (no fetch).
 * Data comes from AnalyticsTab which uses the working job-requests endpoint.
 */
export default function StatsCards({ stats, loading }) {
  const cards = [
    {
      label: "TODAY",
      value: stats?.completedToday ?? 0,
      sub:   "jobs completed",
      icon:  "⚡",
      gradient: "linear-gradient(135deg,#0ea5e9 0%,#0369a1 100%)",
      glow:     "rgba(14,165,233,0.28)",
    },
    {
      label: "THIS WEEK",
      value: stats?.completedWeek ?? 0,
      sub:   "in last 7 days",
      icon:  "📅",
      gradient: "linear-gradient(135deg,#8b5cf6 0%,#6d28d9 100%)",
      glow:     "rgba(139,92,246,0.28)",
    },
    {
      label: "ALL TIME",
      value: stats?.totalCompleted ?? 0,
      sub:   "total completed",
      icon:  "🏆",
      gradient: "linear-gradient(135deg,#f59e0b 0%,#b45309 100%)",
      glow:     "rgba(245,158,11,0.28)",
    },
  ];

  if (loading) {
    return (
      <>
        <style>{`@keyframes shimmer{0%,100%{opacity:1}50%{opacity:.45}}`}</style>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 20 }}>
          {[1, 2, 3].map((i) => (
            <div key={i} style={{ background: "#f1f5f9", borderRadius: 20, height: 130, animation: "shimmer 1.6s ease-in-out infinite" }} />
          ))}
        </div>
      </>
    );
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 20 }}>
      {cards.map((c) => (
        <div key={c.label} style={{
          background:   c.gradient,
          borderRadius: 20,
          padding:      "22px 24px",
          boxShadow:    `0 10px 28px ${c.glow}`,
          position:     "relative",
          overflow:     "hidden",
        }}>
          {/* Decorative blobs */}
          <div style={{ position: "absolute", top: -24, right: -24, width: 90,  height: 90,  borderRadius: "50%", background: "rgba(255,255,255,0.12)" }} />
          <div style={{ position: "absolute", bottom: -16, left: -16, width: 60, height: 60, borderRadius: "50%", background: "rgba(255,255,255,0.07)" }} />

          <div style={{ position: "relative" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span style={{ fontSize: 10, fontWeight: 800, color: "rgba(255,255,255,0.65)", letterSpacing: "0.1em" }}>{c.label}</span>
              <span style={{ fontSize: 22 }}>{c.icon}</span>
            </div>
            <div style={{ fontSize: 42, fontWeight: 900, color: "#fff", lineHeight: 1, letterSpacing: "-0.02em" }}>
              {c.value}
            </div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", marginTop: 7, fontWeight: 500 }}>
              {c.sub}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
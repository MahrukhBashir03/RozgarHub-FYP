"use client";

/**
 * WeeklyChart — receives pre-computed days[] and streak as props.
 * No fetch required. Data computed in AnalyticsTab from the working endpoint.
 */
export default function WeeklyChart({ days = [], streak = 0, loading = false }) {
  const maxCount  = Math.max(...days.map((d) => d.count), 1);
  const totalWeek = days.reduce((s, d) => s + d.count, 0);

  return (
    <div style={{
      background: "#fff",
      borderRadius: 20,
      padding: "24px 28px",
      border: "1.5px solid #e8edf3",
      boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
      marginBottom: 20,
    }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", margin: 0 }}>
            Weekly Performance
          </h3>
          <p style={{ fontSize: 12, color: "#64748b", margin: "4px 0 0" }}>
            {loading
              ? "Loading…"
              : totalWeek === 0
              ? "No jobs completed this week yet"
              : `${totalWeek} job${totalWeek !== 1 ? "s" : ""} completed in the last 7 days`}
          </p>
        </div>

        {streak > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: 7, background: "linear-gradient(135deg,#fef9c3,#fef3c7)", border: "1.5px solid #fde047", borderRadius: 20, padding: "7px 16px", boxShadow: "0 2px 8px rgba(234,179,8,0.2)" }}>
            <span style={{ fontSize: 18 }}>🔥</span>
            <span style={{ fontSize: 13, fontWeight: 800, color: "#92400e" }}>{streak}-day streak</span>
          </div>
        )}
      </div>

      {/* Bars */}
      {loading ? (
        <>
          <style>{`@keyframes shimmer{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
          <div style={{ display: "flex", gap: 8, alignItems: "flex-end", height: 160 }}>
            {[60, 80, 45, 90, 55, 70, 40].map((h, i) => (
              <div key={i} style={{ flex: 1, height: `${h}%`, background: "#f1f5f9", borderRadius: "8px 8px 4px 4px", animation: "shimmer 1.6s ease-in-out infinite" }} />
            ))}
          </div>
        </>
      ) : (
        <div style={{ display: "flex", gap: 8, alignItems: "flex-end", height: 160 }}>
          {days.map((d, i) => {
            const isToday = i === days.length - 1;
            const barH    = d.count > 0 ? Math.max(14, Math.round((d.count / maxCount) * 140)) : 10;

            return (
              <div key={d.date} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 7 }}>
                {/* Count label */}
                <span style={{
                  fontSize: 12, fontWeight: 800, minHeight: 18,
                  color: d.count > 0 ? (isToday ? "#16a34a" : "#475569") : "transparent",
                }}>
                  {d.count || ""}
                </span>

                {/* Bar */}
                <div
                  title={`${isToday ? "Today" : d.label}: ${d.count} job${d.count !== 1 ? "s" : ""}`}
                  style={{
                    width: "100%",
                    height: barH,
                    borderRadius: "8px 8px 3px 3px",
                    background: isToday
                      ? "linear-gradient(180deg,#4ade80 0%,#16a34a 100%)"
                      : d.count > 0
                      ? "linear-gradient(180deg,#a7f3d0 0%,#34d399 100%)"
                      : "#f1f5f9",
                    boxShadow: isToday && d.count > 0
                      ? "0 4px 14px rgba(22,163,74,0.35)"
                      : "none",
                    transition: "height 0.9s cubic-bezier(.4,0,.2,1)",
                    position: "relative",
                  }}
                >
                  {isToday && (
                    <div style={{
                      position: "absolute", top: -5, left: "50%", transform: "translateX(-50%)",
                      width: 8, height: 8, borderRadius: "50%",
                      background: "#16a34a",
                      boxShadow: "0 0 0 3px rgba(22,163,74,0.25)",
                    }} />
                  )}
                </div>

                {/* Day label */}
                <span style={{ fontSize: 11, fontWeight: isToday ? 800 : 500, color: isToday ? "#16a34a" : "#94a3b8" }}>
                  {isToday ? "Today" : d.label}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Legend */}
      <div style={{ display: "flex", gap: 20, marginTop: 20, paddingTop: 16, borderTop: "1px solid #f1f5f9" }}>
        {[
          { swatch: "linear-gradient(135deg,#4ade80,#16a34a)", label: "Today" },
          { swatch: "linear-gradient(135deg,#a7f3d0,#34d399)", label: "Previous days" },
          { swatch: "#f1f5f9",                                 label: "No activity" },
        ].map((l) => (
          <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, background: l.swatch, flexShrink: 0 }} />
            <span style={{ fontSize: 11, color: "#64748b" }}>{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
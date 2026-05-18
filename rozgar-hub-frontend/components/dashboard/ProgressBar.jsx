"use client";

/**
 * ProgressBar — reusable, color-coded by percentage.
 *   0–39%  → red
 *   40–79% → yellow
 *   80–100% → green
 */
export default function ProgressBar({ value = 0, max = 100, showLabel = true }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;

  const color =
    pct >= 80 ? "#16a34a" :
    pct >= 40 ? "#eab308" :
    "#ef4444";

  return (
    <div>
      {showLabel && (
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: "#475569" }}>Progress</span>
          <span style={{ fontSize: 13, fontWeight: 800, color }}>{pct}%</span>
        </div>
      )}
      <div style={{ background: "#e2e8f0", borderRadius: 99, height: 10, overflow: "hidden" }}>
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${color}, ${color}cc)`,
            borderRadius: 99,
            transition: "width 0.8s ease-out",
          }}
        />
      </div>
    </div>
  );
}
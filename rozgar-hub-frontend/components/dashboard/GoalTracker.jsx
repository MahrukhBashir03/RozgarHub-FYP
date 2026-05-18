"use client";

/**
 * GoalTracker — receives goal value and completedToday as props.
 * Goal is controlled by parent (AnalyticsTab) via onGoalChange callback.
 * Saved to localStorage immediately — no backend required.
 */

/* ── SVG circular progress ring ── */
function CircularRing({ value, max, size = 140 }) {
  const pct    = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  const r       = 44;
  const circ    = 2 * Math.PI * r;
  const offset  = circ - (pct / 100) * circ;
  const color   = pct >= 80 ? "#22c55e" : pct >= 40 ? "#eab308" : "#ef4444";
  const track   = pct >= 80 ? "#dcfce7" : pct >= 40 ? "#fef9c3" : "#fee2e2";

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ display: "block", flexShrink: 0 }}>
      <circle cx="50" cy="50" r={r} fill="none" stroke={track}  strokeWidth="10" />
      <circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="10"
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round" transform="rotate(-90 50 50)"
        style={{ transition: "stroke-dashoffset 1.1s cubic-bezier(.4,0,.2,1)" }}
      />
      <text x="50" y="45" textAnchor="middle" fontSize="24" fontWeight="900" fill="#0f172a" fontFamily="inherit">{value}</text>
      <text x="50" y="57" textAnchor="middle" fontSize="9"  fill="#94a3b8"   fontFamily="inherit">of {max}</text>
      <text x="50" y="69" textAnchor="middle" fontSize="10" fill={color} fontWeight="700" fontFamily="inherit">{Math.round(pct)}%</text>
    </svg>
  );
}

function motivationMsg(pct) {
  if (pct >= 100) return { emoji: "🎉", text: "Goal smashed! Excellent work!" };
  if (pct >= 80)  return { emoji: "🔥", text: "Almost there — finish strong!" };
  if (pct >= 40)  return { emoji: "💪", text: "Great progress, keep going!" };
  if (pct > 0)    return { emoji: "⚡", text: "Good start — build momentum!" };
  return            { emoji: "🎯", text: "Complete jobs to hit your goal!" };
}

import { useState } from "react";

export default function GoalTracker({ workerId, goal = 5, completedToday = 0, onGoalChange }) {
  const [input,   setInput]   = useState(String(goal));
  const [editing, setEditing] = useState(false);

  const openEdit  = () => { setInput(String(goal)); setEditing(true); };
  const cancelEdit= () => setEditing(false);

  const saveGoal = () => {
    const parsed = Math.min(50, Math.max(1, Number(input) || 5));
    onGoalChange?.(parsed);
    setEditing(false);
  };

  const pct       = goal > 0 ? Math.min(100, Math.round((completedToday / goal) * 100)) : 0;
  const metGoal   = pct >= 100;
  const remaining = Math.max(0, goal - completedToday);
  const { emoji, text } = motivationMsg(pct);

  return (
    <div style={{
      background:   "#fff",
      borderRadius: 20,
      padding:      "24px 28px",
      border:       metGoal ? "2px solid #22c55e" : "1.5px solid #e8edf3",
      boxShadow:    metGoal ? "0 6px 28px rgba(34,197,94,0.18)" : "0 4px 20px rgba(0,0,0,0.06)",
      marginBottom: 20,
    }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", margin: 0 }}>Daily Goal</h3>
          <p style={{ fontSize: 12, color: "#64748b", margin: "4px 0 0" }}>
            {metGoal ? "You hit your target for today 🎉" : "Track your daily job completion"}
          </p>
        </div>
        <button
          onClick={editing ? cancelEdit : openEdit}
          style={{
            fontSize: 12, fontWeight: 700,
            color:      editing ? "#64748b" : "#16a34a",
            background: editing ? "#f1f5f9" : "#f0fdf4",
            border:     `1.5px solid ${editing ? "#e2e8f0" : "#86efac"}`,
            borderRadius: 20, padding: "6px 16px", cursor: "pointer",
          }}
        >
          {editing ? "✕ Cancel" : "✏️ Edit Goal"}
        </button>
      </div>

      {/* Body */}
      <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
        <CircularRing value={completedToday} max={goal} size={140} />

        <div style={{ flex: 1 }}>
          {/* Motivation pill */}
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            background: metGoal ? "#f0fdf4" : "#f8fafc",
            border: `1px solid ${metGoal ? "#bbf7d0" : "#e2e8f0"}`,
            borderRadius: 12, padding: "10px 14px", marginBottom: 16,
          }}>
            <span style={{ fontSize: 20 }}>{emoji}</span>
            <p style={{ fontSize: 13, fontWeight: 600, color: metGoal ? "#15803d" : "#374151", margin: 0 }}>{text}</p>
          </div>

          {/* Edit input */}
          {editing ? (
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <input
                type="number" min="1" max="50"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && saveGoal()}
                style={{ flex: 1, padding: "11px 14px", borderRadius: 10, border: "2px solid #16a34a", fontSize: 16, fontWeight: 700, outline: "none", color: "#0f172a" }}
              />
              <button onClick={saveGoal}
                style={{ padding: "11px 24px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#22c55e,#16a34a)", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer", boxShadow: "0 4px 12px rgba(22,163,74,0.3)" }}>
                Save
              </button>
            </div>
          ) : (
            /* Stats rows */
            <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
              {[
                { label: "Target",    value: `${goal} jobs`,            color: "#0f172a" },
                { label: "Done",      value: `${completedToday} jobs`,  color: "#16a34a" },
                { label: "Remaining", value: metGoal ? "Done ✓" : `${remaining} jobs`, color: metGoal ? "#16a34a" : "#f59e0b" },
              ].map((row) => (
                <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 10, borderBottom: "1px solid #f1f5f9" }}>
                  <span style={{ fontSize: 13, color: "#64748b", fontWeight: 500 }}>{row.label}</span>
                  <span style={{ fontSize: 14, fontWeight: 800, color: row.color }}>{row.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
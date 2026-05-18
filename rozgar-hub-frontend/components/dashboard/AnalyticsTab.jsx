"use client";
import { useEffect, useState } from "react";
import StatsCards  from "./StatsCards";
import GoalTracker from "./GoalTracker";
import WeeklyChart from "./WeeklyChart";

const API = "http://localhost:5000";

const MILESTONES = [
  { count: 1,  emoji: "🌱", label: "First Job",        color: "#16a34a", bg: "#f0fdf4", border: "#86efac" },
  { count: 5,  emoji: "⭐", label: "5 Jobs Done",       color: "#d97706", bg: "#fffbeb", border: "#fde68a" },
  { count: 10, emoji: "🔥", label: "10 Jobs Done",      color: "#dc2626", bg: "#fff1f2", border: "#fecdd3" },
  { count: 25, emoji: "💎", label: "25 Jobs Done",      color: "#7c3aed", bg: "#f5f3ff", border: "#ddd6fe" },
  { count: 50, emoji: "🏆", label: "50 Jobs — Legend!", color: "#0369a1", bg: "#eff6ff", border: "#bfdbfe" },
];

function rankLabel(total) {
  if (total >= 50) return { text: "Legend",         emoji: "🏆" };
  if (total >= 25) return { text: "Diamond Pro",    emoji: "💎" };
  if (total >= 10) return { text: "Rising Star",    emoji: "🔥" };
  if (total >= 5)  return { text: "On Fire",        emoji: "⭐" };
  if (total >= 1)  return { text: "Getting Started",emoji: "🌱" };
  return              { text: "Ready to Begin",    emoji: "🚀" };
}

/* ── Compute 7-day buckets from a flat array of jobs ── */
function buildWeeklyDays(completedJobs) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return Array.from({ length: 7 }, (_, i) => {
    const dayStart = new Date(today);
    dayStart.setDate(dayStart.getDate() - (6 - i));
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);

    const count = completedJobs.filter((j) => {
      const d = new Date(j.updatedAt || j.createdAt);
      return d >= dayStart && d < dayEnd;
    }).length;

    return {
      date:  dayStart.toISOString().split("T")[0],
      label: dayStart.toLocaleDateString("en-US", { weekday: "short" }),
      count,
    };
  });
}

/* ── Compute streak from days array + goalCount ── */
function buildStreak(days, goalCount) {
  const todayStr = new Date().toISOString().split("T")[0];
  let streak = 0;
  for (let i = days.length - 1; i >= 0; i--) {
    const isToday = days[i].date === todayStr;
    if (isToday && days[i].count === 0) continue;
    if (days[i].count >= goalCount) streak++;
    else break;
  }
  return streak;
}

export default function AnalyticsTab({ user }) {
  const workerId  = user?.id || user?._id;
  const firstName = (user?.name || "Worker").split(" ")[0];

  const [stats,   setStats]   = useState(null);
  const [days,    setDays]    = useState([]);
  const [streak,  setStreak]  = useState(0);
  const [goal,    setGoal]    = useState(5);   // controlled here, passed down
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  /* ── Load goal from localStorage (instant, no backend needed) ── */
  useEffect(() => {
    if (!workerId) return;
    try {
      const today   = new Date().toISOString().split("T")[0];
      const saved   = JSON.parse(localStorage.getItem(`wgoal_${workerId}_${today}`) || "null");
      if (saved?.goalCount) setGoal(saved.goalCount);
    } catch (_) {}

    /* Also try the analytics goal endpoint (if backend restarted) */
    fetch(`${API}/api/worker-analytics/goal?workerId=${workerId}`)
      .then((r) => r.json())
      .then((d) => { if (d?.goalCount) setGoal(d.goalCount); })
      .catch(() => {});
  }, [workerId]);

  /* ── Fetch job data from the EXISTING working endpoint ── */
  useEffect(() => {
    if (!workerId) return;
    setLoading(true);
    setError(null);

    const token   = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    fetch(`${API}/api/job-requests/worker/${workerId}`, { headers })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((jobs) => {
        if (!Array.isArray(jobs)) throw new Error("Invalid response");

        const now        = new Date();
        const todayStart = new Date(now); todayStart.setHours(0, 0, 0, 0);
        const weekStart  = new Date(todayStart); weekStart.setDate(weekStart.getDate() - 6);

        const completed      = jobs.filter((j) => j.status === "completed");
        const completedToday = completed.filter((j) => new Date(j.updatedAt || j.createdAt) >= todayStart).length;
        const completedWeek  = completed.filter((j) => new Date(j.updatedAt || j.createdAt) >= weekStart).length;
        const totalCompleted = completed.length;
        const activeJobs     = jobs.filter((j) => j.status === "confirmed").length;

        const weekDays = buildWeeklyDays(completed);
        const str      = buildStreak(weekDays, goal);

        setStats({ completedToday, completedWeek, totalCompleted, activeJobs });
        setDays(weekDays);
        setStreak(str);
        setLoading(false);
      })
      .catch((err) => {
        console.error("[AnalyticsTab] fetch error:", err.message);
        setError("Could not load analytics. Check your connection.");
        setLoading(false);
      });
  }, [workerId]);           // ← re-run only on workerId change (goal updates handled separately)

  /* Recompute streak when goal changes (without re-fetching) */
  useEffect(() => {
    if (days.length > 0) setStreak(buildStreak(days, goal));
  }, [goal, days]);

  const total  = stats?.totalCompleted ?? 0;
  const rank   = rankLabel(loading ? -1 : total);
  const nextMs = MILESTONES.find((m) => m.count > total);

  /* ── Save goal to localStorage + try analytics API ── */
  const handleGoalChange = (newGoal) => {
    setGoal(newGoal);
    try {
      const today = new Date().toISOString().split("T")[0];
      localStorage.setItem(`wgoal_${workerId}_${today}`, JSON.stringify({ goalCount: newGoal }));
    } catch (_) {}
    /* Fire-and-forget to analytics backend (works after restart) */
    fetch(`${API}/api/worker-analytics/goal`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workerId, goalCount: newGoal }),
    }).catch(() => {});
  };

  if (error) {
    return (
      <div style={{ maxWidth: 900, margin: "0 auto", padding: 40, textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
        <p style={{ fontSize: 16, fontWeight: 700, color: "#dc2626" }}>{error}</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>

      {/* ══════════════ HERO BANNER ══════════════ */}
      <div style={{
        background: "linear-gradient(135deg,#064e3b 0%,#065f46 55%,#047857 100%)",
        borderRadius: 22,
        padding: "28px 32px",
        marginBottom: 22,
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{ position: "absolute", top: -50,  right: -50,  width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />
        <div style={{ position: "absolute", bottom: -30, right: 120, width: 130, height: 130, borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />
        <div style={{ position: "absolute", top: 20,  right: 200, width: 60,  height: 60,  borderRadius: "50%", background: "rgba(52,211,153,0.15)" }} />

        <div style={{ position: "relative", zIndex: 1, display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
          <div>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", margin: 0, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>
              {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
            </p>
            <h1 style={{ fontSize: 26, fontWeight: 900, color: "#fff", margin: "8px 0 4px", letterSpacing: "-0.01em" }}>
              Productivity Dashboard
            </h1>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.55)", margin: 0 }}>
              Keep going, <span style={{ color: "#34d399", fontWeight: 700 }}>{firstName}</span>!
            </p>
            {!loading && (
              <div style={{ marginTop: 14, display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 20, padding: "7px 18px" }}>
                <span style={{ fontSize: 16 }}>{rank.emoji}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{rank.text}</span>
              </div>
            )}
          </div>

          {/* Total counter */}
          <div style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.18)", borderRadius: 18, padding: "18px 26px", textAlign: "center", backdropFilter: "blur(10px)", minWidth: 120 }}>
            {loading
              ? <div style={{ width: 60, height: 48, background: "rgba(255,255,255,0.1)", borderRadius: 8 }} />
              : <div style={{ fontSize: 48, fontWeight: 900, color: "#34d399", lineHeight: 1, letterSpacing: "-0.03em" }}>{total}</div>
            }
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", fontWeight: 700, marginTop: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Total Completed
            </div>
          </div>
        </div>

        {/* Next milestone bar */}
        {!loading && nextMs && total > 0 && (
          <div style={{ position: "relative", zIndex: 1, marginTop: 18, display: "flex", alignItems: "center", gap: 12, background: "rgba(255,255,255,0.08)", borderRadius: 12, padding: "10px 16px" }}>
            <span style={{ fontSize: 18 }}>{nextMs.emoji}</span>
            <div style={{ flex: 1 }}>
              <div style={{ height: 5, background: "rgba(255,255,255,0.15)", borderRadius: 99, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${Math.round((total / nextMs.count) * 100)}%`, background: "linear-gradient(90deg,#34d399,#22c55e)", borderRadius: 99, transition: "width 1s ease-out" }} />
              </div>
            </div>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", fontWeight: 600, whiteSpace: "nowrap" }}>
              {nextMs.count - total} more to <strong style={{ color: "#fff" }}>{nextMs.label}</strong>
            </span>
          </div>
        )}
      </div>

      {/* ══════════════ STATS CARDS ══════════════ */}
      <StatsCards stats={stats} loading={loading} />

      {/* ══════════════ GOAL TRACKER ══════════════ */}
      <GoalTracker
        workerId={workerId}
        goal={goal}
        completedToday={stats?.completedToday ?? 0}
        onGoalChange={handleGoalChange}
      />

      {/* ══════════════ WEEKLY CHART ══════════════ */}
      <WeeklyChart days={days} streak={streak} loading={loading} />

      {/* ══════════════ ACHIEVEMENTS ══════════════ */}
      <AchievementsCard total={total} loading={loading} />
    </div>
  );
}

/* ── Achievements grid ── */
function AchievementsCard({ total, loading }) {
  return (
    <div style={{ background: "#fff", borderRadius: 20, padding: "24px 28px", border: "1.5px solid #e8edf3", boxShadow: "0 4px 20px rgba(0,0,0,0.06)", marginBottom: 20 }}>
      <div style={{ marginBottom: 18 }}>
        <h3 style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", margin: 0 }}>Achievements</h3>
        <p style={{ fontSize: 12, color: "#64748b", margin: "4px 0 0" }}>Complete jobs to unlock badges</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 12 }}>
        {MILESTONES.map((m) => {
          const earned = !loading && total >= m.count;
          return (
            <div key={m.count} title={earned ? `Unlocked: ${m.label}` : `${m.count - Math.min(total, m.count)} more jobs to unlock`}
              style={{ background: earned ? m.bg : "#f8fafc", border: `1.5px solid ${earned ? m.border : "#e2e8f0"}`, borderRadius: 16, padding: "16px 10px", textAlign: "center", opacity: earned ? 1 : 0.38, transition: "all 0.35s", cursor: "default", position: "relative" }}>
              {earned && <div style={{ position: "absolute", inset: 0, borderRadius: 16, boxShadow: `0 0 0 2px ${m.border}`, pointerEvents: "none" }} />}
              <div style={{ fontSize: 30, marginBottom: 8 }}>{m.emoji}</div>
              <div style={{ fontSize: 11, fontWeight: 700, lineHeight: 1.3, color: earned ? m.color : "#94a3b8" }}>{m.label}</div>
              {earned && (
                <div style={{ marginTop: 8, display: "inline-block", fontSize: 9, fontWeight: 800, color: m.color, background: m.bg, border: `1px solid ${m.border}`, borderRadius: 20, padding: "2px 8px", letterSpacing: "0.05em" }}>
                  UNLOCKED
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
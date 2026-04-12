"use client";

import { useEffect, useState } from "react";
import { Zap } from "lucide-react";

export default function UserPointsDisplay() {
  const [points, setPoints] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPoints();
    // Refresh points every 5 seconds
    const interval = setInterval(fetchPoints, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchPoints = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/profile`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch points");

      const data = await response.json();
      setPoints(data.data?.points || 0);
      localStorage.setItem("user", JSON.stringify(data.data));
      setLoading(false);
    } catch (err) {
      console.error("Error fetching points:", err);
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2 bg-gradient-to-r from-orange-500/20 to-yellow-500/20 border border-orange-500/30 rounded-lg px-4 py-2">
      <Zap className="text-orange-400" size={20} />
      <div>
        <p className="text-xs text-gray-300">Points</p>
        <p className="text-lg font-bold text-orange-400">{loading ? "..." : points}</p>
      </div>
    </div>
  );
}

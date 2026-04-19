"use client";
import { useEffect } from "react";

export default function SuppressWarnings() {
  useEffect(() => {
    const orig = console.error.bind(console);
    console.error = (...args) => {
      if (typeof args[0] === "string" && args[0].includes("DialogContent")) return;
      orig(...args);
    };
  }, []);

  return null;
}
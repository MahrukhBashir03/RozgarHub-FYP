"use client";
import { useEffect } from "react";

let originalError = null;
let originalWarn  = null;

export default function SuppressWarnings() {
  useEffect(() => {
    if (originalError) return;

    originalError = console.error.bind(console);
    originalWarn  = console.warn.bind(console);

    console.error = (...args) => {
      const msg = typeof args[0] === "string" ? args[0] : "";
      if (msg.includes("DialogContent"))           return;
      if (msg.includes("[[[bp:init]]"))            return;
      if (msg.includes("Only workers can trigger")) return; // ← suppress SOS role error
      originalError(...args);
    };

    console.warn = (...args) => {
      const msg = typeof args[0] === "string" ? args[0] : "";
      if (msg.includes("Only workers can trigger")) return;
      originalWarn(...args);
    };

    return () => {
      console.error = originalError ?? console.error;
      console.warn  = originalWarn  ?? console.warn;
      originalError = null;
      originalWarn  = null;
    };
  }, []);

  return null;
}
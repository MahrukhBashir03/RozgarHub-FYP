"use client";

import "./globals.css";
import "leaflet/dist/leaflet.css";
import { usePathname } from "next/navigation";

import { LanguageProvider } from "./context/LanguageContext";
import Navbar from "../components/Navbar";
import VoiceAssistant from "../components/VoiceBot";
import BotpressChat from "../components/BotpressChat";

// If you have an auth context, import it here:
// import { useAuth } from "./context/AuthContext";

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const showNavbar = !pathname.includes('/employer/profile') && !pathname.includes('/worker/profile');

  // ── If you have auth context, replace this with real user data ──
  // const { user } = useAuth();
  // Then use: userRole={user?.role} userName={user?.name} userId={user?.id}

  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-br from-[#1e3a8a] via-[#172554] to-[#0f172a]">
        <LanguageProvider>
          {/* Navbar */}
          {showNavbar && <Navbar />}

          {/* Main content */}
          <main className="">{children}</main>

          {/* Voice Assistant — floating bottom-right mic button */}
          <VoiceAssistant
            userRole="worker"   // replace with: {user?.role ?? "worker"}
            userName="User"     // replace with: {user?.name ?? "User"}
            userId="guest"      // replace with: {user?.id   ?? "guest"}
          />

          {/* Botpress visual webchat bubble — unchanged */}
          <BotpressChat />
        </LanguageProvider>
      </body>
    </html>
  );
}
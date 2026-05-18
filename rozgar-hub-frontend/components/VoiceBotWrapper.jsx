"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";

const VoiceBot = dynamic(() => import("./VoiceBot"), { ssr: false });

const isAuthPage = (path) =>
  path === "/" || path.startsWith("/auth/");

export default function VoiceBotWrapper() {
  const [userInfo, setUserInfo] = useState(null);
  const pathname = usePathname();

  const readUserInfo = () => {
    try {
      const raw = localStorage.getItem("user");
      if (raw) {
        const u = JSON.parse(raw);
        setUserInfo({
          userId:    u.id   ?? u._id  ?? "guest",
          userName:  u.name ?? u.username ?? "User",
          userRole:  u.role === "employer" ? "employer" : "worker",
          userToken: localStorage.getItem("token") ?? undefined,
        });
      } else {
        setUserInfo(null);
      }
    } catch (_) {}
  };

  useEffect(() => {
    readUserInfo();
    // storage fires on other tabs; rozgarhub-login fires on the same tab after login
    window.addEventListener("storage", readUserInfo);
    window.addEventListener("focus", readUserInfo);
    window.addEventListener("rozgarhub-login", readUserInfo);
    window.addEventListener("rozgarhub-logout", () => setUserInfo(null));
    return () => {
      window.removeEventListener("storage", readUserInfo);
      window.removeEventListener("focus", readUserInfo);
      window.removeEventListener("rozgarhub-login", readUserInfo);
      window.removeEventListener("rozgarhub-logout", () => setUserInfo(null));
    };
  }, []);

  // Don't render on auth / landing pages, or when no user is logged in
  if (isAuthPage(pathname) || !userInfo) return null;

  return (
    <VoiceBot
      userId={userInfo.userId}
      userName={userInfo.userName}
      userRole={userInfo.userRole}
      userToken={userInfo.userToken}
    />
  );
}

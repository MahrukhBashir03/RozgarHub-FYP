"use client";

import Script from "next/script";

const botpressWebchatUrl = process.env.NEXT_PUBLIC_BOTPRESS_CHAT_WEBCHAT_URL;
const botpressConfigUrl = process.env.NEXT_PUBLIC_BOTPRESS_CHAT_CONFIG_URL;

export default function BotpressChat() {
  if (!botpressWebchatUrl || !botpressConfigUrl) {
    return null;
  }

  return (
    <>
      <Script src={botpressWebchatUrl} strategy="afterInteractive" />
      <Script src={botpressConfigUrl} strategy="afterInteractive" />
    </>
  );
}

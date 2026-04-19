import "./globals.css";
import { LanguageProvider } from "./context/LanguageContext";
import "leaflet/dist/leaflet.css";
import Script from "next/script";
import SuppressWarnings from "../components/SuppressWarnings";

export const metadata = {
  title: "Rozgar Hub",
  description: "Connect with Skilled Workers Instantly",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Botpress Webchat v3.6 */}
        <Script
          id="bp-inject"
          src="https://cdn.botpress.cloud/webchat/v3.6/inject.js"
          strategy="beforeInteractive"
        />
        <Script
          id="bp-config"
          src="https://files.bpcontent.cloud/2026/02/04/14/20260204141438-451YMN3D.js"
          strategy="afterInteractive"
          defer
        />
      </head>

      <body className="min-h-screen bg-gradient-to-br from-[#1e3a8a] via-[#172554] to-[#0f172a]">

        {/* Suppresses Botpress internal Radix UI DialogTitle warning */}
        <SuppressWarnings />

        <LanguageProvider>
          {children}
        </LanguageProvider>

      </body>
    </html>
  );
}
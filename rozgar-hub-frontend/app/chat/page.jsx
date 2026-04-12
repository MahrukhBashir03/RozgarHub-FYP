"use client";
import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { Send, MessageCircle, Globe } from "lucide-react";

export default function ChatPage() {
  const [user, setUser] = useState(null);
  const [chatWith, setChatWith] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [lang, setLang] = useState("en");
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    const u = localStorage.getItem("user");
    if (u) {
      const p = JSON.parse(u);
      setUser(p);
    }

    const urlParams = new URLSearchParams(window.location.search);
    const withId = urlParams.get("with");
    if (withId) setChatWith(withId);

    // Use existing socket if available
    let socket = window._rozgarSocket;
    if (!socket) {
      // Fallback to new socket
      socket = io("http://localhost:5000");
      window._rozgarSocket = socket;
    }
    socketRef.current = socket;

    socket.on("connect", () => setIsConnected(true));
    socket.on("disconnect", () => setIsConnected(false));

    socket.on("receive_message", (data) => {
      setMessages(prev => [...prev, data]);
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("receive_message");
    };
  }, []);

  useEffect(() => {
    if (user && socketRef.current) {
      socketRef.current.emit("join", user.id);
    }
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!message.trim() || !user || !chatWith || !socketRef.current) return;

    const msgData = {
      from: user.id,
      to: chatWith,
      message: message.trim(),
      timestamp: new Date().toISOString(),
    };

    socketRef.current.emit("send_message", msgData);
    setMessages(prev => [...prev, { ...msgData, from: user.id }]);
    setMessage("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  if (!user) return <div className="p-10 text-center">{lang === "ur" ? "براہ کرم پہلے لاگ ان کریں" : "Please login first"}</div>;

  const LANG_STRINGS = {
    en: {
      "Chat": "Chat",
      "Connected": "Connected",
      "Disconnected": "Disconnected",
      "No messages yet": "No messages yet. Start chatting!",
      "Type a message...": "Type a message..."
    },
    ur: {
      "Chat": "چیٹ",
      "Connected": "منسلک",
      "Disconnected": "منقطع",
      "No messages yet": "ابھی کوئی پیغام نہیں۔ بات شروع کریں!",
      "Type a message...": "پیغام لکھیں..."
    }
  };

  const t = LANG_STRINGS[lang];

  return (
    <div className="max-w-2xl mx-auto h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MessageCircle className="w-6 h-6 text-blue-600" />
          <h1 className="text-xl font-semibold">{t["Chat"]}</h1>
          <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`} />
          <span className="text-sm text-gray-500">
            {isConnected ? t["Connected"] : t["Disconnected"]}
          </span>
        </div>
        <button 
          onClick={() => setLang(lang === "en" ? "ur" : "en")}
          className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition text-sm font-semibold">
          <Globe className="w-4 h-4" />
          {lang === "en" ? "اردو" : "EN"}
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            {t["No messages yet"]}
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.from === user.id ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-xs px-4 py-2 rounded-lg ${
                  msg.from === user.id
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-800 border"
                }`}
              >
                <p>{msg.message}</p>
                <span className="text-xs opacity-70 mt-1 block">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={t["Type a message..."]}
            className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={sendMessage}
            disabled={!message.trim()}
            className="bg-blue-600 text-white rounded-full p-2 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
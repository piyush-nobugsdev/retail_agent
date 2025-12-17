"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function WhatsAppPage() {
  const searchParams = useSearchParams();
  const customerId = searchParams.get("customerId");

  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement | null>(null);

  /* 🔹 Auto scroll */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!text.trim() || !customerId) return;

    const userText = text;
    setMessages((prev) => [...prev, { from: "user", text: userText }]);
    setText("");

    const res = await fetch("http://localhost:5000/api/whatsapp/message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerId,
        message: userText
      })
    });

    const data = await res.json();
    setMessages((prev) => [...prev, { from: "bot", text: data.reply }]);
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "#efeae2",
       fontFamily: "var(--font-sans)"

      }}
    >
      {/* 🟢 HEADER */}
      <div
        style={{
          height: 56,
          background: "#075E54",
          color: "white",
          display: "flex",
          alignItems: "center",
          padding: "0 16px",
          fontWeight: 600
        }}
      >
        Lumina • WhatsApp
      </div>

      {/* 💬 CHAT AREA */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "16px",
          backgroundImage:
            "linear-gradient(#efeae2, #efeae2)"
        }}
      >
        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              justifyContent: m.from === "user" ? "flex-end" : "flex-start",
              marginBottom: 10
            }}
          >
            <div
              style={{
                background: m.from === "user" ? "#dcf8c6" : "#ffffff",
                padding: "8px 12px",
                borderRadius: 8,
                maxWidth: "75%",
                fontSize: 14,
                lineHeight: 1.4,
                boxShadow: "0 1px 1px rgba(0,0,0,0.1)"
              }}
            >
              {m.text}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* ⌨️ INPUT BAR */}
      <div
        style={{
          padding: 10,
          background: "#f0f0f0",
          display: "flex",
          gap: 8,
          alignItems: "center"
        }}
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type a message"
          style={{
            flex: 1,
            padding: "10px 14px",
            borderRadius: 20,
            border: "1px solid #ccc",
            outline: "none",
            fontSize: 14
          }}
        />
        <button
          onClick={sendMessage}
          style={{
            background: "#25D366",
            color: "white",
            border: "none",
            padding: "10px 16px",
            borderRadius: 20,
            fontWeight: 600,
            cursor: "pointer"
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}

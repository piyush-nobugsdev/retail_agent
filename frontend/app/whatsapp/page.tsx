"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function WhatsAppPage() {
  const searchParams = useSearchParams();
  const customerId = searchParams.get("customerId");

  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");

 const sendMessage = async () => {
  if (!text.trim() || !customerId) return;

  const userMsg = { from: "user", text };
  setMessages((prev) => [...prev, userMsg]);
  setText("");

  const res = await fetch("http://localhost:5000/api/whatsapp/message", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      customerId,
      message: text // ✅ FIXED
    })
  });

  const data = await res.json();

  const botMsg = { from: "bot", text: data.reply };
  setMessages((prev) => [...prev, botMsg]);
};

  return (
    <main
      style={{
        maxWidth: 420,
        margin: "auto",
        padding: 20,
        fontFamily: "Arial"
      }}
    >
      <h2 style={{ textAlign: "center" }}>WhatsApp Sales Assistant</h2>

      <div
        style={{
          height: 420,
          overflowY: "auto",
          background: "#46454dff",
          padding: 10,
          borderRadius: 8,
          marginBottom: 10
        }}
      >
        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              textAlign: m.from === "user" ? "right" : "left",
              marginBottom: 8
            }}
          >
            <span
              style={{
                display: "inline-block",
                background: m.from === "user" ? "#0e7e4aff" : "#fff",
                padding: "8px 12px",
                borderRadius: 10,
                maxWidth: "80%"
              }}
            >
              {m.text}
            </span>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 6 }}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message"
          style={{ flex: 1, padding: 8 }}
        />
        <button
          onClick={sendMessage}
          style={{
            background: "#11a949ff",
            color: "white",
            border: "none",
            padding: "8px 14px",
            borderRadius: 6
          }}
        >
          Send
        </button>
      </div>
    </main>
  );
}

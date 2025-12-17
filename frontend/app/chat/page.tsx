"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function ChatPage() {
  const searchParams = useSearchParams();
  const customerId = searchParams.get("customerId");

  const [customer, setCustomer] = useState<any>(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<
    { role: "user" | "agent"; text: string }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  /* 🔹 Load customer */
  useEffect(() => {
    if (!customerId) return;

    fetch("http://localhost:5000/api/worker/customers")
      .then((res) => res.json())
      .then((data) => {
        const found = data.find((c: any) => c.customer_id === customerId);
        setCustomer(found);

        setMessages([
          {
            role: "agent",
            text: `Hi ${found?.name}! I'm Lumina, your personal beauty consultant. How can I help you today?`
          }
        ]);
      });
  }, [customerId]);

  /* 🔹 Send message */
  const sendMessage = async () => {
    if (!message.trim()) return;

    const userMsg = message;
    setMessage("");
    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/agent/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: customerId, message: userMsg })
      });

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "agent",
          text:
            typeof data.reply === "string"
              ? data.reply
              : "I've found some great options for you!"
        }
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "agent", text: "Something went wrong. Please try again." }
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!customer) return null;

  return (
    <main style={{ minHeight: "100vh", background: "#faf7f2", padding: 32 }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: 32,
          maxWidth: 1200,
          margin: "0 auto"
        }}
      >
        {/* 💬 CHAT PANEL */}
        <div
          style={{
            background: "white",
            borderRadius: 20,
            display: "flex",
            flexDirection: "column",
            boxShadow: "0 10px 30px rgba(0,0,0,0.05)"
          }}
        >
          <div style={{ padding: 24, borderBottom: "1px solid #eee" }}>
            <h2 style={{ margin: 0 }}>Lumina</h2>
            <p style={{ color: "#777", fontSize: 13 }}>
              Your Beauty Consultant
            </p>
          </div>

          <div
            style={{
              flex: 1,
              padding: 24,
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: 12
            }}
          >
            {messages.map((m, i) => (
              <div
                key={i}
                style={{
                  maxWidth: "70%",
                  alignSelf: m.role === "agent" ? "flex-start" : "flex-end",
                  background:
                    m.role === "agent" ? "#f5eef0" : "#e8d6c7",
                  padding: "10px 14px",
                  borderRadius: 14,
                  fontSize: 14
                }}
              >
                {m.text}
              </div>
            ))}
          </div>

          <div
            style={{
              padding: 16,
              borderTop: "1px solid #eee",
              display: "flex",
              gap: 12
            }}
          >
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Ask me anything about beauty..."
              style={{
                flex: 1,
                padding: 12,
                borderRadius: 12,
                border: "1px solid #ddd"
              }}
            />
            <button
              onClick={sendMessage}
              disabled={loading}
              style={{
                padding: "12px 18px",
                borderRadius: 12,
                background: "#d6b8a6",
                color: "white",
                border: "none"
              }}
            >
              {loading ? "…" : "Send"}
            </button>
          </div>
        </div>

        {/* 🧍 RIGHT PANEL */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div>
            <h1 style={{ fontFamily: "Georgia", fontSize: 36 }}>
              Hello, {customer.name}
            </h1>
            <p style={{ color: "#666" }}>
              As a <strong>{customer.loyalty_tier}</strong> member, you get
              personalized recommendations.
            </p>
          </div>

          {/* Cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 16
            }}
          >
            <Card
              title="Products"
              subtitle="Browse collection"
              onClick={() =>
                window.open("https://fresh-face-shop.lovable.app", "_blank")
              }
            />

            <Card
              title="Latest Release"
              subtitle="New arrivals"
              onClick={() =>
                window.open(
                  "https://latestreleaselumina.lovable.app",
                  "_blank"
                )
              }
            />

            <Card
              title="Profile"
              subtitle="View details"
              onClick={() => setShowProfile(!showProfile)}
            />

            <Card
              title="Offers"
              subtitle="Exclusive deals"
              onClick={() =>
                window.open("https://lipstick1.lovable.app", "_blank")
              }
            />
          </div>

          {showProfile && (
            <div
              style={{
                background: "white",
                borderRadius: 16,
                padding: 16,
                boxShadow: "0 6px 20px rgba(0,0,0,0.05)"
              }}
            >
              <p><strong>Name:</strong> {customer.name}</p>
              <p><strong>Age:</strong> {customer.age ?? "—"}</p>
              <p><strong>Skin Type:</strong> {customer.skin_type ?? "—"}</p>
              <p><strong>Tier:</strong> {customer.loyalty_tier}</p>
            </div>
          )}

          {/* WhatsApp */}
          <button
            onClick={() =>
              window.location.href = `/whatsapp?customerId=${customerId}`
            }
            style={{
              marginTop: 12,
              background: "#25D366",
              color: "white",
              padding: 14,
              borderRadius: 14,
              border: "none",
              fontWeight: 600
            }}
          >
            Continue on WhatsApp
          </button>
        </div>
      </div>
    </main>
  );
}

function Card({
  title,
  subtitle,
  onClick
}: {
  title: string;
  subtitle: string;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        background: "white",
        borderRadius: 16,
        padding: 16,
        cursor: "pointer",
        boxShadow: "0 6px 20px rgba(0,0,0,0.05)"
      }}
    >
      <h4 style={{ margin: 0 }}>{title}</h4>
      <p style={{ marginTop: 4, fontSize: 13, color: "#777" }}>
        {subtitle}
      </p>
    </div>
  );
}

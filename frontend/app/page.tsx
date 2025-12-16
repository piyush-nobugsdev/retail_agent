"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  
   // 🔹 Load customers for dropdown
  useEffect(() => {
    fetch("http://localhost:5000/api/worker/customers")
      .then((res) => res.json())
      .then((data) => {
        setCustomers(data);
        if (data.length > 0) {
          setSelectedCustomer(data[0].customer_id);
        }
      });
  }, []);
  
  const sendMessage = async () => {
    if (!message.trim() || !selectedCustomer) return;

    setLoading(true);
    setReply("");

    try {
      const res = await fetch("http://localhost:5000/api/agent/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ message, userId: selectedCustomer})
      });

      const data = await res.json();
      setReply(data.reply);
      setMessage("");
    } catch (err) {
      setReply("Error contacting agent");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ padding: 40, maxWidth: 600 }}>
      <h1>Retail AI Agent</h1>
      {/* 👤 Customer Selector */}
      <label>
        Customer:
        <select
          value={selectedCustomer}
          onChange={(e) => setSelectedCustomer(e.target.value)}
          style={{ marginLeft: 10 }}
        >
          {customers.map((c: any) => (
            <option key={c.customer_id} value={c.customer_id}>
              {c.name} ({c.loyalty_tier})
            </option>
          ))}
        </select>
      </label>

      <br /><br />

      <textarea
        rows={4}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Ask me about products, availability, or offers..."
        style={{ width: "100%", marginBottom: 10 }}
      />

      <button onClick={sendMessage} disabled={loading}>
        {loading ? "Thinking..." : "Send"}
      </button>

      {reply && (
        <div style={{ marginTop: 20 }}>
          <strong>Agent:</strong>

          {/* TEXT RESPONSE */}
          {typeof reply === "string" && <p>{reply}</p>}

          {/* PRODUCT LIST RESPONSE */}
          {Array.isArray(reply) && (
            <div style={{ marginTop: 10 }}>
              {reply.map((product) => (
                <div
                  key={product.sku}
                  style={{
                    border: "1px solid #ddd",
                    borderRadius: 8,
                    padding: 12,
                    marginBottom: 10
                  }}
                >
                  <h3>{product.name}</h3>
                  <p>
                    <strong>Brand:</strong> {product.brand}
                  </p>
                  <p>
                    <strong>Price:</strong> ₹{product.price}
                  </p>
                  <p>
                    <strong>Skin Type:</strong>{" "}
                    {product.attributes.skinType.join(", ")}
                  </p>
                  <p>
                    <strong>Concern:</strong>{" "}
                    {product.attributes.skinConcern.join(", ")}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </main>
  );
}

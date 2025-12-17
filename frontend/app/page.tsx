"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const router = useRouter();

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

  return (
    <main style={{ textAlign: "center", width: "100%" }}>
      {/* HERO */}
      <h1 style={{ fontSize: 48, marginBottom: 8 }}>Welcome to Lumina</h1>
      <p style={{ opacity: 0.85, marginBottom: 40 }}>
        Your intelligent beauty retail assistant
      </p>

      {/* WHITE CARD */}
      <div
        style={{
          background: "#ffffff",
          color: "#000",
          borderRadius: 12,
          padding: 30,
          width: 360,
          margin: "0 auto",
          boxShadow: "0 20px 40px rgba(0,0,0,0.25)"
        }}
      >
        <p style={{ marginBottom: 10, fontWeight: 600 }}>
          Choose Profile
        </p>

        <select
          value={selectedCustomer}
          onChange={(e) => setSelectedCustomer(e.target.value)}
          style={{
            width: "100%",
            padding: 10,
            borderRadius: 6,
            border: "1px solid #ccc",
            marginBottom: 20
          }}
        >
          {customers.map((c) => (
            <option key={c.customer_id} value={c.customer_id}>
              {c.name} • {c.loyalty_tier}
            </option>
          ))}
        </select>

        <button
          onClick={() =>
            router.push(`/chat?customerId=${selectedCustomer}`)
          }
          style={{
            width: "100%",
            padding: 12,
            background: "#0f172a",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            fontWeight: 600,
            cursor: "pointer"
          }}
        >
          Meet Lumina
        </button>
      </div>
    </main>
  );
}



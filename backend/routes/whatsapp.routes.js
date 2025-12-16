import express from "express";
import { runLLMWithTools } from "../services/llm.service.js";
import { productSearchTool } from "../tools/product.tool.js";
import { searchProducts } from "../services/product.service.js";
import { getMemory, updateMemory } from "../services/memory.service.js";


const router = express.Router();

/**
 * WhatsApp-style chat endpoint
 * Shares SAME memory as web agent
 */
router.post("/message", async (req, res) => {
  try {
    const { message, customerId } = req.body;

    if (!message || !customerId) {
      return res.status(400).json({ error: "message and customerId required" });
    }

    // 🧠 Load shared memory
    const memory = getMemory(customerId);

    const messages = [
      {
        role: "system",
        content: `
You are a WhatsApp beauty sales assistant.
Short replies. Friendly tone.

Known user preferences:
${JSON.stringify(memory, null, 2)}
        `
      },
      { role: "user", content: message }
    ];

    const response = await runLLMWithTools({
      messages,
      tools: [productSearchTool]
    });

    const toolCall = response.message?.tool_calls?.[0];

    // 🛒 Product search
    if (toolCall) {
      const args = JSON.parse(toolCall.function.arguments);
      const products = searchProducts(args);

      const text =
        products.length === 0
          ? "I couldn’t find matching products 😕"
          : products
              .slice(0, 3)
              .map(
                (p) =>
                  `✨ *${p.name}*\n₹${p.price}\nGood for: ${p.attributes.skinConcern.join(
                    ", "
                  )}`
              )
              .join("\n\n");

      return res.json({ reply: text });
    }

    const text = response.message?.content || "No response";

    // 🧠 Very basic memory update
    if (message.toLowerCase().includes("oily")) {
      updateMemory(customerId, { skinType: "oily" });
    }

    if (message.toLowerCase().includes("dry")) {
      updateMemory(customerId, { skinType: "dry" });
    }

    res.json({ reply: text });
  } catch (err) {
    console.error("WhatsApp agent error:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;

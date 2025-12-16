import express from "express";
import { runLLMWithTools } from "../services/llm.service.js";
import { productSearchTool } from "../tools/product.tool.js";
import { searchProducts } from "../services/product.service.js";
import { getMemory, updateMemory } from "../services/memory.service.js";
import { getCustomerById } from "../services/customer.service.js";
import { extractUserMemory } from "../services/llm.service.js";

const router = express.Router();

router.post("/chat", async (req, res) => {
  try {
    const { message, userId = "web_guest" } = req.body;

    // 1️⃣ Load user memory (cross-channel)
    const customer = getCustomerById(userId);
const memory = getMemory(userId);
// After receiving user message


// 1️⃣ Extract new memory from this message
const extractedMemory = await extractUserMemory({
  message,
  existingMemory: memory
});

// 2️⃣ Store it if something meaningful exists
if (Object.keys(extractedMemory).length > 0) {
  updateMemory(userId, extractedMemory);
}

    const messages = [
        {
  role: "system",
  content: `
You are a top-tier retail sales assistant for a beauty brand.

Customer Profile:
${customer ? JSON.stringify(customer, null, 2) : "Unknown customer"}

Conversation Memory:
${JSON.stringify(memory, null, 2)}

Rules:
- Personalize recommendations
- Remember preferences across turns
- Ask clarifying questions if needed
- Recommend grounded products only
Customer profile:
${JSON.stringify(memory, null, 2)}

Use this information to personalize recommendations.
Do NOT repeat it unless relevant.

`
}

      ,
      { role: "user", content: message }
    ];

    // 2️⃣ Call LLM with product search tool
    const response = await runLLMWithTools({
      messages,
      tools: [productSearchTool]
    });

    const toolCall = response.message?.tool_calls?.[0];

    // 3️⃣ If LLM called product search
    if (toolCall) {
      const args = JSON.parse(toolCall.function.arguments);
      const products = searchProducts(args);

      // 🧠 VERY IMPORTANT: convert products → readable text
      const textReply =
        products.length === 0
          ? "Sorry, I couldn't find matching products."
          : products
              .map(
                (p) =>
                  `• ${p.name} (${p.brand}) – ₹${p.price}\n  Good for: ${p.attributes?.skinConcern?.join(
                    ", "
                  )}`
              )
              .join("\n\n");

      return res.json({ reply: textReply });
    }

    // 4️⃣ Normal LLM text response
    const text = response.message?.content || "No response";

    // 5️⃣ VERY BASIC memory extraction (hackathon-safe)
    const updates = {};

if (/oily/i.test(message)) updates.skinType = "oily";
if (/dry/i.test(message)) updates.skinType = "dry";
if (/acne/i.test(message)) updates.concern = "acne";
if (/pigment/i.test(message)) updates.concern = "pigmentation";

if (Object.keys(updates).length > 0) {
  updateMemory(userId, updates);
}


    res.json({ reply: text });
  } catch (err) {
    console.error("Agent error:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;

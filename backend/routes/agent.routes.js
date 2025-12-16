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

    /* -------------------------------
       1️⃣ Load customer + memory
    -------------------------------- */
    const customer = getCustomerById(userId);
    const memory = getMemory(userId);

    /* -------------------------------
       2️⃣ Extract & persist memory
    -------------------------------- */
    const extractedMemory = await extractUserMemory({
      message,
      existingMemory: memory
    });

    if (Object.keys(extractedMemory).length > 0) {
      updateMemory(userId, extractedMemory);
    }

    /* -------------------------------
       3️⃣ First LLM call (decide intent / tool)
    -------------------------------- */
    const messages = [
      {
        role: "system",
        content: `
You are a senior beauty sales consultant.

Customer Profile:
${customer ? JSON.stringify(customer, null, 2) : "Unknown"}

Conversation Memory:
${JSON.stringify(memory, null, 2)}

Rules:
- Think like a premium in-store consultant
- Recommend products only from catalog
- Personalize advice deeply
- Explain WHY a product fits the user
- Do NOT dump raw product lists
`
      },
      { role: "user", content: message }
    ];

    const response = await runLLMWithTools({
      messages,
      tools: [productSearchTool]
    });

    const toolCall = response.message?.tool_calls?.[0];

    /* -------------------------------
       4️⃣ If LLM wants products
    -------------------------------- */
    if (toolCall) {
      const args = JSON.parse(toolCall.function.arguments);
      const products = searchProducts(args);

      if (products.length === 0) {
        return res.json({
          reply:
            "I couldn’t find a perfect match yet. Could you tell me a bit more about your skin concerns or budget?"
        });
      }

      /* -------------------------------
         5️⃣ Second LLM call (SALES MODE)
      -------------------------------- */
      const salesMessages = [
        {
          role: "system",
          content: `
You are an expert beauty advisor.

Customer Profile:
${customer ? JSON.stringify(customer, null, 2) : "Unknown"}

Known Preferences:
${JSON.stringify(getMemory(userId), null, 2)}

Available Products (ONLY recommend from these):
${JSON.stringify(products, null, 2)}

Instructions:
- Recommend 1–3 best products
- Explain benefits in simple language
- Match concerns, skin type, lifestyle
- Sound confident, premium, human
- End with a gentle follow-up question
`
        },
        {
          role: "user",
          content:
            "Recommend the best products for this customer and explain why."
        }
      ];

      const salesResponse = await runLLMWithTools({
        messages: salesMessages
      });

      return res.json({
        reply: salesResponse.message?.content || "Here are my recommendations."
      });
    }

    /* -------------------------------
       6️⃣ Normal conversation reply
    -------------------------------- */
    res.json({
      reply: response.message?.content || "How can I help you today?"
    });
  } catch (err) {
    console.error("Agent error:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;

import express from "express";
import { runLLMWithTools } from "../services/llm.service.js";
import { productSearchTool } from "../tools/product.tool.js";
import { searchProducts } from "../services/product.service.js";

const router = express.Router();

router.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    const messages = [
      {
        role: "system",
        content:
          "You are a top-tier retail sales assistant for a beauty brand. Ask clarifying questions if needed and recommend products."
      },
      { role: "user", content: message }
    ];

    // 1️⃣ Call LLM with tool
    const response = await runLLMWithTools({
      messages,
      tools: [productSearchTool]
    });

    // 2️⃣ If LLM decided to call a tool
    const toolCall = response.message?.tool_calls?.[0];

    if (toolCall) {
      const args = JSON.parse(toolCall.function.arguments);

      // 3️⃣ Call real product service
      const products = searchProducts(args);

      return res.json({
        reply: products
      });
    }

    // 4️⃣ Normal LLM response
    res.json({
      reply: response.message?.content || "No response"
    });
  } catch (err) {
    console.error("Agent error:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;

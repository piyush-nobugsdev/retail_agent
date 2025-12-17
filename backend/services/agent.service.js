import { runLLMWithTools } from "./llm.service.js";
import { productSearchTool } from "../tools/product.tool.js";
import { searchProducts } from "./product.service.js";
import { getMemory, updateMemory } from "./memory.service.js";
import { getCustomerById } from "./customer.service.js";
import { extractUserMemory } from "./llm.service.js";

/**
 * CORE AGENT BRAIN
 * Used by Web, WhatsApp, Store kiosk, Voice, etc.
 */
export async function handleAgentMessage({
  message,
  userId,
  channel = "web" // web | whatsapp | store
}) {
  /* -------------------------------
     1️⃣ Load customer & memory
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
     3️⃣ Intent + tool decision
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
- Personalize advice deeply
- Recommend products only from catalog
- Explain WHY products fit the user
- Adjust tone for channel: ${channel}
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
     4️⃣ Product search flow
  -------------------------------- */
  if (toolCall) {
    const args = JSON.parse(toolCall.function.arguments);
    const products = searchProducts(args);

    if (products.length === 0) {
      return channel === "whatsapp"
        ? "I couldn’t find a perfect match 😕 Can you tell me more about your concern?"
        : "I couldn’t find a perfect match yet. Could you share more details?";
    }

    /* -------------------------------
       5️⃣ SALES MODE (LLM explains)
    -------------------------------- */
    const salesMessages = [
      {
        role: "system",
        content: `
You are a top-tier beauty sales associate.

Customer Profile:
${customer ? JSON.stringify(customer, null, 2) : "Unknown"}

Known Preferences:
${JSON.stringify(getMemory(userId), null, 2)}

Available Products (ONLY these):
${JSON.stringify(products, null, 2)}

Instructions:
- Recommend 1–3 best products
- Explain benefits simply
- Match concerns, skin type & lifestyle
- Sound human and premium
- If WhatsApp: shorter, friendly
- End with a follow-up question
`
      },
      {
        role: "user",
        content: "Recommend the best products for this customer."
      }
    ];

    const salesResponse = await runLLMWithTools({
      messages: salesMessages
    });

    return salesResponse.message?.content;
  }

  /* -------------------------------
     6️⃣ Normal conversation
  -------------------------------- */
  return response.message?.content || "How can I help you today?";
}

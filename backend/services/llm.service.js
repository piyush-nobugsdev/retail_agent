const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_URL = "https://api.openai.com/v1/chat/completions";

export async function runLLMWithTools({ messages, tools }) {
  const body = {
    model: "gpt-4o-mini",
    messages,
    temperature: 0.4,
   
  };
if (tools && tools.length > 0) {
    body.tools = tools;
    body.tool_choice = "auto";
  }
  const response = await fetch(OPENAI_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`LLM Error: ${err}`);
  }

  const data = await response.json();
  return data.choices[0];
}
export async function extractUserMemory({ message, existingMemory }) {
  const body = {
    model: "gpt-4o-mini",
    temperature: 0,
    messages: [
      {
        role: "system",
        content: `
You extract structured customer preferences from conversations.

Rules:
- Return ONLY valid JSON
- Do not hallucinate
- If nothing new is found, return {}

Memory format:
{
  "skinType": string | null,
  "skinConcerns": string[],
  "preferredCategories": string[],
  "preferredIngredients": string[],
  "avoidedIngredients": string[],
  "priceRange": "budget" | "mid" | "premium" | null,
  "brandsLiked": string[],
  "brandsDisliked": string[]
}
        `
      },
      {
        role: "user",
        content: `
Existing memory:
${JSON.stringify(existingMemory)}

User message:
"${message}"

Extract NEW or UPDATED preferences only.
        `
      }
    ]
  };

  const res = await fetch(OPENAI_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  const data = await res.json();
  return JSON.parse(data.choices[0].message.content);
}

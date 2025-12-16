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

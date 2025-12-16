import "dotenv/config";
import express from "express";
import cors from "cors";
import OpenAI from "openai";
import workerRoutes from "./routes/worker.routes.js";
import agentRoutes from "./routes/agent.routes.js";
import whatsappRoutes from "./routes/whatsapp.routes.js";
const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/worker", workerRoutes);
app.use("/api/agent", agentRoutes);
app.use("/api/whatsapp", whatsappRoutes);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.post("/api/test-llm", async (req, res) => {
  try {
    const { message } = req.body;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a helpful retail assistant." },
        { role: "user", content: message }
      ]
    });

    res.json({
      reply: response.choices[0].message.content
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "LLM call failed" });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});

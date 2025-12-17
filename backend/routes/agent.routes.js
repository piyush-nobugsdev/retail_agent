import express from "express";
import { handleAgentMessage } from "../services/agent.service.js";

const router = express.Router();

router.post("/chat", async (req, res) => {
  const { message, userId } = req.body;
  const reply = await handleAgentMessage({
    message,
    userId,
    channel: "web"
  });
  res.json({ reply });
});

export default router;

import express from "express";
import { handleAgentMessage } from "../services/agent.service.js";

const router = express.Router();

router.post("/message", async (req, res) => {
  const { message, customerId } = req.body;

  if (!message || !customerId) {
    return res.status(400).json({ error: "message and customerId required" });
  }

  const reply = await handleAgentMessage({
    message,
    userId: customerId,
    channel: "whatsapp"
  });

  res.json({ reply });
});

export default router;

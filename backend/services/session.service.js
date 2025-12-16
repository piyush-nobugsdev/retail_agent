import { readJson, writeJson } from "../utils/readJson.js";

export function getSession(sessionId) {
  const sessions = readJson("sessions.json");
  return sessions[sessionId] || null;
}

export function saveSession(sessionId, data) {
  const sessions = readJson("sessions.json");
  sessions[sessionId] = data;
  writeJson("sessions.json", sessions);
}

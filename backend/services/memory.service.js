import { readJson, writeJson } from "../utils/readJson.js";

const MEMORY_PATH = "data/memory.json";

/**
 * Get memory for a user across channels
 * @param {string} userId
 */
export function getMemory(userId) {
  const allMemory = readJson(MEMORY_PATH);
  return allMemory[userId] || {};
}

/**
 * Update / merge memory for a user
 * @param {string} userId
 * @param {object} newFacts
 */
export function updateMemory(userId, newFacts) {
  const allMemory = readJson(MEMORY_PATH);

  const existing = allMemory[userId] || {};

  allMemory[userId] = {
    ...existing,
    ...newFacts,
    updatedAt: new Date().toISOString()
  };

  writeJson(MEMORY_PATH, allMemory);
}

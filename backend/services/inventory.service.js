import { readJson } from "../utils/readJson.js";

export function checkInventory(storeId, sku) {
  const inventory = readJson("inventory.json");
  return inventory?.[storeId]?.[sku] || 0;
}

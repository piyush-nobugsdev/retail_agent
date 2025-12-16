import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function readJson(relativePath) {
  const fullPath = path.join(__dirname, "..", relativePath);
  const file = fs.readFileSync(fullPath, "utf-8");
  return JSON.parse(file);
}

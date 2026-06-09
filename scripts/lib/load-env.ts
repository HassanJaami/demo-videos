import fs from "fs";
import path from "path";

/**
 * Loads key=value pairs from a local env file into process.env.
 * Skips keys that are already set (so shell exports always win).
 * Supports # comments and quoted values.
 */
export function loadEnv(filename = "local.env"): void {
  const envPath = path.resolve(filename);
  if (!fs.existsSync(envPath)) return;

  const lines = fs.readFileSync(envPath, "utf-8").split("\n");

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) continue;

    const key = trimmed.slice(0, eqIndex).trim();
    const raw = trimmed.slice(eqIndex + 1).trim();
    const value = raw.replace(/^["'](.*)["']$/, "$1"); // strip surrounding quotes

    if (key && !(key in process.env)) {
      process.env[key] = value;
    }
  }
}

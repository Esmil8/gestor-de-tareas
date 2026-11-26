import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

export function createJsonStore(path, fallback = []) {
  function read() {
    if (!existsSync(path)) return fallback;

    try {
      const parsed = JSON.parse(readFileSync(path, "utf8"));
      return Array.isArray(parsed) ? parsed : fallback;
    } catch {
      return fallback;
    }
  }

  function write(value) {
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, JSON.stringify(value, null, 2), "utf8");
  }

  return { read, write };
}

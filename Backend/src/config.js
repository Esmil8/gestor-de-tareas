import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const backendRoot = dirname(dirname(fileURLToPath(import.meta.url)));

export const projectRoot = dirname(backendRoot);
export const dataFile = join(backendRoot, "data", "tasks.json");
export const dist = join(projectRoot, "Frontend", "dist");
export const port = process.env.PORT || 3001;

import { existsSync } from "node:fs";
import { join } from "node:path";
import express from "express";
import { dist } from "./config.js";
import authRouter from "./features/auth/auth.routes.js";
import tasksRouter from "./features/tasks/tasks.routes.js";
import { requireAuth } from "./shared/require-auth.js";

const app = express();

app.use(express.json());
app.use("/api/auth", authRouter);
app.use("/api/tasks", requireAuth, tasksRouter);

if (existsSync(dist)) {
  app.use(express.static(dist));
  app.get("/{*path}", (_req, res) => res.sendFile(join(dist, "index.html")));
}

app.use((error, _req, res, _next) => {
  const status = error.status || 500;
  if (status === 500) console.error(error);
  res.status(status).json({ error: error.message });
});

export default app;

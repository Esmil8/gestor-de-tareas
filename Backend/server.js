import { randomUUID } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";

const root = dirname(fileURLToPath(import.meta.url));
const dataFile = join(root, "data", "tasks.json");
const dist = join(root, "..", "Frontend", "dist");
const port = process.env.PORT || 3001;
const statuses = new Set(["pendiente", "en-progreso", "completada"]);

function readTasks() {
  if (!existsSync(dataFile)) return [];

  try {
    const parsed = JSON.parse(readFileSync(dataFile, "utf8"));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeTasks(tasks) {
  mkdirSync(dirname(dataFile), { recursive: true });
  writeFileSync(dataFile, JSON.stringify(tasks, null, 2), "utf8");
}

function validate(body) {
  const title = typeof body?.title === "string" ? body.title.trim() : "";
  const description =
    typeof body?.description === "string" ? body.description.trim() : "";
  const status = body?.status ?? "pendiente";

  if (!title) return { error: "El título es obligatorio." };
  if (title.length > 80) return { error: "El título supera los 80 caracteres." };
  if (description.length > 300) {
    return { error: "La descripción supera los 300 caracteres." };
  }
  if (!statuses.has(status)) return { error: "Estado no válido." };

  return { task: { title, description, status } };
}

const app = express();
app.use(express.json());

app.get("/api/tasks", (_req, res) => {
  res.json(readTasks());
});

app.post("/api/tasks", (req, res) => {
  const { error, task } = validate(req.body);
  if (error) return res.status(400).json({ error });

  const now = new Date().toISOString();
  const created = {
    id: randomUUID(),
    ...task,
    createdAt: now,
    updatedAt: now,
  };

  writeTasks([created, ...readTasks()]);
  res.status(201).json(created);
});

app.put("/api/tasks/:id", (req, res) => {
  const tasks = readTasks();
  const index = tasks.findIndex((task) => task.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: "Tarea no encontrada." });

  const { error, task } = validate(req.body);
  if (error) return res.status(400).json({ error });

  const updated = {
    ...tasks[index],
    ...task,
    updatedAt: new Date().toISOString(),
  };
  tasks[index] = updated;
  writeTasks(tasks);
  res.json(updated);
});

app.delete("/api/tasks/:id", (req, res) => {
  const tasks = readTasks();
  const exists = tasks.some((task) => task.id === req.params.id);
  if (!exists) return res.status(404).json({ error: "Tarea no encontrada." });

  writeTasks(tasks.filter((task) => task.id !== req.params.id));
  res.status(204).end();
});

if (existsSync(dist)) {
  app.use(express.static(dist));
  app.get("/{*path}", (_req, res) => res.sendFile(join(dist, "index.html")));
}

app.listen(port, () => {
  console.log(`API lista en http://localhost:${port}`);
});

import { randomUUID } from "node:crypto";
import { HttpError } from "../../shared/http-error.js";
import {
  DEFAULT_PRIORITY,
  DEFAULT_STATUS,
  PRIORITIES,
  STATUSES,
} from "./tasks.constants.js";
import * as repository from "./tasks.repository.js";

function validate(body) {
  const title = typeof body?.title === "string" ? body.title.trim() : "";
  const description =
    typeof body?.description === "string" ? body.description.trim() : "";
  const status = body?.status ?? DEFAULT_STATUS;
  const priority = body?.priority ?? DEFAULT_PRIORITY;

  if (!title) throw new HttpError(400, "El título es obligatorio.");
  if (title.length > 80) {
    throw new HttpError(400, "El título supera los 80 caracteres.");
  }
  if (description.length > 300) {
    throw new HttpError(400, "La descripción supera los 300 caracteres.");
  }
  if (!STATUSES.has(status)) throw new HttpError(400, "Estado no válido.");
  if (!PRIORITIES.has(priority)) {
    throw new HttpError(400, "Prioridad no válida.");
  }

  return { title, description, status, priority };
}

export function list() {
  return repository.findAll();
}

export function create(body) {
  const now = new Date().toISOString();
  return repository.insert({
    id: randomUUID(),
    ...validate(body),
    createdAt: now,
    updatedAt: now,
  });
}

export function update(id, body) {
  const existing = repository.findById(id);
  if (!existing) throw new HttpError(404, "Tarea no encontrada.");

  return repository.replace(id, {
    ...existing,
    ...validate(body),
    updatedAt: new Date().toISOString(),
  });
}

export function remove(id) {
  if (!repository.remove(id)) {
    throw new HttpError(404, "Tarea no encontrada.");
  }
}

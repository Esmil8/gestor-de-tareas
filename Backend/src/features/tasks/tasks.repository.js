import { dataFile } from "../../config.js";
import { createJsonStore } from "../../shared/json-store.js";
import { DEFAULT_PRIORITY, PRIORITIES } from "./tasks.constants.js";

const store = createJsonStore(dataFile);

function normalize(task) {
  return {
    ...task,
    priority: PRIORITIES.has(task.priority) ? task.priority : DEFAULT_PRIORITY,
  };
}

export function findAll() {
  return store.read().map(normalize);
}

export function findById(id) {
  return findAll().find((task) => task.id === id) || null;
}

export function insert(task) {
  store.write([task, ...findAll()]);
  return task;
}

export function replace(id, task) {
  const tasks = findAll();
  const index = tasks.findIndex((item) => item.id === id);
  if (index === -1) return null;

  tasks[index] = task;
  store.write(tasks);
  return task;
}

export function remove(id) {
  const tasks = findAll();
  if (!tasks.some((task) => task.id === id)) return false;

  store.write(tasks.filter((task) => task.id !== id));
  return true;
}

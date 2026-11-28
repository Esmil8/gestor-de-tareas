import { randomBytes, scryptSync } from "node:crypto";
import { usersFile } from "../../config.js";
import { createJsonStore } from "../../shared/json-store.js";
import { DEMO_PASSWORD, DEMO_USERNAME } from "./auth.constants.js";

const store = createJsonStore(usersFile, []);

export function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return { salt, hash };
}

function seedUsers() {
  const users = store.read();
  if (users.length > 0) return users;

  const seeded = [
    {
      username: DEMO_USERNAME,
      ...hashPassword(DEMO_PASSWORD),
      createdAt: new Date().toISOString(),
    },
  ];
  store.write(seeded);
  return seeded;
}

export function findUser(username) {
  if (typeof username !== "string") return null;

  const normalized = username.trim().toLowerCase();
  return (
    seedUsers().find((user) => user.username.toLowerCase() === normalized) ||
    null
  );
}

export function addUser(record) {
  const users = seedUsers();
  const user = { ...record, createdAt: new Date().toISOString() };
  users.push(user);
  store.write(users);
  return user;
}

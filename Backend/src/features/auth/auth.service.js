import { createHmac, scryptSync, timingSafeEqual } from "node:crypto";
import {
  MIN_PASSWORD_LENGTH,
  SECRET,
  SESSION_HOURS,
} from "./auth.constants.js";
import { addUser, findUser, hashPassword } from "./auth.store.js";

const USERNAME_PATTERN = /^[\p{L}\p{N}._-]+$/u;
const USERNAME_ERROR =
  "El usuario no puede tener espacios ni símbolos. Usa letras, números, punto (.), guion (-) o guion bajo (_). Ejemplo: maria.garcia_12.";

export function validateRegistration(username, password, confirmation) {
  const errors = {};
  const cleanUsername = typeof username === "string" ? username.trim() : "";

  if (cleanUsername.length < 3) {
    errors.username = "El usuario debe tener al menos 3 caracteres.";
  } else if (!USERNAME_PATTERN.test(cleanUsername)) {
    errors.username = USERNAME_ERROR;
  }

  if (typeof password !== "string" || password.length < MIN_PASSWORD_LENGTH) {
    errors.password = `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`;
  } else if (password.length > 200) {
    errors.password = "La contraseña es demasiado larga.";
  }

  if (password !== confirmation) {
    errors.confirmation = "Las contraseñas no coinciden.";
  }

  return { errors, username: cleanUsername };
}

export function registerUser(username, password) {
  if (findUser(username)) {
    const error = new Error("Ese usuario ya está registrado.");
    error.status = 409;
    throw error;
  }

  return addUser({ username: username.trim(), ...hashPassword(password) });
}

export function verifyCredentials(username, password) {
  if (typeof username !== "string" || typeof password !== "string") return false;
  if (password.length > 200) return false;

  const user = findUser(username);
  if (!user) return false;

  const inputHash = scryptSync(password, user.salt, 64);
  const storedHash = Buffer.from(user.hash, "hex");

  return (
    storedHash.length === inputHash.length &&
    timingSafeEqual(storedHash, inputHash)
  );
}

export function createSession(username) {
  const expiresAt = Date.now() + SESSION_HOURS * 60 * 60 * 1000;
  const payload = Buffer.from(
    JSON.stringify({ user: username, expiresAt })
  ).toString("base64url");
  const signature = createHmac("sha256", SECRET)
    .update(payload)
    .digest("base64url");

  return { token: `${payload}.${signature}`, expiresAt };
}

export function readSession(token) {
  if (typeof token !== "string") return null;

  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;

  const expected = createHmac("sha256", SECRET)
    .update(payload)
    .digest("base64url");
  const received = Buffer.from(signature);
  const valid = Buffer.from(expected);

  if (received.length !== valid.length || !timingSafeEqual(received, valid)) {
    return null;
  }

  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (data.expiresAt < Date.now() || !findUser(data.user)) return null;
    return data;
  } catch {
    return null;
  }
}

export function readCookie(header, name) {
  if (typeof header !== "string") return null;

  const entry = header
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`));

  if (!entry) return null;

  try {
    return decodeURIComponent(entry.slice(name.length + 1));
  } catch {
    return null;
  }
}

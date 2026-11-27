import {
  createHmac,
  randomBytes,
  scryptSync,
  timingSafeEqual,
} from "node:crypto";
import { PASSWORD, SECRET, SESSION_HOURS, USERNAME } from "./auth.constants.js";

const salt = randomBytes(16);
const passwordHash = scryptSync(PASSWORD, salt, 64);

export function verifyCredentials(username, password) {
  if (typeof username !== "string" || typeof password !== "string") return false;
  if (username.trim().toLowerCase() !== USERNAME.toLowerCase()) return false;
  if (password.length > 200) return false;

  const inputHash = scryptSync(password, salt, 64);
  return timingSafeEqual(passwordHash, inputHash);
}

export function createSession() {
  const expiresAt = Date.now() + SESSION_HOURS * 60 * 60 * 1000;
  const payload = Buffer.from(
    JSON.stringify({ user: USERNAME, expiresAt })
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
    if (data.user !== USERNAME || data.expiresAt < Date.now()) return null;
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

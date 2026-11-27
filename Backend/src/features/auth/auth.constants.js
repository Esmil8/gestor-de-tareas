import { randomBytes } from "node:crypto";

export const COOKIE_NAME = "taskflow_session";
export const SESSION_HOURS = 8;
export const USERNAME = process.env.LOGIN_USERNAME || "admin";
export const PASSWORD = process.env.LOGIN_PASSWORD || "admin123";
export const SECRET =
  process.env.AUTH_SECRET || randomBytes(32).toString("hex");
export const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

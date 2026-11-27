import { HttpError } from "../../shared/http-error.js";
import { COOKIE_NAME, COOKIE_OPTIONS } from "./auth.constants.js";
import { createSession, verifyCredentials } from "./auth.service.js";

export function login(req, res) {
  const { username, password } = req.body || {};

  if (!verifyCredentials(username, password)) {
    throw new HttpError(401, "Usuario o contraseña incorrectos.");
  }

  const { token, expiresAt } = createSession();

  res.cookie(COOKIE_NAME, token, {
    ...COOKIE_OPTIONS,
    expires: new Date(expiresAt),
  });

  res.json({ user: { username: username.trim() } });
}

export function logout(_req, res) {
  res.clearCookie(COOKIE_NAME, COOKIE_OPTIONS);
  res.status(204).end();
}

export function me(req, res) {
  res.json({ user: req.user });
}

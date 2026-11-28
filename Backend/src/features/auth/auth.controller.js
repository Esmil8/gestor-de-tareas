import { HttpError } from "../../shared/http-error.js";
import { COOKIE_NAME, COOKIE_OPTIONS } from "./auth.constants.js";
import {
  createSession,
  registerUser,
  validateRegistration,
  verifyCredentials,
} from "./auth.service.js";

function startSession(res, username) {
  const { token, expiresAt } = createSession(username);

  res.cookie(COOKIE_NAME, token, {
    ...COOKIE_OPTIONS,
    expires: new Date(expiresAt),
  });

  return { username };
}

export function register(req, res) {
  const { username, password, confirmation } = req.body || {};
  const { errors, username: cleanUsername } = validateRegistration(
    username,
    password,
    confirmation
  );

  if (Object.keys(errors).length > 0) {
    throw new HttpError(400, Object.values(errors).join(" "));
  }

  const user = registerUser(cleanUsername, password);
  res.status(201).json({ user: startSession(res, user.username) });
}

export function login(req, res) {
  const { username, password } = req.body || {};

  if (!verifyCredentials(username, password)) {
    throw new HttpError(401, "Usuario o contraseña incorrectos.");
  }

  res.json({ user: startSession(res, username.trim()) });
}

export function logout(_req, res) {
  res.clearCookie(COOKIE_NAME, COOKIE_OPTIONS);
  res.status(204).end();
}

export function me(req, res) {
  res.json({ user: req.user });
}

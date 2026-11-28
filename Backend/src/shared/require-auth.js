import { HttpError } from "./http-error.js";
import { COOKIE_NAME } from "../features/auth/auth.constants.js";
import { readCookie, readSession } from "../features/auth/auth.service.js";

export function requireAuth(req, _res, next) {
  const token = readCookie(req.headers.cookie, COOKIE_NAME);
  const session = readSession(token);

  if (!session) return next(new HttpError(401, "Inicia sesión para continuar."));

  req.user = { username: session.user };
  next();
}

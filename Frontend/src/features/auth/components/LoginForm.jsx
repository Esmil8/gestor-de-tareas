import { useState } from "react";
import toast from "react-hot-toast";
import { login, register } from "../auth.api.js";

const USERNAME_PATTERN = /^[\p{L}\p{N}._-]+$/u;
const USERNAME_ERROR =
  "El usuario no puede tener espacios ni símbolos. Usa letras, números, punto (.), guion (-) o guion bajo (_). Ejemplo: maria.garcia_12.";

function LockIcon() {
  return (
    <svg
      className="auth-lock"
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="4" y="10" width="16" height="11" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

export default function LoginForm({ onSuccess }) {
  const [mode, setMode] = useState("login");
  const [values, setValues] = useState({
    username: "",
    password: "",
    confirmation: "",
  });
  const [errors, setErrors] = useState({});

  const isRegister = mode === "register";

  function handleChange(event) {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
  }

  function toggleMode() {
    setMode(isRegister ? "login" : "register");
    setErrors({});
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const nextErrors = {};
    const username = values.username.trim();

    if (!username) nextErrors.username = "Escribe tu usuario.";
    else if (isRegister && username.length < 3) {
      nextErrors.username = "El usuario debe tener al menos 3 caracteres.";
    } else if (isRegister && !USERNAME_PATTERN.test(username)) {
      nextErrors.username = USERNAME_ERROR;
    }

    if (!values.password) nextErrors.password = "Escribe tu contraseña.";
    else if (isRegister && values.password.length < 8) {
      nextErrors.password = "La contraseña debe tener al menos 8 caracteres.";
    }

    if (isRegister && values.password !== values.confirmation) {
      nextErrors.confirmation = "Las contraseñas no coinciden.";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const payload = isRegister
      ? {
          username,
          password: values.password,
          confirmation: values.confirmation,
        }
      : { username, password: values.password };

    try {
      const data = await toast.promise(
        isRegister ? register(payload) : login(payload),
        {
          loading: isRegister ? "Creando cuenta..." : "Iniciando sesión...",
          success: isRegister ? "Cuenta creada." : "Sesión iniciada.",
          error: (err) => err.message || "No se pudo continuar.",
        }
      );
      onSuccess(data.user);
    } catch {
      return;
    }
  }

  return (
    <div className="auth-screen">
      <section className="auth-intro">
        <div className="auth-brand">
          <span className="auth-brand-mark">
            <LockIcon />
          </span>
          <span>Taskflow</span>
        </div>
        <h1>Tu trabajo, en orden.</h1>
        <p>
          Organiza tareas, prioridades y fechas límite desde un solo panel.
        </p>
      </section>

      <section className="auth-card" aria-labelledby="auth-title">
        <span className="auth-card-icon">
          <LockIcon />
        </span>
        <h2 id="auth-title">
          {isRegister ? "Crear cuenta" : "Iniciar sesión"}
        </h2>
        <p className="auth-subtitle">
          {isRegister
            ? "Regístrate para usar el panel de tareas."
            : "Accede al panel de tareas."}
        </p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label htmlFor="username">Usuario</label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              placeholder="Tu usuario"
              value={values.username}
              onChange={handleChange}
              aria-invalid={Boolean(errors.username)}
              required
            />
            {errors.username && (
              <p className="form-error" role="alert">
                {errors.username}
              </p>
            )}
          </div>

          <div className="field">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete={isRegister ? "new-password" : "current-password"}
              placeholder="Tu contraseña"
              value={values.password}
              onChange={handleChange}
              aria-invalid={Boolean(errors.password)}
              required
            />
            {errors.password && (
              <p className="form-error" role="alert">
                {errors.password}
              </p>
            )}
          </div>

          {isRegister && (
            <div className="field">
              <label htmlFor="confirmation">Confirmar contraseña</label>
              <input
                id="confirmation"
                name="confirmation"
                type="password"
                autoComplete="new-password"
                placeholder="Repite tu contraseña"
                value={values.confirmation}
                onChange={handleChange}
                aria-invalid={Boolean(errors.confirmation)}
                required
              />
              {errors.confirmation && (
                <p className="form-error" role="alert">
                  {errors.confirmation}
                </p>
              )}
            </div>
          )}

          <button className="btn btn-primary auth-submit" type="submit">
            {isRegister ? "Crear cuenta" : "Entrar"}
          </button>
        </form>

        <p className="auth-switch">
          {isRegister ? "¿Ya tienes cuenta?" : "¿No tienes cuenta?"}
          <button type="button" onClick={toggleMode}>
            {isRegister ? "Inicia sesión" : "Regístrate"}
          </button>
        </p>
      </section>
    </div>
  );
}

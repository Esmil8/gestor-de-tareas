import { useState } from "react";
import toast from "react-hot-toast";
import { login } from "../auth.api.js";

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
  const [values, setValues] = useState({ username: "", password: "" });
  const [errors, setErrors] = useState({});

  function handleChange(event) {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const nextErrors = {};
    if (!values.username.trim()) nextErrors.username = "Escribe tu usuario.";
    if (!values.password) nextErrors.password = "Escribe tu contraseña.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    try {
      const data = await toast.promise(
        login({
          username: values.username.trim(),
          password: values.password,
        }),
        {
          loading: "Iniciando sesión...",
          success: "Sesión iniciada.",
          error: (err) => err.message || "No se pudo iniciar sesión.",
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

      <section className="auth-card" aria-labelledby="login-title">
        <span className="auth-card-icon">
          <LockIcon />
        </span>
        <h2 id="login-title">Iniciar sesión</h2>
        <p className="auth-subtitle">Accede al panel de tareas.</p>

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
              autoComplete="current-password"
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

          <button className="btn btn-primary auth-submit" type="submit">
            Entrar
          </button>
        </form>
      </section>
    </div>
  );
}

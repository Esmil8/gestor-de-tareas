import { useEffect, useMemo, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { getSession, logout } from "./features/auth/auth.api.js";
import LoginForm from "./features/auth/components/LoginForm.jsx";
import TaskForm from "./features/tasks/components/TaskForm.jsx";
import TaskList from "./features/tasks/components/TaskList.jsx";
import { isOverdue } from "./features/tasks/task-utils.js";
import {
  createTask,
  deleteTask,
  getTasks,
  updateTask,
} from "./features/tasks/tasks.api.js";
import { STATUS_LABELS } from "./features/tasks/tasks.constants.js";

const VIEWS = [
  { id: "todas", label: "Todas", icon: "grid" },
  { id: "pendiente", label: STATUS_LABELS.pendiente, icon: "clock" },
  { id: "en-progreso", label: STATUS_LABELS["en-progreso"], icon: "activity" },
  { id: "completada", label: STATUS_LABELS.completada, icon: "check" },
  { id: "vencidas", label: "Vencidas", icon: "alert" },
];

const ICONS = {
  grid: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  activity: <path d="M3 12h4l3-7 4 14 3-7h4" />,
  check: <path d="m4 12 5 5L20 6" />,
  alert: (
    <>
      <path d="M12 4 3 20h18L12 4Z" />
      <path d="M12 10v4M12 17h.01" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </>
  ),
};

const todayLabel = new Intl.DateTimeFormat("es", {
  weekday: "long",
  day: "numeric",
  month: "long",
}).format(new Date());

const toasterOptions = {
  position: "top-right",
  gutter: 10,
  toastOptions: {
    duration: 3200,
    className: "app-toast",
    style: {
      background: "#ffffff",
      color: "#172033",
      border: "1px solid #e2e7f0",
      borderRadius: "12px",
      boxShadow: "0 14px 34px rgba(23, 32, 51, 0.12)",
      padding: "12px 14px",
      fontFamily: "inherit",
      fontSize: "0.9rem",
      fontWeight: 600,
    },
    loading: {
      iconTheme: { primary: "#2f5fe0", secondary: "#ffffff" },
    },
    success: {
      iconTheme: { primary: "#1e7145", secondary: "#ffffff" },
    },
    error: {
      iconTheme: { primary: "#bb2f3b", secondary: "#ffffff" },
    },
  },
};

function Icon({ name }) {
  return (
    <svg
      className="icon"
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {ICONS[name]}
    </svg>
  );
}

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingTask, setEditingTask] = useState(null);
  const [query, setQuery] = useState("");
  const [activeView, setActiveView] = useState("todas");
  const [user, setUser] = useState(null);
  const [sessionLoading, setSessionLoading] = useState(true);

  useEffect(() => {
    let active = true;

    getSession()
      .then((data) => {
        if (active) setUser(data.user);
      })
      .catch(() => {
        if (active) setUser(null);
      })
      .finally(() => {
        if (active) setSessionLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!user) return;

    let active = true;
    setLoading(true);
    setError("");

    getTasks()
      .then((data) => {
        if (active) setTasks(data);
      })
      .catch((err) => {
        if (!active) return;
        if (err.status === 401) {
          setUser(null);
          return;
        }
        setError(err.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [user]);

  const counts = useMemo(
    () => ({
      todas: tasks.length,
      pendiente: tasks.filter((task) => task.status === "pendiente").length,
      "en-progreso": tasks.filter((task) => task.status === "en-progreso").length,
      completada: tasks.filter((task) => task.status === "completada").length,
      vencidas: tasks.filter(isOverdue).length,
    }),
    [tasks]
  );

  const visibleTasks = useMemo(() => {
    const text = query.trim().toLowerCase();

    return tasks.filter((task) => {
      const matchesView =
        activeView === "todas" ||
        (activeView === "vencidas"
          ? isOverdue(task)
          : task.status === activeView);
      const content = `${task.title} ${task.description}`.toLowerCase();
      return matchesView && (!text || content.includes(text));
    });
  }, [tasks, query, activeView]);

  const activeLabel =
    VIEWS.find((view) => view.id === activeView)?.label ?? "Todas";

  async function applyMutation(mutation, messages) {
    try {
      const list = await toast.promise(
        mutation.then(() => getTasks()),
        messages
      );
      setTasks(list);
      return true;
    } catch {
      return false;
    }
  }

  async function handleSubmit(values) {
    const editing = Boolean(editingTask);
    const saved = await applyMutation(
      editing ? updateTask(editingTask.id, values) : createTask(values),
      {
        loading: editing ? "Actualizando tarea..." : "Guardando tarea...",
        success: editing ? "Tarea actualizada." : "Tarea creada.",
        error: (err) => err.message || "No se pudo guardar la tarea.",
      }
    );

    if (saved) setEditingTask(null);
  }

  function confirmDelete(task) {
    return new Promise((resolve) => {
      let toastId;

      toastId = toast.custom(
        (t) => (
          <div
            className={`confirm-toast${t.visible ? " confirm-toast--visible" : ""}`}
            role="alertdialog"
            aria-labelledby="confirm-title"
            aria-describedby="confirm-description"
          >
            <span className="confirm-toast-icon">
              <Icon name="alert" />
            </span>

            <div className="confirm-toast-copy">
              <strong id="confirm-title">Eliminar tarea</strong>
              <p id="confirm-description">
                ¿Eliminar "{task.title}"? Esta acción no se puede deshacer.
              </p>
            </div>

            <div className="confirm-toast-actions">
              <button
                className="btn btn-ghost"
                type="button"
                autoFocus
                onClick={() => {
                  toast.dismiss(toastId);
                  resolve(false);
                }}
              >
                Cancelar
              </button>
              <button
                className="btn btn-danger"
                type="button"
                onClick={() => {
                  toast.dismiss(toastId);
                  resolve(true);
                }}
              >
                Eliminar
              </button>
            </div>
          </div>
        ),
        {
          duration: Infinity,
          ariaProps: { role: "alertdialog", "aria-live": "assertive" },
        }
      );
    });
  }

  async function handleDelete(task) {
    if (!(await confirmDelete(task))) return;

    const deleted = await applyMutation(deleteTask(task.id), {
      loading: "Eliminando tarea...",
      success: "Tarea eliminada.",
      error: (err) => err.message || "No se pudo eliminar la tarea.",
    });

    if (deleted && editingTask?.id === task.id) setEditingTask(null);
  }

  async function handleLogout() {
    try {
      await toast.promise(logout(), {
        loading: "Cerrando sesión...",
        success: "Sesión cerrada.",
        error: (err) => err.message || "No se pudo cerrar sesión.",
      });
      setUser(null);
      setTasks([]);
      setEditingTask(null);
      setQuery("");
      setActiveView("todas");
    } catch {
      return;
    }
  }

  if (sessionLoading) {
    return (
      <div className="auth-loading">
        <p>Verificando sesión...</p>
        <Toaster {...toasterOptions} />
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <LoginForm onSuccess={setUser} />
        <Toaster {...toasterOptions} />
      </>
    );
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">
            <Icon name="grid" />
          </span>
          <span className="brand-name">Taskflow</span>
        </div>

        <nav className="sidebar-nav" aria-label="Vistas de tareas">
          <p className="sidebar-label">Espacio de trabajo</p>
          <ul className="nav-list">
            {VIEWS.map((view) => {
              const active = view.id === activeView;
              return (
                <li key={view.id}>
                  <button
                    className={`nav-item${active ? " nav-item--active" : ""}`}
                    type="button"
                    onClick={() => setActiveView(view.id)}
                    aria-current={active ? "page" : undefined}
                  >
                    <Icon name={view.icon} />
                    <span>{view.label}</span>
                    <span className="nav-count">{counts[view.id]}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="sidebar-account">
          <div className="sidebar-footer">
            <span className="footer-dot" />
            <div>
              <strong>{user.username}</strong>
              <span>Sesión activa</span>
            </div>
          </div>
          <button
            className="btn btn-ghost btn-block"
            type="button"
            onClick={handleLogout}
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      <div className="workspace">
        <header className="topbar">
          <div>
            <h1>Panel de tareas</h1>
            <p>Organiza prioridades, plazos y avance en un solo lugar.</p>
          </div>
          <span className="topbar-date">{todayLabel}</span>
        </header>

        <main className="content">
          {error && (
            <p className="app-error" role="alert">
              {error}
            </p>
          )}

          <TaskForm
            editingTask={editingTask}
            onSubmit={handleSubmit}
            onCancel={() => setEditingTask(null)}
          />

          <section className="panel" aria-labelledby="list-title">
            <div className="list-header">
              <div>
                <h2 id="list-title" className="section-title">
                  Lista de tareas
                </h2>
                <p className="list-subtitle">Vista activa: {activeLabel}</p>
              </div>
              <span className="badge">
                {visibleTasks.length} {visibleTasks.length === 1 ? "tarea" : "tareas"}
              </span>
            </div>

            <div className="toolbar">
              <span className="toolbar-icon">
                <Icon name="search" />
              </span>
              <label className="sr-only" htmlFor="search">
                Buscar tareas
              </label>
              <input
                id="search"
                type="search"
                placeholder="Buscar por título o descripción"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>

            {loading ? (
              <p className="empty-state">Cargando tareas...</p>
            ) : (
              <TaskList
                tasks={visibleTasks}
                onEdit={setEditingTask}
                onDelete={handleDelete}
              />
            )}
          </section>
        </main>
      </div>

      <Toaster {...toasterOptions} />
    </div>
  );
}

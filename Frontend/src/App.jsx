import { useEffect, useMemo, useState } from "react";
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

  useEffect(() => {
    let active = true;

    getTasks()
      .then((data) => {
        if (active) setTasks(data);
      })
      .catch((err) => {
        if (active) setError(err.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

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

  async function handleSubmit(values) {
    try {
      setError("");
      if (editingTask) {
        await updateTask(editingTask.id, values);
      } else {
        await createTask(values);
      }
      setTasks(await getTasks());
      setEditingTask(null);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(task) {
    if (!window.confirm(`¿Eliminar la tarea "${task.title}"?`)) return;

    try {
      setError("");
      await deleteTask(task.id);
      setTasks(await getTasks());
      if (editingTask?.id === task.id) setEditingTask(null);
    } catch (err) {
      setError(err.message);
    }
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

        <div className="sidebar-footer">
          <span className="footer-dot" />
          <div>
            <strong>Datos locales</strong>
            <span>Guardados en el servidor</span>
          </div>
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
    </div>
  );
}

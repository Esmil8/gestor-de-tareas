import { useEffect, useMemo, useState } from "react";
import TaskForm from "./features/tasks/components/TaskForm.jsx";
import TaskList from "./features/tasks/components/TaskList.jsx";
import {
  createTask,
  deleteTask,
  getTasks,
  updateTask,
} from "./features/tasks/tasks.api.js";
import { STATUSES, STATUS_LABELS } from "./features/tasks/tasks.constants.js";

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingTask, setEditingTask] = useState(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("todos");

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

  const visibleTasks = useMemo(() => {
    const text = query.trim().toLowerCase();

    return tasks.filter((task) => {
      const matchesStatus = filter === "todos" || task.status === filter;
      const content = `${task.title} ${task.description}`.toLowerCase();
      return matchesStatus && (!text || content.includes(text));
    });
  }, [tasks, query, filter]);

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
    <main className="app">
      <header className="app-header">
        <h1>Gestor de tareas</h1>
        <p>CRUD con React y Express. Los datos se guardan en el servidor.</p>
      </header>

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
          <h2 id="list-title" className="section-title">
            Tareas
          </h2>
          <span className="badge">
            {visibleTasks.length} {visibleTasks.length === 1 ? "tarea" : "tareas"}
          </span>
        </div>

        <div className="toolbar">
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

          <label className="sr-only" htmlFor="filter">
            Filtrar por estado
          </label>
          <select
            id="filter"
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
          >
            <option value="todos">Todos los estados</option>
            {STATUSES.map((status) => (
              <option key={status} value={status}>
                {STATUS_LABELS[status]}
              </option>
            ))}
          </select>
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
  );
}

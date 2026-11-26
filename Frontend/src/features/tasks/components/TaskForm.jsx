import { useEffect, useState } from "react";
import { PRIORITIES, PRIORITY_LABELS, STATUSES, STATUS_LABELS } from "../tasks.constants.js";

const emptyTask = {
  title: "",
  description: "",
  status: "pendiente",
  priority: "media",
  dueDate: "",
};

export default function TaskForm({ editingTask, onSubmit, onCancel }) {
  const [values, setValues] = useState(emptyTask);
  const [error, setError] = useState("");

  useEffect(() => {
    setValues(
      editingTask
        ? {
            title: editingTask.title,
            description: editingTask.description,
            status: editingTask.status,
            priority: editingTask.priority || "media",
            dueDate: editingTask.dueDate || "",
          }
        : emptyTask
    );
    setError("");
  }, [editingTask]);

  function handleChange(event) {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (!values.title.trim()) {
      setError("Escribe un título para la tarea.");
      return;
    }

    setError("");
    onSubmit(values);
  }

  return (
    <section className="panel" aria-labelledby="form-title">
      <h2 id="form-title" className="section-title">
        {editingTask ? "Editar tarea" : "Nueva tarea"}
      </h2>

      <form onSubmit={handleSubmit} noValidate>
        <div className="field">
          <label htmlFor="title">Título</label>
          <input
            id="title"
            name="title"
            type="text"
            maxLength={80}
            placeholder="Ej: Preparar informe"
            value={values.title}
            onChange={handleChange}
            required
          />
        </div>

        <div className="field">
          <label htmlFor="description">Descripción</label>
          <textarea
            id="description"
            name="description"
            rows={3}
            maxLength={300}
            placeholder="Detalles de la tarea"
            value={values.description}
            onChange={handleChange}
          />
        </div>

        <div className="field">
          <label htmlFor="status">Estado</label>
          <select
            id="status"
            name="status"
            value={values.status}
            onChange={handleChange}
          >
            {STATUSES.map((status) => (
              <option key={status} value={status}>
                {STATUS_LABELS[status]}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="priority">Prioridad</label>
          <select
            id="priority"
            name="priority"
            value={values.priority}
            onChange={handleChange}
          >
            {PRIORITIES.map((priority) => (
              <option key={priority} value={priority}>
                {PRIORITY_LABELS[priority]}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="dueDate">Fecha límite</label>
          <input
            id="dueDate"
            name="dueDate"
            type="date"
            value={values.dueDate}
            onChange={handleChange}
          />
        </div>

        <div className="form-actions">
          <button className="btn btn-primary" type="submit">
            {editingTask ? "Actualizar tarea" : "Guardar tarea"}
          </button>
          {editingTask && (
            <button className="btn btn-ghost" type="button" onClick={onCancel}>
              Cancelar
            </button>
          )}
        </div>

        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
      </form>
    </section>
  );
}

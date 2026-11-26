import { useEffect, useState } from "react";
import { PRIORITIES, PRIORITY_LABELS, STATUSES, STATUS_LABELS } from "../tasks.constants.js";

const emptyTask = {
  title: "",
  description: "",
  status: "pendiente",
  priority: "media",
  dueDate: "",
};

function isValidDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const date = new Date(`${value}T00:00:00Z`);
  return (
    !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
  );
}

function validate(values) {
  const errors = {};
  const title = values.title.trim();

  if (!title) errors.title = "Escribe un título para la tarea.";
  if (title.length > 80) errors.title = "El título supera los 80 caracteres.";
  if (values.description.length > 300) {
    errors.description = "La descripción supera los 300 caracteres.";
  }
  if (values.dueDate && !isValidDate(values.dueDate)) {
    errors.dueDate = "Escribe una fecha válida.";
  }

  return errors;
}

export default function TaskForm({ editingTask, onSubmit, onCancel }) {
  const [values, setValues] = useState(emptyTask);
  const [errors, setErrors] = useState({});

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
    setErrors({});
  }, [editingTask]);

  function handleChange(event) {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    onSubmit({
      ...values,
      title: values.title.trim(),
      description: values.description.trim(),
    });
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
            aria-invalid={Boolean(errors.title)}
            required
          />
          {errors.title && (
            <p className="form-error" role="alert">
              {errors.title}
            </p>
          )}
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
            aria-invalid={Boolean(errors.description)}
          />
          {errors.description && (
            <p className="form-error" role="alert">
              {errors.description}
            </p>
          )}
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
            aria-invalid={Boolean(errors.dueDate)}
          />
          {errors.dueDate && (
            <p className="form-error" role="alert">
              {errors.dueDate}
            </p>
          )}
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
      </form>
    </section>
  );
}

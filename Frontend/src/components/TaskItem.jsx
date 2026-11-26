import { STATUS_LABELS } from "../statuses.js";

function formatDate(iso) {
  return new Intl.DateTimeFormat("es", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

export default function TaskItem({ task, onEdit, onDelete }) {
  return (
    <li className="task-card">
      <div className="task-body">
        <h3 className="task-title">{task.title}</h3>
        <p className="task-description">{task.description || "Sin descripción"}</p>
        <div className="task-meta">
          <span className={`status status--${task.status}`}>
            {STATUS_LABELS[task.status] || task.status}
          </span>
          <span>Creada: {formatDate(task.createdAt)}</span>
        </div>
      </div>

      <div className="task-actions">
        <button
          className="btn btn-small"
          type="button"
          onClick={() => onEdit(task)}
          aria-label={`Editar ${task.title}`}
        >
          Editar
        </button>
        <button
          className="btn btn-small btn-danger"
          type="button"
          onClick={() => onDelete(task)}
          aria-label={`Eliminar ${task.title}`}
        >
          Eliminar
        </button>
      </div>
    </li>
  );
}

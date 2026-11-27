import {
  formatDate,
  formatDueDate,
  isOverdue,
} from "../task-utils.js";
import { PRIORITY_LABELS, STATUS_LABELS } from "../tasks.constants.js";

export default function TaskItem({ task, onEdit, onDelete }) {
  const overdue = isOverdue(task);

  return (
    <li className="task-card">
      <div className="task-body">
        <h3 className="task-title">{task.title}</h3>
        <p className="task-description">{task.description || "Sin descripción"}</p>
        <div className="task-meta">
          <span className={`status status--${task.status}`}>
            {STATUS_LABELS[task.status] || task.status}
          </span>
          <span className={`priority priority--${task.priority || "media"}`}>
            Prioridad: {PRIORITY_LABELS[task.priority] || "Media"}
          </span>
          {task.dueDate && (
            <span className={`due-date${overdue ? " due-date--overdue" : ""}`}>
              Vence: {formatDueDate(task.dueDate)}
              {overdue ? " (atrasada)" : ""}
            </span>
          )}
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

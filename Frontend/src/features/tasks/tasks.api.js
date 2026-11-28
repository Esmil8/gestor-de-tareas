const base = "/api/tasks";

async function request(path, options = {}) {
  const response = await fetch(`${base}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    const error = new Error(payload.error || `Error ${response.status}`);
    error.status = response.status;
    throw error;
  }

  return response.status === 204 ? null : response.json();
}

export function getTasks() {
  return request("");
}

export function createTask(task) {
  return request("", {
    method: "POST",
    body: JSON.stringify(task),
  });
}

export function updateTask(id, task) {
  return request(`/${id}`, {
    method: "PUT",
    body: JSON.stringify(task),
  });
}

export function deleteTask(id) {
  return request(`/${id}`, { method: "DELETE" });
}

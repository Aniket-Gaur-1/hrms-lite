const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options
  });

  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }

  if (!res.ok) {
    const message = data?.detail || `Request failed (${res.status})`;
    const error = new Error(message);
    error.status = res.status;
    throw error;
  }

  return data;
}

export function getEmployees() {
  return request("/api/employees");
}

export function createEmployee(payload) {
  return request("/api/employees", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function deleteEmployee(employeeId) {
  return request(`/api/employees/${encodeURIComponent(employeeId)}`, {
    method: "DELETE"
  });
}

export function markAttendance(payload) {
  return request("/api/attendance", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function getAttendance(employeeId) {
  return request(`/api/employees/${encodeURIComponent(employeeId)}/attendance`);
}

export function getSummary() {
  return request("/api/summary");
}

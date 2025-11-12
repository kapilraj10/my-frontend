// Mock API service functions returning Promise-based data for react-query.
// In a real app you could replace these with fetch/axios calls.

const API_BASE = process.env.REACT_APP_API_BASE || 'https://my-backend-vwgs.vercel.app';

function authHeaders() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Simple fetch wrapper
async function getJSON(path) {
  const resp = await fetch(`${API_BASE}${path}`, {
    headers: {
      ...authHeaders(),
      // Ensure cookies are not required; token-based auth only
    }
  });
  if (!resp.ok) throw new Error(`GET ${path} ${resp.status}`);
  return resp.json();
}

async function sendJSON(path, method, body) {
  const resp = await fetch(`${API_BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(body)
  });
  if (!resp.ok) {
    const msg = await resp.text();
    throw new Error(`${method} ${path} ${resp.status} ${msg}`);
  }
  return resp.status === 204 ? null : resp.json();
}

export async function fetchProjects() {
  return getJSON('/api/projects');
}
export async function createProject(data) {
  return sendJSON('/api/projects', 'POST', data);
}
export async function updateProject(id, data) {
  return sendJSON(`/api/projects/${id}`, 'PUT', data);
}
export async function deleteProject(id) {
  return sendJSON(`/api/projects/${id}`, 'DELETE');
}

export async function fetchFinancials() {
  const data = await getJSON('/api/finance');
  // Map to old shape expected by FinancialAnalytics
  const summary = data.summary || {};
  return Object.values(summary).map((s) => ({
    projectId: s.project?._id || 'unknown',
    income: s.payment || 0,
    expenses: s.expense || 0,
    profit: (s.payment || 0) - (s.expense || 0)
  }));
}
export async function fetchFinanceRaw() {
  return getJSON('/api/finance');
}
export async function createFinance(data) {
  return sendJSON('/api/finance', 'POST', data);
}
export async function updateFinance(projectId, data) {
  return sendJSON(`/api/finance/${projectId}`, 'PUT', data);
}
export async function deleteFinance(projectId) {
  return sendJSON(`/api/finance/${projectId}`, 'DELETE');
}

export async function fetchTasks() {
  return getJSON('/api/tasks');
}
export async function createTask(data) {
  return sendJSON('/api/tasks', 'POST', data);
}
export async function updateTask(id, data) {
  return sendJSON(`/api/tasks/${id}`, 'PUT', data);
}
export async function deleteTask(id) {
  return sendJSON(`/api/tasks/${id}`, 'DELETE');
}

// Clients & Team
export async function fetchClients() {
  return getJSON('/api/clients');
}
export async function fetchTeam() {
  return getJSON('/api/team');
}

export async function fetchOverview() {
  return getJSON('/api/reports/overview');
}

import api from "./api";

/** @returns {Promise<{client: import('../contracts/resources').Client, token: string}>} */
export async function login({ email, password }) {
  const response = await api.post("/api/clients/login", { email, password });
  return response.data.data.session;
}

/** @returns {Promise<import('../contracts/resources').Client>} */
export async function register({ name, email, password, admin_email, role }) {
  const response = await api.post("/api/clients/register", { name, email, password, admin_email, role });
  return response.data.data.client;
}

export async function logout() {
  await api.post("/api/clients/logout", {}, { withCredentials: true });
}

export function readStoredClient() {
  const stored = localStorage.getItem("user");
  if (!stored) return null;
  const record = JSON.parse(stored);
  if (!record || typeof record !== "object") return null;
  return record.client_id != null ? record : null;
}

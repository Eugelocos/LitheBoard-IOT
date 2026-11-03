import api from "./api";

/** @returns {Promise<import('../contracts/resources').Client[]>} */
export async function fetchAssociatedClients(client_id) {
  const response = await api.get(`/api/clients/admins/${client_id}/clients`);
  const client_ids = response.data.data.client_ids;
  if (!client_ids.length) return [];
  const clients_response = await api.get(`/api/clients/${client_ids.join(",")}`);
  return clients_response.data.data.clients;
}

/** @returns {Promise<import('../contracts/resources').Client>} */
export async function updateClient({ client_id, name, email }) {
  const response = await api.put("/api/clients", { client_id, name, email });
  return response.data.data.client;
}

export async function deleteClient(client_id) {
  await api.delete(`/api/clients/${client_id}`);
}

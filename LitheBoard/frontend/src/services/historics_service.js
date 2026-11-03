import api from "./api";

/** @returns {Promise<import('../contracts/resources').Historic[]>} */
export async function fetchEntityHistorics(entity_id) {
  const response = await api.get(`/api/historics/entity/${entity_id}`);
  return response.data.data.historics;
}

/** @returns {Promise<import('../contracts/resources').Historic[]>} */
export async function fetchClientHistorics(client_id) {
  const response = await api.get(`/api/historics/client/${client_id}`);
  return response.data.data.historics;
}

export async function createHistoric({ entity_id, client_id, data_key, data, recorded_at }) {
  await api.post("/api/historics", { entity_id, client_id, data_key, data, recorded_at }, {
    headers: { "Content-Type": "application/json" },
  });
}

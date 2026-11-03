import api from "./api";

/** @returns {Promise<import('../contracts/resources').Alarm[]>} */
export async function fetchAlarms(client_id) {
  const response = await api.get(`/api/alarms/${client_id}`);
  return response.data.data.alarms;
}

/** @returns {Promise<import('../contracts/resources').Alarm>} */
export async function createAlarm({ entity_id, threshold, client_id, data_key, operator }) {
  const response = await api.post("/api/alarms", { entity_id, threshold, client_id, data_key, operator });
  return response.data.data.alarm;
}

export async function updateAlarm(alarm_id, { entity_id, threshold, data_key, operator }) {
  const response = await api.put(`/api/alarms/${alarm_id}`, { entity_id, threshold, data_key, operator });
  return response.data.data.alarm;
}
export async function deleteAlarm(alarm_id) {
  await api.delete(`/api/alarms/${alarm_id}`);
}

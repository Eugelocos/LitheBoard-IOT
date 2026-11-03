import api from "./api";

/** @returns {Promise<import('../contracts/resources').Dashboard[]>} */
export async function fetchDashboards(client_id) {
  const response = await api.get(`/api/dashboards/${client_id}`);
  return response.data.data.dashboards;
}

function buildDashboardPayload({ dashboard_id, client_id, name, description, shared_client_ids }, update = false) {
  return { ...(update ? { dashboard_id } : { client_id }), name, description, ...(shared_client_ids !== undefined ? { shared_client_ids } : {}) };
}

/** @returns {Promise<import('../contracts/resources').Dashboard>} */
export async function createDashboard(dashboard) {
  const response = await api.post("/api/dashboards", buildDashboardPayload(dashboard));
  return response.data.data.dashboard;
}

/** @returns {Promise<import('../contracts/resources').Dashboard>} */
export async function updateDashboard(dashboard) {
  const response = await api.put("/api/dashboards", buildDashboardPayload(dashboard, true));
  return response.data.data.dashboard;
}

export async function deleteDashboard(dashboard_id) {
  await api.delete(`/api/dashboards/${dashboard_id}`);
}

/** @returns {Promise<import('../contracts/resources').Dashboard>} */
export async function assignDashboard(client_id, dashboard_id) {
  const response = await api.post("/api/dashboards/assign", { client_id, dashboard_id });
  return response.data.data.dashboard;
}

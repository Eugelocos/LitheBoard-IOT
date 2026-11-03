import api from "./api";

/** @returns {Promise<import('../contracts/resources').Entity[]>} */
export async function fetchEntities(client_id) {
  const response = await api.get("/api/entities", { params: { client_id } });
  return response.data.data.entities;
}

function buildEntityPayload({ entity_id, client_id, name, datasource_type, datasource_config, rulechain_id }, update = false) {
  const keys = ['sub_topic', 'pub_topic', 'heartbeat_timeout_s', 'base_url', 'method', 'polling_interval_ms', 'data_key', 'query_params', 'headers', 'request_body'];
  const config = datasource_config && Object.fromEntries(keys.filter((key) => datasource_config[key] !== undefined).map((key) => [key, datasource_config[key]]));
  for (const key of ['query_params', 'headers', 'request_body']) {
    if (typeof config?.[key] !== 'string') continue;
    if (!config[key].trim()) { delete config[key]; continue; }
    config[key] = JSON.parse(config[key]);
    if (!config[key] || typeof config[key] !== 'object' || Array.isArray(config[key])) throw new Error(`${key} debe ser un objeto JSON.`);
  }
  return { ...(update ? { entity_id } : { client_id, datasource_type }), name, datasource_config: config, rulechain_id: rulechain_id || undefined };
}

/** @returns {Promise<import('../contracts/resources').Entity>} */
export async function createEntity(entity) {
  const response = await api.post("/api/entities", buildEntityPayload(entity));
  return response.data.data.entity;
}

/** @returns {Promise<import('../contracts/resources').Entity>} */
export async function updateEntity(entity) {
  const response = await api.put("/api/entities", buildEntityPayload(entity, true));
  return response.data.data.entity;
}

export async function deleteEntity(entity_id) {
  await api.delete(`/api/entities/${entity_id}`);
}

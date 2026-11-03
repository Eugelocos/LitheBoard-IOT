import api from "./api";

/** @returns {Promise<import('../contracts/resources').Rulechain[]>} */
export async function fetchRulechains(client_id) {
  const response = await api.get("/api/rulechains", { params: { client_id } });
  return response.data.data.rulechains;
}

function buildRulechainPayload({ rulechain_id, client_id, name, description, definition, entity_ids }, update = false) {
  return { ...(update ? { rulechain_id } : { client_id }), name, description, definition, entity_ids };
}

/** @returns {Promise<import('../contracts/resources').Rulechain>} */
export async function createRulechain(rulechain) {
  const response = await api.post("/api/rulechains", buildRulechainPayload(rulechain));
  return response.data.data.rulechain;
}

/** @returns {Promise<import('../contracts/resources').Rulechain>} */
export async function updateRulechain(rulechain) {
  const response = await api.put("/api/rulechains", buildRulechainPayload(rulechain, true));
  return response.data.data.rulechain;
}

export async function deleteRulechain(rulechain_id) {
  await api.delete(`/api/rulechains/${rulechain_id}`);
}

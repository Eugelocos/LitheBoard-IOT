import api from "./api";

export async function publishMessage(entity_id, message) {
  await api.post("/api/mqtt/publish", { entity_id, message });
}

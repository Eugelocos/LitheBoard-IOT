const db = require('../config/db');
let io;
function init(socket_io) { io = socket_io; }

async function emitForEntity(entity_id, event, payload) {
  if (!io || entity_id == null) return;
  try {
    // Resolve access on each event so unlinking a client or unsharing a
    // dashboard also revokes an already connected socket's access.
    const [clients] = await db.query(`
      SELECT DISTINCT c.client_id FROM clients c
      JOIN entities e ON e.entity_id = ?
      WHERE c.client_id = e.client_id
        OR (c.access_level_id = 2 AND c.admin_client_id = e.client_id)
        OR EXISTS (
          SELECT 1 FROM widgets w JOIN dashboards d ON d.dashboard_id = w.dashboard_id
          WHERE w.entity_id = e.entity_id
            AND JSON_CONTAINS(d.shared_client_ids, CAST(c.client_id AS JSON), '$')
        )`, [entity_id]);
    if (clients.length) io.to(clients.map((client) => `client:${client.client_id}`)).emit(event, payload);
  } catch (error) {
    // Fail closed: a database failure must never fall back to a broadcast.
    console.error('Could not authorize realtime event:', error.message);
  }
}
function emitHistoricCreated(historic) {
  return emitForEntity(historic.entity_id, 'historic:created', {
    historic: require('../contracts/resources').serializeResource('historic', historic),
  });
}
function emitEntityStateChange({ entity_id, connection_status }) {
  return emitForEntity(entity_id, 'entity:connection_changed', { entity_id, connection_status });
}
module.exports = { init, emitHistoricCreated, emitEntityStateChange };

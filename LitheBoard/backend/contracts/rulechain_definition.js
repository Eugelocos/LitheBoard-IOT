// Canonical graph <-> existing rules engine representation. Presentation is
// reconstructed only for the legacy compiler, never included in definition.
const variants = {
  input: ['input', 'Input'], filter: ['processing', 'Filtro de Mensajes'],
  key_selector: ['processing', 'Key Selector'], notification: ['action', 'Notificación'],
  storage: ['action', 'Almacenamiento'], delay: ['logic', 'Retraso'],
  aggregator: ['logic', 'Agregador'], mqtt_publish: ['output', 'Publicar MQTT'], webhook: ['output', 'Webhook'],
};
const config_fields = {
  filter: { value: 'threshold', filter: 'operator' }, key_selector: { key: 'data_key' },
  notification: { tipo: 'notification_type', destino: 'destination' },
  delay: { delay: 'delay_ms' }, aggregator: { agregator: 'aggregator' },
};
function translateConfig(type, config, legacy = false) {
  const result = { ...config };
  for (const [old, current] of Object.entries(config_fields[type] || {})) {
    const from = legacy ? current : old;
    const to = legacy ? old : current;
    if (Object.prototype.hasOwnProperty.call(result, from)) { result[to] = result[from]; delete result[from]; }
  }
  if (legacy && result.filter) result.filter = ({ greater_than: 'greaterThan', less_than: 'lessThan' })[result.filter] || result.filter;
  if (!legacy && result.operator) result.operator = ({ greaterThan: 'greater_than', lessThan: 'less_than' })[result.operator] || result.operator;
  if (!legacy && typeof result.notification_type === 'string') result.notification_type = result.notification_type.toLowerCase();
  if (legacy && result.tipo) result.tipo = ({ email: 'Email', sms: 'SMS' })[result.tipo] || result.tipo;
  return result;
}
function toDefinition(graph) {
  return {
    nodes: (graph.nodes || []).map((node) => {
      const node_type = node.node_type ?? Object.keys(variants).find((key) => variants[key][1] === node.data?.label) ?? node.type;
      return {
      node_id: node.node_id ?? node.id,
      node_type,
      position: { x: node.position?.x ?? 0, y: node.position?.y ?? 0 },
      node_config: translateConfig(node_type, node.node_config ?? node.data?.config ?? {}),
    }; }),
    edges: (graph.edges || []).map((edge) => ({
      edge_id: edge.edge_id ?? edge.id,
      source_node_id: edge.source_node_id ?? edge.source,
      target_node_id: edge.target_node_id ?? edge.target,
      ...(edge.source_handle_id != null || edge.sourceHandle != null ? { source_handle_id: edge.source_handle_id ?? edge.sourceHandle } : {}),
      ...(edge.target_handle_id != null || edge.targetHandle != null ? { target_handle_id: edge.target_handle_id ?? edge.targetHandle } : {}),
    })),
  };
}
function toRuntimeGraph(definition) {
  return {
    nodes: (definition.nodes || []).map((node) => ({
      id: node.node_id, type: variants[node.node_type]?.[0] ?? node.node_type,
      position: node.position,
      data: { label: variants[node.node_type]?.[1] ?? node.node_type, config: translateConfig(node.node_type, node.node_config || {}, true) },
    })),
    edges: (definition.edges || []).map((edge) => ({
      id: edge.edge_id, source: edge.source_node_id, target: edge.target_node_id,
      ...(edge.source_handle_id != null ? { sourceHandle: edge.source_handle_id } : {}),
      ...(edge.target_handle_id != null ? { targetHandle: edge.target_handle_id } : {}),
    })),
  };
}
module.exports = { toDefinition, toRuntimeGraph };

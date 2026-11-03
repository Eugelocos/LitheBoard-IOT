const Joi = require('joi');

const node_id = Joi.string().required();
const definitionSchema = Joi.object({
  nodes: Joi.array().items(Joi.object({
    node_id,
    node_type: Joi.string().valid('input', 'filter', 'key_selector', 'notification', 'storage', 'delay', 'aggregator', 'mqtt_publish', 'webhook').required(),
    position: Joi.object({ x: Joi.number().required(), y: Joi.number().required() }).unknown(false).required(),
    node_config: Joi.object({ value: Joi.forbidden(), filter: Joi.forbidden(), key: Joi.forbidden(), tipo: Joi.forbidden(), destino: Joi.forbidden(), delay: Joi.forbidden(), agregator: Joi.forbidden(), selected_key: Joi.forbidden(), 'widget_clave': Joi.forbidden() }).unknown(true).required(),
  }).unknown(false)).min(1).required(),
  edges: Joi.array().items(Joi.object({
    edge_id: Joi.string().required(), source_node_id: node_id, target_node_id: node_id,
    source_handle_id: Joi.string(), target_handle_id: Joi.string(),
  }).unknown(false)).required(),
}).unknown(false).custom((graph, helpers) => {
  const ids = new Set(graph.nodes.map((node) => node.node_id));
  if (ids.size !== graph.nodes.length || new Set(graph.edges.map((edge) => edge.edge_id)).size !== graph.edges.length) return helpers.error('any.invalid');
  if (!graph.nodes.some((node) => node.node_type === 'input')) return helpers.error('any.invalid');
  if (graph.edges.some((edge) => !ids.has(edge.source_node_id) || !ids.has(edge.target_node_id))) return helpers.error('any.invalid');
  const visiting = new Set();
  const visited = new Set();
  const adjacency = new Map(graph.nodes.map((node) => [node.node_id, []]));
  graph.edges.forEach((edge) => adjacency.get(edge.source_node_id).push(edge.target_node_id));
  function cycle(id) {
    if (visiting.has(id)) return true;
    if (visited.has(id)) return false;
    visiting.add(id);
    if (adjacency.get(id).some(cycle)) return true;
    visiting.delete(id); visited.add(id); return false;
  }
  if ([...ids].some(cycle)) return helpers.error('any.invalid');
  return graph;
});
module.exports = { definitionSchema };

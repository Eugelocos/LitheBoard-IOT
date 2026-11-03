import { NODE_TYPES } from "../data/node_schemas";

const node_types = ['input', 'filter', 'key_selector', 'notification', 'storage', 'delay', 'aggregator', 'mqtt_publish', 'webhook'];

export function toFlowGraph(definition) {
  return {
    nodes: (definition.nodes || []).map((node) => {
      const descriptor = NODE_TYPES[node_types.indexOf(node.node_type)];
      return {
        id: node.node_id, type: descriptor?.type ?? node.node_type, position: node.position,
        data: { ...descriptor, node_type: node.node_type, config: { ...node.node_config } },
      };
    }),
    edges: (definition.edges || []).map((edge) => ({
      id: edge.edge_id, source: edge.source_node_id, target: edge.target_node_id,
      ...(edge.source_handle_id != null ? { sourceHandle: edge.source_handle_id } : {}),
      ...(edge.target_handle_id != null ? { targetHandle: edge.target_handle_id } : {}),
    })),
  };
}

export function toDefinition(nodes, edges) {
  return {
    nodes: nodes.map((node) => ({
      node_id: node.id,
      node_type: node.data.node_type ?? node_types[NODE_TYPES.findIndex((descriptor) => descriptor.label === node.data.label)] ?? node.type,
      position: { x: node.position?.x ?? 0, y: node.position?.y ?? 0 },
      node_config: { ...node.data.config },
    })),
    edges: edges.map((edge) => ({
      edge_id: edge.id, source_node_id: edge.source, target_node_id: edge.target,
      ...(edge.sourceHandle != null ? { source_handle_id: edge.sourceHandle } : {}),
      ...(edge.targetHandle != null ? { target_handle_id: edge.targetHandle } : {}),
    })),
  };
}

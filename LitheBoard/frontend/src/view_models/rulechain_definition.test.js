import { toFlowGraph, toDefinition } from "./rulechain_definition";

const definition = {
  nodes: [
    { node_id: 'in', node_type: 'input', position: { x: 0, y: 0 }, node_config: {} },
    { node_id: 'filter', node_type: 'filter', position: { x: 10, y: 0 }, node_config: { threshold: 0, operator: 'greater_than' } },
  ],
  edges: [{ edge_id: 'e', source_node_id: 'in', target_node_id: 'filter', source_handle_id: 'right' }],
};

it('rebuilds presentation from node_type and saves only normalized graph data', () => {
  const flow = toFlowGraph(definition);
  expect(flow.nodes[1].data.label).toBe('Filtro de Mensajes');
  expect(flow.nodes[1].data.fields.map((field) => field.name)).toEqual(['threshold', 'operator']);
  flow.nodes[0].data.onConfigChange = () => {};
  flow.nodes[0].measured = { width: 100 };
  flow.edges[0].markerEnd = { type: 'arrow' };
  expect(toDefinition(flow.nodes, flow.edges)).toEqual(definition);
});

import React from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import RuleChainEditor from "./rulechain_board";
import { NODE_TYPES } from "../../data/node_schemas";
import { buildRulechain } from "../../test/test_utils";
import { mockProps, resetMockProps } from "../../test/mock_component";

// ReactFlow necesita medidas reales del DOM; se sustituye por un doble que
// expone sus props y conserva el estado de nodos/aristas con useState.
jest.mock("@xyflow/react", () => {
  const React = require("react");
  const { mockProps } = require("../../test/mock_component");
  const useFlowState = (initial) => {
    const [state, setState] = React.useState(initial);
    return [state, setState, () => {}];
  };
  return {
    ReactFlow: (props) => {
      mockProps.ReactFlow = props;
      return (
        <div data-testid="flow">
          {props.nodes.map((node) => (
            <span key={node.id}>{node.data.label}</span>
          ))}
        </div>
      );
    },
    Background: () => null,
    Handle: () => null,
    MarkerType: { ArrowClosed: "arrowclosed" },
    useNodesState: useFlowState,
    useEdgesState: useFlowState,
    useReactFlow: () => ({}),
  };
});

const storedNode = {
  node_id: "node-1",
  node_type: "filter",
  position: { x: 0, y: 0 },
  node_config: { threshold: "10" },
};

function renderEditor(rulechain = buildRulechain({ definition: { nodes: [storedNode], edges: [] } })) {
  const props = { rulechain, onSave: jest.fn(), onCancel: jest.fn() };
  render(<RuleChainEditor {...props} />);
  return props;
}

const flow = () => mockProps.ReactFlow;
const save = () => fireEvent.click(screen.getByRole("button", { name: "Save" }));

describe("<RuleChainEditor />", () => {
  beforeEach(resetMockProps);

  it("carga los nodos guardados e inyecta el callback de configuración", () => {
    renderEditor();

    expect(screen.getByText("Filtro de Mensajes", { selector: "span" })).toBeInTheDocument();
    expect(flow().nodes[0].data.onConfigChange).toEqual(expect.any(Function));
  });

  it("guarda la rulechain con los nodos y aristas actuales", () => {
    const { onSave, rulechain } = renderEditor();

    act(() => flow().onConnect({ source: "node-1", target: "node-2" }));
    save();

    expect(onSave).toHaveBeenCalledWith({
      ...rulechain,
      definition: {
        nodes: [expect.objectContaining({ node_id: "node-1" })],
        edges: [
          expect.objectContaining({
            source_node_id: "node-1",
            target_node_id: "node-2",
          }),
        ],
      },
    });
  });

  it("fusiona los cambios de configuración de un nodo", () => {
    const { onSave } = renderEditor();

    act(() => flow().nodes[0].data.onConfigChange("node-1", { operator: "less_than" }));
    save();

    const [savedNode] = onSave.mock.calls[0][0].definition.nodes;
    expect(savedNode.node_config).toEqual({ threshold: "10", operator: "less_than" });
  });

  it("crea un nodo nuevo al soltar un elemento de la paleta", () => {
    const { onSave } = renderEditor();
    const instance = { fitView: jest.fn(), screenToFlowPosition: jest.fn(() => ({ x: 5, y: 7 })) };
    const webhook = NODE_TYPES.find((node) => node.label === "Webhook");

    act(() => flow().onInit(instance));
    act(() =>
      flow().onDrop({
        preventDefault: jest.fn(),
        clientX: 100,
        clientY: 200,
        dataTransfer: { getData: () => JSON.stringify(webhook) },
      }),
    );

    expect(instance.fitView).toHaveBeenCalled();
    expect(instance.screenToFlowPosition).toHaveBeenCalledWith({ x: 100, y: 200 });
    expect(screen.getByText("Webhook", { selector: "span" })).toBeInTheDocument();

    save();
    expect(onSave.mock.calls[0][0].definition.nodes[1]).toMatchObject({
      node_type: "webhook",
      position: { x: 5, y: 7 },
      node_config: {},
    });
  });

  it("ignora soltar elementos antes de inicializar el lienzo", () => {
    renderEditor();

    act(() =>
      flow().onDrop({ preventDefault: jest.fn(), dataTransfer: { getData: () => JSON.stringify(NODE_TYPES[0]) } }),
    );

    expect(flow().nodes).toHaveLength(1);
  });

  it("delega la cancelación", () => {
    const { onCancel } = renderEditor();

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});

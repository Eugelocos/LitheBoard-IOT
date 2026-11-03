import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import NodePalette from "./node_palette";
import { NODE_TYPES } from "../../data/node_schemas";
import { selectMuiOption } from "../../test/test_utils";

function renderPalette() {
  const props = { onSave: jest.fn(), onCancel: jest.fn() };
  const view = render(<NodePalette {...props} />);
  const getNodeItems = () => [...view.container.querySelectorAll('[draggable="true"]')];
  return { ...props, getNodeItems };
}

describe("<NodePalette />", () => {
  it("muestra todos los nodos agrupados por categoría", () => {
    const { getNodeItems } = renderPalette();

    expect(getNodeItems().map((item) => item.textContent)).toEqual(
      NODE_TYPES.map((node) => `${node.icon}${node.label}`),
    );
    ["Processing", "Action", "Logic", "Output"].forEach((header) =>
      expect(screen.getByText(header)).toBeInTheDocument(),
    );
  });

  it("filtra los nodos por la categoría seleccionada", () => {
    const { getNodeItems } = renderPalette();

    selectMuiOption("Tipo de nodo", "action");

    expect(getNodeItems().map((item) => item.textContent)).toEqual(["🔔Notificación", "💾Almacenamiento"]);
    expect(screen.queryByText("Action")).not.toBeInTheDocument();
  });

  it("vuelve a mostrar todos los nodos al elegir 'Todos'", () => {
    const { getNodeItems } = renderPalette();

    selectMuiOption("Tipo de nodo", "logic");
    selectMuiOption("Tipo de nodo", "Todos");

    expect(getNodeItems()).toHaveLength(NODE_TYPES.length);
  });

  it("serializa la definición del nodo al arrastrarlo", () => {
    const { getNodeItems } = renderPalette();
    const dataTransfer = { setData: jest.fn(), effectAllowed: "" };
    const webhook = NODE_TYPES.find((node) => node.label === "Webhook");

    fireEvent.dragStart(getNodeItems().find((item) => item.textContent.includes("Webhook")), { dataTransfer });

    expect(dataTransfer.setData).toHaveBeenCalledWith("application/reactflow", JSON.stringify(webhook));
    expect(dataTransfer.effectAllowed).toBe("move");
  });

  it("delega guardar y cancelar", () => {
    const { onSave, onCancel } = renderPalette();

    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});

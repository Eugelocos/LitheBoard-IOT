import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import InputNode from "./input_node";
import ActionNode from "./action_node";
import LogicNode from "./logic_node";
import OutputNode from "./output_node";
import ProcessingNode from "./proccesing_node";
import UtilityNode from "./utility_node";

jest.mock("@xyflow/react", () => ({
  Handle: ({ type, position }) => <div data-testid={`handle-${type}`} data-position={position} />,
}));

const buildData = (overrides = {}) => ({
  label: "Filtro de Mensajes",
  color: "#FFEB3B",
  fields: [
    { name: "value", label: "Threshold", type: "text" },
    { name: "filter", label: "Condition", type: "select", options: ["greaterThan", "lessThan", "equal"] },
  ],
  handles: { inputs: ["left"], outputs: ["right"] },
  config: {},
  onConfigChange: jest.fn(),
  ...overrides,
});

describe("<InputNode />", () => {
  it("muestra la etiqueta y una única salida a la derecha", () => {
    render(<InputNode data={{ label: "Input" }} />);

    expect(screen.getByText("Input")).toBeInTheDocument();
    expect(screen.getByTestId("handle-source")).toHaveAttribute("data-position", "right");
    expect(screen.queryByTestId("handle-target")).not.toBeInTheDocument();
  });
});

describe.each([
  ["ActionNode", ActionNode],
  ["LogicNode", LogicNode],
  ["OutputNode", OutputNode],
  ["ProcessingNode", ProcessingNode],
  ["UtilityNode", UtilityNode],
])("<%s />", (_name, NodeComponent) => {
  it("renderiza etiqueta, campos y conexiones declaradas", () => {
    render(<NodeComponent id="n-1" data={buildData()} />);

    expect(screen.getByText("Filtro de Mensajes")).toBeInTheDocument();
    expect(screen.getByLabelText("Threshold")).toBeInTheDocument();
    expect(screen.getByText("Condition")).toBeInTheDocument();
    expect(screen.getByTestId("handle-target")).toHaveAttribute("data-position", "left");
    expect(screen.getByTestId("handle-source")).toHaveAttribute("data-position", "right");
  });

  it("inicializa los campos con la configuración guardada", () => {
    render(<NodeComponent id="n-1" data={buildData({ config: { value: "25", filter: "lessThan" } })} />);

    expect(screen.getByLabelText("Threshold")).toHaveValue("25");
    expect(screen.getByRole("combobox")).toHaveValue("lessThan");
  });

  it("usa la primera opción como threshold por defecto de los selects", () => {
    render(<NodeComponent id="n-1" data={buildData()} />);

    expect(screen.getByRole("combobox")).toHaveValue("greaterThan");
    expect(screen.getByLabelText("Threshold")).toHaveValue("");
  });

  it("notifica la configuración completa al editar un campo de texto", () => {
    const data = buildData();
    render(<NodeComponent id="n-1" data={data} />);

    fireEvent.change(screen.getByLabelText("Threshold"), { target: { value: "30" } });

    expect(data.onConfigChange).toHaveBeenCalledWith("n-1", { value: "30", filter: "greaterThan" });
  });

  it("notifica la configuración al cambiar un select", () => {
    const data = buildData({ config: { value: "10" } });
    render(<NodeComponent id="n-1" data={data} />);

    fireEvent.change(screen.getByRole("combobox"), { target: { value: "equal" } });

    expect(data.onConfigChange).toHaveBeenCalledWith("n-1", { value: "10", filter: "equal" });
  });

  it("se sincroniza cuando la configuración cambia desde fuera", () => {
    const data = buildData({ config: { value: "1" } });
    const { rerender } = render(<NodeComponent id="n-1" data={data} />);

    rerender(<NodeComponent id="n-1" data={{ ...data, config: { value: "99" } }} />);

    expect(screen.getByLabelText("Threshold")).toHaveValue("99");
  });

  it("funciona sin campos ni conexiones", () => {
    render(<NodeComponent id="n-1" data={{ label: "Almacenamiento", color: "#4CAF50" }} />);

    expect(screen.getByText("Almacenamiento")).toBeInTheDocument();
    expect(screen.queryByTestId("handle-source")).not.toBeInTheDocument();
  });
});

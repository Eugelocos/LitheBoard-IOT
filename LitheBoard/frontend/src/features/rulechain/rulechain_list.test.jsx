import React, { useState } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import api from "../../services/api";
import RulechainList from "./rulechain_list";
import {
  buildEntity,
  buildRulechain,
  buildUser,
  clickIconButton,
  clickRowAction,
  getGridRow,
} from "../../test/test_utils";

jest.mock("../../services/api");
jest.mock("./rulechain_board", () => ({ rulechain, onSave, onCancel }) => (
  <div>
    <p>Editor de {rulechain.name}</p>
    <button onClick={() => onSave({ definition: { nodes: [{ node_id: "nuevo", node_type: "input", node_config: {}, position: { x: 0, y: 0 } }], edges: [] } })}>Guardar board</button>
    <button onClick={onCancel}>Volver</button>
  </div>
));

const entities = [buildEntity()];

function Harness({ initial }) {
  const [rulechains, setRulechains] = useState(initial);
  return <RulechainList rulechains={rulechains} setRulechains={setRulechains} entities={entities} user={buildUser()} />;
}

const defaultRulechains = () => [
  buildRulechain(),
  buildRulechain({ rulechain_id: "rc-2", name: "Sin entidad", entity_ids: [] }),
];

describe("<RulechainList />", () => {
  it("muestra las rulechains con su entidad asociada", () => {
    render(<Harness initial={defaultRulechains()} />);

    expect(getGridRow("Regla temperatura")).toHaveTextContent("Sensor Temperatura");
    expect(getGridRow("Sin entidad")).toHaveTextContent("N/A");
  });

  it("elimina una rulechain", async () => {
    api.delete.mockResolvedValue({ data: { status: "success" } });
    render(<Harness initial={defaultRulechains()} />);

    clickRowAction("Regla temperatura", "DeleteIcon");

    await waitFor(() => expect(screen.queryByText("Regla temperatura")).not.toBeInTheDocument());
    expect(api.delete).toHaveBeenCalledWith(`/api/rulechains/rc-1`);
  });

  it("conserva la rulechain si el borrado falla", async () => {
    api.delete.mockRejectedValue(new Error("fail"));
    render(<Harness initial={defaultRulechains()} />);

    clickRowAction("Regla temperatura", "DeleteIcon");

    expect((await screen.findAllByRole("alert")).length).toBeGreaterThan(0);
    expect(screen.getByText("Regla temperatura")).toBeInTheDocument();
  });

  it("edita nombre y descripción desde el panel lateral", async () => {
    api.put.mockResolvedValue({ data: { data: { rulechain: {} } } });
    render(<Harness initial={defaultRulechains()} />);

    clickRowAction("Regla temperatura", "EditIcon");
    expect(screen.getByText("Editando: Regla temperatura")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Nombre"), { target: { value: "Regla renombrada" } });
    fireEvent.click(screen.getByRole("button", { name: "Guardar" }));

    expect(await screen.findByText("Regla renombrada")).toBeInTheDocument();
    expect(api.put).toHaveBeenCalledWith(`/api/rulechains`, {
      rulechain_id: "rc-1",
      name: "Regla renombrada",
      description: "Alerta por temperatura",
      definition: { nodes: [], edges: [] },
      entity_ids: ["entity-1"],
    });
  });

  it("guarda los cambios hechos en el editor visual", async () => {
    api.put.mockResolvedValue({ data: { data: { rulechain: {} } } });
    render(<Harness initial={defaultRulechains()} />);

    clickRowAction("Regla temperatura", "EditIcon");
    fireEvent.click(screen.getByRole("button", { name: "Abrir Editor" }));
    expect(screen.getByText("Editor de Regla temperatura")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Guardar board" }));
    fireEvent.click(await screen.findByRole("button", { name: "Guardar" }));

    await waitFor(() =>
      expect(api.put).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ definition: { nodes: [{ node_id: "nuevo", node_type: "input", node_config: {}, position: { x: 0, y: 0 } }], edges: [] } }),
      ),
    );
  });

  it("vuelve al panel lateral al salir del editor visual sin guardar", async () => {
    render(<Harness initial={defaultRulechains()} />);

    clickRowAction("Regla temperatura", "EditIcon");
    fireEvent.click(screen.getByRole("button", { name: "Abrir Editor" }));
    fireEvent.click(screen.getByRole("button", { name: "Volver" }));

    expect(await screen.findByText("Editando: Regla temperatura")).toBeInTheDocument();
  });

  it("muestra el formulario de alta y añade la nueva rulechain", async () => {
    api.post.mockResolvedValue({ data: { data: { rulechain: buildRulechain({ rulechain_id: "rc-3", name: "Nueva" }) } } });
    render(<Harness initial={defaultRulechains()} />);

    clickIconButton("AddRoundedIcon");
    fireEvent.change(screen.getByLabelText("Nombre"), { target: { value: "Nueva" } });
    fireEvent.click(screen.getByRole("button", { name: "Crear" }));

    expect(await screen.findByText("Nueva")).toBeInTheDocument();
    expect(screen.getByText("Rulechains Panel")).toBeInTheDocument();
  });
});

 beforeEach(() => jest.spyOn(window, "confirm").mockReturnValue(true));

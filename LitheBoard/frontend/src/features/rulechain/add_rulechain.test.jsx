import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import api from "../../services/api";
import AddRulechain from "./add_rulechain";
import { buildRulechain, buildUser, clickIconButton, httpError } from "../../test/test_utils";

jest.mock("../../services/api");

const user = buildUser();

function renderAddRulechain() {
  const props = { onAddRulechain: jest.fn(), showRulechainList: jest.fn(), setRulechains: jest.fn(), user };
  render(<AddRulechain {...props} />);
  return props;
}

function fill({ name = "Regla temperatura", description = "" } = {}) {
  fireEvent.change(screen.getByLabelText("Nombre"), { target: { value: name } });
  fireEvent.change(screen.getByLabelText("Descripción"), { target: { value: description } });
}

const create = () => fireEvent.click(screen.getByRole("button", { name: "Crear" }));

describe("<AddRulechain />", () => {
  it("crea la rulechain con un nodo de entrada por defecto", async () => {
    const created = buildRulechain();
    api.post.mockResolvedValue({ data: { data: { rulechain: created } } });
    const { onAddRulechain, showRulechainList } = renderAddRulechain();

    fill({ name: "  Regla temperatura  ", description: " Alerta " });
    create();

    await waitFor(() => expect(onAddRulechain).toHaveBeenCalledWith(created));
    expect(api.post).toHaveBeenCalledWith(`/api/rulechains`, {
      client_id: user.client_id,
      name: "Regla temperatura",
      description: "Alerta",
      definition: {
        nodes: [expect.objectContaining({ node_type: "input", node_config: {} })],
        edges: [],
      },
      entity_ids: [],
    });
    expect(showRulechainList).toHaveBeenCalledWith(false);
    expect(screen.getByLabelText("Nombre")).toHaveValue("");
  });

  it("envía descripción nula cuando se deja vacía", async () => {
    api.post.mockResolvedValue({ data: { data: { rulechain: buildRulechain() } } });
    renderAddRulechain();

    fill();
    create();

    await waitFor(() =>
      expect(api.post).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({ description: null })),
    );
  });

  it("no envía nada y marca error si falta el nombre", () => {
    renderAddRulechain();

    fill({ name: "   " });
    create();

    expect(api.post).not.toHaveBeenCalled();
    expect(screen.getByText("Error")).toBeInTheDocument();
  });

  it("marca error y permanece en el formulario si el backend falla", async () => {
    api.post.mockRejectedValue(httpError(500));
    const { onAddRulechain, showRulechainList } = renderAddRulechain();

    fill();
    create();

    expect(await screen.findByText("Error")).toBeInTheDocument();
    expect(onAddRulechain).not.toHaveBeenCalled();
    expect(showRulechainList).not.toHaveBeenCalled();
  });

  it("vuelve a la lista con el botón atrás", () => {
    const { showRulechainList } = renderAddRulechain();

    clickIconButton("ArrowBackIcon");

    expect(showRulechainList).toHaveBeenCalledWith(false);
  });
});

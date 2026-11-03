import React, { useState } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import api from "../../../services/api";
import DashboardListPanel from "./dashboard_list_panel";
import {
  apiError,
  apiNoContent,
  buildDashboard,
  clickIconButton,
  clickRowAction,
  getGridRow,
} from "../../../test/test_utils";

jest.mock("../../../services/api");

function renderPanel() {
  const handlers = { handleAddDashboard: jest.fn(), handleSwitchSection: jest.fn() };
  function Harness() {
    const [dashboards, setDashboards] = useState([
      buildDashboard(),
      buildDashboard({ dashboard_id: "d-2", name: "Oficina", description: "Clima" }),
    ]);
    return <DashboardListPanel dashboards={dashboards} setDashboards={setDashboards} {...handlers} />;
  }
  render(<Harness />);
  return handlers;
}

describe("<DashboardListPanel />", () => {
  it("lista los dashboards", () => {
    renderPanel();

    expect(screen.getByText("Planta")).toBeInTheDocument();
    expect(screen.getByText("Oficina")).toBeInTheDocument();
  });

  it("crea un dashboard con el botón flotante", () => {
    const { handleAddDashboard } = renderPanel();

    clickIconButton("AddRoundedIcon");

    expect(handleAddDashboard).toHaveBeenCalledTimes(1);
  });

  it("abre el dashboard al hacer doble clic en su fila", () => {
    const { handleSwitchSection } = renderPanel();

    fireEvent.doubleClick(getGridRow("Oficina"));

    expect(handleSwitchSection).toHaveBeenCalledWith("dashboards", expect.objectContaining({ id: "d-2", name: "Oficina" }));
  });

  it("elimina un dashboard cuando el backend lo confirma", async () => {
    api.delete.mockResolvedValue(apiNoContent());
    renderPanel();

    clickRowAction("Planta", "DeleteIcon");

    await waitFor(() => expect(screen.queryByText("Planta")).not.toBeInTheDocument());
    expect(api.delete).toHaveBeenCalledWith("/api/dashboards/dashboard-1");
  });

  it("conserva el dashboard y registra el motivo si el borrado falla", async () => {
    api.delete.mockRejectedValue(apiError(404, "DASHBOARD_NOT_FOUND", "No encontrado"));
    renderPanel();

    clickRowAction("Planta", "DeleteIcon");

    expect((await screen.findAllByRole("alert"))[0]).toHaveTextContent("No encontrado");
    expect(screen.getByText("Planta")).toBeInTheDocument();
  });

  it("edita nombre y descripción", async () => {
    api.put.mockResolvedValue({ data: { data: { dashboard: {} } } });
    renderPanel();

    clickRowAction("Oficina", "EditIcon");
    expect(screen.getByLabelText("Nombre")).toHaveValue("Oficina");
    expect(screen.getByLabelText("Descripción")).toHaveValue("Clima");
    fireEvent.change(screen.getByLabelText("Nombre"), { target: { value: "Oficina central" } });
    fireEvent.click(screen.getByRole("button", { name: "Guardar" }));

    expect(await screen.findByText("Oficina central")).toBeInTheDocument();
    expect(api.put).toHaveBeenCalledWith(`/api/dashboards`, {
      dashboard_id: "d-2",
      name: "Oficina central",
      description: "Clima",
    });
  });

  it("no modifica la lista si la edición falla", async () => {
    api.put.mockRejectedValue(new Error("fail"));
    renderPanel();

    clickRowAction("Oficina", "EditIcon");
    fireEvent.change(screen.getByLabelText("Nombre"), { target: { value: "Otro" } });
    fireEvent.click(screen.getByRole("button", { name: "Guardar" }));

    expect((await screen.findAllByRole("alert"))[0]).toHaveTextContent("Could not complete");
    expect(getGridRow("Oficina")).toBeInTheDocument();
  });
});

 beforeEach(() => jest.spyOn(window, "confirm").mockReturnValue(true));

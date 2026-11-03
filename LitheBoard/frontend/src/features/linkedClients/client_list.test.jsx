import React, { useState } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import api from "../../services/api";
import ClientList from "./client_list";
import {
  apiError,
  apiSuccess,
  buildDashboard,
  clickRowAction,
  getGridRow,
  selectMuiOption,
} from "../../test/test_utils";

jest.mock("../../services/api");

const ADMIN_ID = "admin-1";
const clients = [
  { client_id: "c-2", name: "Ana", email: "ana@example.com" },
  { client_id: "c-3", name: "Luis", email: "luis@example.com" },
];
const dashboards = [
  buildDashboard({ dashboard_id: "d-1", name: "Planta", shared_client_ids: ["c-2"] }),
  buildDashboard({ dashboard_id: "d-2", name: "Oficina", shared_client_ids: [] }),
];

function mockBackend({ updatedDashboards = dashboards } = {}) {
  api.get.mockImplementation((url) => {
    if (url === `/api/clients/admins/${ADMIN_ID}/clients`) {
      return Promise.resolve(apiSuccess({ client_ids: ["c-2", "c-3"] }, { count: 2 }));
    }
    if (url === `/api/clients/c-2,c-3`) return Promise.resolve(apiSuccess({ clients }, { count: clients.length }));
    if (url === `/api/dashboards/${ADMIN_ID}`) {
      return Promise.resolve(apiSuccess({ dashboards: updatedDashboards }));
    }
    return Promise.reject(new Error(`URL no esperada: ${url}`));
  });
}

function Harness() {
  const [associated, setAssociated] = useState([]);
  const [dashboardList, setDashboards] = useState(dashboards);
  return (
    <ClientList
      client_id={ADMIN_ID}
      dashboards={dashboardList}
      clients_asociated={associated}
      setClientsAsociated={setAssociated}
      setDashboards={setDashboards}
    />
  );
}

async function renderLoaded() {
  render(<Harness />);
  await screen.findByText("Ana");
}

describe("<ClientList />", () => {
  beforeEach(() => {
    mockBackend();
    jest.spyOn(window, "alert").mockImplementation(() => {});
    jest.spyOn(window, "confirm").mockReturnValue(true);
  });

  it("carga los clientes asociados y sus dashboards asignados", async () => {
    await renderLoaded();

    expect(getGridRow("Ana")).toHaveTextContent("ana@example.com");
    expect(getGridRow("Ana")).toHaveTextContent("Planta");
    expect(getGridRow("Luis")).not.toHaveTextContent("Planta");
  });

  it("no pide detalles cuando el admin no tiene clientes asociados", async () => {
    api.get.mockResolvedValue(apiSuccess({ client_ids: [] }, { count: 0 }));
    render(<Harness />);

    await waitFor(() => expect(api.get).toHaveBeenCalledTimes(1));
    expect(screen.queryByText("Ana")).not.toBeInTheDocument();
    expect(console.error).not.toHaveBeenCalledWith("Error fetching associated clients:", expect.anything());
  });

  it("registra el error si no puede cargar los clientes", async () => {
    api.get.mockRejectedValue(new Error("network"));
    render(<Harness />);

    await waitFor(() =>
      expect(console.error).toHaveBeenCalledWith("Error fetching associated clients:", expect.any(Error)),
    );
  });

  it("edita los datos de un cliente", async () => {
    api.put.mockResolvedValue(apiSuccess({ client: { client_id: "c-2", name: "Ana María", email: "ana@example.com" } }));
    await renderLoaded();

    clickRowAction("Ana", "EditIcon");
    fireEvent.change(screen.getByLabelText("Nombre"), { target: { value: "Ana María" } });
    fireEvent.click(screen.getByRole("button", { name: "Guardar" }));

    expect(await screen.findByText("Ana María")).toBeInTheDocument();
    expect(api.put).toHaveBeenCalledWith(`/api/clients`, {
      client_id: "c-2",
      name: "Ana María",
      email: "ana@example.com",
    });
    expect(window.alert).toHaveBeenCalledWith("Cambios guardados exitosamente");
  });

  it("informa el error del backend al editar", async () => {
    api.put.mockRejectedValue(apiError(409, "CONFLICT", "Email duplicado"));
    await renderLoaded();

    clickRowAction("Ana", "EditIcon");
    fireEvent.click(screen.getByRole("button", { name: "Guardar" }));

    await waitFor(() => expect(window.alert).toHaveBeenCalledWith("Email duplicado"));
  });

  it("elimina un cliente tras confirmar", async () => {
    api.delete.mockResolvedValue({ data: {} });
    await renderLoaded();

    clickRowAction("Luis", "DeleteIcon");

    await waitFor(() => expect(screen.queryByText("Luis")).not.toBeInTheDocument());
    expect(api.delete).toHaveBeenCalledWith(`/api/clients/c-3`);
  });

  it("no elimina si el usuario cancela la confirmación", async () => {
    window.confirm.mockReturnValue(false);
    await renderLoaded();

    clickRowAction("Luis", "DeleteIcon");

    expect(api.delete).not.toHaveBeenCalled();
    expect(screen.getByText("Luis")).toBeInTheDocument();
  });

  it("asigna un dashboard disponible y refresca la lista", async () => {
    api.post.mockResolvedValue(apiSuccess({ dashboard: dashboards[1] }));
    mockBackend({
      updatedDashboards: [dashboards[0], { ...dashboards[1], shared_client_ids: ["c-2"] }],
    });
    await renderLoaded();

    clickRowAction("Ana", "DashboardRoundedIcon");
    expect(screen.getByText("Assigned Dashboards")).toBeInTheDocument();
    selectMuiOption("Add Dashboard", "Oficina");
    fireEvent.click(screen.getByRole("button", { name: "Assign" }));

    await waitFor(() => expect(window.alert).toHaveBeenCalledWith("Dashboard asignado correctamente"));
    expect(api.post).toHaveBeenCalledWith(`/api/dashboards/assign`, {
      client_id: "c-2",
      dashboard_id: "d-2",
    });
    await waitFor(() => expect(getGridRow("Ana")).toHaveTextContent("Planta, Oficina"));
  });

  it("solo ofrece dashboards que el cliente aún no tiene", async () => {
    await renderLoaded();

    clickRowAction("Ana", "DashboardRoundedIcon");
    fireEvent.mouseDown(
      screen.getAllByLabelText("Add Dashboard").find((el) => el.getAttribute("role") !== "listbox"),
    );

    const options = screen.getAllByRole("option").map((option) => option.textContent);
    expect(options).toEqual(["Oficina"]);
  });
});

import React from "react";
import { act, render, screen, waitFor } from "@testing-library/react";
import api from "../../../services/api";
import socket from "../../../socket.js";
import { getDashboardWidgets } from "../../../component/database_data_functions.jsx";
import Dashboard from "./dashboard";
import { buildDashboard, buildDevice, buildEntity, buildUser } from "../../../test/test_utils";
import { mockProps, resetMockProps } from "../../../test/mock_component";

jest.mock("../../../services/api");
jest.mock("../../../socket.js", () => ({ __esModule: true, default: { on: jest.fn(), off: jest.fn() } }));
jest.mock("mqtt", () => ({}));
jest.mock("../../../app/app.jsx", () => ({}));
jest.mock("../../../component/database_data_functions.jsx", () => ({
  getDashboardWidgets: jest.fn(),
  getHistorialEntity: jest.fn(),
}));
jest.mock("./Widget/WidgetForm/widgets_form_selection.jsx", () =>
  require("../../../test/mock_component").mockComponent("WidgetSelection"),
);
jest.mock("./Widget/dashboard_widget_list.jsx", () =>
  require("../../../test/mock_component").mockComponent("WidgetList"),
);
jest.mock("./Widget/WidgetForm/Edit/edit_widget_form.jsx", () =>
  require("../../../test/mock_component").mockComponent("WidgetEditor"),
);

const user = buildUser();
const dashboard = buildDashboard({ client_id: "owner-7" });

function renderDashboard(overrides = {}) {
  return render(
    <Dashboard
      dashboard_name="Planta"
      dashboard_id={dashboard.dashboard_id}
      dashboard={dashboard}
      entities={[buildEntity()]}
      setEntities={jest.fn()}
      user={user}
      {...overrides}
    />,
  );
}

const socketHandler = (event) => socket.on.mock.calls.find(([name]) => name === event)[1];
const listedDevices = () => mockProps.WidgetList.devices_list;

async function renderLoaded(devices = [buildDevice()]) {
  getDashboardWidgets.mockResolvedValue({ devices, history: [] });
  const view = renderDashboard();
  await waitFor(() => expect(listedDevices()).toEqual(devices));
  return view;
}

describe("<Dashboard />", () => {
  beforeEach(resetMockProps);

  it("muestra el nombre del dashboard", async () => {
    await renderLoaded();

    expect(screen.getByRole("heading", { name: "Planta" })).toBeInTheDocument();
  });

  it("carga los widgets usando el cliente dueño del dashboard", async () => {
    await renderLoaded();

    expect(getDashboardWidgets).toHaveBeenCalledWith("dashboard-1", "owner-7");
  });

  it("usa el cliente del usuario si el dashboard no tiene dueño", async () => {
    getDashboardWidgets.mockResolvedValue({ devices: [], history: [] });

    renderDashboard({ dashboard: buildDashboard({ client_id: undefined }) });

    await waitFor(() => expect(getDashboardWidgets).toHaveBeenCalledWith("dashboard-1", user.client_id));
  });

  it("registra el error si no puede cargar los widgets", async () => {
    getDashboardWidgets.mockRejectedValue(new Error("fail"));

    renderDashboard();

    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent("Could not load dashboard"),
    );
  });

  it("añade históricos confirmados sin duplicar eventos repetidos", async () => {
    const other = buildDevice({ widget_id: "widget-2", entity_id: "entity-2" });
    await renderLoaded([buildDevice(), other]);
    const historic = { historic_id: "h-2", entity_id: "entity-1", data: { temp: 23 } };
    act(() => socketHandler("historic:created")({ historic }));
    act(() => socketHandler("historic:created")({ historic }));
    expect(listedDevices()[0].historics).toEqual([historic]);
    expect(listedDevices()[1].historics).toEqual([]);
    expect(api.get).not.toHaveBeenCalled();
  });

  it("actualiza connection_status y libera suscripciones", async () => {
    const { unmount } = await renderLoaded();
    act(() => socketHandler("entity:connection_changed")({ entity_id: "entity-1", connection_status: "offline" }));
    expect(listedDevices()[0].connection_status).toBe("offline");
    unmount();
    expect(socket.off).toHaveBeenCalledWith("historic:created", expect.any(Function));
    expect(socket.off).toHaveBeenCalledWith("entity:connection_changed", expect.any(Function));
  });

  it("publica el estado del switch por MQTT", async () => {
    const device = buildDevice({ widget_type: "switch" });
    await renderLoaded([device]);
    api.post.mockResolvedValue({ data: { status: "success" } });

    act(() => mockProps.WidgetList.toggleSwitchState(device));

    expect(api.post).toHaveBeenCalledWith(`/api/mqtt/publish`, { entity_id: "entity-1", message: "true" });
    expect(device.widget_config.is_on).toBe(false);
  });

  it("guarda la edición de un widget y recarga la lista", async () => {
    await renderLoaded();
    const refreshed = [buildDevice({ name: "Editado" })];
    api.put.mockResolvedValue({ data: { data: { widget: {} } } });
    getDashboardWidgets.mockResolvedValue({ devices: refreshed, history: [] });

    await act(() =>
      mockProps.WidgetEditor.onSave({
        widget_id: "widget-1",
        name: "Editado",
        entity_id: "entity-1",
        widget_type: "line_chart",
        widget_config: { line_color: "#000000", data_key: "temp" },
      }),
    );

    expect(api.put).toHaveBeenCalledWith(
      `/api/widgets/widget-1`,
      expect.objectContaining({
        name: "Editado",
        dashboard_id: "dashboard-1",
        widget_config: expect.objectContaining({ line_color: "#000000", data_key: "temp" }),
      }),
    );
    expect(listedDevices()).toEqual(refreshed);
  });

  it("no guarda ediciones incompletas", async () => {
    await renderLoaded();

    act(() => {
      mockProps.WidgetEditor.onSave({ widget_id: "widget-1", name: "", widget_config: {} });
    });

    expect(api.put).not.toHaveBeenCalled();
  });

  it("muestra la selección de widgets al pulsar '+'", async () => {
    const { container } = await renderLoaded();

    act(() => container.querySelector('[data-icon="plus"]').closest("button").click());

    expect(container.querySelector("#sumDisp")).toHaveStyle({ display: "block" });
    expect(container.querySelector("#contenedor")).toHaveStyle({ display: "none" });

    act(() => mockProps.WidgetSelection.returnFromWidgetFormSelection());
    expect(container.querySelector("#sumDisp")).toHaveStyle({ display: "none" });
  });
});

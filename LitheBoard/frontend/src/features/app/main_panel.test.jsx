import React from "react";
import { act, screen, waitFor } from "@testing-library/react";
import api from "../../services/api.js";
import DashboardPanel from "./main_panel";
import {
  buildAlarm,
  buildDashboard,
  buildEntity,
  buildNotification,
  buildRulechain,
  buildUser,
  httpError,
  renderWithRouter,
  setAuthenticatedUser,
} from "../../test/test_utils";
import { mockProps, resetMockProps } from "../../test/mock_component";

jest.mock("../../services/api.js");
jest.mock("../../socket", () => ({connect:jest.fn(),disconnect:jest.fn()}));
jest.mock("../dashboards/Dashboard/dashboard", () => require("../../test/mock_component").mockComponent("Dashboard"));
jest.mock("../entities/device_list", () => require("../../test/mock_component").mockComponent("DeviceList"));
jest.mock("../dashboards/PanelDashboards/dashboard_list_panel", () => require("../../test/mock_component").mockComponent("DashboardListPanel"));
jest.mock("../menu/TopMenu/top_menu", () => require("../../test/mock_component").mockComponent("TopMenu"));
jest.mock("../profile/profile_settings_panel ", () => require("../../test/mock_component").mockComponent("ProfileSettingsPanel"));
jest.mock("../menu/LateralMenu/lateral_menu", () => require("../../test/mock_component").mockComponent("LateralMenu"));
jest.mock("../alarms/alarm_list", () => require("../../test/mock_component").mockComponent("AlarmList"));
jest.mock("../linkedClients/client_list", () => require("../../test/mock_component").mockComponent("ClientList"));
jest.mock("../rulechain/rulechain_list.jsx", () => require("../../test/mock_component").mockComponent("RulechainList"));

const user = buildUser();
const data = {
  entities: [buildEntity()],
  dashboards: [buildDashboard(), buildDashboard({ dashboard_id: "dashboard-2", name: "Oficina" })],
  alarms: [buildAlarm()],
  rulechains: [buildRulechain()],
  notifications: [
    buildNotification(),
    buildNotification({ notification_id: "n-2", alarm_id: "borrada", is_read: true }),
  ],
};

/** Responde cada endpoint de la carga inicial; `overrides` permite fallos puntuales. */
function mockInitialLoad(overrides = {}) {
  const responses = {
    [`/api/entities`]: { entities: data.entities },
    [`/api/dashboards/${user.client_id}`]: { dashboards: data.dashboards },
    [`/api/alarms/${user.client_id}`]: { alarms: data.alarms },
    [`/api/rulechains`]: { rulechains: data.rulechains },
    [`/api/notifications/${user.client_id}`]: { notifications: data.notifications },
  };
  api.get.mockImplementation((url) => {
    if (overrides[url]) return Promise.reject(overrides[url]);
    if (responses[url]) return Promise.resolve({ data: { data: responses[url] } });
    return Promise.reject(new Error(`URL no esperada: ${url}`));
  });
}

function renderPanel() {
  return renderWithRouter(<DashboardPanel />, {
    route: "/dashboard",
    extraRoutes: { "/login": <div>Login</div> },
  });
}

async function renderLoaded() {
  const view = renderPanel();
  await waitFor(() => expect(mockProps.TopMenu.all_notifications).toHaveLength(2));
  return view;
}

const expectLocation = (pathname) =>
  waitFor(() => expect(screen.getByTestId("location")).toHaveTextContent(pathname));

describe("<DashboardPanel />", () => {
  beforeEach(() => {
    resetMockProps();
    mockInitialLoad();
  });

  describe("sesión", () => {
    it("redirige al login si no hay usuario guardado", async () => {
      renderPanel();

      await expectLocation("/login");
      expect(api.get).not.toHaveBeenCalled();
    });

    it("redirige al login si el usuario guardado está corrupto", async () => {
      localStorage.setItem("user", "{no-json");

      renderPanel();

      await expectLocation("/login");
    });

    it("requiere login para una sesión antigua sin client_id", async () => {
      localStorage.setItem("user", JSON.stringify({ id: "client-1", name: "Legacy" }));

      renderPanel();

      await expectLocation("/login");
      expect(api.get).not.toHaveBeenCalled();
    });

    it("redirige al login si el backend responde 401", async () => {
      setAuthenticatedUser(user);
      mockInitialLoad({ [`/api/entities`]: httpError(401) });

      renderPanel();

      await expectLocation("/login");
    });
  });

  describe("carga inicial", () => {
    beforeEach(() => setAuthenticatedUser(user));

    it("reparte los datos del cliente a cada sección", async () => {
      await renderLoaded();

      expect(api.get).toHaveBeenCalledWith(`/api/entities`, { params: { client_id: user.client_id } });
      expect(mockProps.DeviceList).toMatchObject({ entities: data.entities, rulechains: data.rulechains, user });
      expect(mockProps.DashboardListPanel.dashboards).toEqual(data.dashboards);
      expect(mockProps.AlarmList).toMatchObject({ alarms: data.alarms, entities: data.entities });
      expect(mockProps.RulechainList.rulechains).toEqual(data.rulechains);
      expect(mockProps.LateralMenu.dashboards).toEqual(data.dashboards);
      expect(screen.getAllByTestId("Dashboard")).toHaveLength(2);
    });

    it("enriquece las notificaciones con los datos de su alarma", async () => {
      await renderLoaded();

      const [known, orphan] = mockProps.TopMenu.all_notifications;
      expect(known).toMatchObject({ alarm_value: 30, alarm_key: "temp", device_name: "Sensor Temperatura" });
      expect(orphan).toMatchObject({ alarm_value: "Desconocido", alarm_key: "Desconocido", device_name: "Desconocido" });
      expect(mockProps.TopMenu.unseen_notifications.map((n) => n.notification_id)).toEqual(["n-1"]);
    });

    it("registra el error y sigue en el panel si falla una carga", async () => {
      mockInitialLoad({ [`/api/alarms/${user.client_id}`]: httpError(500) });

      renderPanel();

      await waitFor(() =>
        expect(console.error).toHaveBeenCalledWith("Error inicializando MainPanel:", expect.any(Error)),
      );
      expect(screen.getByTestId("location")).toHaveTextContent("/dashboard");
    });

    it("oculta los clientes asociados a usuarios comunes", async () => {
      await renderLoaded();

      expect(screen.queryByTestId("ClientList")).not.toBeInTheDocument();
    });

    it("muestra los clientes asociados a administradores", async () => {
      setAuthenticatedUser(buildUser({ role: "admin" }));

      await renderLoaded();

      expect(screen.getByTestId("ClientList")).toBeInTheDocument();
      expect(mockProps.ClientList).toMatchObject({ client_id: user.client_id, dashboards: data.dashboards });
    });
  });

  describe("acciones", () => {
    beforeEach(() => setAuthenticatedUser(user));

    it("muestra solo la sección elegida", async () => {
      const { container } = await renderLoaded();

      act(() => mockProps.LateralMenu.handleSwitchSection("devices-list"));

      expect(container.querySelector(".devices-list")).toHaveStyle({ display: "block" });
      expect(container.querySelector(".dashboard-list")).toHaveStyle({ display: "none" });
    });

    it("abre un dashboard concreto", async () => {
      const { container } = await renderLoaded();

      act(() => mockProps.LateralMenu.handleSwitchSection("dashboards", data.dashboards[1]));

      expect(container.querySelector(".dashboards")).toHaveStyle({ display: "block" });
      expect(container.querySelector("#dashboard-dashboard-2")).toHaveStyle({ display: "block" });
      expect(container.querySelector("#dashboard-dashboard-1")).toHaveStyle({ display: "none" });
    });

    it("crea un dashboard y recarga la lista", async () => {
      await renderLoaded();
      const updated = [...data.dashboards, buildDashboard({ dashboard_id: "dashboard-3", name: "dashboard 3" })];
      api.post.mockResolvedValue({ data: { data: { dashboard: updated[updated.length - 1] } } });
      api.get.mockResolvedValue({ data: { data: { dashboards: updated } } });

      await act(() => mockProps.DashboardListPanel.handleAddDashboard());

      expect(api.post).toHaveBeenCalledWith(`/api/dashboards`, {
        name: "dashboard 3",
        description: "Dashboard",
        client_id: user.client_id,
      });
      expect(mockProps.DashboardListPanel.dashboards).toEqual(updated);
    });

    it("añade nuevas entidades a la lista", async () => {
      await renderLoaded();
      const created = buildEntity({ entity_id: "entity-9" });

      act(() => mockProps.DeviceList.handleAddDevice(created));

      expect(mockProps.DeviceList.entities).toEqual([...data.entities, created]);
    });

    it("cierra sesión desde el perfil", async () => {
      await renderLoaded();
      api.post.mockResolvedValue({ data: {} });

      await act(() => mockProps.ProfileSettingsPanel.handleLogout());

      await expectLocation("/login");
      expect(localStorage.getItem("token")).toBeNull();
    });
  });
});

import api from "./api";
import { fetchEntities, createEntity, updateEntity, deleteEntity } from "./entities_service";
import { fetchDashboards, createDashboard, updateDashboard, deleteDashboard, assignDashboard } from "./dashboards_service";
import { fetchWidgets, createWidget, updateWidget, deleteWidget, updateWidgetFromForm } from "./widgets_service";
import { fetchAlarms, createAlarm } from "./alarms_service";
import { fetchNotifications, createNotification, markNotificationRead } from "./notifications_service";
import { fetchClientHistorics, fetchEntityHistorics, createHistoric } from "./historics_service";
import { fetchRulechains, createRulechain, updateRulechain, deleteRulechain } from "./rulechains_service";
import { fetchAssociatedClients, updateClient, deleteClient } from "./clients_service";
import { login, register, logout } from "./auth_service";
import { publishMessage } from "./mqtt_service";

jest.mock("./api");
const ok = (data) => ({ data: { status: "success", data, error: null } });

describe("resource services", () => {
  it.each([
    [fetchEntities, [7], "/api/entities", "entities", { params: { client_id: 7 } }],
    [fetchDashboards, [7], "/api/dashboards/7", "dashboards", undefined],
    [fetchWidgets, [3, 7], "/api/widgets/7/3", "widgets", undefined],
    [fetchAlarms, [7], "/api/alarms/7", "alarms", undefined],
    [fetchNotifications, [7], "/api/notifications/7", "notifications", undefined],
    [fetchClientHistorics, [7], "/api/historics/client/7", "historics", undefined],
    [fetchEntityHistorics, [42], "/api/historics/entity/42", "historics", undefined],
    [fetchRulechains, [7], "/api/rulechains", "rulechains", { params: { client_id: 7 } }],
  ])("unwraps collections, including empty ones (case %#)", async (fetchResource, args, url, key, options) => {
    const records = [{ name: "record" }];
    api.get.mockResolvedValueOnce(ok({ [key]: records })).mockResolvedValueOnce(ok({ [key]: [] }));
    expect(await fetchResource(...args)).toBe(records);
    expect(await fetchResource(...args)).toEqual([]);
    expect(api.get).toHaveBeenCalledWith(...(options ? [url, options] : [url]));
  });

  it.each([
    [createEntity, "post", "/api/entities", "entity", { client_id: 7, name: "Sensor", datasource_type: "mqtt", datasource_config: {} }],
    [updateEntity, "put", "/api/entities", "entity", { entity_id: 42, name: "Sensor" }],
    [createDashboard, "post", "/api/dashboards", "dashboard", { client_id: 7, name: "Board", description: "", shared_client_ids: [8] }],
    [updateDashboard, "put", "/api/dashboards", "dashboard", { dashboard_id: 3, name: "Board" }],
    [createWidget, "post", "/api/widgets", "widget", { entity_id: 42, name: "Value", widget_config: {} }],
    [updateWidget, "put", "/api/widgets/5", "widget", { widget_id: 5, name: "Value", widget_config: {} }],
    [createAlarm, "post", "/api/alarms", "alarm", { entity_id: 42, threshold: 30, client_id: 7, data_key: "temp", operator: "greater_than" }],
    [createNotification, "post", "/api/notifications", "notification", { alarm_id: 9, client_id: 7, value: "31", created_at: "2026-10-30T12:00:00Z" }],
        [createRulechain, "post", "/api/rulechains", "rulechain", { client_id: 7, name: "Rule", definition: { nodes: [], edges: [] }, entity_ids: [] }],
    [updateRulechain, "put", "/api/rulechains", "rulechain", { rulechain_id: 2, name: "Rule" }],
    [updateClient, "put", "/api/clients", "client", { client_id: 7, name: "Client", email: "client@example.com" }],
    [login, "post", "/api/clients/login", "session", { email: "client@example.com", password: "secret" }],
    [register, "post", "/api/clients/register", "client", { name: "Client", email: "client@example.com", password: "secret", role: "client" }],
  ])("returns the resource and strips view fields (case %#)", async (saveResource, method, url, key, fields) => {
    const resource = { ...fields, created_at: "2026-10-30T12:00:00Z" };
    api[method].mockResolvedValue(ok({ [key]: resource }));
    expect(await saveResource({ ...fields, label: "view only", onClick: () => {} })).toBe(resource);
    const [called_url, payload] = api[method].mock.calls[0];
    expect(called_url).toBe(url);
    expect(payload).toMatchObject(fields);
    expect(payload).not.toHaveProperty("label");
    expect(payload).not.toHaveProperty("onClick");
  });

  it.each([
    [deleteEntity, [42], "delete", "/api/entities/42"],
    [deleteDashboard, [3], "delete", "/api/dashboards/3"],
    [deleteWidget, [5], "delete", "/api/widgets/5"],
    [deleteRulechain, [2], "delete", "/api/rulechains/2"],
    [deleteClient, [7], "delete", "/api/clients/7"],
    [markNotificationRead, [9], "patch", "/api/notifications/9/read"],
    [logout, [], "post", "/api/clients/logout"],
    [createHistoric, [{ entity_id: 42, data_key: "temp" }], "post", "/api/historics"],
    [publishMessage, [42, "on"], "post", "/api/mqtt/publish"],
  ])("handles actions without reading a response body (case %#)", async (action, args, method, url) => {
    api[method].mockResolvedValue({ status: 204, data: "" });
    await expect(action(...args)).resolves.toBeUndefined();
    expect(api[method].mock.calls[0][0]).toBe(url);
  });

  it("loads associated clients only when there are ids", async () => {
    api.get.mockResolvedValueOnce(ok({ client_ids: [] }));
    await expect(fetchAssociatedClients(7)).resolves.toEqual([]);
    expect(api.get).toHaveBeenCalledTimes(1);
    api.get.mockResolvedValueOnce(ok({ client_ids: [8, 9] })).mockResolvedValueOnce(ok({ clients: [{ client_id: 8 }] }));
    await expect(fetchAssociatedClients(7)).resolves.toEqual([{ client_id: 8 }]);
    expect(api.get).toHaveBeenLastCalledWith("/api/clients/8,9");
  });

  it("returns the assigned dashboard", async () => {
    const dashboard = { dashboard_id: 3 };
    api.post.mockResolvedValue(ok({ dashboard }));
    await expect(assignDashboard(7, 3)).resolves.toBe(dashboard);
    expect(api.post).toHaveBeenCalledWith("/api/dashboards/assign", { client_id: 7, dashboard_id: 3 });
  });

  it("propagates the original HTTP error", async () => {
    const error = Object.assign(new Error("Forbidden"), { response: { status: 403, data: { error: { code: "FORBIDDEN" } } } });
    api.get.mockRejectedValue(error);
    await expect(fetchEntities(7)).rejects.toBe(error);
    api.post.mockRejectedValue(error);
    await expect(createWidget({ name: "Value" })).rejects.toBe(error);
  });

  it("maps an edited switch without serializing presentation data or losing false", async () => {
    api.put.mockResolvedValue(ok({ widget: { widget_id: 5 } }));
    await updateWidgetFromForm({
      widget_id: 5,
      entity_id: 42,
      name: "Switch",
      widget_type: "switch",
      label: "View label",
      widget_config: { is_on: false, message_on: "on", message_off: "off", data_key: "power", client_id: 7, onClick: () => {} },
    }, 3);
    const [, payload] = api.put.mock.calls[0];
    expect(payload).toMatchObject({ widget_id: 5, dashboard_id: 3, widget_config: { is_on: false, data_key: "power" } });
    expect(payload).not.toHaveProperty("client_id");
    expect(payload).not.toHaveProperty("label");
    expect(payload.widget_config).not.toHaveProperty("onClick");
    expect(payload.widget_config).not.toHaveProperty("client_id");
  });
});

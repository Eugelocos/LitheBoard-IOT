import Device from "./device";

describe("Device", () => {
  it("guarda los datos del widget y arranca sin widget_id", () => {
    const historics = [{ historic_id: "h-1" }];
    const widget_config = { data_key: "temp" };

    const device = new Device("entity-1", "Temperatura", "client-1", "dashboard-1", "line_chart", historics, widget_config);

    expect(device).toEqual({
      widget_id: null,
      entity_id: "entity-1",
      name: "Temperatura",
      client_id: "client-1",
      dashboard_id: "dashboard-1",
      widget_type: "line_chart",
      historics,
      widget_config,
    });
  });
});

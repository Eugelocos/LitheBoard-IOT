import api from "../services/api";
import Device from "../features/dataStructures/device";
import {
  getDashboardWidgets,
  getDevice,
  getHistorialEntity,
  setDatosHistoricos,
  setDevice,
  setWidget,
} from "./database_data_functions";
import {
  buildEntity,
  buildHistoric,
  buildWidget,
  httpError,
} from "../test/test_utils";

jest.mock("../services/api");

const CLIENT_ID = "client-1";
const DASHBOARD_ID = "dashboard-1";

const ok = (data) => Promise.resolve({ data: { data } });

/** Configura las tres respuestas que consume getDashboardWidgets. */
function mockDashboardResponses({ historics = [], widgets = [], entities = [] } = {}) {
  api.get.mockImplementation((url) => {
    if (url.includes("/api/historics/client/")) return historics instanceof Error ? Promise.reject(historics) : ok({ historics });
    if (url.includes("/api/widgets/")) return widgets instanceof Error ? Promise.reject(widgets) : ok({ widgets });
    if (url.endsWith("/api/entities")) return entities instanceof Error ? Promise.reject(entities) : ok({ entities });
    return Promise.reject(new Error(`URL no esperada: ${url}`));
  });
}

describe("getDashboardWidgets", () => {
  it.each([
    [undefined, CLIENT_ID],
    [DASHBOARD_ID, undefined],
  ])("devuelve vacío sin llamar a la API si falta un id (%s, %s)", async (dashboardId, clientId) => {
    await expect(getDashboardWidgets(dashboardId, clientId)).resolves.toEqual({
      devices: [],
      history: [],
    });
    expect(api.get).not.toHaveBeenCalled();
  });

  it("consulta históricos, widgets y entidades del cliente", async () => {
    mockDashboardResponses();

    await getDashboardWidgets(DASHBOARD_ID, CLIENT_ID);

    expect(api.get).toHaveBeenCalledWith(`/api/historics/client/${CLIENT_ID}`);
    expect(api.get).toHaveBeenCalledWith(`/api/widgets/${CLIENT_ID}/${DASHBOARD_ID}`);
    expect(api.get).toHaveBeenCalledWith(`/api/entities`, {
      params: { client_id: CLIENT_ID },
    });
  });

  it("combina cada widget con su entidad e historics en un Device", async () => {
    const entity = buildEntity();
    const widget = buildWidget();
    const ownHistoric = buildHistoric();
    const otherHistoric = buildHistoric({ historic_id: "h-2", entity_id: "otra" });
    mockDashboardResponses({
      widgets: [widget],
      entities: [entity],
      historics: [ownHistoric, otherHistoric],
    });

    const { devices, history } = await getDashboardWidgets(DASHBOARD_ID, CLIENT_ID);

    expect(history).toEqual([ownHistoric, otherHistoric]);
    expect(devices).toHaveLength(1);
    const [device] = devices;
    expect(device).toBeInstanceOf(Device);
    expect(device).toMatchObject({
      widget_id: widget.widget_id,
      entity_id: entity.entity_id,
      name: widget.name,
      widget_type: widget.widget_type,
      client_id: CLIENT_ID,
      dashboard_id: widget.dashboard_id,
      historics: [ownHistoric],
      widget_config: {
        ...widget.widget_config,
        datasource_type: entity.datasource_type,
        datasource_config: entity.datasource_config,
        entity_name: entity.name,
        entity_id: entity.entity_id,
      },
    });
  });

  it("parsea configuraciones guardadas como JSON en texto", async () => {
    mockDashboardResponses({
      widgets: [buildWidget({ widget_config: JSON.stringify({ data_key: "hum" }) })],
      entities: [buildEntity({ datasource_config: JSON.stringify({ sub_topic: "hum" }) })],
    });

    const { devices } = await getDashboardWidgets(DASHBOARD_ID, CLIENT_ID);

    expect(devices[0].widget_config.data_key).toBe("hum");
    expect(devices[0].widget_config.datasource_config).toEqual({ sub_topic: "hum" });
  });

  it("tolera JSON inválido en la configuración usando un objeto vacío", async () => {
    mockDashboardResponses({
      widgets: [buildWidget({ widget_config: "{no-json" })],
      entities: [buildEntity({ datasource_config: "{no-json" })],
    });

    const { devices } = await getDashboardWidgets(DASHBOARD_ID, CLIENT_ID);

    expect(devices).toHaveLength(1);
    expect(devices[0].widget_config.datasource_config).toEqual({});
    expect(devices[0].widget_config).not.toHaveProperty("data_key");
  });

  it("descarta los widgets cuya entidad no existe", async () => {
    mockDashboardResponses({
      widgets: [buildWidget(), buildWidget({ widget_id: "huérfano", entity_id: "borrada" })],
      entities: [buildEntity()],
    });

    const { devices } = await getDashboardWidgets(DASHBOARD_ID, CLIENT_ID);

    expect(devices.map((d) => d.widget_id)).toEqual(["widget-1"]);
  });

  it("devuelve listas vacías cuando las colecciones llegan vacías", async () => {
    mockDashboardResponses();

    await expect(getDashboardWidgets(DASHBOARD_ID, CLIENT_ID)).resolves.toEqual({
      devices: [],
      history: [],
    });
  });

  it("propaga los errores de la API", async () => {
    const serverError = httpError(500);
    mockDashboardResponses({ widgets: serverError });

    await expect(getDashboardWidgets(DASHBOARD_ID, CLIENT_ID)).rejects.toBe(serverError);
  });
});

describe("setDatosHistoricos", () => {
  const payload = { entity_id: "entity-1", client_id: "client-1", data_key: "temp", data: "22", recorded_at: "2026-10-30T12:00:00Z" };

  it("envía el histórico como JSON y devuelve la respuesta", async () => {
    api.post.mockReturnValue(ok({ historic: payload }));

    await expect(setDatosHistoricos(payload)).resolves.toBeUndefined();
    expect(api.post).toHaveBeenCalledWith(`/api/historics`, payload, {
      headers: { "Content-Type": "application/json" },
    });
  });

  it("refresca el historics cuando se pasan callback, entidad y clave", async () => {
    api.post.mockReturnValue(ok({ historic: payload }));
    const refresh = jest.fn();

    await setDatosHistoricos(payload, refresh, "entity-1", "temp");

    expect(refresh).toHaveBeenCalledWith("entity-1", "temp");
  });

  it("no refresca si falta algún parámetro del callback", async () => {
    api.post.mockReturnValue(ok({ historic: payload }));
    const refresh = jest.fn();

    await setDatosHistoricos(payload, refresh, "entity-1");

    expect(refresh).not.toHaveBeenCalled();
  });

  it("propaga el error de la API", async () => {
    const error = httpError(400);
    api.post.mockRejectedValue(error);

    await expect(setDatosHistoricos(payload)).rejects.toBe(error);
  });
});

describe("getHistorialEntity", () => {
  it("devuelve los históricos de la entidad", async () => {
    const historics = [buildHistoric()];
    api.get.mockReturnValue(ok({ historics }));

    await expect(getHistorialEntity("entity-1")).resolves.toEqual(historics);
    expect(api.get).toHaveBeenCalledWith(`/api/historics/entity/entity-1`);
  });

  it("propaga el error de la API", async () => {
    const error = httpError(500);
    api.get.mockRejectedValue(error);

    await expect(getHistorialEntity("entity-1")).rejects.toBe(error);
  });
});

describe("setWidget", () => {
  it("crea el widget y devuelve los datos creados", async () => {
    const widget = buildWidget();
    api.post.mockReturnValue(ok({ widget }));

    await expect(setWidget(widget)).resolves.toEqual(widget);
    const { widget_id, ...payload } = widget;
    expect(api.post).toHaveBeenCalledWith(`/api/widgets`, payload);
    expect(api.post.mock.calls[0][1]).not.toHaveProperty("widget_id");
  });

  it("propaga el error de la API", async () => {
    const error = httpError(422);
    api.post.mockRejectedValue(error);

    await expect(setWidget(buildWidget())).rejects.toBe(error);
  });
});

describe("entidades", () => {
  it("setDevice envía la entidad al backend", async () => {
    const entity = buildEntity();
    api.post.mockReturnValue(ok({ entity }));

    await setDevice(entity);

    const { connection_status, entity_id, ...payload } = entity;
    expect(api.post).toHaveBeenCalledWith(`/api/entities`, payload);
  });

  it("getDevice entrega al setter una copia de las entidades del cliente", async () => {
    const entities = [buildEntity(), buildEntity({ entity_id: "entity-2" })];
    api.get.mockReturnValue(ok({ entities }));
    const setEntities = jest.fn();

    await getDevice(setEntities, CLIENT_ID);

    expect(api.get).toHaveBeenCalledWith(`/api/entities`, {
      params: { client_id: CLIENT_ID },
    });
    expect(setEntities).toHaveBeenCalledWith(entities);
    expect(setEntities.mock.calls[0][0]).not.toBe(entities);
  });
});

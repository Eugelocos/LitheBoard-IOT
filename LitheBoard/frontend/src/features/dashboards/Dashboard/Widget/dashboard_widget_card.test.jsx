import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import api from "../../../../services/api";
import DeviceCard from "./dashboard_widget_card";
import { buildDevice, clickIconButton } from "../../../../test/test_utils";

jest.mock("../../../../services/api");
// Leaflet y Recharts dependen de medidas reales del DOM: se reemplazan por
// dobles que exponen los datos que reciben.
jest.mock("react-leaflet", () => ({
  MapContainer: ({ center, children }) => (
    <div data-testid="map" data-center={center.join(",")}>
      {children}
    </div>
  ),
  TileLayer: () => null,
  Marker: ({ position, children }) => (
    <div data-testid="marker" data-position={position.join(",")}>
      {children}
    </div>
  ),
  Polyline: ({ positions }) => <div data-testid="polyline" data-points={positions.length} />,
  Popup: ({ children }) => <div>{children}</div>,
}));
jest.mock("recharts", () => {
  const chart = (testId) => ({ data, children }) => (
    <div data-testid={testId} data-points={JSON.stringify(data)}>
      {children}
    </div>
  );
  const series = (testId) => ({ dataKey, stroke, fill }) => (
    <div data-testid={testId} data-key={dataKey} data-color={stroke || fill} />
  );
  return {
    ResponsiveContainer: ({ children }) => <div>{children}</div>,
    LineChart: chart("line-chart"),
    BarChart: chart("bar-chart"),
    Line: series("line"),
    Bar: series("bar"),
    XAxis: () => null,
    YAxis: () => null,
    Tooltip: () => null,
    CartesianGrid: () => null,
    Legend: () => null,
  };
});

const entry = (data, recorded_at = "2026-10-01T10:00:00Z") => ({ recorded_at, data, entity_id: "entity-1" });

function renderCard(deviceOverrides = {}) {
  const props = {
    device: buildDevice(deviceOverrides),
    index: 0,
    toggleSwitchState: jest.fn(),
    devices_list: [],
    setDevicesList: jest.fn(),
    handleMouseOver: jest.fn(),
    openWidgetEditor: jest.fn(),
    setEditedWidgetId: jest.fn(),
    setEditedWidgetType: jest.fn(),
  };
  render(<DeviceCard {...props} />);
  return props;
}

const chartPoints = (testId) => JSON.parse(screen.getByTestId(testId).getAttribute("data-points"));

describe("<DeviceCard />", () => {
  it("muestra el nombre del widget", () => {
    renderCard();

    expect(screen.getByRole("heading", { name: "Temperatura" })).toBeInTheDocument();
  });

  it("avisa cuando el widget no tiene entidad", () => {
    renderCard({ entity_id: null });

    expect(screen.getByText("No Entity Selected")).toBeInTheDocument();
  });

  it("muestra la información MQTT de la entidad al pasar sobre el icono", async () => {
    renderCard();

    fireEvent.mouseOver(screen.getByTestId("InfoIcon"));

    expect(await screen.findByText("Subscribed Topic: temp")).toBeInTheDocument();
    expect(screen.getByText("Publish Topic: temp/set")).toBeInTheDocument();
  });

  it("muestra la información API de la entidad", async () => {
    renderCard({
      widget_config: {
        data_key: "temp",
        datasource_type: "api",
        datasource_config: { base_url: "https://api.example.com", method: "GET", polling_interval_ms: 5000 },
      },
    });

    fireEvent.mouseOver(screen.getByTestId("InfoIcon"));

    expect(await screen.findByText("Base URL: https://api.example.com")).toBeInTheDocument();
    expect(screen.getByText("Polling Interval: 5000")).toBeInTheDocument();
  });

  it("elimina el widget cuando el backend confirma", async () => {
    api.delete.mockResolvedValue({ data: { status: "success" } });
    const { setDevicesList } = renderCard();

    clickIconButton("DeleteIcon");

    await waitFor(() => expect(setDevicesList).toHaveBeenCalled());
    expect(api.delete).toHaveBeenCalledWith("/api/widgets/widget-1");
    const updater = setDevicesList.mock.calls[0][0];
    expect(updater([buildDevice(), buildDevice({ widget_id: "widget-2" })])).toEqual([
      expect.objectContaining({ widget_id: "widget-2" }),
    ]);
  });

  it("no toca la lista si el borrado falla", async () => {
    api.delete.mockRejectedValue(new Error("fail"));
    const { setDevicesList } = renderCard();

    clickIconButton("DeleteIcon");

    expect((await screen.findAllByRole("alert")).length).toBeGreaterThan(0);
    expect(setDevicesList).not.toHaveBeenCalled();
  });

  it("abre el editor con el widget seleccionado", () => {
    const { setEditedWidgetId, setEditedWidgetType, openWidgetEditor } = renderCard();

    clickIconButton("EditIcon");

    expect(setEditedWidgetId).toHaveBeenCalledWith("widget-1");
    expect(setEditedWidgetType).toHaveBeenCalledWith("line_chart");
    expect(openWidgetEditor).toHaveBeenCalledWith(true);
  });

  it("muestra el overlay de dispositivo desconectado", () => {
    renderCard({
      last_connection: "2026-10-01 09:00",
      connection_status: "offline",
      widget_config: { ...buildDevice().widget_config, datasource_config: { status: "inactive" } },
    });

    expect(screen.getByText("Dispositivo desconectado")).toBeInTheDocument();
    expect(screen.getByText("Última conexión: 2026-10-01 09:00")).toBeInTheDocument();
  });

  describe("switch", () => {
    it("refleja el estado y delega el cambio", () => {
      const { toggleSwitchState, device } = renderCard({ widget_type: "switch", widget_config: { is_on: true } });

      expect(screen.getByText("ON")).toBeInTheDocument();
      fireEvent.click(screen.getByRole("checkbox"));

      expect(toggleSwitchState).toHaveBeenCalledWith(device);
    });

    it("muestra OFF cuando está apagado", () => {
      renderCard({ widget_type: "switch", widget_config: { is_on: false } });

      expect(screen.getByText("OFF")).toBeInTheDocument();
    });
  });

  describe("gráficos", () => {
    it("grafica solo las entradas con la clave seleccionada y su color", () => {
      renderCard({
        historics: [entry({ temp: 20 }), entry({ hum: 50 }), entry({ temp: 22 })],
        widget_config: { ...buildDevice().widget_config, line_color: "#ff6a00" },
      });

      expect(chartPoints("line-chart").map((point) => point.data.temp)).toEqual([20, 22]);
      expect(screen.getByTestId("line")).toHaveAttribute("data-key", "data.temp");
      expect(screen.getByTestId("line")).toHaveAttribute("data-color", "#ff6a00");
    });

    it("limita el gráfico a las últimas 20 lecturas", () => {
      const historics = Array.from({ length: 25 }, (_, i) => entry({ temp: i }));
      renderCard({ historics });

      const points = chartPoints("line-chart");
      expect(points).toHaveLength(20);
      expect(points[0].data.temp).toBe(5);
    });

    it("usa el color por defecto en gráficos de barras", () => {
      renderCard({ widget_type: "bar_chart", historics: [entry({ temp: 1 })] });

      expect(screen.getByTestId("bar")).toHaveAttribute("data-color", "#fff000");
    });
  });

  describe("mapa", () => {
    it("ubica las posiciones válidas y centra en la última", () => {
      renderCard({
        widget_type: "map",
        widget_config: { ...buildDevice().widget_config, data_key: "lat" },
        historics: [
          entry({ lat: "-34.6", lon: "-58.4" }),
          entry({ lat: "no-numero", lon: "1" }),
          entry({ lat: -31.4, lon: -64.2 }),
        ],
      });

      expect(screen.getAllByTestId("marker").map((m) => m.getAttribute("data-position"))).toEqual([
        "-34.6,-58.4",
        "-31.4,-64.2",
      ]);
      expect(screen.getByTestId("map")).toHaveAttribute("data-center", "-31.4,-64.2");
      expect(screen.getByTestId("polyline")).toHaveAttribute("data-points", "2");
    });

    it("avisa cuando no hay posiciones válidas", () => {
      renderCard({ widget_type: "map", historics: [] });

      expect(screen.getByText("No valid position available")).toBeInTheDocument();
    });
  });

  describe("tarjeta personalizada", () => {
    const customConfig = { ...buildDevice().widget_config, html_template: "<b>${value}</b>", css: "b{}" };
    const srcDoc = () => screen.getByTitle("Custom Widget").getAttribute("srcdoc");

    it("muestra el último threshold de la clave seleccionada", () => {
      renderCard({
        widget_type: "custom_value_card",
        widget_config: customConfig,
        historics: [entry({ temp: 18 }), entry({ temp: 21 }), entry({ hum: 40 })],
      });

      expect(srcDoc()).toContain("<b>21</b>");
    });

    it("indica cuando no hay datos", () => {
      renderCard({ widget_type: "custom_value_card", widget_config: customConfig, historics: [] });

      expect(srcDoc()).toContain("<b>No data available</b>");
    });

    it("indica cuando la clave no aparece en el historics", () => {
      renderCard({ widget_type: "custom_value_card", widget_config: customConfig, historics: [entry({ hum: 1 })] });

      expect(srcDoc()).toContain('Key "temp" not found in any data entry');
    });
  });
});

 beforeEach(() => jest.spyOn(window, "confirm").mockReturnValue(true));

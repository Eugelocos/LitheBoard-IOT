import api from "../../../../../services/api";
import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { getDashboardWidgets } from "../../../../../component/database_data_functions";
import WidgetForm from "./widget_form";
import { buildDevice, buildEntity, buildUser, selectMuiOption } from "../../../../../test/test_utils";

jest.mock("../../../../../services/api");

jest.mock("../../../../../component/database_data_functions", () => ({
  getDashboardWidgets: jest.fn(),
}));
jest.mock("@uiw/react-codemirror", () => require("../../../../../test/editor_mocks").MockCodeMirror);
jest.mock("react-colorful", () => ({
  HexColorPicker: require("../../../../../test/editor_mocks").MockHexColorPicker,
}));

const user = buildUser();
const entities = [buildEntity({ client_id: "client-1" })];

function renderForm(widget_type) {
  const props = {
    widget_type,
    entities,
    user,
    dashboard_id: "dashboard-1",
    setDevicesList: jest.fn(),
    onHasScriptFields: jest.fn(),
  };
  render(<WidgetForm {...props} />);
  return props;
}

const type = (label, value) => fireEvent.change(screen.getByLabelText(label), { target: { value } });
const chooseDevice = () => selectMuiOption("Seleccionar dispositivo", "Sensor Temperatura");
const submit = () => fireEvent.click(screen.getByRole("button", { name: "Agregar" }));

describe("<WidgetForm />", () => {
  beforeEach(() => {
    api.post.mockResolvedValue({ data: { data: { widget: { widget_id: "widget-9" } } } });
    getDashboardWidgets.mockResolvedValue({ devices: [buildDevice()], history: [] });
  });

  it.each([
    ["switch", false],
    ["custom_value_card", true],
  ])("informa si el tipo %s tiene campos de script", (widgetType, hasScripts) => {
    const { onHasScriptFields } = renderForm(widgetType);

    expect(onHasScriptFields).toHaveBeenCalledWith(hasScripts);
  });

  it("crea un switch y refresca los widgets del dashboard", async () => {
    const { setDevicesList } = renderForm("switch");

    type("Nombre del Widget", "Luz");
    type("Clave", "estado");
    type("Message ON", "1");
    type("Message OFF", "0");
    chooseDevice();
    submit();

    await waitFor(() => expect(setDevicesList).toHaveBeenCalledWith([expect.objectContaining({ widget_id: "widget-1" })]));
    expect(api.post).toHaveBeenCalledWith("/api/widgets", {
      name: "Luz",
      entity_id: "entity-1",
      dashboard_id: "dashboard-1",
      widget_type: "switch",
      widget_config: {
        sub_topic: undefined,
        pub_topic: undefined,
        message_on: "1",
        message_off: "0",
        is_on: true,
        data_key: "estado",
      },
      client_id: user.client_id,
    });
    expect(getDashboardWidgets).toHaveBeenCalledWith("dashboard-1", user.client_id);
  });

  it("incluye el color elegido en los gráficos de línea", async () => {
    renderForm("line_chart");

    type("Nombre del Widget", "Temperatura");
    fireEvent.click(screen.getByRole("button", { name: "pick-line_color" }));
    chooseDevice();
    submit();

    await waitFor(() => expect(api.post).toHaveBeenCalled());
    expect(api.post.mock.calls[0][1].widget_config.line_color).toBe("#123456");
  });

  it("incluye coordenadas en los mapas", async () => {
    renderForm("map");

    type("Nombre del Widget", "GPS");
    type("Latitud", "-34.6");
    type("Longitud", "-58.4");
    chooseDevice();
    submit();

    await waitFor(() => expect(api.post).toHaveBeenCalled());
    expect(api.post.mock.calls[0][1].widget_config).toMatchObject({ lat: "-34.6", lon: "-58.4" });
  });

  it("incluye HTML y CSS en las tarjetas personalizadas", async () => {
    renderForm("custom_value_card");

    type("Nombre del Widget", "Card");
    type("html_template", "<p>${value}</p>");
    type("css", "p{}");
    chooseDevice();
    submit();

    await waitFor(() => expect(api.post).toHaveBeenCalled());
    expect(api.post.mock.calls[0][1].widget_config).toMatchObject({ html_template: "<p>${value}</p>", css: "p{}" });
  });

  it("no crea el widget sin dispositivo", () => {
    renderForm("switch");

    type("Nombre del Widget", "Luz");
    submit();

    expect(api.post).not.toHaveBeenCalled();
  });

  it("no crea el widget sin nombre", () => {
    renderForm("switch");

    chooseDevice();
    submit();

    expect(api.post).not.toHaveBeenCalled();
  });

  it("no refresca la lista si la creación falla", async () => {
    api.post.mockRejectedValue(new Error("fail"));
    const { setDevicesList } = renderForm("switch");

    type("Nombre del Widget", "Luz");
    chooseDevice();
    submit();

    await waitFor(() => expect(console.error).toHaveBeenCalledWith("Error al añadir el dispositivo:", expect.any(Error)));
    expect(setDevicesList).not.toHaveBeenCalled();
  });
});

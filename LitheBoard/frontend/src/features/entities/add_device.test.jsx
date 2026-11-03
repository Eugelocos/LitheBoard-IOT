import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { createEntity } from "../../services/entities_service";
import AddDevice from "./add_device";
import {
  buildEntity,
  buildRulechain,
  buildUser,
  clickIconButton,
  httpError,
  selectMuiOption,
} from "../../test/test_utils";

jest.mock("../../services/entities_service", () => ({ createEntity: jest.fn() }));

const user = buildUser();
const rulechains = [buildRulechain()];

function renderAddDevice() {
  const props = { onAddDevice: jest.fn(), showDeviceList: jest.fn(), user, rulechains };
  render(<AddDevice {...props} />);
  return props;
}

const type = (label, value) => fireEvent.change(screen.getByLabelText(label), { target: { value } });
const submit = () => fireEvent.click(screen.getByRole("button", { name: "Add Device" }));

describe("<AddDevice />", () => {
  beforeEach(() => {
    jest.spyOn(window, "alert").mockImplementation(() => {});
  });

  it("muestra por defecto los campos MQTT", () => {
    renderAddDevice();

    expect(screen.getByLabelText("Subscribe Topic")).toBeInTheDocument();
    expect(screen.queryByLabelText("Base URL")).not.toBeInTheDocument();
  });

  it("crea una entidad MQTT con su rulechain y limpia el formulario", async () => {
    const created = buildEntity({ entity_id: "entity-9" });
    createEntity.mockResolvedValue(created);
    const { onAddDevice, showDeviceList } = renderAddDevice();

    type("Entity Name", "Sensor Patio");
    selectMuiOption("Rulechain Assigned", "Regla temperatura");
    type("Subscribe Topic", "patio/temp");
    type("Publish Topic", "patio/cmd");
    type("Heartbeat Timeout (s)", "60");
    submit();

    await waitFor(() => expect(onAddDevice).toHaveBeenCalledWith(created));
    expect(createEntity).toHaveBeenCalledWith({
      client_id: user.client_id,
      name: "Sensor Patio",
      datasource_type: "mqtt",
      datasource_config: { sub_topic: "patio/temp", pub_topic: "patio/cmd", heartbeat_timeout_s: 60 },
      rulechain_id: "rc-1",
    });
    expect(showDeviceList).toHaveBeenCalledWith(true);
    expect(screen.getByLabelText("Entity Name")).toHaveValue("");
    expect(screen.getByText("Success")).toBeInTheDocument();
  });

  it("crea una entidad API parseando los campos JSON y omitiendo los vacíos", async () => {
    createEntity.mockResolvedValue(buildEntity());
    renderAddDevice();

    selectMuiOption("Datasource Type", "API");
    type("Entity Name", "Clima");
    type("Base URL", "https://api.example.com/weather");
    type("HTTP Method", "GET");
    type("Polling Interval (ms)", "5000");
    type("Query Params", '{"lat": "-34.6"}');
    submit();

    await waitFor(() => expect(createEntity).toHaveBeenCalled());
    expect(createEntity.mock.calls[0][0]).toMatchObject({
      datasource_type: "api",
      datasource_config: {
        base_url: "https://api.example.com/weather",
        method: "GET",
        polling_interval_ms: 5000,
        query_params: { lat: "-34.6" },
      },
    });
    expect(createEntity.mock.calls[0][0].datasource_config).not.toHaveProperty("headers");
    expect(createEntity.mock.calls[0][0].datasource_config).not.toHaveProperty("request_body");
  });

  it("avisa y no envía nada si un campo JSON es inválido", () => {
    renderAddDevice();

    selectMuiOption("Datasource Type", "API");
    type("Entity Name", "Clima");
    type("Headers", "{no-json");
    submit();

    expect(screen.getByRole("alert")).toHaveTextContent("Headers");
    expect(createEntity).not.toHaveBeenCalled();
    expect(screen.getByText("Error")).toBeInTheDocument();
  });

  it("no envía la entidad si falta el nombre", () => {
    renderAddDevice();

    type("Subscribe Topic", "patio/temp");
    submit();

    expect(createEntity).not.toHaveBeenCalled();
  });

  it("marca error y conserva el formulario si el backend falla", async () => {
    createEntity.mockRejectedValue(httpError(400));
    const { onAddDevice } = renderAddDevice();

    type("Entity Name", "Sensor Patio");
    submit();

    expect(await screen.findByText("Error")).toBeInTheDocument();
    expect(onAddDevice).not.toHaveBeenCalled();
    expect(screen.getByLabelText("Entity Name")).toHaveValue("Sensor Patio");
  });

  it("vuelve a la lista con el botón atrás", () => {
    const { showDeviceList } = renderAddDevice();

    clickIconButton("ArrowBackIcon");

    expect(showDeviceList).toHaveBeenCalledWith(true);
  });
});

import React, { useState } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import api from "../../services/api";
import DeviceList from "./device_list";
import {
  apiError,
  apiNoContent,
  buildEntity,
  buildRulechain,
  buildUser,
  clickIconButton,
  clickRowAction,
  getGridRow,
  selectMuiOption,
} from "../../test/test_utils";

jest.mock("../../services/api");

const user = buildUser();
const rulechains = [buildRulechain()];

const mqttEntity = buildEntity({ datasource_type: "mqtt", rulechain_id: "rc-1", credential: { token: "tok-123" }, datasource_config: { sub_topic: "temp", pub_topic: "temp/set", token: "tok-123" } });
const apiEntity = buildEntity({
  entity_id: "entity-2",
  name: "Clima",
  datasource_type: "api",
  rulechain_id: "rc-borrada",
  datasource_config: { base_url: "https://api.example.com", method: "GET", polling_interval_ms: "5000", query_params: { lat: 1 } },
});

function Harness({ initial = [mqttEntity, apiEntity] }) {
  const [entities, setEntities] = useState(initial);
  return (
    <DeviceList
      entities={entities}
      setEntities={setEntities}
      handleAddDevice={jest.fn()}
      user={user}
      rulechains={rulechains}
    />
  );
}

describe("<DeviceList />", () => {
  it("lista las entidades con su tipo y rulechain asignada", () => {
    render(<Harness />);

    expect(getGridRow("Sensor Temperatura")).toHaveTextContent("mqtt");
    expect(getGridRow("Sensor Temperatura")).toHaveTextContent("Regla temperatura");
    expect(getGridRow("Clima")).toHaveTextContent("rc-borrada");
  });

  it("indica cuando una entidad no tiene rulechain", () => {
    render(<Harness initial={[buildEntity({ rulechain_id: undefined })]} />);

    expect(getGridRow("Sensor Temperatura")).toHaveTextContent("No rulechain assigned");
  });

  it("alterna entre la lista y el formulario de alta", () => {
    render(<Harness />);

    clickIconButton("AddRoundedIcon");
    expect(screen.getByText("Add Entity")).toBeInTheDocument();

    clickIconButton("ArrowBackIcon");
    expect(screen.getByText("Entities Panel")).toBeInTheDocument();
  });

  it("elimina la entidad cuando el backend confirma", async () => {
    api.delete.mockResolvedValue(apiNoContent());
    render(<Harness />);

    clickRowAction("Sensor Temperatura", "DeleteIcon");

    await waitFor(() => expect(screen.queryByText("Sensor Temperatura")).not.toBeInTheDocument());
    expect(api.delete).toHaveBeenCalledWith("/api/entities/entity-1");
  });

  it("conserva la entidad si el borrado falla", async () => {
    api.delete.mockRejectedValue(apiError(403, "FORBIDDEN"));
    render(<Harness />);

    clickRowAction("Sensor Temperatura", "DeleteIcon");

    await waitFor(() => expect(api.delete).toHaveBeenCalled());
    expect(screen.getByText("Sensor Temperatura")).toBeInTheDocument();
  });

  it("muestra credenciales y tópicos MQTT al editar", () => {
    render(<Harness />);

    clickRowAction("Sensor Temperatura", "EditIcon");

    expect(screen.getByText("tok-123")).toBeInTheDocument();
    expect(screen.getByText("users/client-1/device/entity-1/data/temp")).toBeInTheDocument();
    expect(screen.getByText("users/client-1/device/entity-1/data/temp/set")).toBeInTheDocument();
    expect(screen.getByLabelText("Subscribe Topic")).toHaveValue("temp");
  });

  it("guarda los cambios de una entidad MQTT", async () => {
    api.put.mockResolvedValue({ data: { data: { entity: {} } } });
    render(<Harness />);

    clickRowAction("Sensor Temperatura", "EditIcon");
    fireEvent.change(screen.getByLabelText(/^name/i), { target: { value: "Sensor Renombrado" } });
    fireEvent.change(screen.getByLabelText("Subscribe Topic"), { target: { value: "nuevo/topic" } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(await screen.findByText("Sensor Renombrado")).toBeInTheDocument();
    expect(api.put).toHaveBeenCalledWith(`/api/entities`, {
      entity_id: "entity-1",
      name: "Sensor Renombrado",
      datasource_config: { sub_topic: "nuevo/topic", pub_topic: "temp/set" },
      rulechain_id: "rc-1",
    });
  });

  it("muestra la rulechain actual y permite cambiarla", async () => {
    api.put.mockResolvedValue({ data: { data: { entity: {} } } });
    render(
      <DeviceList
        entities={[mqttEntity]}
        setEntities={jest.fn()}
        user={user}
        rulechains={[...rulechains, buildRulechain({ rulechain_id: "rc-2", name: "Regla humedad" })]}
      />,
    );

    clickRowAction("Sensor Temperatura", "EditIcon");
    const select = screen.getAllByLabelText("Rulechain Assigned").find((el) => el.getAttribute("role") !== "listbox");
    expect(select).toHaveTextContent("Regla temperatura");

    selectMuiOption(select, "Regla humedad");
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() =>
      expect(api.put).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({ rulechain_id: "rc-2" })),
    );
  });

  it("omite rulechain_id si la entidad no tiene rulechain", async () => {
    api.put.mockResolvedValue({ data: { data: { entity: {} } } });
    render(<Harness initial={[buildEntity({ datasource_type: "mqtt", rulechain_id: null })]} />);

    clickRowAction("Sensor Temperatura", "EditIcon");
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => expect(api.put).toHaveBeenCalled());
    expect(api.put.mock.calls[0][1].rulechain_id).toBe(0);
  });

  it("impide guardar con el nombre vacío", () => {
    render(<Harness />);

    clickRowAction("Sensor Temperatura", "EditIcon");
    fireEvent.change(screen.getByLabelText(/^name/i), { target: { value: "  " } });

    expect(screen.getByText("El nombre es obligatorio")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();
  });

  it("muestra error si la actualización falla", async () => {
    api.put.mockRejectedValue(new Error("fail"));
    render(<Harness />);

    clickRowAction("Sensor Temperatura", "EditIcon");
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(await screen.findByText("Error")).toBeInTheDocument();
  });

  it("carga y edita los campos de una entidad API", async () => {
    api.put.mockResolvedValue({ data: { data: { entity: {} } } });
    render(<Harness />);

    clickRowAction("Clima", "EditIcon");
    expect(screen.getByLabelText("Base URL")).toHaveValue("https://api.example.com");
    expect(screen.getByLabelText("Polling Interval")).toHaveValue("5000");
    expect(JSON.parse(screen.getByLabelText("Query Params").value)).toEqual({ lat: 1 });

    fireEvent.change(screen.getByLabelText("Polling Interval"), { target: { value: "10000" } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() =>
      expect(api.put).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ datasource_config: expect.objectContaining({ polling_interval_ms: "10000" }) }),
      ),
    );
  });

  it("cierra el panel de edición al cancelar", async () => {
    render(<Harness />);

    clickRowAction("Sensor Temperatura", "EditIcon");
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    await waitFor(() => expect(screen.queryByText("tok-123")).not.toBeInTheDocument());
    expect(api.put).not.toHaveBeenCalled();
  });
});

 beforeEach(() => jest.spyOn(window, "confirm").mockReturnValue(true));

it("cancelling deletion keeps the entity and does not send a request", () => {
  window.confirm.mockReturnValue(false);
  render(<Harness />);
  clickRowAction("Sensor Temperatura", "DeleteIcon");
  expect(api.delete).not.toHaveBeenCalled();
  expect(screen.getByText("Sensor Temperatura")).toBeInTheDocument();
});

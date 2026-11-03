import React from "react";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import api from "../../services/api";
import AddAlarm from "./add_alarm";
import { buildEntity, httpError } from "../../test/test_utils";

jest.mock("../../services/api");

const entities = [
  buildEntity(),
  buildEntity({ entity_id: "entity-2", name: "Sensor Humedad" }),
];

function renderAddAlarm() {
  const props = { client_id: "client-1", onCancel: jest.fn(), onSave: jest.fn(), entities };
  render(<AddAlarm {...props} />);
  return props;
}

/** Abre un Select de MUI por su etiqueta y elige una opción. */
function selectOption(label, optionName) {
  fireEvent.mouseDown(screen.getByLabelText(label));
  fireEvent.click(within(screen.getByRole("listbox")).getByRole("option", { name: optionName }));
}

function fillAlarm() {
  selectOption("Seleccionar Dispositivo", "Sensor Humedad");
  fireEvent.change(screen.getByLabelText("Valor"), { target: { value: "30" } });
  fireEvent.change(screen.getByLabelText("Selected Key"), { target: { value: "hum" } });
  selectOption("Condición", "Mayor que");
}

describe("<AddAlarm />", () => {
  it("lista las entidades disponibles como opciones", () => {
    renderAddAlarm();

    fireEvent.mouseDown(screen.getByLabelText("Seleccionar Dispositivo"));
    const options = within(screen.getByRole("listbox")).getAllByRole("option");

    expect(options.map((o) => o.textContent)).toEqual([
      "Seleccione un dispositivo",
      "Sensor Temperatura",
      "Sensor Humedad",
    ]);
  });

  it("guarda la alarma, notifica y reinicia el formulario", async () => {
    api.post.mockResolvedValue({ data: { data: { alarm: { alarm_id: "a-1" } } } });
    const { onSave } = renderAddAlarm();

    fillAlarm();
    fireEvent.click(screen.getByRole("button", { name: "Guardar" }));

    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1));
    expect(api.post).toHaveBeenCalledWith(`/api/alarms`, {
      entity_id: "entity-2",
      threshold: 30,
      client_id: "client-1",
      data_key: "hum",
      operator: "greater_than",
    });
    expect(onSave).toHaveBeenCalledWith({alarm_id:"a-1"});
    // The parent closes the form after saving.
  });

  it("no notifica ni limpia el formulario si el guardado falla", async () => {
    api.post.mockRejectedValue(httpError(400));
    const { onSave } = renderAddAlarm();

    fillAlarm();
    fireEvent.click(screen.getByRole("button", { name: "Guardar" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Could not save alarm");
    expect(onSave).not.toHaveBeenCalled();
    expect(screen.getByLabelText("Selected Key")).toHaveValue("hum");
  });

  it("vuelve atrás al pulsar el botón de cancelar", () => {
    const { onCancel } = renderAddAlarm();

    fireEvent.click(screen.getByTestId("ArrowBackRoundedIcon").closest("button"));

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(api.post).not.toHaveBeenCalled();
  });
});

it("rejects incomplete forms and prevents repeated submissions while saving", async () => {
  let resolve;
  api.post.mockReturnValue(new Promise((done) => { resolve=done; }));
  const {onSave}=renderAddAlarm();
  fireEvent.click(screen.getByRole("button",{name:"Guardar"}));
  expect(screen.getByRole("alert")).toHaveTextContent("Complete all fields");
  expect(api.post).not.toHaveBeenCalled();
  fillAlarm();
  fireEvent.click(screen.getByRole("button",{name:"Guardar"}));
  fireEvent.click(screen.getByRole("button",{name:"Guardar"}));
  expect(api.post).toHaveBeenCalledTimes(1);
  expect(screen.getByRole("button",{name:"Guardar"})).toBeDisabled();
  resolve({data:{data:{alarm:{alarm_id:"a-1"}}}});
  await waitFor(()=>expect(onSave).toHaveBeenCalledTimes(1));
});

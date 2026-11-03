import React, { useState } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import api from "../../services/api";
import AlarmList from "./alarm_list";
import {
  buildAlarm,
  buildEntity,
  buildUser,
  clickIconButton,
  selectMuiOption,
} from "../../test/test_utils";

jest.mock("../../services/api");

const user = buildUser();
const entities = [buildEntity(), buildEntity({ entity_id: "entity-2", name: "Sensor Humedad" })];

function Harness({ initialAlarms }) {
  const [alarms, setAlarms] = useState(initialAlarms);
  return <AlarmList user={user} alarms={alarms} setAlarms={setAlarms} entities={entities} />;
}

describe("<AlarmList />", () => {
  it("muestra las alarmas existentes en la tabla", () => {
    render(<Harness initialAlarms={[buildAlarm(), buildAlarm({ alarm_id: "a-2", entity_id: "entity-2", threshold: 80 })]} />);

    expect(screen.getByText("Alarms Panel")).toBeInTheDocument();
    expect(screen.getByText("Sensor Temperatura")).toBeInTheDocument();
    expect(screen.getByText("Sensor Humedad")).toBeInTheDocument();
    expect(screen.getByText("80")).toBeInTheDocument();
  });

  it("abre el formulario de alta y vuelve a la lista al cancelar", () => {
    render(<Harness initialAlarms={[]} />);

    clickIconButton("AddRoundedIcon");
    expect(screen.getByRole("heading", { name: "Crear Alarma" })).toBeInTheDocument();

    clickIconButton("ArrowBackRoundedIcon");
    expect(screen.getByText("Alarms Panel")).toBeInTheDocument();
  });

  it("creates an alarm and immediately updates the list", async () => {
    const created = buildAlarm({alarm_id:"a-9",threshold:50});
    api.post.mockResolvedValue({data:{data:{alarm:created}}});
    render(<Harness initialAlarms={[]} />);
    clickIconButton("AddRoundedIcon");
    selectMuiOption("Seleccionar Dispositivo", "Sensor Temperatura");
    fireEvent.change(screen.getByLabelText("Valor"), {target:{value:"50"}});
    fireEvent.change(screen.getByLabelText("Selected Key"), {target:{value:"temp"}});
    selectMuiOption("Condición", "Mayor que");
    fireEvent.click(screen.getByRole("button", {name:"Guardar"}));
    expect(await screen.findByText("50")).toBeInTheDocument();
    expect(api.get).not.toHaveBeenCalled();
  });
  it("deletes only after confirmation and keeps the alarm on failure", async () => {
    jest.spyOn(window,"confirm").mockReturnValue(false);
    render(<Harness initialAlarms={[buildAlarm()]} />);
    fireEvent.click(screen.getByRole("button", {name:"Delete alarm"}));
    expect(api.delete).not.toHaveBeenCalled();
    window.confirm.mockReturnValue(true);
    api.delete.mockRejectedValue(new Error("offline"));
    fireEvent.click(screen.getByRole("button", {name:"Delete alarm"}));
    expect(await screen.findByRole("alert")).toHaveTextContent("Could not delete alarm");
    expect(screen.getByText("Sensor Temperatura")).toBeInTheDocument();
  });
  it("edits an existing alarm using the prefilled form", async () => {
    const original=buildAlarm();
    const updated={...original,threshold:75};
    api.put.mockResolvedValue({data:{data:{alarm:updated}}});
    render(<Harness initialAlarms={[original]} />);
    clickIconButton("EditIcon");
    expect(screen.getByLabelText("Valor")).toHaveValue(original.threshold);
    fireEvent.change(screen.getByLabelText("Valor"), {target:{value:"75"}});
    fireEvent.click(screen.getByRole("button", {name:"Guardar"}));
    expect(await screen.findByText("75")).toBeInTheDocument();
    expect(api.put).toHaveBeenCalledWith(`/api/alarms/${original.alarm_id}`,expect.objectContaining({threshold:75}));
  });
});

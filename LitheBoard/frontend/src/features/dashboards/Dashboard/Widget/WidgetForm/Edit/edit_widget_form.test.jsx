import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import EditWidgetDrawer from "./edit_widget_form";
import { buildDevice, buildEntity, selectMuiOption } from "../../../../../../test/test_utils";

jest.mock("@uiw/react-codemirror", () => require("../../../../../../test/editor_mocks").MockCodeMirror);
jest.mock("react-colorful", () => ({
  HexColorPicker: require("../../../../../../test/editor_mocks").MockHexColorPicker,
}));

const entities = [buildEntity(), buildEntity({ entity_id: "entity-2", name: "Sensor Humedad" })];

function renderEditor({ device = buildDevice(), open = true, widget_id = device.widget_id } = {}) {
  const props = {
    devices_list: [device],
    widget_id,
    widget_type: device.widget_type,
    entities,
    onSave: jest.fn(),
    is_widget_editor_drawer_open: open,
    setIsWidgetEditorDrawerOpen: jest.fn(),
  };
  render(<EditWidgetDrawer {...props} />);
  return props;
}

const save = () => fireEvent.click(screen.getByRole("button", { name: "Guardar" }));

describe("<EditWidgetDrawer />", () => {
  it("no muestra nada mientras está cerrado", () => {
    renderEditor({ open: false });

    expect(screen.queryByText(/Editar Dispositivo/)).not.toBeInTheDocument();
  });

  it("precarga los datos del widget a editar", () => {
    renderEditor({ device: buildDevice({ widget_config: { ...buildDevice().widget_config, line_color: "#ff6a00" } }) });

    expect(screen.getByText("Editar Dispositivo line_chart")).toBeInTheDocument();
    expect(screen.getByLabelText("Nombre del Widget")).toHaveValue("Temperatura");
    expect(screen.getByLabelText("Clave")).toHaveValue("temp");
  });

  it("guarda un gráfico de línea conservando su color", () => {
    const { onSave, setIsWidgetEditorDrawerOpen } = renderEditor({
      device: buildDevice({ widget_config: { ...buildDevice().widget_config, line_color: "#ff6a00" } }),
    });

    fireEvent.change(screen.getByLabelText("Nombre del Widget"), { target: { value: "Temp interior" } });
    save();

    expect(onSave).toHaveBeenCalledWith({
      widget_id: "widget-1",
      name: "Temp interior",
      entity_id: "entity-1",
      widget_type: "line_chart",
      widget_config: {
        sub_topic: "temp",
        pub_topic: "temp/set",
        entity_name: "Sensor Temperatura",
        line_color: "#ff6a00",
        data_key: "temp",
      },
    });
    expect(setIsWidgetEditorDrawerOpen).toHaveBeenCalledWith(false);
  });

  it("permite cambiar el color y el dispositivo asociado", () => {
    const { onSave } = renderEditor({
      device: buildDevice({ widget_config: { ...buildDevice().widget_config, line_color: "#ff6a00" } }),
    });

    fireEvent.click(screen.getByRole("button", { name: "pick-line_color" }));
    selectMuiOption("Seleccionar dispositivo", "Sensor Humedad");
    save();

    expect(onSave.mock.calls[0][0]).toMatchObject({
      entity_id: "entity-2",
      widget_config: { line_color: "#123456", entity_name: "Sensor Humedad" },
    });
  });

  it("valida los campos obligatorios antes de guardar", () => {
    const { onSave, setIsWidgetEditorDrawerOpen } = renderEditor();

    fireEvent.change(screen.getByLabelText("Nombre del Widget"), { target: { value: "" } });
    save();

    expect(screen.getByText("Nombre del Widget es obligatorio")).toBeInTheDocument();
    expect(screen.getByText("El color de la línea es obligatorio")).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();
    expect(setIsWidgetEditorDrawerOpen).not.toHaveBeenCalled();
  });

  it("valida los mensajes de un switch", () => {
    const { onSave } = renderEditor({ device: buildDevice({ widget_type: "switch" }) });

    save();

    expect(screen.getAllByText("Message ON es obligatorio").length).toBeGreaterThan(0);
    expect(onSave).not.toHaveBeenCalled();
  });

  it("conserva false al editar un switch apagado", () => {
    const { onSave } = renderEditor({ device: buildDevice({ widget_type: "switch", widget_config: { data_key: "power", is_on: false, message_on: "1", message_off: "0" } }) });
    save();
    expect(onSave.mock.calls[0][0].widget_config.is_on).toBe(false);
  });

  it("guarda HTML y CSS de una tarjeta personalizada", () => {
    const { onSave } = renderEditor({
      device: buildDevice({
        widget_type: "custom_value_card",
        widget_config: { ...buildDevice().widget_config, html_template: "<b>${value}</b>", css: "b{}" },
      }),
    });

    fireEvent.change(screen.getByLabelText("css"), { target: { value: "b{color:red}" } });
    save();

    expect(onSave.mock.calls[0][0].widget_config).toMatchObject({ html_template: "<b>${value}</b>", css: "b{color:red}" });
  });

  it("cierra sin guardar al cancelar", () => {
    const { onSave, setIsWidgetEditorDrawerOpen } = renderEditor();

    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(setIsWidgetEditorDrawerOpen).toHaveBeenCalledWith(false);
    expect(onSave).not.toHaveBeenCalled();
  });

  it("registra un error si se abre sin widget", () => {
    renderEditor({ widget_id: null });

    expect(console.error).toHaveBeenCalledWith("no widget_id, ", null);
  });
});

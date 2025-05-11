import React, { useState, useEffect } from "react";
import {
  Drawer,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Toolbar,
  FormHelperText,
} from "@mui/material";
import { HexColorPicker } from "react-colorful";
import CodeMirror from "@uiw/react-codemirror";
import widgetFieldsConfig from "../widget_forms_config";

const EditWidgetDrawer = ({
  devices_list,
  widget_id,
  widget_type,
  onSave,
  entities,
  is_widget_editor_drawer_open,
  setIsWidgetEditorDrawerOpen,
}) => {
  const [form_data, setFormData] = useState({});
  const [selected_device, set_selected_device] = useState("");
  const [errors, set_errors] = useState({});

  const fields = widgetFieldsConfig[widget_type] || [];

  useEffect(() => {
    if (is_widget_editor_drawer_open) {
      if( widget_id) {
      const widget = devices_list.find((item) => item.widget_id === widget_id);
      console.log("widget : ", widget_id)
      if (widget) {
        const device = entities.find(
          (d) => d.entity_id === widget.entity_id
        );
        set_selected_device(device);
        setFormData({
          widget_name: widget.widget_name,
          widget_clave: widget.config.selected_key,
          widget_type: widget.widget_type,
          message_on: widget.config.message_on,
          message_off: widget.config.message_off,
          line_color: widget.config.line_color,
          lat: widget.config.lat,
          lon: widget.config.lon,
          script_html: widget.config.scriptHtml,
          script_css: widget.config.scriptCss,
          entity_id: widget.entity_id,
        });
      }
      }
      else {
              console.error("no widget_id, ", widget_id)
      }
    }
  }, [is_widget_editor_drawer_open, widget_id, devices_list, entities]);

  const handleDeviceSelect = (e) => {
    const entity_id = e.target.value;
    const device = entities.find((d) => d.entity_id === entity_id);
    set_selected_device(device);
    setFormData((prev_data) => ({
      ...prev_data,
      widget_name: prev_data.widget_name,
      client_id: device.client_id,
      entity_id: device.entity_id,
      widget_type: widget_type || "switch",
      config: {},
    }));
  };

  const handleInputChange = (id, value) => {
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const validateForm = () => {
    const newErrors = {};

    // Verificar que todos los campos necesarios estén llenos
    fields.forEach((field) => {
      if (!form_data[field.id] && field.type !== "script") {
        newErrors[field.id] = `${field.label} es obligatorio`;
      }
    });

    // Validación específica según el tipo de widget
    if (widget_type === "switch") {
      if (!form_data.message_on)
        newErrors.message_on = "Message ON es obligatorio";
      if (!form_data.message_off)
        newErrors.message_off = "Message OFF es obligatorio";
    } else if (widget_type === "map") {
      if (!form_data.lat) newErrors.lat = "La Latitud es obligatoria";
      if (!form_data.lon) newErrors.lon = "La Longitud es obligatoria";
    } else if (widget_type === "lineChart" || widget_type === "barChart") {
      if (!form_data.line_color)
        newErrors.line_color = "El color de la línea es obligatorio";
    } else if (widget_type === "customValueCard") {
      if (!form_data.script_html)
        newErrors.script_html = "El HTML es obligatorio";
      if (!form_data.script_css) newErrors.script_css = "El CSS es obligatorio";
    }

    if (!form_data.entity_id)
      newErrors.entity_id = "El dispositivo es obligatorio";

    set_errors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    const editedWidget = {
      widget_id: widget_id,
      widget_name: form_data.widget_name,
      entity_id: selected_device.entity_id,
      widget_type: form_data.widget_type,
      config_data: {
        sub_topic: selected_device.sub_topic,
        pub_topic: selected_device.pub_topic,
        entity_name: selected_device.disp_name,
        ...(form_data.widget_type === "switch" && {
          message_on: form_data.message_on,
          message_off: form_data.message_off,
          estado_actual: form_data.estado_actual || true,
        }),
        ...(form_data.widget_type === "map" && {
          lat: form_data.lat,
          lon: form_data.lon,
        }),
        ...(form_data.widget_type === "lineChart" ||
          (form_data.widget_type === "barChart" && {
            line_color: form_data.line_color,
          })),
        ...(form_data.widget_type === "customValueCard" && {
          scriptHtml: form_data.script_html,
          scriptCss: form_data.script_css,
        }),
        selected_key: form_data.widget_clave,
      },
    };

    onSave(editedWidget);
    setIsWidgetEditorDrawerOpen(false);
  };

  const renderFields = () => {
    const scriptFields = fields.filter((field) => field.type === "script");
    const otherFields = fields.filter((field) => field.type !== "script");

    return (
      <div className="mb-6 w-full mx-10 inline-flex">
        <div className="flex m-auto flex-wrap justify-center flex-1">
          {otherFields.map((field) => (
            <div
              className={`mb-6 w-full ${scriptFields.length > 0 ? "mr-2" : ""}`}
              key={field.id}
            >
              <label className="block mb-1 text-sm text-gray-700">
                {field.label}
              </label>
              {field.type === "color" ? (
                <>
                  <HexColorPicker
                    id={field.id}
                    color={form_data[field.id] || "#000000"}
                    onChange={(newColor) =>
                      setFormData((prev_data) => ({
                        ...prev_data,
                        [field.id]: newColor,
                      }))
                    }
                  />
                  {errors[field.id] && (
                    <FormHelperText error>{errors[field.id]}</FormHelperText>
                  )}
                </>
              ) : (
                <TextField
                  id={field.id}
                  label={field.label}
                  variant="filled"
                  value={form_data[field.id] || ""}
                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                  InputLabelProps={{ style: { color: "#232939" } }}
                  InputProps={{ style: { color: "#232939" } }}
                  autoComplete="off"
                  fullWidth
                />
              )}
              {errors[field.id] && (
                <FormHelperText error>{errors[field.id]}</FormHelperText>
              )}
            </div>
          ))}
        </div>

        {scriptFields.length > 0 && (
          <div className="flex flex-wrap justify-center flex-1">
            <div className="w-full ml-2 flex flex-col">
              {scriptFields.map((field) => (
                <div key={field.id} className="flex-auto mb-3">
                  <label className="block mb-1 text-sm text-gray-700">
                    {field.label}
                  </label>
                  <CodeMirror
                    id={field.id}
                    value={form_data[field.id] || ""}
                    onChange={(value) =>
                      setFormData((prev_data) => ({
                        ...prev_data,
                        [field.id]: value,
                      }))
                    }
                    theme="dark"
                    className="border border-gray-300 rounded-md"
                    options={{
                      lineWrapping: true,
                      scrollbarStyle: "native",
                    }}
                  />
                  {errors[field.id] && (
                    <FormHelperText error>{errors[field.id]}</FormHelperText>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      <Drawer anchor="right" open={is_widget_editor_drawer_open}>
        <div className="h-full flex-wrap flex content-between my-3">
          <div className="bg-opacity-10 bg-slate-300">
            <Toolbar className="w-full h-fit mt-[64px] flex-col flex m-4 ">
              <h2 className="font-medium text-gray-900 text-xl w-full">
                Editar Dispositivo {widget_type}
              </h2>
            </Toolbar>
          </div>

          <div className="flex flex-wrap items-center h-fit w-full m-4 overscroll-y-none">
            {renderFields()}
            <FormControl variant="filled" fullWidth>
              <InputLabel id="device-select-label" style={{ color: "#232939" }}>
                Seleccionar dispositivo
              </InputLabel>
              <Select
                labelId="device-select-label"
                id="entity_id"
                onChange={handleDeviceSelect}
                label="Seleccionar dispositivo"
                style={{ color: "#232939" }}
                value={form_data.entity_id || ""}
              >
                {entities.map((device) => (
                  <MenuItem key={device.entity_id} value={device.entity_id}>
                    {device.disp_name}
                  </MenuItem>
                ))}
              </Select>
              {errors.entity_id && (
                <FormHelperText error>{errors.entity_id}</FormHelperText>
              )}
            </FormControl>
          </div>
          <div className="flex justify-end mt-4 items-end w-full">
            <Button
              onClick={() => setIsWidgetEditorDrawerOpen(false)}
              color="primary"
            >
              Cancelar
            </Button>
            <Button onClick={handleSubmit} color="primary">
              Guardar
            </Button>
          </div>
        </div>
      </Drawer>
    </div>
  );
};

export default EditWidgetDrawer;

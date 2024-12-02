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
import widgetFieldsConfig from "../WidgetFormsConfig";

const EditWidgetDrawer = ({
  datos,
  widgetId,
  widgetType,
  onSave,
  dispositivos,
  isWidgetEditorDrawerOpen,
  setIsWidgetEditorDrawerOpen,
}) => {
  const [formData, setFormData] = useState({});
  const [selectedDevice, setSelectedDevice] = useState("");
  const [errors, setErrors] = useState({});

  const fields = widgetFieldsConfig[widgetType] || [];
  const widget = datos.find((item) => item.widget_id === widgetId);


  useEffect(() => {
    if (isWidgetEditorDrawerOpen && widgetId) {
      // Buscar el widget con el widget_id igual al proporcionado
      const widget = datos.find((item) => item.widget_id === widgetId);
      if (widget) {
        const device = dispositivos.find((d) => d.entity_name === widget.entity_name);
        console.log("device",device);
        setSelectedDevice(device);
        // Establecer los valores de los campos en el estado formData
        setFormData({
          widget_name: widget.widget_name,
          widget_clave: widget.config.selected_key,
          widget_type: widget.widget_type,
          message_on: widget.config.message_on,
          message_off: widget.config.message_off,
          lineColor: widget.config.lineColor,
          lat: widget.config.lat,
          lon: widget.config.lon,
          script_html: widget.config.scriptHtml,
          script_css: widget.config.scriptCss,
          entity_id: device.entity_id
        });

        // Establecer el dispositivo seleccionado si es necesario

      }
    }
  }, [isWidgetEditorDrawerOpen, widgetId, datos, dispositivos]);

  const handleDeviceSelect = (e) => {
    const entity_id = e.target.value;
    const device = dispositivos.find((d) => d.entity_id === entity_id);
    setSelectedDevice(device);
    setFormData((prevData) => ({
      ...prevData,
      widget_name: prevData.widget_name,
      client_id: device.client_id,
      entity_id: device.entity_id,
      widget_type: widgetType || "switch",
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
      if (!formData[field.id] && field.type !== "script") {
        newErrors[field.id] = `${field.label} es obligatorio`;
      }
    });

    // Validación específica según el tipo de widget
    if (widgetType === "switch") {
      if (!formData.message_on) newErrors.message_on = "Message ON es obligatorio";
      if (!formData.message_off) newErrors.message_off = "Message OFF es obligatorio";
    } else if (widgetType === "map") {
      if (!formData.lat) newErrors.lat = "La Latitud es obligatoria";
      if (!formData.lon) newErrors.lon = "La Longitud es obligatoria";
    } else if (widgetType === "lineChart" || widgetType === "barChart") {
      if (!formData.lineColor) newErrors.lineColor = "El color de la línea es obligatorio";
    } else if (widgetType === "customValueCard") {
      if (!formData.script_html) newErrors.script_html = "El HTML es obligatorio";
      if (!formData.script_css) newErrors.script_css = "El CSS es obligatorio";
    }

    if (!formData.entity_id) newErrors.entity_id = "El dispositivo es obligatorio";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    const editedWidget = {
      widget_id: widgetId,
      widget_name: formData.widget_name,
      entity_id: selectedDevice.entity_id,
      widget_type: formData.widget_type,
      config_data: {
        sub_topic: selectedDevice.sub_topic,
        pub_topic: selectedDevice.pub_topic,
        entity_name: selectedDevice.disp_name,
        ...(formData.widget_type === "switch" && {
          message_on: formData.message_on,
          message_off: formData.message_off,
          estado_actual: formData.estado_actual || true,
        }),
        ...(formData.widget_type === "map" && {
          lat: formData.lat,
          lon: formData.lon,
        }),
        ...(formData.widget_type === "lineChart" || formData.widget_type === "barChart" && {
          lineColor: formData.lineColor,
        }),
        ...(formData.widget_type === "customValueCard" && {
          scriptHtml: formData.script_html,
          scriptCss: formData.script_css,
        }),
        selected_key: formData.widget_clave,
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
                    color={formData[field.id] || "#000000"}
                    onChange={(newColor) =>
                      setFormData((prevData) => ({
                        ...prevData,
                        [field.id]: newColor,
                      }))
                    }
                  />
                  {errors[field.id] && <FormHelperText error>{errors[field.id]}</FormHelperText>}
                </>
              ) : (
                <TextField
                  id={field.id}
                  label={field.label}
                  variant="filled"
                  value={formData[field.id] || ""}
                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                  InputLabelProps={{ style: { color: "#232939" } }}
                  InputProps={{ style: { color: "#232939" } }}
                  autoComplete="off"
                  fullWidth
                />
              )}
              {errors[field.id] && <FormHelperText error>{errors[field.id]}</FormHelperText>}
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
                    value={formData[field.id] || ""}
                    onChange={(value) =>
                      setFormData((prevData) => ({
                        ...prevData,
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
                  {errors[field.id] && <FormHelperText error>{errors[field.id]}</FormHelperText>}
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
      <Drawer anchor="right" open={isWidgetEditorDrawerOpen}>
        <div className="h-full flex-wrap flex content-between my-3">
          <div className="bg-opacity-10 bg-slate-300">
            <Toolbar className="w-full h-fit mt-[64px] flex-col flex m-4 ">
              <h2 className="font-medium text-gray-900 text-xl w-full">
                Editar Dispositivo {widgetType}
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
                value={formData.entity_id || ""}
              >
                {dispositivos.map((device) => (
                  <MenuItem key={device.entity_id} value={device.entity_id}>
                    {device.disp_name}
                  </MenuItem>
                ))}
              </Select>
              {errors.entity_id && <FormHelperText error>{errors.entity_id}</FormHelperText>}
            </FormControl>

            
          </div>
          <div className="flex justify-end mt-4 items-end w-full">
            <Button onClick={() => setIsWidgetEditorDrawerOpen(false)} color="primary">
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

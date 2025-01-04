import React, { useState, useEffect} from "react";
import axios from "axios";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  TextField,
  Typography,
} from "@mui/material";
import {
  setWidget,
  getDashboardWidgets,
} from "../../../../../database_data_functions";
import widgetFieldsConfig from "./widget_forms_config";
import { HexColorPicker } from "react-colorful";
import CodeMirror from "@uiw/react-codemirror";

function WidgetForm(props) {
  const { setDevicesList, entities, dashboard_id, widget_type, user, onHasScriptFields} = props;
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [form_data, setFormData] = useState({});
  const fields = widgetFieldsConfig[widget_type] || [];

  useEffect(() => {
    const has_script_fields = fields.some((field) => field.type === "script");
    onHasScriptFields(has_script_fields);
  }, [fields, onHasScriptFields]);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [id]: value }));
  };

  const handleDeviceSelect = (e) => {
    const entity_id = e.target.value;
    const device = entities.find((d) => d.entity_id === entity_id);
    setSelectedDevice(device);
    setFormData((prevData) => ({
      ...prevData,
      widget_name: prevData.widget_name,
      client_id: device.client_id,
      entity_id: device.entity_id,
      widget_type: widget_type || "switch",
      config: {},
    }));
  };


  const handleWidgetCreate = () => {
    if (selectedDevice && form_data.widget_type && form_data.widget_name) {
      const new_widget = {
        widget_name: form_data.widget_name,
        entity_id: selectedDevice.entity_id,
        dashboard_id: dashboard_id,
        widget_type: form_data.widget_type,
        config_data: {
          sub_topic: selectedDevice.sub_topic,
          pub_topic: selectedDevice.pub_topic,
          entity_name: selectedDevice.disp_name,
          ...(form_data.widget_type === "switch" && {
            message_on: form_data.message_on,
            message_off: form_data.message_off,
            estado_actual: true,
          }),
          ...(form_data.widget_type === "map" && {
            lat: form_data.lat,
            lon: form_data.lon,
          }),
          ...(form_data.widget_type === "lineChart" && {
            line_color: form_data.line_color,
          }),
          ...(form_data.widget_type === "barChart" && {
            line_color: form_data.line_color,
          }),
          ...(form_data.widget_type === "customValueCard" && {
            scriptHtml: form_data.script_html,
            scriptCss: form_data.script_css,
          }),

          selected_key: form_data.widget_clave,
        },
        client_id: user.id,
      };

      setWidget(new_widget)
        .then((response) => {
          console.log("Widget creado:", response.data);

          return getDashboardWidgets(dashboard_id, user.id);
        })
        .then(({ devices, history }) => {
          setDevicesList(devices);
          console.log("Datos actualizados:", devices);
        })
        .catch((error) => {
          console.error("Error al añadir el dispositivo:", error);
        });
    } else {
      console.log(
        "Seleccione un dispositivo, un tipo de widget y proporcione un name para el widget."
      );
    }
  };

  const renderFields = () => {

    const scriptFields = fields.filter((field) => field.type === "script");
    const otherFields = fields.filter((field) => field.type !== "script");

    return (
      <div className="mb-6 w-full mx-10 inline-flex ">
        <div className="flex m-auto flex-wrap justify-center flex-1">
          {otherFields.map((field) => (
            <div className={`mb-6 w-full ${
              scriptFields ? "mr-2" : ""
            }`} key={field.id}>
              {field.type === "color" ? (
                <>
                  {field.label}
                  <HexColorPicker
                    id={field.id}
                    color={"#000000"}
                    onChange={(newColor) =>
                      setFormData((prevData) => ({
                        ...prevData,
                        [field.id]: newColor, 
                      }))
                    }
                  />
                </>
              ) : (
                <TextField
                  id={field.id}
                  label={field.label}
                  variant="filled"
                  value={form_data[field.id] || ""}
                  onChange={handleInputChange}
                  InputLabelProps={{ style: { color: "#232939" } }}
                  InputProps={{ style: { color: "#232939" } }}
                  autoComplete="off"
                  fullWidth
                />
              )}
            </div>
          ))}
        </div>
        {scriptFields.length > 0 && (
          <div className="flex flex-wrap justify-center flex-1">
            <div className=" w-full ml-2 flex flex-col">
              {scriptFields.map((field) => (
                <div key={field.id} className="flex-auto mb-3">
                  <Typography variant="body">{field.label}</Typography>
                  <CodeMirror
                    id={field.id}
                    value={form_data[field.id] || ""}
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
                  <style jsx>{`
                    #${field.id} {
                      max-height: 200px; /* max height */
                      overflow-y: auto;
                    }
                  `}</style>
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
      <div className="flex m-auto flex-wrap justify-center my-10">
        {renderFields()}
        <div className="mb-6 w-full mx-10">
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
              {entities.map((device, index) => (
                <MenuItem key={device.entity_id} value={device.entity_id}>
                  {device.disp_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>
      </div>
      <div className="w-full flex justify-center flex-wrap">
        <Button
          variant="contained"
          color="primary"
          onClick={handleWidgetCreate}
        >
          Agregar
        </Button>
      </div>
    </div>
  );
}

export default WidgetForm;

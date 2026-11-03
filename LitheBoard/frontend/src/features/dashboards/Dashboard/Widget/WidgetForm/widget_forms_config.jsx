const widgetFieldsConfig = {
  switch: [
    { id: "name", label: "Nombre del Widget", type: "text" },
    { id: "data_key", label: "Clave", type: "text" },
    { id: "message_on", label: "Message ON", type: "text" },
    { id: "message_off", label: "Message OFF", type: "text" },
  ],
  line_chart: [
    { id: "name", label: "Nombre del Widget", type: "text" },
    { id: "data_key", label: "Clave", type: "text" },
    { id: "line_color", label: "Color de la línea", type: "color", value:"#ff6a00"},
  ],
  bar_chart: [
    { id: "name", label: "Nombre del Widget", type: "text" },
    { id: "data_key", label: "Clave", type: "text" },
    { id: "line_color", label: "Color de la línea", type: "color", value:"#ff6a00"},
  ],
  map: [
    { id: "name", label: "Nombre del Widget", type: "text" },
    { id: "data_key", label: "Clave", type: "text" },
    { id: "lat", label: "Latitud", type: "number" },
    { id: "lon", label: "Longitud", type: "number" },
  ],
  custom_value_card: [
    { id: "name", label: "Nombre del Widget", type: "text" },
    { id: "data_key", label: "Clave", type: "text" },
    { id: "html_template", label: "html", type: "script" },
    { id: "css", label: "CSS", type: "script" },
  ],
};

export default widgetFieldsConfig;

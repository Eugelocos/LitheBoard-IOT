const widgetFieldsConfig = {
  switch: [
    { id: "widget_name", label: "Nombre del Widget", type: "text" },
    { id: "widget_clave", label: "Clave", type: "text" },
    { id: "message_on", label: "Message ON", type: "text" },
    { id: "message_off", label: "Message OFF", type: "text" },
  ],
  lineChart: [
    { id: "widget_name", label: "Nombre del Widget", type: "text" },
    { id: "widget_clave", label: "Clave", type: "text" },
    { id: "lineColor", label: "Color de la línea", type: "color", value:"#ff6a00"},
  ],
  barChart: [
    { id: "widget_name", label: "Nombre del Widget", type: "text" },
    { id: "widget_clave", label: "Clave", type: "text" },
    { id: "lineColor", label: "Color de la línea", type: "color", value:"#ff6a00"},
  ],
  map: [
    { id: "widget_name", label: "Nombre del Widget", type: "text" },
    { id: "widget_clave", label: "Clave", type: "text" },
    { id: "lat", label: "Latitud", type: "number" },
    { id: "lon", label: "Longitud", type: "number" },
  ],
  customValueCard: [
    { id: "widget_name", label: "Nombre del Widget", type: "text" },
    { id: "widget_clave", label: "Clave", type: "text" },
    { id: "script_html", label: "html", type: "script" },
    { id: "script_css", label: "CSS", type: "script" },
  ],
};

export default widgetFieldsConfig;

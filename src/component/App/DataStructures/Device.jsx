class Device {
  constructor(device_id, widget_name, clientId, dashboardID, widget_type, historial, config) {
    this.widget_id = null;
    this.device_id = device_id;
    this.dashboardID = dashboardID;
    this.widget_name = widget_name;
    this.clientId = clientId;
    this.config = config;
    this.widget_type = widget_type;
    this.historial = historial;
  }
}

export default Device;


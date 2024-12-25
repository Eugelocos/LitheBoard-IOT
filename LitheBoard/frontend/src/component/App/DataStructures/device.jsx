class Device {
  constructor(entity_id, widget_name, client_id, dashboard_id, widget_type, historial, config, mqtt_data) {
    this.widget_id = null;
    this.entity_id = entity_id;
    this.dashboard_id = dashboard_id;
    this.widget_name = widget_name;
    this.client_id = client_id;
    this.config = config;
    this.widget_type = widget_type;
    this.historial = historial;
    this.mqtt_data = mqtt_data;
  }
}

export default Device;


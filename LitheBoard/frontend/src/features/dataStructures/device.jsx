class Device {
  constructor(entity_id, name, client_id, dashboard_id, widget_type, historics, widget_config, ) {
    this.widget_id = null;
    this.entity_id = entity_id;
    this.dashboard_id = dashboard_id;
    this.name = name;
    this.client_id = client_id;
    this.widget_config = widget_config;
    this.widget_type = widget_type;
    this.historics = historics;
  }
}

export default Device;


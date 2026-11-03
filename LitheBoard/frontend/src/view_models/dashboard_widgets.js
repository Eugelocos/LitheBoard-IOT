import Device from "../features/dataStructures/device";
export function toDashboardWidgets(widgetsList, entitiesList, historicsList, client_id) {
    const devices = widgetsList
      .map((data) => {
        try {
          const entity = entitiesList.find(
            e => e.entity_id === data.entity_id
          );
          
          if (!entity) {
            console.warn(`Entity not found for widget ${data.widget_id}`);
            return null;
          }

          let widgetConfig = {};
          try {
            widgetConfig = typeof data.widget_config === 'string' 
              ? JSON.parse(data.widget_config) 
              : data.widget_config || {};
          } catch (e) {
            console.warn('Error parsing widgetConfig:', e);
            widgetConfig = {};
          }

          let datasourceConfig = {};
          try {
            datasourceConfig = typeof entity.datasource_config === 'string'
              ? JSON.parse(entity.datasource_config)
              : entity.datasource_config || {};
          } catch (e) {
            console.warn('Error parsing datasourceConfig:', e);
            datasourceConfig = {};
          }

          const fullConfig = {
            ...widgetConfig,
            datasource_type: entity.datasource_type,
            datasource_config: datasourceConfig,
            entity_name: entity.name,
            entity_id: entity.entity_id,
          };

          const entity_history = historicsList.filter(
            (historics) => historics.entity_id === data.entity_id
          );

          const new_device = new Device(
            data.entity_id || null,
            data.name,
            client_id,
            data.dashboard_id,
            data.widget_type,
            entity_history,
            fullConfig
          );
          new_device.widget_id = data.widget_id;
          new_device.connection_status = entity.connection_status;
          
          return new_device;
        } catch (parseError) {
          console.error(
            "Error processing widget:",
            data.widget_id,
            parseError
          );
          return null;
        }
      })
      .filter(device => device !== null);
  return devices;
}

import Device from "../features/dataStructures/device";
import React, { useRef, useState, useEffect } from "react";
import config from "@config";
import api from "../services/api"

const base_url = `${config.BACKEND_URL}:${config.BACKEND_API_PORT}`;
//#region Historicos
function setDatosHistoricos(
  historial_data,
  actualizar_hist = null,
  entity_id = null,
  selected_key = null
) {
  return api
    .post(`${base_url}/api/historic`, historial_data, {
      headers: {
        "Content-Type": "application/json",
      },
    })
    .then((response) => {
      if (actualizar_hist && entity_id && selected_key) {
        actualizar_hist(entity_id, selected_key);
      }
      return response.data.data.historial;
    })
    .catch((error) => {
      console.error("Error sending historic data:", error);
      throw error; 
    });
}

function getHistorialEntity(entity_id) {
  return api
    .get(`${base_url}/api/historic/entity/${entity_id}`)
    .then((response) => {
      return response.data.data.historics;
    })
    .catch((error) => {
      console.error("Error fetching history:", error);
      throw error;
    });
}
//#endregion

//#region widgets
async function getDashboardWidgets(dashboard_id, client_id) {
  try {
    const [historical_response, entities_response] = await Promise.all([
      api.get(`${base_url}/api/historic/client/${client_id}`),
      api.get(
        `${base_url}/api/widget/${client_id}/${dashboard_id}`
      ),
    ])

    const devices = entities_response.data.data.widgets
      .map((data) => {
        try {
          const config = {
            ...JSON.parse(data.config_data),  // Propiedades de config_data
          };
          const entity_history  = historical_response.data.data.historics.filter(
            (historial) =>
              historial.entity_id === data.entity_id
          );
          const new_device = new Device(
            data.entity_id||null,
            data.widget_name,
            data.client_id,
            data.dashboard_id,
            data.widget_type,
            entity_history , // Asume que historial está vacío por ahora
            config
          );
          new_device.widget_id=data.widget_id;
          return new_device;
        } catch (parseError) {
          console.error(
            "Error parsing config_data for entity_id:",
            data.entity_id,
            parseError
          );
          return null; // Devuelve null si hay un error al parsear el JSON
        }
      })


    return {
      devices,
      history: historical_response.data.data.historics,
    };
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
}

const setWidget = (new_widget, setDevicesList) => {
  return api
    .post(`${base_url}/api/widget`, new_widget)
    .then((response) => {
      console.log("Widget creado:", response.data.data);
      return response.data.data;
    })
    .catch((error) => {
      console.error("Error al crear el widget:", error);
      throw error;
    });
};
//#endregion

//#region entities
function setDevice(device_data) {
  return api.post(`${base_url}/api/entity`, device_data);
}

function getDevice(setEntities, client_id) {
  return api
    .get(`${base_url}/api/entity`, {
      params: { client_id },
    })
    .then((response) => {
      setEntities([...response.data.data]);
    });
}

//#endregion

export {
  getDashboardWidgets,
  getHistorialEntity,
  setDatosHistoricos,
  setWidget,
  setDevice,
  getDevice,
};

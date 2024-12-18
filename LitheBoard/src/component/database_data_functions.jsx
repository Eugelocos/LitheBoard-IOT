import axios from "axios";
import Device from "./App/DataStructures/device";
import React, { useRef, useState, useEffect } from "react";

const baseURL = "http://localhost:3001";
//#region Historicos
function setDatosHistoricos(
  historialData,
  actualizarHist = null,
  entity_id = null,
  selected_key = null
) {
  return axios
    .post(`${baseURL}/api/data/historic/insert`, historialData, {
      headers: {
        "Content-Type": "application/json",
      },
    })
    .then((response) => {
      // Return response data if needed
      if (actualizarHist && entity_id && selected_key) {
        actualizarHist(entity_id, selected_key);
      }
      return response.data;
    })
    .catch((error) => {
      console.error("Error sending historic data:", error);
      throw error; // Throw error to handle in calling function if needed
    });
}

function getHistoricosEntity(entity_id) {
  return axios
    .get(`${baseURL}/api/data/historic/ei/get/${entity_id}`)
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.error("Error fetching history:", error);
      throw error; // Throw error to handle in calling function if needed
    });
}
//#endregion

//#region widgets
async function getDashboardWidgets(dashboard_id, client_id) {
  try {
    const [historicalResponse, entitiesResponse] = await axios.all([
      axios.get(`${baseURL}/api/data/historic/ci/get/${client_id}`),
      axios.get(
        `${baseURL}/api/data/entitiesWidgets/${dashboard_id}/${client_id}`
      ),
    ])

    const devices = entitiesResponse.data
      .map((data) => {
        try {
if(data.entity_id == null){
  console.log("device:", data);
}
          const config = JSON.parse(data.config_data || "{}");
          const historialDelDispositivo = historicalResponse.data.filter(
            (historial) =>
              historial.entity_id === data.entity_id
          );
          const newDevice = new Device(
            data.entity_id||null,
            data.widget_name,
            data.client_id,
            data.dashboard_id,
            data.widget_type,
            historialDelDispositivo, // Asume que historial está vacío por ahora
            config
          );

          newDevice.widget_id=data.widget_id;
          return newDevice;
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
      history: historicalResponse.data,
    };
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
}

const setWidget = (newWidget, setDatos) => {
  return axios
    .post(`${baseURL}/api/data/widgets/insert`, newWidget)
    .then((response) => {
      console.log("Widget creado:", response.data);
      return response.data; // Aseguramos de que retorna la data correcta
    })
    .catch((error) => {
      console.error("Error al crear el widget:", error);
      throw error; // Lanzar error para manejarlo en el componente
    });
};
//#endregion

//#region entities
function setDevice(deviceData) {
  return axios.post(`${baseURL}/api/data/entities/insert`, deviceData);
}

function getDevice(setDispositivos, client_id) {
  return axios
    .get(`${baseURL}/api/data/entities/get`, {
      params: { client_id },
    })
    .then((response) => {
      setDispositivos([...response.data]);
    });
}

//#endregion

export {
  getDashboardWidgets,
  getHistoricosEntity,
  setDatosHistoricos,
  setWidget,
  setDevice,
  getDevice,
};

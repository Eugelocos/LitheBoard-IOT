import mqtt from "mqtt";
import React, { useEffect, useState } from "react";
import {
  setDatosHistoricos,
  getDashboardWidgets,
  getDevice,
} from "./DatabaseDataFunctions";
import axios from "axios";

function Sketch(props) {
  const {
    datos,
    user,
    actualizarHistorial,
    alarms,
    setUnseenNotifications,
    fetchNotifications,
    dispositivos,
    clientAlert,
    setClientAlert,
    indexDashboard,
    client
  } = props;


  useEffect(() => {


    client.on("message", (topic, message) => {
      let historialData;
      let entity_id;
      let selected_key;
        
      datos.forEach((dato) => {
        if (dato.config?.sub_topic === topic) {
          let parsedMessage;
          entity_id = dato.device_id;
          selected_key = dato.config.selected_key;
          try {

            parsedMessage = JSON.parse(message.toString());
            if (parsedMessage["token"] !== dato.config.token) {
              console.warn(
                "El mensaje entrante no proviene de un dispositivo autentificado"
              );
              return;
            }


            if(dato.widget_type === "map") {
              const location={"lat":parsedMessage['lat'],"lon":parsedMessage['lon']}

              historialData = {
                entity_id: dato.device_id,
                date: new Date().toISOString().slice(0, 19).replace("T", " "),
                data: JSON.stringify({
                  lat: parsedMessage.lat,
                  lon: parsedMessage.lon,
                }),
                client_id: user.id,
                selected_key: dato.config.selected_key,
              };

            }
            if (dato.widget_type === "switch") {
              const estado =  parsedMessage[dato.config.selected_key] === "on" ? true : false;

              historialData = {
                entity_id: dato.device_id,
                date: new Date().toISOString().slice(0, 19).replace("T", " "),
                data: parsedMessage[dato.config.selected_key],
                client_id: user.id,
                selected_key: dato.config.selected_key,
              };
            } else if (dato.widget_type !== "switch" && dato.widget_type !== "map"){
              const value = parsedMessage[dato.config.selected_key];
              historialData = {
                entity_id: dato.device_id,
                date: new Date().toISOString().slice(0, 19).replace("T", " "),
                data: value,
                client_id: user.id,
                selected_key: dato.config.selected_key,
              };
            }
          } catch (e) {
            parsedMessage = { message: message.toString() };
            return () => {
              client.end();
            };
          }
        }
      });

      if (historialData?.data) {
        setDatosHistoricos(
          historialData,
          actualizarHistorial,
          entity_id,
          selected_key
        );

        entity_id = null;
        selected_key = null;
      }
    });

    return () => {

      setClientAlert(false);

    };
  }, [client, alarms, datos]);

  return <div />;
}

export default Sketch;

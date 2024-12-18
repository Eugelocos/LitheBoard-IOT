import React, { useRef, useState, useEffect } from "react";
import "../../app.jsx";
import Content from "./Widget/WidgetForm/widgets_form_selection.jsx";
import Disps from "../../Entities/disp.jsx";
import DeviceList from "./Widget/dashboard_widget_list.jsx";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "../../../../dashboards_panel.css";
import "../../../../app.css"
import EditWidgetDrawer from "./Widget/WidgetForm/Edit/edit_widget_form.jsx";
import axios from "axios";
import {

  getDashboardWidgets,
  getHistoricosEntity,
} from "../../../database_data_functions.jsx";
import mqtt from "mqtt";
import socket from "../../../../socket.js"
import dayjs from "dayjs";

//run(controller)

function Dashboard(props) {
  const handleMouseOver = (e) => {
    e.target.classList.toggle("delete");
  };

  const {
    dispositivos,
    setDispositivos,
    dashboard_name,
    dashboard_id,
    user,
    alarms,
    setUnseenNotifications,
    fetchNotifications,
    clientAlert,
    setClientAlert,
    indexDashboard,
    clientMQTT,
    dashboard
  } = props;
  const [datos, setDatos] = useState([]);
  const [dispState, setDispState] = useState(false);
  const [history, setHistory] = useState([]);
  const [editedWidgetType, setEditedWidgetType] = useState([]);
  const [editedWidgetId, setEditedWidgetId] = useState([]);
  const [isWidgetEditorDrawerOpen, setIsWidgetEditorDrawerOpen] = useState(false);

  const contenedorRef = useRef(null);
  const sumDispRef = useRef(null);
  const sketchRef = useRef(null);



  function saveWidgetEdition(editedData) {
    if (editedData.widget_id && editedData.widget_name && editedData.entity_id) {
      const updatedWidget = {
        widget_id: editedData.widget_id, // Asegúrate de tener el ID del widget a editar
        widget_name: editedData.widget_name,
        entity_id: editedData.entity_id,
        dashboard_id: dashboard.dashboard_id,
        widget_type: editedData.widget_type,
        config_data: {
          sub_topic: editedData.config_data.sub_topic,
          pub_topic: editedData.config_data.pub_topic,
          entity_name: editedData.config_data.entity_name,
          ...(editedData.widget_type === "switch" && {
            message_on: editedData.config_data.message_on,
            message_off: editedData.config_data.message_off,
            estado_actual: editedData.config_data.estado_actual || true,
          }),
          ...(editedData.widget_type === "map" && {
            lat: editedData.config_data.lat,
            lon: editedData.config_data.lon,
          }),
          ...(editedData.widget_type === "lineChart" && {
            lineColor: editedData.config_data.lineColor,
          }),
          ...(editedData.widget_type === "barChart" && {
            lineColor: editedData.config_data.lineColor,
          }),
          ...(editedData.widget_type === "customValueCard" && {
            scriptHtml: editedData.config_data.scriptHtml,
            scriptCss: editedData.config_data.scriptCss,
          }),
          selected_key: editedData.config_data.selected_key,
        },
        client_id: editedData.config_data.client_id,
      };
  

      // Realizamos la solicitud para editar el widget
      return axios
        .put(`http://localhost:3001/api/data/widgets/update/${updatedWidget.widget_id}`, updatedWidget)
        .then((response) => {
          console.log("Widget actualizado:", response.data);

          // Opcional: Obtener nuevamente los widgets del dashboard
          window.location.reload()
          return getDashboardWidgets(dashboard_id, user.client_id);
        })
        .then(({ devices, history }) => {
          setDatos(devices);
          console.log("Datos actualizados tras edición:", devices);
        })
        .catch((error) => {
          console.error("Error al editar el widget:", error);
          throw error;
        });
    } else {
      console.log("Por favor, proporciona un widget válido para editar.");
    }
  }
  
  useEffect(() => {
    socket.on("mqtt_message", (recievedData) => {
      const { widget_id, data } = recievedData;


      setDatos(prevDatos => {
        const updatedDatos = prevDatos.map(device => {
          const newHistRow = {
            history_id : device.historial.historic_id+1,
            enity_id:device.device_id,
            date: dayjs(Date.now()).format("DD/MM"),
            data: data,
            selcted_key:null
          }
          if (device.widget_id === widget_id) {  
            return {
              ...device,
              historial: [...device.historial, newHistRow]
            };
          }
          return device;  
        });
        console.log("updated datprs : ", updatedDatos)
        return updatedDatos;
      });

    });

  
    return () => {
      socket.off("mqtt_message");
    };
  }, []);

  useEffect(() => {

    const getDashboardWidgetsAsync = async () => {
      try {
        const { devices, history } = await getDashboardWidgets(
          dashboard_id,
          dashboard.client_id
        );

        //console.log("----------------------<0>----------------------");
        setDatos(devices);
      } catch (error) {
        console.error("Error fetching dashboard widgets:", error);
      }
    };

    getDashboardWidgetsAsync();
  }, [dashboard_id]);

  const getDashboardWidgetsLlamadaAsync = async (device_id, selected_key) => {
    try {
      const datosActualizados = datos.filter(
        (dato) =>
          dato.device_id === device_id &&
          dato.config?.selected_key === selected_key
      );

      await Promise.all(
        datosActualizados.map(async (datoActualizado) => {
          try {
            let historialDatoActualizado = await getHistoricosEntity(
              datoActualizado.device_id
            );
            historialDatoActualizado = historialDatoActualizado.filter(
              (histDatAct) => histDatAct.selected_key === selected_key
            );

            setDatos((prevDatos) =>
              prevDatos.map((dato) => {
                if (
                  dato.device_id === datoActualizado.device_id &&
                  dato.config?.selected_key === selected_key
                ) {
                  return {
                    ...dato,
                    historial: historialDatoActualizado,
                  };
                }
                return dato; // Devuelve el dato sin cambios si no coincide con device_id y selected_key
              })
            );
          } catch (error) {
            console.error(
              `Error fetching historical data for device_id ${datoActualizado.device_id}:`,
              error
            );
          }
        })
      );


    } catch (error) {
      console.error("Error fetching dashboard widgets:", error);
    }
  };

  function mostrar() {

    if (contenedorRef.current) contenedorRef.current.style.display = "none";
    if (sumDispRef.current) sumDispRef.current.style.display = "block";
    document.getElementsByTagName("body")[0].style.backgroundColor = "#e0e0e0";
  }

  function ocultar() {
    if (contenedorRef.current) contenedorRef.current.style.display = "grid";
    if (sumDispRef.current) sumDispRef.current.style.display = "none";
    document.getElementsByTagName("body")[0].style.backgroundColor = "#F0F0F0";
  }

  const publishMessage = (pubTopic, message) => {
    const client = mqtt.connect("ws://broker.emqx.io:8083/mqtt");
    client.on("connect", () => {
      client.publish(pubTopic, message, (err) => {
        if (err) {
          console.error(`Error al publicar en ${pubTopic}: ${err}`);
        } else {
          console.log(`Publicado en ${pubTopic}`);
        }
        client.end();
      });
    });
  };
  function cambiarEstado(device) {
    var estadoActual = device.config?.estadoActual;
    const valorSeguro = estadoActual !== undefined ? estadoActual : true;
    device.config.estadoActual = !valorSeguro;
    publishMessage(device.config?.pub_topic, JSON.stringify(valorSeguro));
    setDatos([...datos]);
  }






  return (
    <div>
      <div
        ref={contenedorRef}
        className="contenedor min-w-fit min-h-full w-full h-full bg-white border border-gray-300 rounded p-2.5 shadow-[0px_0px_10px_rgba(0,0,0,0.1)] m-1/4 overflow-hidden "
        id="contenedor"
      >
        <div
          className="flex justify-between items-center py-2 px-4 min-w-full"
          id="top"
        >
          <h2 className=" font-medium text-gray-900 text-xl">
            {dashboard_name}
          </h2>
          <button
            onClick={() => mostrar(false)}
            id="show-add-device-panel"
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white hover:bg-gray-200/75 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-colors duration-200"
          >
            <FontAwesomeIcon icon={faPlus} />
          </button>
        </div>

        <div
          id="dispContainer"
          className="-m-[9px] mt-[20px] overflow-scroll h-[80vh] dispContainer"
        >
          <DeviceList
            datos={datos}
            setDatos={setDatos}
            handleMouseOver={handleMouseOver}
            setDevice={setDispositivos}
            cambiarEstado={cambiarEstado}
            openEditor={setIsWidgetEditorDrawerOpen}
            setEditedWidgetId={setEditedWidgetId}
            setEditedWidgetType={setEditedWidgetType}

          />
          <Disps />
        </div>
      </div>

      <IntermediateComponent dispState={dispState}>

      </IntermediateComponent>
      <div ref={sumDispRef} id="sumDisp" style={{ display: "none" }}>
        <div className="flex flex-wrap justify-center">
          <Content
            datos={datos}
            setDatos={setDatos}
            volver={ocultar}
            dispositivos={dispositivos}
            setDispositivos={setDispositivos}
            dashboard_id={dashboard_id}
            user={user}
          />
        </div>
      </div>

      <EditWidgetDrawer datos={datos} widgetId={editedWidgetId} widgetType={editedWidgetType} dispositivos={dispositivos} onSave={saveWidgetEdition} isWidgetEditorDrawerOpen={isWidgetEditorDrawerOpen} setIsWidgetEditorDrawerOpen={setIsWidgetEditorDrawerOpen}></EditWidgetDrawer>
    </div>
  );
}

function IntermediateComponent(stateProps) {
  return <div>{stateProps.children}</div>;
}

// btnEliminar.forEach((btn) => {
//   btnEliminar.addEventListener("click", (e) => {
//     e.preventDefault();
//     btnEliminar.classList.add("delete");

//   });
// });

export default Dashboard;

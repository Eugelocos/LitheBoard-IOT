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
  getHistorialEntity,
} from "../../../database_data_functions.jsx";
import mqtt from "mqtt";
import socket from "../../../../socket.js"
import dayjs from "dayjs";
import config from "@config";
import { Divider } from "@mui/material";


function Dashboard(props) {
  const handleMouseOver = (e) => {
    e.target.classList.toggle("delete");
  };

  const {
    entities,
    setEntities,
    dashboard_name,
    dashboard_id,
    user,
    dashboard
  } = props;
  const [devices_list, setDevicesList] = useState([]);
  const [edited_widget_type, setEditedWidgetType] = useState([]);
  const [edited_widget_id, setEditedWidgetId] = useState([]);
  const [is_widget_editor_drawer_open, setIsWidgetEditorDrawerOpen] = useState(false);

  const ref_container = useRef(null);
  const sum_disp_ref = useRef(null);


  const base_url = `${config.BACKEND_URL}:${config.BACKEND_API_PORT}`;


  function saveWidgetEdition(edited_data) {
    if (edited_data.widget_id && edited_data.widget_name && edited_data.entity_id) {
      const updated_widget = {
        widget_id: edited_data.widget_id, // Asegúrate de tener el ID del widget a editar
        widget_name: edited_data.widget_name,
        entity_id: edited_data.entity_id,
        dashboard_id: dashboard.dashboard_id,
        widget_type: edited_data.widget_type,
        config_data: {
          sub_topic: edited_data.config_data.sub_topic,
          pub_topic: edited_data.config_data.pub_topic,
          entity_name: edited_data.config_data.entity_name,
          ...(edited_data.widget_type === "switch" && {
            message_on: edited_data.config_data.message_on,
            message_off: edited_data.config_data.message_off,
            estado_actual: edited_data.config_data.estado_actual || true,
          }),
          ...(edited_data.widget_type === "map" && {
            lat: edited_data.config_data.lat,
            lon: edited_data.config_data.lon,
          }),
          ...(edited_data.widget_type === "lineChart" && {
            line_color: edited_data.config_data.line_color,
          }),
          ...(edited_data.widget_type === "barChart" && {
            line_color: edited_data.config_data.line_color,
          }),
          ...(edited_data.widget_type === "customValueCard" && {
            scriptHtml: edited_data.config_data.scriptHtml,
            scriptCss: edited_data.config_data.scriptCss,
          }),
          selected_key: edited_data.config_data.selected_key,
        },
        client_id: edited_data.config_data.client_id,
      };
  

      // Realizamos la solicitud para editar el widget
      return axios
        .put(`${base_url}/api/data/widgets/update/${updated_widget.widget_id}`, updated_widget)
        .then((response) => {
          console.log("Widget actualizado:", response.data);

          // Opcional: Obtener nuevamente los widgets del dashboard
          window.location.reload()
          return getDashboardWidgets(dashboard_id, user.client_id);
        })
        .then(({ devices, history }) => {
          setDevicesList(devices);
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
      setDevicesList(prevDatos => {
        const updated_datos = prevDatos.map(device => {
          const new_hist_row = {
            history_id : device.historial.historic_id+1,
            enity_id:device.entity_id,
            date: dayjs(Date.now()).format("DD/MM"),
            data: data,
            selcted_key:null
          }
          if (device.widget_id === widget_id) {  
            return {
              ...device,
              historial: [...device.historial, new_hist_row]
            };
          }
          return device;  
        });
        console.log("updated datprs : ", updated_datos)
        return updated_datos;
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
        setDevicesList(devices);
      } catch (error) {
        console.error("Error fetching dashboard widgets:", error);
      }
    };

    getDashboardWidgetsAsync();
  }, [dashboard_id]);


  function showWidgetFormSelection() {
    if (ref_container.current) ref_container.current.style.display = "none";
    if (sum_disp_ref.current) sum_disp_ref.current.style.display = "block";
    document.getElementsByTagName("body")[0].style.backgroundColor = "#e0e0e0";
  }

  function hideWidgetFormSelection() {
    if (ref_container.current) ref_container.current.style.display = "grid";
    if (sum_disp_ref.current) sum_disp_ref.current.style.display = "none";
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
  function toggleSwitchState(device) {
    var estadoActual = device.config?.estadoActual;
    const valorSeguro = estadoActual !== undefined ? estadoActual : true;
    device.config.estadoActual = !valorSeguro;
    publishMessage(device.config?.pub_topic, JSON.stringify(valorSeguro));
    setDevicesList([...devices_list]);
  }






  return (
    <div>
<div
  ref={ref_container}
  className="contenedor w-full h-full min-w-fit min-h-full bg-white border border-gray-300 rounded-xl shadow-sm m-1/4 overflow-hidden"
  id="contenedor"
>
  <div className="flex items-center justify-between py-4 px-5 w-full bg-white mb-3">
    <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
      {dashboard_name}
    </h2>
    <button
      onClick={() => showWidgetFormSelection(false)}
      className="flex items-center justify-center w-10 h-10 transition-all duration-200 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
    >
      <FontAwesomeIcon icon={faPlus} className="text-gray-700 text-xl" />
    </button>
  </div>

  <Divider className="h-px mt-4 mb-5 bg-gray-200" />

  <div
    id="dispContainer"
    className="flex flex-wrap gap-5 p-6 bg-gray-50 h-[calc(100vh-160px)] overflow-y-auto scrollbar-custom"
  >
    <style jsx>{`
      .scrollbar-custom::-webkit-scrollbar {
        width: 10px;
        height: 10px;
      }
      .scrollbar-custom::-webkit-scrollbar-track {
        background: #f1f1f1;
        border-radius: 6px;
        margin: 8px;
      }
      .scrollbar-custom::-webkit-scrollbar-thumb {
        background: #b0b0b0;
        border-radius: 6px;
        border: 2px solid #f1f1f1;
      }
      .scrollbar-custom::-webkit-scrollbar-thumb:hover {
        background: #909090;
      }
    `}</style>

    <DeviceList
      devices_list={devices_list}
      setDevicesList={setDevicesList}
      handleMouseOver={handleMouseOver}
      setDevice={setEntities}
      toggleSwitchState={toggleSwitchState}
      openWidgetEditor={setIsWidgetEditorDrawerOpen}
      setEditedWidgetId={setEditedWidgetId}
      setEditedWidgetType={setEditedWidgetType}
    />
    <Disps />
  </div>
</div>


      <div ref={sum_disp_ref} id="sumDisp" style={{ display: "none" }}>
        <div className="flex flex-wrap justify-center">
          <Content
            devices_list={devices_list}
            setDevicesList={setDevicesList}
            returnFromWidgetFormSelection={hideWidgetFormSelection}
            entities={entities}
            setEntities={setEntities}
            dashboard_id={dashboard_id}
            user={user}
          />
        </div>
      </div>

      <EditWidgetDrawer devices_list={devices_list} widget_id={edited_widget_id} widget_type={edited_widget_type} entities={entities} onSave={saveWidgetEdition} is_widget_editor_drawer_open={is_widget_editor_drawer_open} setIsWidgetEditorDrawerOpen={setIsWidgetEditorDrawerOpen}></EditWidgetDrawer>
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

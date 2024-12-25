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


  const baseURL = `http://litheboard-backend:3001`;


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
        .put(`${baseURL}/api/data/widgets/update/${updated_widget.widget_id}`, updated_widget)
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
            onClick={() => showWidgetFormSelection(false)}
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

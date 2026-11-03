import { getApiErrorMessage } from "../../../services/api_errors";
import { updateWidgetFromForm } from "../../../services/widgets_service";
import { publishMessage as publishEntityMessage } from "../../../services/mqtt_service";
import React, { useRef, useState, useEffect } from "react";
import "../../../app/app.jsx";
import Content from "./Widget/WidgetForm/widgets_form_selection.jsx";
import DeviceList from "./Widget/dashboard_widget_list.jsx";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "../../../dashboards_panel.css";
import "../../../app.css";
import EditWidgetDrawer from "./Widget/WidgetForm/Edit/edit_widget_form.jsx";
import { getDashboardWidgets } from "../../../component/database_data_functions.jsx";
import socket from "../../../socket.js";
import { Alert, Button, Divider } from "@mui/material";

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
    dashboard,
  } = props;
  const [devices_list, setDevicesList] = useState([]);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);
  const [edited_widget_type, setEditedWidgetType] = useState([]);
  const [edited_widget_id, setEditedWidgetId] = useState([]);
  const [is_widget_editor_drawer_open, setIsWidgetEditorDrawerOpen] =
    useState(false);

  const ref_container = useRef(null);
  const sum_disp_ref = useRef(null);


  function saveWidgetEdition(edited_data) {
    if (
      edited_data.widget_id &&
      edited_data.name &&
      edited_data.entity_id
    ) {
      return updateWidgetFromForm(edited_data, dashboard.dashboard_id)
        .then(() => {
          const clientId = user?.client_id ?? dashboard?.client_id;
          return getDashboardWidgets(dashboard_id, clientId);
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
    const handleHistoricCreated = ({ historic }) => {
      setDevicesList((previous) => previous.map((widget) => {
        if (widget.entity_id !== historic.entity_id || widget.historics.some((entry) => entry.historic_id === historic.historic_id)) return widget;
        return { ...widget, historics: [...widget.historics, historic] };
      }));
    };
    const handleConnectionChanged = ({ entity_id, connection_status }) => {
      setDevicesList((previous) => previous.map((widget) => widget.entity_id === entity_id
        ? { ...widget, connection_status } : widget));
    };
    socket.on("historic:created", handleHistoricCreated);
    socket.on("entity:connection_changed", handleConnectionChanged);
    return () => {
      socket.off("historic:created", handleHistoricCreated);
      socket.off("entity:connection_changed", handleConnectionChanged);
    };
  }, []);

  useEffect(() => {
    const getDashboardWidgetsAsync = async () => {
      try {
        const clientId = dashboard?.client_id ?? user?.client_id;
        const { devices, history } = await getDashboardWidgets(
          dashboard_id,
          clientId
        );

        //console.log("----------------------<0>----------------------");
        setDevicesList(devices);
        setError("");
      } catch (error) {
        setError(getApiErrorMessage(error, "Could not load dashboard. Please try again."));
      }
    };

    getDashboardWidgetsAsync();
    socket.on("connect", getDashboardWidgetsAsync);
    return () => socket.off("connect", getDashboardWidgetsAsync);
  }, [dashboard_id, reload]);

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


  const publishMessage = (entity, message) => {
    // FIX (junto con backend/routes/mqtt_routes.js): mandamos sólo el
    // entity_id; el backend resuelve la entidad real y valida ownership.
    // Antes se mandaba el objeto `entity` completo y el backend confiaba
    // ciegamente en su client_id/entity_id. Responde 204 sin cuerpo.
    return publishEntityMessage(entity.entity_id, message)
      .catch((err) => {
        console.error("Error publishing message:", err);
      });
  };

  function toggleSwitchState(entity) {
    var is_on = entity.widget_config?.is_on;
    const valorSeguro = is_on !== undefined ? is_on : true;
    entity.widget_config.is_on = !valorSeguro;
    publishMessage(entity, JSON.stringify(valorSeguro));
    setDevicesList([...devices_list]);
  }

  return (
    <div>
      {error && <Alert severity="error" action={<Button onClick={() => setReload((value) => value + 1)}>Retry</Button>}>{error}</Alert>}
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

      <EditWidgetDrawer
        devices_list={devices_list}
        widget_id={edited_widget_id}
        widget_type={edited_widget_type}
        entities={entities}
        onSave={saveWidgetEdition}
        is_widget_editor_drawer_open={is_widget_editor_drawer_open}
        setIsWidgetEditorDrawerOpen={setIsWidgetEditorDrawerOpen}
      ></EditWidgetDrawer>
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

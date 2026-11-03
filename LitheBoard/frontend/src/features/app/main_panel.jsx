import socket from "../../socket";
import { fetchEntities } from "../../services/entities_service";
import { fetchDashboards, createDashboard } from "../../services/dashboards_service";
import { fetchAlarms } from "../../services/alarms_service";
import { fetchRulechains } from "../../services/rulechains_service";
import { fetchNotifications } from "../../services/notifications_service";
import { logout, readStoredClient } from "../../services/auth_service";
import React, { useState, useEffect } from "react";
import Dashboard from "../dashboards/Dashboard/dashboard";
import "../../dashboards_panel.css";
import DeviceList from "../entities/device_list";
import DashboardListPanel from "../dashboards/PanelDashboards/dashboard_list_panel";
import { useNavigate } from "react-router-dom";
import TopMenu from "../menu/TopMenu/top_menu";
import ProfileSettingsPanel from "../profile/profile_settings_panel ";
import LateralMenu from "../menu/LateralMenu/lateral_menu";
import { Drawer, Button, Toolbar } from "@mui/material";
import AlarmList from "../alarms/alarm_list";
import ClientList from "../linkedClients/client_list";

import RulechainList from "../rulechain/rulechain_list.jsx";

const entityTest = {
  entity_id: 234,
  client_id: 4,
  name: "RandomNumber",
  datasource_type: "api",
  datasource_config: {
    method: "GET",
    headers: "",
    base_url: "https://random-data-api.com/api/number/random_number",
    data_key: "fact",
    query_params: "",
    request_body: "",
    polling_interval_ms: "10000",
  },
};

function DashboardPanel() {
  const navigate = useNavigate();
  const [dashboards, setDashboards] = useState([]);
  const [entities, setEntities] = useState([]);
  const [alarms, setAlarms] = useState([]);
  const [all_notifications, setAllNotifications] = useState([]);
  const [unseen_notifications, setUnseenNotifications] = useState([]);
  const [client_alert, setClientAlert] = useState(false);
  const [user, setUser] = useState(null);
  const [clients_asociated, setClientsAsociated] = useState([]);
  const [rulechains, setRulechains] = useState([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (localStorage.getItem("token")) socket.connect();
    return () => socket.disconnect();
  }, []);

  useEffect(() => {
    const initialize = async () => {
      const storedUserJSON = localStorage.getItem("user");

      if (!storedUserJSON) {
        navigate("/login");
        return;
      }

      let parsedUser;

      try {
        parsedUser = readStoredClient();
        if (!parsedUser) { navigate("/login"); return; }
      } catch (err) {
        console.error("Error parseando usuario:", err);
        navigate("/login");
        return;
      }


      setLoading(true);
      setUser(parsedUser);

      try {
        const [entities, dashboards, alarms, rulechains] = await Promise.all([
          fetchEntities(parsedUser.client_id),
          fetchDashboards(parsedUser.client_id),
          fetchAlarms(parsedUser.client_id),
          fetchRulechains(parsedUser.client_id),
        ]);

        setEntities(entities);
        setDashboards(dashboards);
        setAlarms(alarms);
        setRulechains(rulechains);

        // Notificaciones (dependen de las alarmas)
        const notifications = await fetchNotifications(parsedUser.client_id);

        const notificationsWithDetails = notifications.map((notification) => {
          const alarm =
            alarms.find((a) => a.alarm_id === notification.alarm_id) || {};

          return {
            ...notification,
            alarm_value: alarm.threshold ?? "Desconocido",
            alarm_key: alarm.data_key || "Desconocido",
            device_name: entities.find((entity) => entity.entity_id === alarm.entity_id)?.name || "Desconocido",
          };
        });

        setAllNotifications(notificationsWithDetails);
        setUnseenNotifications(
          notificationsWithDetails.filter((n) => !n.is_read)
        );

      } catch (error) {
        console.error("Error inicializando MainPanel:", error);

        if (error.response?.status === 401) {
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, [navigate]);



  const handleAddDevice = (new_device) => {
    setEntities([...entities, new_device]);
  };

  //ERROR INCONSISTENCIA
  const handleAddDashboard = async () => {
    try {
      const newDashboard = {
        name: `dashboard ${dashboards.length + 1}`,
        description: "Dashboard",
        client_id: user.client_id,
      };

      await createDashboard(newDashboard);
      setDashboards(await fetchDashboards(user.client_id));
    } catch (error) {
      console.error("Error saving dashboard:", error);
    }
  };

  const handleSwitchSection = (section, dashboard = null) => {
    const allSections = document.querySelectorAll(".menu-content > div");
    allSections.forEach((s) => (s.style.display = "none"));

    const selectedSection = document.querySelector(`.${section}`);
    if (selectedSection) {
      selectedSection.style.display = "block";
    }

    if (section === "dashboards" && dashboard) {
      const allDashboards = document.querySelectorAll(".dashboard-content");
      allDashboards.forEach((d) => (d.style.display = "none"));
      const dashboardId = dashboard.dashboard_id;
      const selected_dashboard = document.getElementById(
        `dashboard-${dashboardId}`
      );
      if (selected_dashboard) {
        selected_dashboard.style.display = "block";
      }
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const [drawer_open, setDrawerOpen] = useState(false);

  const handleToggleDrawer = () => {
    setDrawerOpen(!drawer_open);
  };

  /*if (loading) {
    return (
      <div className="h-[100vh] w-full flex flex-wrap justify-center items-center">
        <div id="wifi-loader">
          <svg viewBox="0 0 86 86" class="circle-outer">
            <circle r="40" cy="43" cx="43" class="back"></circle>
            <circle r="40" cy="43" cx="43" class="front"></circle>
            <circle r="40" cy="43" cx="43" class="new"></circle>
          </svg>
          <svg viewBox="0 0 60 60" class="circle-middle">
            <circle r="27" cy="30" cx="30" class="back"></circle>
            <circle r="27" cy="30" cx="30" class="front"></circle>
          </svg>
          <svg viewBox="0 0 34 34" class="circle-inner">
            <circle r="14" cy="17" cx="17" class="back"></circle>
            <circle r="14" cy="17" cx="17" class="front"></circle>
          </svg>
          <div data-text="Loading" class="text"></div>
        </div>
      </div>
    );
  }*/

  return (
    <div className="container flex flex-wrap justify-center w-full min-w-full ">
      <TopMenu
        user={user}
        toggleMenu={handleToggleDrawer}
        handleSwitchSection={handleSwitchSection}
        alarms={alarms}
        all_notifications={all_notifications}
        setAllNotifications={setAllNotifications}
        unseen_notifications={unseen_notifications}
        setUnseenNotifications={setUnseenNotifications}
      ></TopMenu>
      {
        //#region lateral menu
      }
      <Drawer
        anchor="left"
        open={drawer_open}
        onClose={handleToggleDrawer}
        sx={{
          "& .MuiDrawer-paper": {
            width: 250,
            backgroundColor: "#232939",
            zIndex: (theme) => theme.zIndex.drawer - 100,
            borderRight: "none",
          },
        }}
        variant="permanent"
        className="md:block hidden lateralMenu"
      >
        <Toolbar />
        <LateralMenu
          handleSwitchSection={handleSwitchSection}
          dashboards={dashboards}
          user={user}
        />
      </Drawer>

      {/* En pantallas pequeñas, se muestra un botón para abrir el Drawer */}
      <Button
        className="lg:hidden absolute top-4 left-4 z-50"
        onClick={handleToggleDrawer}
      >
        {drawer_open ? "Cerrar Menu" : "Abrir Menu"}
      </Button>

      {/* En pantallas pequeñas Drawer se muestra como un panel deslizante */}
      <Drawer
        anchor="left"
        open={drawer_open}
        onClose={handleToggleDrawer}
        sx={{
          "& .MuiDrawer-paper": {
            width: 250,
            backgroundColor: "#232939",
          },
        }}
        variant="temporary"
        className="lg:hidden "
      >
        <Toolbar />
        <LateralMenu
          handleSwitchSection={handleSwitchSection}
          dashboards={dashboards}
          user={user}
        />
      </Drawer>
      {
        //#endregion
      }

      <button onClick={handleAddDevice}></button>
      <div className="menu min-w-full max-w-full">
        <div className="menu-content sm:max-w-full h-[100%] flex">
          <div
            className="dashboards min-[500px]:p-10 px-30 w-full m-[0.25rem]"
            style={{ display: "none" }}
          >
            {dashboards.map((dashboard, index) => (
              <div
                key={dashboard.dashboard_id}
                id={`dashboard-${dashboard.dashboard_id}`}
                className="dashboard-content"
                style={{ display: "none" }}
              >
                <Dashboard
                  key={index}
                  dashboard_name={dashboard.name}
                  entities={entities}
                  setEntities={setEntities}
                  dashboard_id={dashboard.dashboard_id}
                  user={user}
                  alarms={alarms}
                  client_alert={client_alert}
                  setClientAlert={setClientAlert}
                  indexDashboard={index}
                  dashboard={dashboard}
                />
              </div>
            ))}
          </div>

          <div
            className="devices-list min-[500px]:p-10 px-30 w-full m-[0.25rem]"
            style={{ display: "none" }}
          >
            <DeviceList
              entities={entities}
              handleAddDevice={handleAddDevice}
              setEntities={setEntities}
              user={user}
              rulechains={rulechains}
            ></DeviceList>
          </div>

          <div className="dashboard-list min-[500px]:p-10 px-30 w-full m-[0.25rem]">
            <DashboardListPanel
              dashboards={dashboards}
              handleAddDashboard={handleAddDashboard}
              handleSwitchSection={handleSwitchSection}
              setDashboards={setDashboards}
            ></DashboardListPanel>
          </div>

          <div
            className="alarms-list min-[500px]:p-10 px-30 w-full m-[0.25rem]"
            style={{ display: "none" }}
          >
            <AlarmList
              user={user}
              alarms={alarms}
              setAlarms={setAlarms}
              entities={entities}
            ></AlarmList>
          </div>

          <div
            className="rulechain-editor min-[500px]:p-10 px-30 w-full m-[0.25rem]"
            style={{ display: "none" }}
          >
            <RulechainList
              entity={entityTest}
              rulechains={rulechains}
              setRulechains={setRulechains}
              entities={entities}
              user={user}
            ></RulechainList>
          </div>

          {user?.role === "admin" && (
            <div
              className="clients-settings min-[500px]:p-10 px-30 w-full m-[0.25rem]"
              style={{ display: "none" }}
            >
              <ClientList
                client_id={user?.client_id}
                dashboards={dashboards}
                clients_asociated={clients_asociated}
                setClientsAsociated={setClientsAsociated}
                setDashboards={setDashboards}
              ></ClientList>
            </div>
          )}

          <div
            className="profile-settings min-[500px]:p-10 px-30 w-full m-[0.25rem]"
            style={{ display: "none" }}
          >
            <ProfileSettingsPanel user={user} handleLogout={handleLogout} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPanel;

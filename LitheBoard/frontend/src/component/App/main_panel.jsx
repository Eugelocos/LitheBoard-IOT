import React, { useState, useEffect } from "react";
import Dashboard from "./Dashboards/Dashboard/dashboard";
import "../../dashboards_panel.css";
import DeviceList from "./Entities/device_list";
import DashboardListPanel from "./Dashboards/PanelDashboards/dashboard_list_panel";
import { getDevice } from "../database_data_functions";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import TopMenu from "./Menu/TopMenu/top_menu";
import ProfileSettingsPanel from "./Profile/profile_settings_panel ";
import LateralMenu from "./Menu/LateralMenu/lateral_menu";
import { Drawer, Button, Toolbar } from "@mui/material";
import AlarmList from "./Alarms/alarm_list";
import ClientList from "./LinkedClients/client_list";
import config from "@config";

import RulechainList from "./Rulechain/rulechain_list"

const entityTest = {
  entity_id: 234,
  client_id: 4,
  disp_name: "RandomNumber",
  datasource_type: "API",
  datasource_config: {
    method: "GET",
    headers: "",
    base_url: "https://random-data-api.com/api/number/random_number",
    data_key: "fact",
    endpoint: "",
    query_params: "",
    request_body: "",
    polling_interval: "10000",
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

  const base_url = `${config.BACKEND_URL}:${config.BACKEND_API_PORT}`;
  useEffect(() => {
    const fetchData = async () => {
      try {
        const userResponse = await axios.get(`${base_url}/api/user`, {
          withCredentials: true,
        });
        console.log("user repsone", userResponse);
        setUser(userResponse.data);

        const devicesResponse = await getDevice(
          setEntities,
          userResponse.data.id
        );
        const dashboardsResponse = await axios.get(
          `${base_url}/api/data/dashboards/${userResponse.data.id}`
        );

        setDashboards(dashboardsResponse.data);
        setEntities(devicesResponse.data);
        setLoading(false);
      } catch (error) {
        console.error("Error al obtener los devices_list:", error);
        setLoading(false);
        if (error.response && error.response.status === 401) {
          navigate("/login");
        }
      }
    };

    fetchData();
  }, [base_url, navigate]);

  useEffect(() => {
    if (!user?.id) return;
    const fetchData = async () => {
      axios
        .get(`${base_url}/api/alarms/${user?.id}`)
        .then((response) => {
          setAlarms(response.data);
        })
        .catch((error) => {
          console.error("Error fetching alarms:", error);
        });
    };
    fetchData();
  }, [user, base_url]);

  useEffect(() => {
    if (!user?.id) return;
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${base_url}/api/data/rulechains/get`,
          { params: { client_id: user.id } }
        );
        setRulechains(response.data);
      } catch (error) {
        console.error("Error fetching rulechains:", error);
      }
    };
    fetchData();
  }, [user, base_url]);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(
        `${base_url}/api/notifications/get/${user.id}`
      );
      const notifications = response.data;

      const notificationsWithDetails = notifications.map((notification) => {
        const alarm =
          alarms.find((alarm) => alarm.alarm_id === notification.alarm_id) ||
          {};
        return {
          ...notification,
          alarm_value: alarm.valor || "Desconocido",
          alarm_key: alarm.selected_key || "Desconocido",
          device_name: alarm.disp_name || "Desconocido",
        };
      });

      setAllNotifications(notificationsWithDetails);
      const unseen = notificationsWithDetails.filter(
        (notification) => notification.visto === 0
      );
      setUnseenNotifications(unseen);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const handleAddDevice = (new_device) => {
    setEntities([...entities, new_device]);
  };

  const handleAddDashboard = async () => {
    try {
      const newDashboard = {
        id: dashboards.length + 1,
        name: `dashboard ${entities.length + 1}`,
        description: "Dashboard",
        client_id: user.id,
      };

      await axios.post(`${base_url}/api/dashboards/set`, newDashboard);

      const updatedDashboards = await axios.get(
        `${base_url}/api/data/dashboards/${user.id}`
      );
      setDashboards(updatedDashboards.data);
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
      const selected_dashboard = document.getElementById(
        `dashboard-${dashboard.id}`
      );
      if (selected_dashboard) {
        selected_dashboard.style.display = "block";
      }
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post(`${base_url}/api/logout`, {}, { withCredentials: true });
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
        fetchNotifications={fetchNotifications}
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
            borderRight: "none"
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
                  setUnseenNotifications={setUnseenNotifications}
                  fetchNotifications={fetchNotifications}
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
              client_id={user?.id}
              alarms={alarms}
              setAlarms={setAlarms}
              entities={entities}
            ></AlarmList>
          </div>

          <div
            className="rulechain-editor min-[500px]:p-10 px-30 w-full m-[0.25rem]"
            style={{ display: "none" }}
          >
            <RulechainList entity={entityTest} rulechains={rulechains} setRulechains={setRulechains} entities={entities} user={user}></RulechainList>
          </div>

          {user?.access_level_id === 1 && (
            <div
              className="clients-settings min-[500px]:p-10 px-30 w-full m-[0.25rem]"
              style={{ display: "none" }}
            >
              <ClientList
                client_id={user?.id}
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

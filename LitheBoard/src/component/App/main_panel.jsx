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


function DashboardPanel() {
  const navigate = useNavigate();
  const [dashboards, setDashboards] = useState([]);
  const [dispositivos, setDispositivos] = useState([]);
  const [alarms, setAlarms] = useState([]);
  const [allNotifications, setAllNotifications] = useState([]);
  const [unseenNotifications, setUnseenNotifications] = useState([]);
  const [clientAlert, setClientAlert] = useState(false);
  const [user, setUser] = useState(null);
  const [clientsAsociated, setClientsAsociated] = useState([]);

  const [loading, setLoading] = useState(true);
  const [clientMQTT, setClientMQTT] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userResponse = await axios.get("http://localhost:3001/api/user", {
          withCredentials: true,
        });
        setUser(userResponse.data);

        const devicesResponse = await getDevice(
          setDispositivos,
          userResponse.data.id
        );
        const dashboardsResponse = await axios.get(
          `http://localhost:3001/api/data/dashboards/${userResponse.data.id}`
        );

        setDashboards(dashboardsResponse.data);
        setDispositivos(devicesResponse.data);
        setLoading(false);
      } catch (error) {
        console.error("Error al obtener los datos:", error);
        setLoading(false);
        if (error.response && error.response.status === 401) {
          navigate("/login"); 
        }
      }
    };

    fetchData();
  }, []);






  /* useEffect(() => {
    if (!user?.id) {
      return; // Si user no tiene un id, no realizamos la conexión
    }
    const client = mqtt.connect("ws://broker.emqx.io:8083/mqtt", {
      clientId: user?.id,
      clean: false,
      reconnectPeriod: 1000, // Intentar reconectar cada 1 segundo
      connectTimeout: 30 * 1000, // Timeout de conexión de 30 segundos
    });

    client.on("connect", () => {
      console.log("Conectado al broker MQTT");
      setClientMQTT(client); // Actualiza el estado con la instancia del cliente

      // Suscribirse a los temas especificados en el array datos
      dispositivos.forEach((dispositivo) => {
        if (dispositivo.sub_topic) {
          client.subscribe(dispositivo.sub_topic);
        }
      });
    });
    client.on("message", (topic, message) => {
      let alarmTriggered = false;

      setClientAlert(true);
      alarms.forEach((alarm) => {
        if (alarm.sub_topic === topic) {

          let parsedMessage;
          try {
            parsedMessage = JSON.parse(message.toString());


            if (parsedMessage["token"] !== alarm.token) {
              console.warn(
                "El mensaje entrante no proviene de un dispositivo autentificado"
              );
              return;
            }

            const value = parsedMessage[alarm.selected_key];
            if (
              (alarm.alarm_condition === ">" &&
                value > parseInt(alarm.valor)) ||
              (alarm.alarm_condition === "<" && value < parseInt(alarm.valor))
            ) {

              if (!alarmTriggered) {
                const notificationData = {
                  alarm_id: alarm.alarm_id,
                  client_id: alarm.client_id,
                  date: new Date().toISOString().slice(0, 19).replace("T", " "),
                  data: value,
                };

                saveNotification(notificationData);
                alarmTriggered = true;
              }
            }
          } catch (e) {

            parsedMessage = { message: message.toString() };
            return () => {
              client.end();
            };
          }
        }
      });
    });

    return () => {
      setClientAlert(false);
      client.end();
      console.log("Cliente finalizado");
    };
  }, [dispositivos, alarms, user]);*/

  useEffect(() => {
    const fetchData = async () => {
      axios
        .get(`http://localhost:3001/api/alarms/${user?.id}`)
        .then((response) => {
          setAlarms(response.data);
        })
        .catch((error) => {
          console.error("Error fetching alarms:", error);
        });
    };
    fetchData();
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3001/api/notifications/get/${user.id}`
      );
      const notifications = response.data;

      const notificationsWithDetails = notifications.map((notification) => {
        const alarm =
          alarms.find((alarm) => alarm.alarm_id === notification.alarm_id) ||
          {};
        return {
          ...notification,
          alarmValue: alarm.valor || "Desconocido",
          alarmKey: alarm.selected_key || "Desconocido",
          deviceName: alarm.disp_name || "Desconocido",
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

  const handleAddDevice = (newDevice) => {
    setDispositivos([...dispositivos, newDevice]);
  };

  const handleAddDashboard = async () => {
    try {
      const newDashboard = {
        id: dashboards.length + 1,
        name: `dashboard ${dispositivos.length + 1}`,
        description: "Dashboard",
        client_id: user.id,
      };

      await axios.post(
        "http://localhost:3001/api/dashboards/set",
        newDashboard
      );

      const updatedDashboards = await axios.get(
        `http://localhost:3001/api/data/dashboards/${user.id}`
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
      const selectedDashboard = document.getElementById(
        `dashboard-${dashboard.dashboard_id}`
      );
      if (selectedDashboard) {
        selectedDashboard.style.display = "block";
      }
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post(
        "http://localhost:3001/api/logout",
        {},
        { withCredentials: true }
      );
      navigate("/login");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const [drawerOpen, setDrawerOpen] = useState(false); // Estado inicial como cerrado en pantallas pequeñas

  const handleToggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  if (loading) {
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
  }

  return (
    <div className="container flex flex-wrap justify-center w-full min-w-full ">
      <TopMenu
        user={user}
        toggleMenu={handleToggleDrawer}
        handleSwitchSection={handleSwitchSection}
        alarms={alarms}
        allNotifications={allNotifications}
        setAllNotifications={setAllNotifications}
        unseenNotifications={unseenNotifications}
        setUnseenNotifications={setUnseenNotifications}
        fetchNotifications={fetchNotifications}
      ></TopMenu>
      {
        //#region lateral menu
      }
      {/* En pantallas grandes, el Drawer está siempre abierto */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={handleToggleDrawer}
        sx={{
          "& .MuiDrawer-paper": {
            width: 250,
            backgroundColor: "#232939",
            zIndex: (theme) => theme.zIndex.drawer - 100,
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
        {drawerOpen ? "Cerrar Menu" : "Abrir Menu"}
      </Button>

      {/* En pantallas pequeñas Drawer se muestra como un panel deslizante */}
      <Drawer
        anchor="left"
        open={drawerOpen}
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
        />
      </Drawer>
      {
        //#endregion
      }

      <button onClick={handleAddDevice}></button>
      <div className="menu min-w-full max-w-full">
        <div className="menu-content sm:max-w-full h-full">
          <div
            className="dashboards min-[500px]:p-10 px-30 h-full"
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
                  dispositivos={dispositivos}
                  setDispositivos={setDispositivos}
                  dashboard_id={dashboard.dashboard_id}
                  user={user}
                  alarms={alarms}
                  setUnseenNotifications={setUnseenNotifications}
                  fetchNotifications={fetchNotifications}
                  clientAlert={clientAlert}
                  setClientAlert={setClientAlert}
                  indexDashboard={index}
                  clientMQTT={clientMQTT}
                  dashboard={dashboard}
                />
              </div>
            ))}
          </div>

          <div
            className="devices-list min-[500px]:p-10 px-30 h-full"
            style={{ display: "none" }}
          >
            <DeviceList
              dispositivos={dispositivos}
              handleAddDevice={handleAddDevice}
              setDispositivos={setDispositivos}
              user={user}
            ></DeviceList>
          </div>

          <div className="dashboard-list min-[500px]:p-10 px-30 h-full shadow-[0px_0px_10px_rgba(0,0,0,0.1)]">
            <DashboardListPanel
              dashboards={dashboards}
              handleAddDashboard={handleAddDashboard}
              handleSwitchSection={handleSwitchSection}
              setDashboards={setDashboards}
            ></DashboardListPanel>
          </div>

          <div
            className="alarms-list min-[500px]:p-10 px-30 h-full"
            style={{ display: "none" }}
          >
            <AlarmList
              clientId={user?.id}
              alarms={alarms}
              setAlarms={setAlarms}
              dispositivos={dispositivos}
              
            ></AlarmList>
          </div>

          {user?.access_level_id == 1 ? (
            <div
              className="clients-settings min-[500px]:p-10 px-30 h-full"
              style={{ display: "none" }}
            >
              <ClientList clientId={user?.id} dashboards={dashboards} clientsAsociated={clientsAsociated} setClientsAsociated={setClientsAsociated} setDashboards={setDashboards}></ClientList>
            </div>
          ) : (
            <></>
          )}

          <div
            className="profile-settings min-[500px]:p-10 px-30 h-full"
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

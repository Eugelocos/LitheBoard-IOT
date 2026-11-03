import { deleteWidget } from "../../../../services/widgets_service";
import { getApiErrorMessage } from "../../../../services/api_errors";
import React, { useState, useEffect, useRef } from "react";
import {
  Alert,
  Card,
  CardContent,
  Typography,
  Switch,
  Tooltip,
  IconButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import InfoIcon from "@mui/icons-material/Info";
import EditIcon from "@mui/icons-material/Edit";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import SignalWifiOffRoundedIcon from "@mui/icons-material/SignalWifiOffRounded";
import { styled } from "@mui/material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  BarChart,
  Bar,
} from "recharts";
import dayjs from "dayjs";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  Popup,
} from "react-leaflet";

import WidgetCustomValueCard from "./WidgetTypes/widget_custom_value_card";

const IOSSwitch = styled((props) => (
  <Switch focusVisibleClassName=".Mui-focusVisible" disableRipple {...props} />
))(({ theme }) => ({
  width: 42,
  height: 26,
  padding: 0,
  "& .MuiSwitch-switchBase": {
    padding: 0,
    margin: 2,
    transitionDuration: "300ms",
    "&.Mui-checked": {
      transform: "translateX(16px)",
      color: "#fff",
      "& + .MuiSwitch-track": {
        backgroundColor: theme.palette.mode === "dark" ? "#232939" : "#232939",
        opacity: 1,
        border: 0,
      },
      "&.Mui-disabled + .MuiSwitch-track": {
        opacity: 0.5,
      },
    },
    "&.Mui-focusVisible .MuiSwitch-thumb": {
      color: "#33cf4d",
      border: "6px solid #fff",
    },
    "&.Mui-disabled .MuiSwitch-thumb": {
      color:
        theme.palette.mode === "light"
          ? theme.palette.grey[600]
          : theme.palette.grey[900],
    },
    "&.Mui-disabled + .MuiSwitch-track": {
      opacity: theme.palette.mode === "light" ? 0.7 : 0.3,
    },
  },
  "& .MuiSwitch-thumb": {
    boxSizing: "border-box",
    width: 22,
    height: 22,
  },
  "& .MuiSwitch-track": {
    borderRadius: 26 / 2,
    backgroundColor: theme.palette.mode === "light" ? "#d3d3d3" : "#797979",
    opacity: 1,
    transition: theme.transitions.create(["background-color"], {
      duration: 500,
    }),
  },
}));

function DeviceCard({
  device,
  index,
  toggleSwitchState,
  devices_list,
  setDevicesList,
  handleMouseOver,
  openWidgetEditor,
  setEditedWidgetId,
  setEditedWidgetType,
}) {
  const [is_loading, setis_loading] = useState(true);
  const [config, setConfig] = useState({});
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const chart_ref = useRef();
  const [historics, setHistorial] = useState([]);


  useEffect(() => {
    setConfig(device.widget_config);
  }, [device.widget_config, device.entity_id]);

  useEffect(() => {
    if (device.historics && device.widget_config?.data_key) {
      setHistorial(() => {
        const filteredHistorial = device.historics.filter((entry) => {
          const data = entry.data || {};
          const hasKey = Object.prototype.hasOwnProperty.call(
            data,
            device.widget_config.data_key
          );
          return hasKey;
        });

        return filteredHistorial.slice(-20);
      });
    } else {
      setHistorial([]);
    }
    setis_loading(false);
  }, [device.widget_type, device.historics, device.widget_config?.data_key]);

  const eliminarWidget = async () => {
    if (deleting || !window.confirm("Delete this widget? Device data will be kept.")) return;
    setDeleting(true);
    setError("");
    try {
      // 204 sin cuerpo: si no hubo error, el widget se eliminó.
      await deleteWidget(device.widget_id);
      setDevicesList((prev) =>
        prev.filter((widget) => widget.widget_id !== device.widget_id)
      );
    } catch (error) {
      setError(getApiErrorMessage(error, "Could not delete widget. Please try again."));
    } finally {
      setDeleting(false);
    }
  };

  function editWidget() {
    setEditedWidgetId(device.widget_id);
    setEditedWidgetType(device.widget_type);
    openWidgetEditor(true);
  }

  const formatXAxis = (tickItem) => {
    return dayjs(tickItem).format("DD/MM");
  };

  // FIX: cada entrada de `historics` tiene la forma
  // { date, data: { lat, lon, ... }, entity_id, historic_id, ... }.
  // El mapa necesitaba leer `entry.data.lat/lon`, no `entry.lat/lon`
  // ni `device.historics.data?.lat` (historics es un array, no tiene .data).
  const mapPoints = historics
    .map((entry) => {
      const data = entry.data || {};
      if (data.lat == null || data.lon == null) return null;
      const lat = parseFloat(data.lat);
      const lon = parseFloat(data.lon);
      if (Number.isNaN(lat) || Number.isNaN(lon)) return null;
      return { lat, lon, timestamp: entry.recorded_at };
    })
    .filter((point) => point !== null);

  const mapCenter =
    mapPoints.length > 0
      ? [mapPoints[mapPoints.length - 1].lat, mapPoints[mapPoints.length - 1].lon]
      : [0, 0];

  return (
    <Card
      className={`
        bg-white
        text-gray-800
        transition-all
        rounded-xl
        shadow-[0_2px_8px_rgba(0,0,0,0.05)]
        border border-[rgba(245,245,245,0.8)]
        ${device.widget_type === "switch" ? "w-fit" : "w-[45%]"}
        h-fit
        max-w-full
        m-1.5
        p-0
        overflow-hidden
        hover:shadow-sm
        backdrop-blur-[2px]
        ${device.widget_type !== "switch" && "min-w-[300px]"}
      `}
    >
      <CardContent className="h-full flex flex-col">
        {error && <Alert severity="error">{error}</Alert>}
        <div className="flex justify-between items-center mb-3">
          <Typography variant="h5">{device.name}</Typography>
          <Tooltip
            title={
              device.widget_config?.datasource_type === "mqtt" ? (
                <div>
                  <Typography variant="body2">
                    Subscribed Topic: {device.widget_config?.datasource_config?.sub_topic || "N/A"}
                  </Typography>
                  <Typography variant="body2">
                    Publish Topic: {device.widget_config?.datasource_config?.pub_topic || "N/A"}
                  </Typography>
                  <Typography variant="body2">
                    Associated Entity Name:{" "}
                    {device.widget_config?.entity_name || "N/A"}
                  </Typography>
                </div>
              ) : device.widget_config?.datasource_type === "api" ? (
                <div>
                  <Typography variant="body2">
                    Base URL:{" "}
                    {device.widget_config?.datasource_config?.base_url || "N/A"}
                  </Typography>
                  <Typography variant="body2">
                    Method: {device.widget_config?.datasource_config?.method || "N/A"}
                  </Typography>
                  <Typography variant="body2">
                    Polling Interval:{" "}
                    {device.widget_config?.datasource_config?.polling_interval_ms ||
                      "N/A"}
                  </Typography>
                </div>
              ) : (
                <Typography variant="body2">
                  No valid datasource type
                </Typography>
              )
            }
            className="z-[15]"
          >
            <IconButton className="z-[15]">
              <InfoIcon className="text-[#232939]" />
            </IconButton>
          </Tooltip>
        </div>

        {device.entity_id ? (
          <div className="relative h-full">
            {device.widget_type === "switch" && (
              <div className="flex-1 flex flex-col justify-center m-2">
                <IOSSwitch
                  checked={device.widget_config?.is_on}
                  onClick={() => toggleSwitchState(device)}
                />
                <Typography variant="body2" className="ml-2">
                  {device.widget_config?.is_on ? "ON" : "OFF"}
                </Typography>
              </div>
            )}
            {device.widget_type === "line_chart" && (
              <div className="flex-1 flex flex-col justify-center" ref={chart_ref}>
                <ResponsiveContainer width="100%" aspect={5.0 / 3.0}>
                  <LineChart
                    width={400}
                    height={300}
                    data={historics}
                    margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="recorded_at" tickFormatter={formatXAxis} />
                    <YAxis />
                    <RechartsTooltip
                      wrapperStyle={{ backgroundColor: "#000", fontSize: 12 }}
                      labelFormatter={(label) =>
                        dayjs(label).format("YYYY/MM/DD")
                      }
                    />
                    <Legend layout="vertical" verticalAlign="top" height={36} />
                    <Line
                      type="linear"
                      dataKey={`data.${device.widget_config?.data_key}`}
                      stroke={device.widget_config?.line_color || "#2196F3"}
                      dot={{
                        stroke: "#b1b1b1",
                        strokeWidth: 1,
                        fill: "#1c0d00",
                      }}
                      activeDot
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
            {device.widget_type === "bar_chart" && (
              <div className="flex-1 flex flex-col justify-center" ref={chart_ref}>
                <ResponsiveContainer width="100%" aspect={5.0 / 3.0}>
                  <BarChart
                    width={400}
                    height={300}
                    data={historics}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="recorded_at"
                      tickFormatter={formatXAxis}
                      interval="preserveStartEnd"
                    />
                    <YAxis />
                    <RechartsTooltip
                      wrapperStyle={{ backgroundColor: "#000", fontSize: 12 }}
                      labelFormatter={(label) =>
                        dayjs(label).format("YYYY/MM/DD")
                      }
                    />
                    <Legend />
                    <Bar
                      dataKey={`data.${device.widget_config?.data_key}`}
                      fill={device.widget_config?.line_color || "#fff000"}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
            {device.widget_type === "map" && (
              <div
                className="flex-1 flex flex-col justify-center h-[400px] w-full"
                ref={chart_ref}
                id="map"
              >
                {is_loading ? (
                  <div>Loading map...</div>
                ) : mapPoints.length > 0 ? (
                  <MapContainer
                    center={mapCenter}
                    zoom={4}
                    className="h-screen w-full"
                    scrollWheelZoom={false}
                  >
                    <TileLayer
                      url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                      attribution='&copy; <a href="https://www.esri.com">Esri</a>'
                    />

                    {mapPoints.map((point, i) => (
                      <Marker key={i} position={[point.lat, point.lon]}>
                        <Popup>
                          <div>
                            <strong>Lat:</strong> {point.lat}
                            <br />
                            <strong>Lon:</strong> {point.lon}
                            <br />
                            <small>Timestamp: {point.timestamp || "N/A"}</small>
                          </div>
                        </Popup>
                      </Marker>
                    ))}

                    {mapPoints.length > 1 && (
                      <Polyline
                        positions={mapPoints.map((p) => [p.lat, p.lon])}
                        color="blue"
                      />
                    )}
                  </MapContainer>
                ) : (
                  <div>No valid position available</div>
                )}
              </div>
            )}
            {device.widget_type === "custom_value_card" && (
              <div
                className="flex-1 flex flex-col justify-center h-[400px] w-full"
                ref={chart_ref}
                id="custom_value_card"
              >
                <WidgetCustomValueCard
                  value={
                    device.historics && device.historics.length > 0
                      ? (() => {
                          const selectedKey = device.widget_config?.data_key;
                          const lastEntryWithKey = [...device.historics]
                            .reverse()
                            .find((entry) =>
                              Object.prototype.hasOwnProperty.call(
                                entry.data || {},
                                selectedKey
                              )
                            );

                          if (lastEntryWithKey) {
                            return lastEntryWithKey.data[selectedKey];
                          } else if (selectedKey) {
                            return `Key "${selectedKey}" not found in any data entry`;
                          } else {
                            return "No key selected";
                          }
                        })()
                      : "No data available"
                  }
                  html={device.widget_config?.html_template || ""}
                  css={device.widget_config?.css || ""}
                ></WidgetCustomValueCard>
              </div>
            )}

            {/* inactive state overlay*/}
            {device.connection_status === "offline" && (
              <div
                className={`absolute inset-0 flex items-center justify-center p-4
                ${
                  device.widget_type === "switch"
                    ? "bg-white/70"
                    : "bg-white/70"
                }
                backdrop-blur-sm rounded-lg z-10`}
              >
                <div
                  className={`flex flex-col items-center text-center space-y-2 p-6 rounded-lg
                  ${
                    device.widget_type === "switch"
                      ? "bg-white/90"
                      : "bg-white/90 shadow-lg border border-gray-200"
                  }`}
                >
                  <SignalWifiOffRoundedIcon
                    className={`w-12 h-12 text-yellow-600`}
                  />

                  <h3
                    className={`text-lg font-semibold${
                      device.widget_type === "switch"
                        ? "text-gray-700"
                        : "text-gray-700"
                    }`}
                  >
                    Dispositivo desconectado
                  </h3>

                  <p
                    className={`text-sm ${
                      device.widget_type === "switch"
                        ? "text-gray-600"
                        : "text-gray-600"
                    }`}
                  >
                    Última conexión: {device.last_connection || "N/A"}
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center bg-gray-100 border border-gray-300 rounded-lg p-6 text-gray-600 shadow-md">
            <InfoOutlinedIcon className="text-gray-500 text-4xl mb-2" />
            <h2 className="text-lg font-semibold">No Entity Selected</h2>
            <p className="text-sm text-gray-500">
              Please select an entity to view its details.
            </p>
          </div>
        )}

        <div className="inline-block mt-4">
          <IconButton
            className="text-my-blue hover:text-red-900 "
            disabled={deleting} onClick={eliminarWidget}
          >
            <DeleteIcon />
          </IconButton>
          <IconButton
            className="text-my-blue hover:text-blue-400 editButon"
            onClick={editWidget}
          >
            <EditIcon />
          </IconButton>
        </div>
      </CardContent>
    </Card>
  );
}

export default DeviceCard;

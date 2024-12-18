import React, { useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  Typography,
  Switch,
  Button,
  Tooltip,
  IconButton,
} from "@mui/material";
import { grey } from "@mui/material/colors";
import DeleteIcon from "@mui/icons-material/Delete";
import InfoIcon from "@mui/icons-material/Info";
import EditIcon from "@mui/icons-material/Edit";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
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
  Rectangle,
} from "recharts";
import axios from "axios";
import dayjs from "dayjs";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  Polygon,
  Popup,
  Tooltip as leafletTooltip,
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

const MyButton = styled(Button)(({ theme }) => ({
  backgroundColor: "#232939",
  color: "#fff",
  "&:hover": {
    backgroundColor: "#333c54",
  },
}));

function DeviceCard({
  device,
  index,
  cambiarEstado,
  datos,
  setDatos,
  handleMouseOver,
  openEditor,
  setEditedWidgetId,
  setEditedWidgetType,
}) {
  const [position, setPosition] = useState(null); // Iniciar como null
  const [isLoading, setIsLoading] = useState(true); // Estado de carga
  const [config, setConfig] = useState({});
  const chartRef = useRef();
  const [chartSize, setChartSize] = useState({ width: 0, height: 0 });
  const [historial, setHistorial] = useState({});

  useEffect(() => {
    setConfig(device.config);
  }, [device.device_id]);



  useEffect(() => {
    if (device.historial && device.config?.selected_key) {
      setHistorial(() => {
        const filteredHistorial = device.historial.filter((entry) => {
          const data = entry.data || {};
          const hasKey = Object.prototype.hasOwnProperty.call(data, device.config.selected_key);
          console.log("Entry Data:", data, "Selected Key:", device.config.selected_key, "Has Key:", hasKey);
          return hasKey; // Solo incluir si existe la clave seleccionada
        });


        return filteredHistorial.slice(-20); // Limitar a los últimos 20 elementos
      });
    } else {
      setHistorial([]);
    }
    setIsLoading(false);
  }, [device.widget_type, device.historial, device.config?.selected_key]);
  
  
  

  useEffect(() => {
    const updateSize = () => {
      if (chartRef.current) {
        setChartSize({
          width: chartRef.current.offsetWidth,
          height: chartRef.current.offsetHeight,
        });
      }
    };

    window.addEventListener("resize", updateSize);
    updateSize();

    return () => window.removeEventListener("resize", updateSize);
  }, []);


  if (device.widget_type === "customValueCard") {
    console.log("------------------");
    console.log("Selected Key:", device.config?.selected_key);
    const lastEntry = device.historial[device.historial.length - 1];
    const data = lastEntry?.data || {};
    console.log("Last Entry Data:", data);
    console.log(
      "Has Selected Key:",
      device.config?.selected_key && Object.prototype.hasOwnProperty.call(data, device.config.selected_key)
    );
    console.log("------------------");
  }

  const eliminarWidget = () => {
    try {
      fetch(
        `http://localhost:3001/api/data/widgets/delete/${device.widget_id}`,
        {
          method: "DELETE",
        }
      )
        .then((response) => response.json())
        .then((data) => {
          if (data.message === "Widget deleted successfully") {
            datos.splice(index, 1);
            setDatos([...datos]);
          }
        })
        .catch((error) => {
          console.error("Error en la solicitud:", error);
        });
    } catch (error) {
      console.error("Error deleting widget:", error);
    }
  };

  function editWidget() {
    setEditedWidgetId(device.widget_id);
    setEditedWidgetType(device.widget_type);
    openEditor(true);
  }

  const formatXAxis = (tickItem) => {
    return dayjs(tickItem).format("DD/MM");
  };

  const [iframeHeight, setIframeHeight] = useState("auto");

  const handleIframeMessage = (event) => {
    if (event.data?.type === "iframe-resize" && event.data?.height) {
      setIframeHeight(`${event.data.height}px`);
    }
  };

  React.useEffect(() => {
    window.addEventListener("message", handleIframeMessage);
    return () => window.removeEventListener("message", handleIframeMessage);
  }, []);

  return (
    <Card
      style={{
        backgroundColor: "#fff",
        color: "#232939",
        borderRadius: "12px",
        boxShadow: "0 6px 12px rgba(0, 0, 0, 0.1)",
        width: device.widget_type === "switch" ? "fit-content" : "45%",
        height: "fit-content",
        maxWidth: "100%",
        margin: "0px",
        padding: device.widget_type === "switch" ? "10px" : "0px",
      }}
    >
      <CardContent
        style={{ height: "100%", display: "flex", flexDirection: "column" }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "12px",
          }}
        >
          <Typography variant="h5">{device.widget_name}</Typography>
          <Tooltip
            title={
              <div>
                <Typography variant="body2">
                  Subscribed Topic : {device.config?.sub_topic || "N/A"}
                </Typography>
                <Typography variant="body2">
                  Publish Topic : {device.config?.pub_topic || "N/A"}
                </Typography>
                <Typography variant="body2">
                  Associated Entity Name : {device.config?.entity_name || "N/A"}
                </Typography>
              </div>
            }
          >
            <IconButton>
              <InfoIcon style={{ color: "#232939" }} />
            </IconButton>
          </Tooltip>
        </div>
        {device.device_id ? (
          <>
            {device.widget_type === "switch" && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginTop: "16px",
                }}
              >
                <IOSSwitch
                  checked={device.estadoActual}
                  onClick={() => cambiarEstado(device)}
                />
                <Typography variant="body2" style={{ marginLeft: "8px" }}>
                  {device.estadoActual ? "ON" : "OFF"}
                </Typography>
              </div>
            )}
            {device.widget_type === "lineChart" && (
              <div
                style={{
                  flex: "1 1 auto",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                }}
                ref={chartRef}
              >
                <ResponsiveContainer width="100%" aspect={5.0 / 3.0}>
                  <LineChart
                    width={400}
                    height={300}
                    data={historial}
                    margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickFormatter={formatXAxis} />
                    <YAxis />
                    <RechartsTooltip
                      wrapperStyle={{ backgroundColor: "#000", fontSize: 12 }}
                      labelFormatter={
                        (label) => dayjs(label).format("YYYY/MM/DD") // Formato de fecha para el tooltip
                      }
                    />
                    <Legend layout="vertical" verticalAlign="top" height={36} />
                    <Line
                      type="linear"
                      dataKey={`data.${device.config?.selected_key}`}
                      stroke={device.config.lineColor}
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
            {device.widget_type === "barChart" && (
              <div
                style={{
                  flex: "1 1 auto",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                }}
                ref={chartRef}
              >
                <ResponsiveContainer width="100%" aspect={5.0 / 3.0}>
                  <BarChart
                    width={400}
                    height={300}
                    data={historial}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={formatXAxis}
                      interval="preserveStartEnd"
                    />
                    <YAxis />
                    <RechartsTooltip
                      wrapperStyle={{ backgroundColor: "#000", fontSize: 12 }}
                      labelFormatter={
                        (label) => dayjs(label).format("YYYY/MM/DD") // Formato de fecha para el tooltip
                      }
                    />
                    <Legend />
                    <Bar
                      dataKey={`data.${device.config?.selected_key}`}
                      fill={device.config?.lineColor || "#fff000"}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
            {device.widget_type === "map" && (
              <div
                style={{
                  flex: "1 1 auto",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  height: "400px",
                  width: "100%",
                }}
                ref={chartRef}
                id="map"
              >
                {isLoading ? (
                  <div>Loading map...</div>
                ) : historial.length > 0 ? (
                  <MapContainer
                    center={
                      historial && device.historial.data?.lat
                        ? [
                            parseFloat(historial.data?.lat),
                            parseFloat(historial.data?.lon),
                          ]
                        : [0, 0] // Posición predeterminada si no hay datos válidos
                    }
                    zoom={4}
                    style={{ height: "100vh", width: "100%" }}
                    scrollWheelZoom={false}
                  >
                    <TileLayer
                      url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                      attribution='&copy; <a href="https://www.esri.com">Esri</a>'
                    />

                    {historial.map((entry, index) => {
                      try {
                        const data = entry;
                        if (data.lat && data.lon) {
                          const position = [
                            parseFloat(data.lat),
                            parseFloat(data.lon),
                          ];
                          return (
                            <Marker key={index} position={position}>
                              <Popup>
                                <div>
                                  <strong>Lat:</strong> {position[0]}
                                  <br />
                                  <strong>Lon:</strong> {position[1]}
                                  <br />
                                  <small>
                                    Timestamp: {data.timestamp || "N/A"}
                                  </small>
                                </div>
                              </Popup>
                            </Marker>
                          );
                        }
                      } catch (error) {
                        console.error(
                          "Error parsing entry data:",
                          entry,
                          error
                        );
                      }
                      return null; // Ignorar entradas no válidas
                    })}

                    {historial.length > 1 && (
                      <Polyline
                        positions={historial
                          .map((entry) => {
                            try {
                              const data = entry.data;
                              if (data.lat && data.lon) {
                                return [
                                  parseFloat(data.lat),
                                  parseFloat(data.lon),
                                ];
                              }
                            } catch (error) {
                              console.error(
                                "Error parsing data for polyline:",
                                error
                              );
                            }
                            return null; // Ignorar puntos no válidos
                          })
                          .filter((point) => point !== null)} // Filtra los puntos nulos
                        color="blue"
                      />
                    )}
                  </MapContainer>
                ) : (
                  <div>No valid position available</div>
                )}
              </div>
            )}
            {device.widget_type === "customValueCard" && (
              <div
                style={{
                  flex: "1 1 auto",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  height: "400px",
                  width: "100%",
                }}
                ref={chartRef}
                id="customValueCard"
              >
                <WidgetCustomValueCard
value={
  device.historial && device.historial.length > 0
    ? (() => {
        const selectedKey = device.config?.selected_key;

        // Encuentra la última entrada con la clave seleccionada
        const lastEntryWithKey = [...device.historial]
          .reverse()
          .find((entry) => Object.prototype.hasOwnProperty.call(entry.data || {}, selectedKey));

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


                  html={device.config?.scriptHtml || ""}
                  css={device.config?.scriptCss || ""}
                ></WidgetCustomValueCard>
              </div>
            )}
          </>
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
            onClick={eliminarWidget}
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

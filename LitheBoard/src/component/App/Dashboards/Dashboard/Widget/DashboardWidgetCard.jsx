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
import { grey } from '@mui/material/colors';
import DeleteIcon from "@mui/icons-material/Delete";
import InfoIcon from "@mui/icons-material/Info";
import EditIcon from '@mui/icons-material/Edit';
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

import { getDashboardHistoricos } from "../../../../DatabaseDataFunctions";
import WidgetCustomValueCard from "./WidgetTypes/WidgetCustomValueCard";

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
  setEditedWidgetId, setEditedWidgetType
}) {
  const [position, setPosition] = useState(null); // Iniciar como null
  const [isLoading, setIsLoading] = useState(true); // Estado de carga
  const [config, setConfig] = useState({});
  const chartRef = useRef();
  const [chartSize, setChartSize] = useState({ width: 0, height: 0 });

  const [clearHistorial, setClearHistorial] = useState([]);

  useEffect(() => {
    setConfig(device.config);
  }, [device.device_id]);

  useEffect(() => {
    if (device.widget_type === "map" && Array.isArray(device.historial)) {
      const filteredHistorial = device.historial.filter((entry) => {
        let parsedData;
        try {
          parsedData = JSON.parse(entry.data);
        } catch (error) {
          console.error("Error parsing JSON data: ", error);
          return false;
        }
        return parsedData && parsedData.lat && parsedData.lon;
      });

      if (filteredHistorial.length > 0) {
        const lastEntry = filteredHistorial[filteredHistorial.length - 1];
        let lastData;
        try {
          lastData = JSON.parse(lastEntry.data);
        } catch (error) {
          console.error("Error parsing lastEntry data: ", error);
          setIsLoading(false); // Termina carga si hay error
          return;
        }
        if (lastData.lat && lastData.lon) {
          setPosition([parseFloat(lastData.lat), parseFloat(lastData.lon)]);
        }
      }
      setClearHistorial(filteredHistorial);
    }
    setIsLoading(false);
  }, [device.widget_type, device.historial]);

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

  const eliminarWidget = () => {
    datos.splice(index, 1);
    setDatos([...datos]);
  };

  function editWidget() {
    setEditedWidgetId(device.widget_id)
    setEditedWidgetType(device.widget_type)
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

        {device.widget_type === "switch" && (
          <div
            style={{ display: "flex", alignItems: "center", marginTop: "16px" }}
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
                data={device.historial}
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
                  dataKey="data"
                  stroke={device.config.lineColor}
                  dot={{ stroke: "#b1b1b1", strokeWidth: 1, fill: "#1c0d00" }}
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
                data={device.historial}
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
                  dataKey="data"
                  fill="#8884d8"
                  stroke={device.config.lineColor}
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
              <div>Loading map...</div> // Mostrar estado de carga hasta que el historial se filtre
            ) : position ? (
              <MapContainer
                center={position}
                zoom={4}
                style={{ height: "100vh", width: "100%" }}
                scrollWheelZoom={false}
              >
                <TileLayer
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                  attribution='&copy; <a href="https://www.esri.com">Esri</a>'
                />

                <Marker position={position}>
                  <Popup>
                    <div>
                      <strong>Lat:</strong> {position[0]}
                      <br />
                      <strong>Lon:</strong> {position[1]}
                      <br />
                      <small>Timestamp: un dia</small>
                    </div>
                  </Popup>{" "}
                </Marker>
                {clearHistorial.length > 1 && (
                  <Polyline
                    positions={clearHistorial.map((entry) => {
                      const data = JSON.parse(entry.data);
                      return [parseFloat(data?.lat), parseFloat(data?.lon)];
                    })}
                    color="blue"
                  />
                )}
              </MapContainer>
            ) : (
              <div>No valid position available</div> // Mostrar mensaje si no hay posición válida
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
              value={device.historial[device.historial.length - 1].data}
              html={device.config.scriptHtml}
              css={device.config.scriptCss}
            ></WidgetCustomValueCard>
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

import React, { useEffect, useState } from "react";
import axios from "axios";
import { DataGrid } from "@mui/x-data-grid";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import AddAlarm from "./add_alarm";
import {
  Tooltip,
  Typography,
  Fab, Box} from "@mui/material"
import config from "@config";
function AlarmList({ client_id, alarms, setAlarms, entities }) {
  const [isAddAlarmVisible, setIsAddAlarmVisible] = useState(false);
  const base_url = `${config.BACKEND_URL}:${config.BACKEND_API_PORT}`;
  useEffect(() => {
    // Fetch alarms from the backend
    axios
      .get(`${base_url}/api/alarms/${client_id}`)
      .then((response) => {
        setAlarms(response.data);
      })
      .catch((error) => {
        console.error("Error fetching alarms:", error);
      });
  }, [client_id]);

  const handleAddAlarm = () => {
    setIsAddAlarmVisible(true);
  };

  const handleCancelAddAlarm = () => {
    setIsAddAlarmVisible(false);
  };
  const openAdd  = () => setIsAddAlarmVisible(true);
  const cancelAdd= () => setIsAddAlarmVisible(false);

  const handleSaveAlarm = (newAlarm) => {
    axios
      .get(`${base_url}/api/alarms/${client_id}`)
      .then((response) => {
        setAlarms(response.data);
      })
      .catch((error) => {
        console.error("Error fetching alarms:", error);
      });
    setIsAddAlarmVisible(false);
  };

  const handleEditClick = () => {};

  const columns = [
    {
      field: "disp_name",
      renderHeader: () => (
        <h2 className="font-medium text-gray-900 text-[14px]">
          {"Nombre del Dispositivo"}
        </h2>
      ),
      flex: 1,
    },
    { field: "valor",       renderHeader: () => (
        <h2 className="font-medium text-gray-900 text-[14px]">
          {"Valor"}
        </h2>
      ), flex: 1 },
    {
      field: "actions",
      renderHeader: () => (
        <h2 className="font-medium text-gray-900 text-[14px]">
          {"Acciones"}
        </h2>
      ),
      flex: 1,
      renderCell: (params) => (
        <>
          <IconButton
            className="text-my-blue hover:text-red-900"
            onClick={(e) => {
              e.stopPropagation();
              // Add your delete function here
            }}
          >
            <DeleteIcon />
          </IconButton>
          <IconButton
            className="text-my-blue hover:text-blue-400 editButon"
            onClick={(e) => {
              e.stopPropagation();
              handleEditClick(params.row);
            }}
          >
            <EditIcon />
          </IconButton>
        </>
      ),
    },
  ];
  const rows = alarms.map((alarm, index) => ({
    id: alarm.alarm_id,
    disp_name: alarm.disp_name,
    valor: alarm.valor,
  }));

  if (isAddAlarmVisible) {
    return (
      <AddAlarm
        client_id={client_id}
        entities={entities}
        onCancel={cancelAdd}
        onSave={handleSaveAlarm}
      />
    );
  }

  return (
    <Box
      className="min-w-fit w-full h-full bg-white border border-gray-300 rounded-[12px] shadow-[0px_0px_10px_rgba(0,0,0,0.1)] overflow-hidden"
      sx={{ p: 2 }}
    >
      {/* Cabecera (2) */}
      <Box className="flex justify-between items-center mb-4 px-2 py-1">
        <Typography variant="h5" className="text-lg font-semibold" sx={{ color: "#232939" }}>
          Alarms Panel
        </Typography>
        <Tooltip title="Add an Alarm">
          <Fab
            size="small"
            onClick={openAdd}
            sx={{
              backgroundColor: "#232939",
              color: "#fff",
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              transition: "all 0.2s ease-in-out",
              "&:hover": {
                backgroundColor: "#1f2736",
                transform: "scale(1.05)",
              },
            }}
          >
            <AddRoundedIcon />
          </Fab>
        </Tooltip>
      </Box>

      {/* DataGrid (3) */}
      <Box sx={{ height: "calc(100% - 64px)", width: "100%" }}>
        <DataGrid
          rows={rows}
          columns={columns}
          pageSizeOptions={[5, 10]}
          initialState={{
            pagination: { paginationModel: { pageSize: 5, page: 0 } },
          }}
          hideFooterSelectedRowCount
          sx={{
            borderRadius: "12px",
            ".MuiDataGrid-columnHeaders": {
              backgroundColor: "#f9fafb",
            },
            "& .MuiDataGrid-cell": {
              fontSize: "0.9rem",
            },
            "& .MuiDataGrid-row:hover": {
              backgroundColor: "rgba(0,0,0,0.04)",
            },
          }}
        />
      </Box>
    </Box>
  );
}

export default AlarmList;

import { getApiErrorMessage } from "../../services/api_errors";
import { deleteAlarm } from "../../services/alarms_service";
import React, { useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import AddAlarm from "./add_alarm";
import {
  Alert,
  Tooltip,
  Typography,
  Fab, Box} from "@mui/material"

function AlarmList({ user, alarms, setAlarms, entities }) {
  const [isAddAlarmVisible, setIsAddAlarmVisible] = useState(false);

  const [editing, setEditing] = useState(null);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const handleDelete = async (alarm_id) => {
    if (deleting || !window.confirm("Delete this alarm and its notifications?")) return;
    setDeleting(true);
    setError("");
    try {
      await deleteAlarm(alarm_id);
      setAlarms((previous) => previous.filter((alarm) => alarm.alarm_id !== alarm_id));
    } catch (error) {
      setError(getApiErrorMessage(error, "Could not delete alarm. Please try again."));
    } finally { setDeleting(false); }
  };
  const openAdd = () => { setEditing(null); setIsAddAlarmVisible(true); };
  const cancelAdd= () => setIsAddAlarmVisible(false);

  const handleSaveAlarm = (saved) => {
    setAlarms((previous) => editing
      ? previous.map((alarm) => alarm.alarm_id === saved.alarm_id ? saved : alarm)
      : [...previous, saved]);
    setIsAddAlarmVisible(false);
    setEditing(null);
  };
  const handleEditClick = (row) => {
    setEditing(alarms.find((alarm) => alarm.alarm_id === row.id));
    setIsAddAlarmVisible(true);
  };

  const columns = [
    {
      field: "name",
      renderHeader: () => (
        <h2 className="font-medium text-gray-900 text-[14px]">
          {"Nombre del Dispositivo"}
        </h2>
      ),
      flex: 1,
    },
    { field: "threshold",       renderHeader: () => (
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
            disabled={deleting} aria-label="Delete alarm" className="text-my-blue hover:text-red-900"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(params.row.id);
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
    name: entities.find((entity) => entity.entity_id === alarm.entity_id)?.name || "Desconocido",
    threshold: alarm.threshold,
  }));

  if (isAddAlarmVisible) {
    return (
      <AddAlarm
        alarm={editing}
        client_id={user.client_id}
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
      {error && <Alert severity="error">{error}</Alert>}
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

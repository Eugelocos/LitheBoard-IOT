import React, { useEffect, useState } from "react";
import axios from "axios";
import { DataGrid } from "@mui/x-data-grid";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import AddAlarm from "./add_alarm";

function AlarmList({ client_id, alarms, setAlarms, entities }) {
  const [is_add_alarm_visible, setIsAddAlarmVisible] = useState(false);
  const baseURL = `http://litheboard-backend:3001`;
  useEffect(() => {
    // Fetch alarms from the backend
    axios
      .get(`${baseURL}/api/alarms/${client_id}`)
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

  const handleSaveAlarm = (newAlarm) => {
    axios
      .get(`${baseURL}/api/alarms/${client_id}`)
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

  return (
      <div
        className="min-w-fit min-h-full w-full h-full bg-white border border-gray-300 rounded p-2.5 shadow-[0px_0px_10px_rgba(0,0,0,0.1)] m-1/4 overflow-hidden"
        id="alarm-list-table"
      >
        <div className="h-full w-full">
          {is_add_alarm_visible ? (
            <AddAlarm
              client_id={client_id}
              onCancel={handleCancelAddAlarm}
              onSave={handleSaveAlarm}
              entities={entities}
            />
          ) : (
            <div className="h-full w-full">
              <div className="flex justify-between items-center py-2 px-4">
                <h2 className="font-medium text-gray-900 text-xl">Alarmas</h2>
                <button
                  onClick={handleAddAlarm}
                  id="show-add-alarm-panel"
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-white hover:bg-gray-200/75 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-colors duration-200"
                >
                  <AddRoundedIcon />
                </button>
              </div>
              <div className="h-[93%] w-full">
                <DataGrid
                  rows={rows}
                  columns={columns}
                  checkboxSelection={false}
                  initialState={{
                    pagination: {
                      paginationModel: { page: 0, pageSize: 5 },
                    },
                  }}
                  pageSizeOptions={[5, 10]}
                  columnBufferPx={5}
                />
              </div>
            </div>
          )}
        </div>
      </div>

  );
}

export default AlarmList;

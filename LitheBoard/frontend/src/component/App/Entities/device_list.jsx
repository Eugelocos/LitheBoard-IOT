import { useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import {
  IconButton,
  Drawer,
  TextField,
  Button,
  Tooltip,
  Toolbar,
} from "@mui/material";
import axios from "axios";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import AddDevice from "./add_device";
import config from "@config";
import StatusBadge from "../../status_badge";

function DeviceList(props) {
  const [isDeviceListVisible, setDeviceListVisible] = useState(true);
  const [drawer_open, setDrawerOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [editedName, setEditedName] = useState("");
  const [editedConfig, setEditedConfig] = useState({});
  const [token, setToken] = useState("");
  const { entities, handleAddDevice, setEntities, user } = props;
  const base_url = `${config.BACKEND_URL}:${config.BACKEND_API_PORT}`;

  const [status, setStatus] = useState(0); // 0: initial, 1: loading, 2: success, 3: error

  const showDeviceList = (show) => {
    setDeviceListVisible(show);
  };

  const handleEditClick = (device) => {
    setSelectedDevice(device);
    setEditedName(device.disp_name);
    setEditedConfig(
      entities.find((entity) => entity.entity_id === device.id)
        .datasource_config
    );
    setToken(
      entities.find((entity) => entity.entity_id === device.id)
        .datasource_config?.token || ""
    );
    setDrawerOpen(true);
  };

  const handleDelete = async (entity) => {
    try {
      await fetch(`${base_url}/api/entities/delete/${entity.entity_id}`, {
        method: "DELETE",
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.message === "Entity deleted successfully") {
            setEntities((prevEntities) =>
              prevEntities.filter(
                (device) => device.entity_id !== entity.entity_id
              )
            );
          }
        })
        .catch((error) => {
          console.error("Error in request:", error);
        });
    } catch (error) {
      console.error("Error deleting entity:", error);
    }
  };

  const handleSaveEdit = async () => {
    if (selectedDevice) {
      setStatus(1)
      try {
        const updatedData = {
          entity_id: selectedDevice.id,
          disp_name: editedName,
          datasource_config: { ...editedConfig },
        };
        console.log("updated data : ", updatedData);
        await axios.put(`${base_url}/api/data/entities/update`, updatedData);

        const updatedEntities = entities.map((device) =>
          device.entity_id === selectedDevice.entity_id
            ? { ...device, ...updatedData }
            : device
        );

        setEntities(updatedEntities);
        setStatus(2)
        setDrawerOpen(false);
        setSelectedDevice(null);

      } catch (error) {
        setStatus(3)
        console.error("Error updating device:", error);
      }
    }
  };

  const handleCancelEdit = () => {
    setDrawerOpen(false);
    setSelectedDevice(null);
  };
  const columns = [
    { field: "disp_name", headerName: "Nombre", flex: 1 },
    { field: "datasource_type", headerName: "Datasource Type", flex: 1 },
    { field: "datasource_config", headerName: "Datasource Config", flex: 1 },
    {
      field: "actions",
      headerName: "Acciones",
      flex: 1,
      renderCell: (params) => (
        <>
          <IconButton
            className="text-my-blue hover:text-red-900 "
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(params.row);
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
  // Mapea los entities a filas para el DataGrid
  const rows = entities.map((disp, index) => ({
    id: disp?.entity_id,
    disp_name: disp.disp_name,
    datasource_type: disp.datasource_type,
    datasource_config: JSON.stringify(disp.datasource_config),
    token: disp.config,
  }));
  console.log("rows", rows);
  return (
    <>
      {isDeviceListVisible ? (
        <div className="device-list-panel h-full overflow-hidden overflow-x-auto  bg-white border border-gray-300 rounded p-2.5 shadow-[0px_0px_10px_rgba(0,0,0,0.1) h-[90%]">
          <div className="flex justify-between items-center py-2 px-4">
            <h2 className=" font-medium text-gray-900 text-xl">Entities</h2>
            <button
              onClick={() => showDeviceList(false)}
              id="show-add-device-panel"
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
              pageSizeOptions={[20, 50]}
              columnBufferPx={5}
            />
          </div>
        </div>
      ) : (
        <div id="add-device-panel" className="flex flex-wrap justify-center">
          <AddDevice
            onAddDevice={handleAddDevice}
            showDeviceList={showDeviceList}
            user={user}
          />
        </div>
      )}
      <Drawer
        anchor="right"
        open={drawer_open}
        onClose={handleCancelEdit}
        sx={{
          "& .MuiDrawer-paper": {
            zIndex: 1400,
            width: "400px",
            backgroundColor: "#f5f5f5",
          },
        }}
      >
        <div className="h-full flex-wrap flex content-between">
          <div className="bg-opacity-10">
            <Toolbar className="w-full h-fit mt-[64px] flex-col flex m-4">
              <h2 className="font-medium text-gray-900 text-xl inline">
                Edit{" "}
                <span className="font-normal text-gray-700">
                  {selectedDevice?.datasource_type}
                </span>{" "}
                entity
              </h2>

              <Tooltip title="Place this token in the message sent by the device.">
                <p className="italic">{token}</p>
              </Tooltip>
            </Toolbar>
          </div>

          <div className="flex flex-wrap items-center h-[40%] w-full m-4 overflow-y-auto">
            <TextField
              autoFocus
              margin="dense"
              label="Name"
              fullWidth
              value={editedName}
              variant="filled"
              onChange={(e) => setEditedName(e.target.value)}
            />
            {selectedDevice?.datasource_type === "MQTT" && (
              <>
                <TextField
                  margin="dense"
                  label="Subscribe Topic"
                  variant="filled"
                  fullWidth
                  value={editedConfig.sub_topic || ""}
                  onChange={(e) =>
                    setEditedConfig({
                      ...editedConfig,
                      sub_topic: e.target.value,
                    })
                  }
                />
                <TextField
                  margin="dense"
                  label="Publish Topic"
                  variant="filled"
                  fullWidth
                  value={editedConfig.pub_topic || ""}
                  onChange={(e) =>
                    setEditedConfig({
                      ...editedConfig,
                      pub_topic: e.target.value,
                    })
                  }
                />
              </>
            )}
            {selectedDevice?.datasource_type === "API" && (
              <div>
                <TextField
                  margin="dense"
                  label="Base URL"
                  variant="filled"
                  fullWidth
                  value={editedConfig.base_url || ""}
                  onChange={(e) =>
                    setEditedConfig({
                      ...editedConfig,
                      base_url: e.target.value,
                    })
                  }
                />
                <TextField
                  margin="dense"
                  label="HTTP Method"
                  variant="filled"
                  fullWidth
                  value={editedConfig.method || ""}
                  onChange={(e) =>
                    setEditedConfig({ ...editedConfig, method: e.target.value })
                  }
                />
                <TextField
                  margin="dense"
                  label="Polling Interval"
                  variant="filled"
                  fullWidth
                  value={editedConfig.polling_interval || ""}
                  onChange={(e) =>
                    setEditedConfig({
                      ...editedConfig,
                      polling_interval: e.target.value,
                    })
                  }
                />
                <TextField
                  margin="dense"
                  label="Query Params"
                  variant="filled"
                  fullWidth
                  value={JSON.stringify(editedConfig.query_params) || ""}
                  onChange={(e) =>
                    setEditedConfig({
                      ...editedConfig,
                      query_params: e.target.value,
                    })
                  }
                />
                <TextField
                  margin="dense"
                  label="Headers"
                  variant="filled"
                  fullWidth
                  value={JSON.stringify(editedConfig.headers) || ""}
                  onChange={(e) =>
                    setEditedConfig({
                      ...editedConfig,
                      headers: e.target.value,
                    })
                  }
                />
                <TextField
                  margin="dense"
                  label="Request Body"
                  variant="filled"
                  fullWidth
                  value={JSON.stringify(editedConfig.request_body) || ""}
                  onChange={(e) =>
                    setEditedConfig({
                      ...editedConfig,
                      request_body: e.target.value,
                    })
                  }
                />
              </div>
            )}
          </div>

          <div className="flex justify-end mt-4 items-end w-full">
            <Button onClick={handleCancelEdit} color="primary">
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} color="primary">
              Save
            </Button>
            <StatusBadge status={status}/>
          </div>
        </div>
      </Drawer>
    </>
  );
}

export default DeviceList;

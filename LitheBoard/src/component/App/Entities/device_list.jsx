import { useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { IconButton, Drawer, TextField, Button, Tooltip, Toolbar } from "@mui/material";
import axios from "axios";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import AddDevice from "./add_device";
function DeviceList(props) {
  const [isDeviceListVisible, setDeviceListVisible] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [editedName, setEditedName] = useState("");
  const [editedSubTopic, setEditedSubTopic] = useState("");
  const [editedPubTopic, setEditedPubTopic] = useState("");
  const [token, setToken] = useState("");
  const { dispositivos, handleAddDevice, setDispositivos, user } = props;

  const mostrar = (showDeviceList) => {
    setDeviceListVisible(showDeviceList);
  };

  const handleEditClick = (device) => {
    setSelectedDevice(device);
    setEditedName(device.disp_name);
    setEditedSubTopic(device.sub_topic);
    setEditedPubTopic(device.pub_topic);
    setToken(device.token);
    setDrawerOpen(true);
  };

  const handleDelete = async (entity) => {
    try {
      fetch(`http://localhost:3001/api/entities/delete/${entity.id}`, {
        method: "DELETE",
      })
      .then((response) => response.json())
      .then((data) => {
        if (data.message === "Entity deleted succesfully") {
          // Actualiza la lista de dashboards en el estado local
          setDispositivos((prevDispositivos) => prevDispositivos.filter(dispositivo => dispositivo.entity_id !== entity.id));
        }
      })
      .catch((error) => {
        console.error("Error en la solicitud:", error);
      });
    } catch (error) {
      console.error("Error deleting entity:", error);
    }
  }

  const handleSaveEdit = async () => {
    if (selectedDevice) {
      try {
        const updatedData = {
          entity_id: selectedDevice.id,
          disp_name: editedName,
          sub_topic: editedSubTopic,
          pub_topic: editedPubTopic,
        };

        // Envía la solicitud PUT al servidor
        await axios.put(
          "http://localhost:3001/api/data/entities/update",
          updatedData
        );

        const updatedDispositivos = dispositivos.map((disp) =>
          disp.entity_id === selectedDevice.id
            ? {
                ...disp,
                disp_name: editedName,
                sub_topic: editedSubTopic,
                pub_topic: editedPubTopic,
              }
            : disp
        );

        setDispositivos(updatedDispositivos);

        // Cierra el drawer
        setDrawerOpen(false);
        setSelectedDevice(null);
      } catch (error) {
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
    { field: "sub_topic", headerName: "Subscribe Topic", flex: 1 },
    { field: "pub_topic", headerName: "Public Topic", flex: 1 },
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
              handleDelete(params.row)
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
  // Mapea los dispositivos a filas para el DataGrid
  const rows = dispositivos.map((disp, index) => ({
    id: disp?.entity_id,
    disp_name: disp.disp_name,
    sub_topic: disp.sub_topic,
    pub_topic: disp.pub_topic,
    token: disp.token,
  }));

  return (
    <>
      {isDeviceListVisible ? (
    <div className="device-list-panel h-full overflow-hidden overflow-x-auto  bg-white border border-gray-300 rounded p-2.5 shadow-[0px_0px_10px_rgba(0,0,0,0.1) h-[90%]">
          <div className="flex justify-between items-center py-2 px-4">
            <h2 className=" font-medium text-gray-900 text-xl">Dispositivos</h2>
            <button
              onClick={() => mostrar(false)}
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
            mostrar={mostrar}
            user={user}
          />
        </div>
      )}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={handleCancelEdit}
        sx={{
          "& .MuiDrawer-paper": {
            width: "400px", // Ancho del Drawer
            backgroundColor: "#f5f5f5", // Color de fondo del Drawer
          },
        }}
      >
        <div className="h-full flex-wrap flex content-between">
          <div className="bg-opacity-10 bg-slate-300">
          <Toolbar className="w-full h-fit mt-[64px]  flex-col flex m-4 ">
            <h2 className="font-medium text-gray-900 text-xl w-full">
              Editar Dispositivo
            </h2>
            <Tooltip title="Coloca este token en el json del dispositivo">
              <p className="italic">{token}</p>
            </Tooltip>
          </Toolbar>            
          </div>


          <div className="flex flex-wrap items-center h-[40%] w-full m-4">
            <TextField
              autoFocus
              margin="dense"
              label="Nombre"
              fullWidth
              value={editedName}
              variant="filled"
              onChange={(e) => setEditedName(e.target.value)}
            />
            <TextField
              margin="dense"
              label="Subscribe Topic"
              variant="filled"
              fullWidth
              value={editedSubTopic}
              onChange={(e) => setEditedSubTopic(e.target.value)}
            />
            <TextField
              margin="dense"
              label="Public Topic"
              variant="filled"
              fullWidth
              value={editedPubTopic}
              onChange={(e) => setEditedPubTopic(e.target.value)}
            />
          </div>

          <div className="flex justify-end mt-4 items-end w-full">
            <Button onClick={handleCancelEdit} color="primary">
              Cancelar
            </Button>
            <Button onClick={handleSaveEdit} color="primary">
              Guardar
            </Button>
          </div>
        </div>
      </Drawer>
    </>
  );
}

export default DeviceList;

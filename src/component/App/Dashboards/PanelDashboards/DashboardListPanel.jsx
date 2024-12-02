import { useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { IconButton, Drawer, Button, TextField } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import axios from "axios";


function DashboardListPanel({
  dashboards,
  handleAddDashboard,
  handleSwitchSection,
  setDashboards,
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedDashboard, setSelectedDashboard] = useState(null);
  const [editedName, setEditedName] = useState("");
  const [editedDescription, setEditedDescription] = useState("");

  const handleDeleteDashboard = (dashboardId) => {
    fetch(`http://localhost:3001/api/dashboards/delete/${dashboardId}`, {
      method: "DELETE",
    })
    .then((response) => response.json())
    .then((data) => {
      if (data.message === "Dashboard y widgets eliminados correctamente") {
        // Actualiza la lista de dashboards en el estado local
        setDashboards((prevDashboard) => prevDashboard.filter(dashboard => dashboard.dashboard_id !== dashboardId));
      } else {
        console.error("Error al eliminar el dashboard:", data.message);
      }
    })
    .catch((error) => {
      console.error("Error en la solicitud:", error);
    });
  };

  const handleEditDashboard = (dashboard) => {

    setSelectedDashboard(dashboard);
    setEditedName(dashboard.nombre);
    setEditedDescription(dashboard.descripcion);
    setDrawerOpen(true);
  };


  const handleSaveEdit = async () => {
    try {
      const response = await axios.put('http://localhost:3001/api/dashboards/update', {
        dashboard_id: selectedDashboard.id,
        name: editedName,
        description: editedDescription,
      });
      const updatedDashboards = dashboards.map((dashboard) => {

        if (dashboard.dashboard_id === selectedDashboard.id) {
          return { ...dashboard, name: editedName, description: editedDescription };
        }
        return dashboard;
      });
      
      setDashboards(updatedDashboards)
  
      setDrawerOpen(false);
      setSelectedDashboard(null);
    } catch (error) {
      console.error('Error updating dashboard:', error);
    }
  };


  const handleCancelEdit = () => {
    setDrawerOpen(false);
    setSelectedDashboard(null);
  };




  // Define las columnas para el DataGrid
  const columns = [
    { field: "nombre", headerName: "Nombre", flex: 1, minWidth: 50 },
    {
      field: "fechaCreacion",
      headerName: "Fecha de Creación",
      flex: 1,
      minWidth: 50,
    },
    {
      field: "actions",
      headerName: "Acciones",
      flex: 1,
      minWidth: 50,
      renderCell: (params) => (
        <>
          <IconButton
            className="text-my-blue hover:text-red-900 "
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteDashboard(params.row.id);
            }}
          >
            <DeleteIcon />
          </IconButton>
          <IconButton
            className="text-my-blue hover:text-blue-400 editButon"
            onClick={(e) => {
              e.stopPropagation();
              handleEditDashboard(params.row);
            }}
          >
            <EditIcon />
          </IconButton>
        </>
      ),
    },
  ];

  const rows = dashboards.map((dashboard) => ({
    id: dashboard.dashboard_id,
    nombre: dashboard.name,
    descripcion: dashboard.description,
    fechaCreacion: new Date().toLocaleString(),
  }));

  return (
    <div className="dashboard-panel h-full overflow-hidden overflow-x-auto  bg-white border border-gray-300 rounded p-2.5 shadow-[0px_0px_10px_rgba(0,0,0,0.1) h-[90%]">
      <div className="flex justify-between items-center py-2 px-4">
        <h2 className=" font-medium text-gray-900 text-xl">Dashboards Panel</h2>
        <button
          onClick={handleAddDashboard}
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
          disableSelectionOnClick
          onRowDoubleClick={(params) =>
            handleSwitchSection("dashboards", params.row.dashboard)
          }
          columnBufferPx={100}
          hideFooterPagination={!rows.length}
        />
      </div>

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
        <div className="p-4 h-full flex-wrap flex content-between">
          <h2 className="font-medium text-gray-900 text-xl mb-4 w-full">Editar Dashboard</h2>
          <div className="flex flex-wrap items-center h-[40%] w-full">
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
            label="Descripción"
            variant="filled"
            fullWidth
            multiline
            rows={4}
            value={editedDescription}
            onChange={(e) => setEditedDescription(e.target.value)}

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
    </div>
  );
}
export default DashboardListPanel;

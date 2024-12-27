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
  const [drawer_open, setDrawerOpen] = useState(false);
  const [selected_dashboard, setSelectedDashboard] = useState(null);
  const [edited_name, setEditedName] = useState("");
  const [edited_description, setEditedDescription] = useState("");

  const baseURL = `http://backend:3001`;



  const handleDeleteDashboard = (dashboard_id) => {
    fetch(`${baseURL}/api/dashboards/delete/${dashboard_id}`, {
      method: "DELETE",
    })
    .then((response) => response.json())
    .then((data) => {
      if (data.message === "Dashboard y widgets eliminados correctamente") {
        // Actualiza la lista de dashboards en el estado local
        setDashboards((prev_dashboard) => prev_dashboard.filter(dashboard => dashboard.dashboard_id !== dashboard_id));
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
    setEditedName(dashboard.name);
    setEditedDescription(dashboard.descripcion);
    setDrawerOpen(true);
  };


  const handleSaveEdit = async () => {
    try {
      await axios.put(`${baseURL}/api/dashboards/update`, {
        dashboard_id: selected_dashboard.id,
        name: edited_name,
        description: edited_description,
      });
      const updated_dashboards = dashboards.map((dashboard) => {

        if (dashboard.dashboard_id === selected_dashboard.id) {
          return { ...dashboard, name: edited_name, description: edited_description };
        }
        return dashboard;
      });
      
      setDashboards(updated_dashboards)
  
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
    { field: "name", headerName: "Nombre", flex: 1, minWidth: 50 },
    {
      field: "creation_date",
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
    name: dashboard.name,
    descripcion: dashboard.description,
    creation_date: new Date().toLocaleString(),  // change to DB dashboard date
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
          onRowDoubleClick={(params) =>{
            handleSwitchSection("dashboards", params.row);
          }
          }
          columnBufferPx={100}
          hideFooterPagination={!rows.length}
        />
      </div>

      <Drawer
        anchor="right"
        open={drawer_open}
        onClose={handleCancelEdit}
        sx={{
          "& .MuiDrawer-paper": {
            width: "400px",
            backgroundColor: "#f5f5f5",
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
            value={edited_name}
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
            value={edited_description}
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

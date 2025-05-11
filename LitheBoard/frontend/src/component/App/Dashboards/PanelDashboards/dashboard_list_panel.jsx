import { useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import {
  IconButton,
  Drawer,
  Button,
  TextField,
  Typography,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import axios from "axios";
import config from "@config";
import { Tooltip, Fab } from "@mui/material";

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

  const base_url = `${config.BACKEND_URL}:${config.BACKEND_API_PORT}`;

  const handleDeleteDashboard = (dashboard_id) => {
    fetch(`${base_url}/api/dashboards/delete/${dashboard_id}`, {
      method: "DELETE",
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.message === "Dashboard y widgets eliminados correctamente") {
          // Actualiza la lista de dashboards en el estado local
          setDashboards((prev_dashboard) =>
            prev_dashboard.filter(
              (dashboard) => dashboard.dashboard_id !== dashboard_id
            )
          );
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
      await axios.put(`${base_url}/api/dashboards/update`, {
        dashboard_id: selected_dashboard.id,
        name: edited_name,
        description: edited_description,
      });
      const updated_dashboards = dashboards.map((dashboard) => {
        if (dashboard.dashboard_id === selected_dashboard.id) {
          return {
            ...dashboard,
            name: edited_name,
            description: edited_description,
          };
        }
        return dashboard;
      });

      setDashboards(updated_dashboards);

      setDrawerOpen(false);
      setSelectedDashboard(null);
    } catch (error) {
      console.error("Error updating dashboard:", error);
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
    creation_date: new Date().toLocaleString(), // change to DB dashboard date
  }));

  return (
    <div className="dashboard-panel h-full overflow-hidden overflow-x-auto  bg-white border border-gray-300 rounded-[12px] p-2.5 shadow-[0px_0px_10px_rgba(0,0,0,0.1)">
      <div className="flex justify-between items-center py-4 px-6">
        <Typography
          variant="h5"
          className="text-lg font-semibold mb-4"
          style={{ color: "#232939" }}
        >
          Dashboards Panel
        </Typography>
        <Tooltip title="Crear dashboard" sx={{ display: "flex" }}>
          <Fab
            color="primary" // usa tu color primario #232939 en el theme o con sx
            size="small"
            onClick={() => handleAddDashboard()}
            sx={{
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              backgroundColor: "#232939",
              "&:hover": {
                backgroundColor: "#1f2736",
                transform: "scale(1.05)",
              },
              transition: "all 0.2s ease-in-out",
            }}
          >
            <AddRoundedIcon />
          </Fab>
        </Tooltip>
      </div>
      <div className="h-[calc(100%-72px)] w-full">
        <DataGrid
          rows={rows}
          columns={columns}
          checkboxSelection={false}
          disableSelectionOnClick
          onRowDoubleClick={(params) => {
            handleSwitchSection("dashboards", params.row);
          }}
          columnBufferPx={100}
          hideFooterPagination={!rows.length}
          sx={{
            borderRadius: "12px",
            ".MuiDataGrid-columnHeaders": {
              backgroundColor: "#f9fafb",
              fontWeight: 600, // más peso
              fontSize: "1rem", // un poquito más grande
              color: "#232939",
            },
            "& .MuiDataGrid-cell": {
              fontSize: "0.900rem",
            },
            "& .MuiDataGrid-row:hover": {
              backgroundColor: "rgba(0, 0, 0, 0.04)",
              transition: "background-color 0.2s ease-in-out",
            },
          }}
        />
      </div>

      <Drawer
        anchor="right"
        open={drawer_open}
        onClose={handleCancelEdit}
        ModalProps={{ keepMounted: true }}
        sx={{
          "& .MuiDrawer-paper": {
            width: "400px",
            backgroundColor: "#f5f5f5",
          },

          "& .MuiDrawer-paper": {
            transition: "transform 0.3s ease-in-out",
          },
        }}
      >
        <div className="p-4 h-full flex-wrap flex content-between">
          <h2 className="font-medium text-gray-900 text-xl mb-4 w-full">
            Editar Dashboard
          </h2>
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

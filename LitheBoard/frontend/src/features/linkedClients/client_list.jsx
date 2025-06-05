import React, { useEffect, useState } from "react";
import axios from "axios";
import { DataGrid } from "@mui/x-data-grid";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DashboardIcon from "@mui/icons-material/DashboardRounded";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Drawer,
  Toolbar,
  TextField,
  Typography,
  Tooltip, Fab
} from "@mui/material";
import config from "@config";
function ClientList({
  client_id,
  dashboards,
  clients_asociated,
  setClientsAsociated,
  setDashboards,
}) {
  const [open_dialog, setOpenDialog] = useState(false);
  const [selected_dashboard_id, setSelectedDashboardId] = useState("");
  const [selected_client_id, setSelectedclient_id] = useState(null);
  const [available_dashboards, setAvailableDashboards] = useState([]);
  const [assigned_dashboards, setAssignedDashboards] = useState([]);
  const [drawer_open, setDrawerOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [editedName, setEditedName] = useState("");
  const [editedEmail, setEditedEmail] = useState("");

  const base_url = `${config.BACKEND_URL}:${config.BACKEND_API_PORT}`;

  useEffect(() => {
    // Fetch associated client IDs from the backend
    axios
      .get(`${base_url}/api/asociatedClients-Admins/${client_id}`)
      .then((response) => {
        const associated_client_ids = response.data;
        // Fetch details of each associated client
        return axios.get(
          `${base_url}/api/clients_id-client/${associated_client_ids.join(",")}`
        );
      })
      .then((response) => {
        setClientsAsociated(response.data);
      })
      .catch((error) => {
        console.error("Error fetching associated clients:", error);
      });
  }, [client_id]);

  const handleEditClick = (client) => {
    setSelectedClient(client);
    setEditedName(client.name);
    setEditedEmail(client.email);
    setDrawerOpen(true);
  };

  const handleCancelEdit = () => {
    setDrawerOpen(false);
    setSelectedClient(null);
  };

  const handleSaveEdit = async () => {
    try {

      const payload = {
        id: selectedClient.client_id,
        name: editedName,
        email: editedEmail
      };


      const response = await axios.put(`${base_url}/api/user/update`, payload);

      if (response.data.message) {
        // Actualiza la lista de clientes
        setClientsAsociated((prev) =>
          prev.map((client) =>
            client.client_id === selectedClient.client_id
              ? { ...client, name: editedName, email: editedEmail }
              : client
          )
        );
        setDrawerOpen(false);
        alert("Cambios guardados exitosamente");
      }
    } catch (error) {
      console.error("Error al actualizar cliente:", error);
      alert(error.response?.data?.message || "Error al actualizar");
    }
  };

  const handleDeleteClient = async (clientId) => {
    if (window.confirm("¿Estás seguro de eliminar este cliente?")) {
      try {
        await axios.delete(`${base_url}/api/clients/${clientId}`);

        setClientsAsociated((prev) =>
          prev.filter((client) => client.client_id !== clientId)
        );
        alert("Cliente eliminado exitosamente");
      } catch (error) {
        console.error("Error eliminando cliente:", error);
        alert(error.response?.data?.message || "Error al eliminar");
      }
    }
  };



  const handleOpenDialog = (client_id) => {
    setSelectedclient_id(client_id);
    // Filter the dashboards assigned to the selected client
    const assigned = dashboards.filter((dashboard) =>
      (dashboard.additional_client_ids || "[]").includes(client_id)
    );
    setAssignedDashboards(assigned);

    // Get available dashboards
    const assigned_ids = assigned.map((dashboard) => dashboard.dashboard_id);
    const available = dashboards.filter(
      (dashboard) => !assigned_ids.includes(dashboard.dashboard_id)
    );
    setAvailableDashboards(available);

    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleDashboardChange = (event) => {
    setSelectedDashboardId(event.target.value);
  };

  const handleAssignDashboard = async () => {
    if (selected_dashboard_id && selected_client_id) {
      axios
        .post(`${base_url}/api/assign-dashboard`, {
          client_id: selected_client_id,
          dashboardId: selected_dashboard_id,
        })
        .then((response) => {
          alert(response.data.message);

          handleCloseDialog();
        })
        .catch((error) => {
          console.error("Error assigning dashboard:", error);
          alert("Failed to assign dashboard");
        });
    }
    const dashboards_response = await axios.get(
      `${base_url}/api/data/dashboards/${client_id}`
    );
    setDashboards(dashboards_response.data);
  };

  const columns = [
    {
      field: "client_name",
      renderHeader: () => (
        <h2 className="font-medium text-gray-900 text-[14px]">
          {"Nombre del Cliente"}
        </h2>
      ),
      flex: 1,
    },
    {
      field: "email",
      renderHeader: () => (
        <h2 className="font-medium text-gray-900 text-[14px]">{"Email"}</h2>
      ),
      flex: 1,
    },
    {
      field: "dashboards_asigned",
      renderHeader: () => (
        <h2 className="font-medium text-gray-900 text-[14px]">
          {"Dashboards Assigned"}
        </h2>
      ),
      flex: 1,
      cellClassName: "truncate-cell",
    },
    {
      field: "actions",
      renderHeader: () => (
        <h2 className="font-medium text-gray-900 text-[14px]">{"Acciones"}</h2>
      ),
      flex: 1,
      renderCell: (params) => (
        <>
          <IconButton
            className="text-my-blue hover:text-red-900"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteClient(params.row.id);
            }}
          >
            <DeleteIcon />
          </IconButton>
          <IconButton
            className="text-my-blue hover:text-blue-400 editButon"
            onClick={(e) => {
              e.stopPropagation();
              const clientData = clients_asociated.find(
                (c) => c.client_id === params.row.id
              );
              handleEditClick(clientData);
            }}
          >
            <EditIcon />
          </IconButton>
          <IconButton
            className="text-my-blue hover:text-green-500"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenDialog(params.row.id); // Pass client_id here
            }}
          >
            <DashboardIcon />
          </IconButton>
        </>
      ),
    },
  ];
  clients_asociated.forEach((client_asociated) => {
    const associatedDashboards = dashboards.filter((dashboard) =>
      dashboard.additional_client_ids.includes(client_asociated.client_id)
    );
  });

  const rows = clients_asociated.map((client_asociated) => ({
    id: client_asociated.client_id,
    client_name: client_asociated.name,
    email: client_asociated.email,
    dashboards_asigned: dashboards
      .filter((dashboard) =>
        (dashboard.additional_client_ids || "[]").includes(
          client_asociated.client_id
        )
      )
      .map((dashboard) => dashboard.name)
      .join(", "),
  }));

  const dashboardColumns = [
    { field: "name", headerName: "Dashboard Name", width: 200 },
    { field: "description", headerName: "Description", width: 300 },
  ];

  const dashboardRows = assigned_dashboards.map((dashboard) => ({
    id: dashboard.dashboard_id,
    name: dashboard.name,
    description: dashboard.description || "No Description",
  }));

  return (
    <div
      className="client-list h-full overflow-hidden overflow-x-auto  bg-white border border-gray-300 rounded-[12px] p-2.5 shadow-[0px_0px_10px_rgba(0,0,0,0.1)"
      
    >
      <Dialog open={open_dialog} onClose={handleCloseDialog}>
        <DialogTitle>Assigned Dashboards</DialogTitle>
        <DialogContent>
          <div style={{ height: 400, width: "100%" }}>
            <DataGrid
              rows={dashboardRows}
              columns={dashboardColumns}
              pageSize={5}
              checkboxSelection
            />
          </div>
          <div className="my-3">
            <FormControl fullWidth variant="filled">
              <InputLabel id="select-dashboard-label">Add Dashboard</InputLabel>
              <Select
                labelId="select-dashboard-label"
                value={selected_dashboard_id}
                onChange={handleDashboardChange}
              >
                {available_dashboards.map((dashboard) => (
                  <MenuItem
                    key={dashboard.dashboard_id}
                    value={dashboard.dashboard_id}
                  >
                    {dashboard.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleAssignDashboard} color="primary">
            Assign
          </Button>
        </DialogActions>
      </Dialog>
      <div className="h-full w-full">
        <div className="flex justify-between items-center py-4 px-6">
          <Typography
                    variant="h5"
                    className="text-lg font-semibold mb-4"
                    style={{ color: "#232939" }}
                  >
                    Clients Associated
                  </Typography>
                  <Tooltip title="Add a client" sx={{ display: "flex" }}>
                    <Fab
                      color="primary" // usa tu color primario #232939 en el theme o con sx
                      size="small"
                      onClick={() => {}}
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
            initialState={{
              pagination: {
                paginationModel: { page: 0, pageSize: 5 },
              },
            }}
            pageSizeOptions={[5, 10,20]}
            columnBufferPx={5}
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
      </div>
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
                Editar Cliente
              </h2>
            </Toolbar>
          </div>

          <div className="flex flex-wrap items-center h-[40%] w-full m-4 overflow-y-auto">
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
              label="Email"
              fullWidth
              value={editedEmail}
              variant="filled"
              onChange={(e) => setEditedEmail(e.target.value)}
            />
          </div>

          <div className="flex justify-end mt-4 items-end w-full p-2">
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

export default ClientList;

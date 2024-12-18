import React, { useEffect, useState } from "react";
import axios from "axios";
import { DataGrid } from "@mui/x-data-grid";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DashboardIcon from "@mui/icons-material/DashboardRounded";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Select, MenuItem, FormControl, InputLabel } from "@mui/material";

function ClientList({ clientId, dashboards, clientsAsociated, setClientsAsociated, setDashboards}) {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedDashboardId, setSelectedDashboardId] = useState("");
  const [selectedClientId, setSelectedClientId] = useState(null);
  const [availableDashboards, setAvailableDashboards] = useState([]);
  const [assignedDashboards, setAssignedDashboards] = useState([]);

  useEffect(() => {
    // Fetch associated client IDs from the backend
    axios
      .get(`http://localhost:3001/api/asociatedClients-Admins/${clientId}`)
      .then((response) => {
        const associatedClientIds = response.data;
        // Fetch details of each associated client
        return axios.get(
          `http://localhost:3001/api/clients_id-client/${associatedClientIds.join(",")}`
        );
      })
      .then((response) => {
        setClientsAsociated(response.data);
      })
      .catch((error) => {
        console.error("Error fetching associated clients:", error);
      });
  }, [clientId]);

  const handleOpenDialog = (clientId) => {
    setSelectedClientId(clientId);
    // Filter the dashboards assigned to the selected client
    const assigned = dashboards.filter(dashboard =>
      (dashboard.additional_client_ids || "[]").includes(clientId)
    );
    setAssignedDashboards(assigned);

    // Get available dashboards
    const assignedIds = assigned.map(dashboard => dashboard.dashboard_id);
    const available = dashboards.filter(dashboard => !assignedIds.includes(dashboard.dashboard_id));
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
    if (selectedDashboardId && selectedClientId) {
      axios
        .post("http://localhost:3001/api/assign-dashboard", {
          clientId: selectedClientId,
          dashboardId: selectedDashboardId,
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
    const dashboardsResponse = await axios.get(
        `http://localhost:3001/api/data/dashboards/${clientId}`
      );
    setDashboards(dashboardsResponse.data)
    
  };

  const columns = [
    {
      field: "client_name",
      renderHeader: () => <h2 className="font-medium text-gray-900 text-[14px]">{"Nombre del Cliente"}</h2>,
      flex: 1,
    },
    {
      field: "email",
      renderHeader: () => <h2 className="font-medium text-gray-900 text-[14px]">{"Email"}</h2>,
      flex: 1,
    },
    {
      field: "dashboards_asigned",
      renderHeader: () => <h2 className="font-medium text-gray-900 text-[14px]">{"Dashboards Assigned"}</h2>,
      flex: 1,
          cellClassName: 'truncate-cell'
    },
    {
      field: "actions",
      renderHeader: () => <h2 className="font-medium text-gray-900 text-[14px]">{"Acciones"}</h2>,
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
            }}
          >
            <EditIcon />
          </IconButton>
          <IconButton
            className="text-my-blue hover:text-green-500"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenDialog(params.row.id); // Pass clientId here
            }}
          >
            <DashboardIcon />
          </IconButton>
        </>
      ),
    },
  ];
  clientsAsociated.forEach((clientAsociated) => {
    const associatedDashboards = dashboards.filter(dashboard =>
      dashboard.additional_client_ids.includes(clientAsociated.client_id)
    );
  });


  const rows = clientsAsociated.map((clientAsociated) => ({
    id: clientAsociated.client_id,
    client_name: clientAsociated.name,
    email: clientAsociated.email,
    dashboards_asigned: dashboards
      .filter(dashboard =>
        (dashboard.additional_client_ids || "[]").includes(clientAsociated.client_id)
      )
      .map(dashboard => dashboard.name)
      .join(', '),
  }));

  const dashboardColumns = [
    { field: "name", headerName: "Dashboard Name", width: 200 },
    { field: "description", headerName: "Description", width: 300 },
  ];

  const dashboardRows = assignedDashboards.map(dashboard => ({
    id: dashboard.dashboard_id,
    name: dashboard.name,
    description: dashboard.description || "No Description",
  }));

  return (
    <div
      className="min-w-fit min-h-full w-full h-full bg-white border border-gray-300 rounded p-2.5 shadow-[0px_0px_10px_rgba(0,0,0,0.1)] m-1/4 overflow-hidden"
      id="alarm-list-table"
    >
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Assigned Dashboards</DialogTitle>
        <DialogContent>
          <div style={{ height: 400, width: '100%' }}>
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
              value={selectedDashboardId}
              onChange={handleDashboardChange}
            >
              {availableDashboards.map(dashboard => (
                <MenuItem key={dashboard.dashboard_id} value={dashboard.dashboard_id}>
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
        <div className="flex justify-between items-center py-2 px-4">
          <h2 className="font-medium text-gray-900 text-xl">Clients</h2>
          <button
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
            hideFooterPagination={!rows.length}
          />
        </div>
      </div>
    </div>
  );
}

export default ClientList;

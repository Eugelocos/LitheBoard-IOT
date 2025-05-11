import React, { useState, useEffect } from "react";
import { DataGrid } from "@mui/x-data-grid";
import {
  IconButton,
  Drawer,
  Button,
  Toolbar,
  TextField,
  Box,
  Tooltip,
  Typography,
  Fab
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddRoundedIcon from "@mui/icons-material/AddRounded";

import axios from "axios";
import RulechainBoard from "./rulechain_board";
import AddRulechain from "./add_rulechain";
import config from "@config";

function RulechainList({ rulechains, setRulechains, entities, user }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedRulechain, setSelectedRulechain] = useState(null);
  const [editedName, setEditedName] = useState("");
  const [editedDescription, setEditedDescription] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editBoardOpen, setEditBoardOpen] = useState(false);
  const base_url = `${config.BACKEND_URL}:${config.BACKEND_API_PORT}`;

  // Fetch rulechains
  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      try {
        const { data } = await axios.get(
          `${base_url}/api/data/rulechains/get`,
          { params: { user_id: user.id } }
        );
        setRulechains(data);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [user, base_url, setRulechains]);

  const handleEditClick = async ({ rulechain_id }) => {
    try {
      const { data } = await axios.get(
        `${base_url}/api/data/rulechains/get/byId/${rulechain_id}`
      );
      setSelectedRulechain(data);
      setEditedName(data.name);
      setEditedDescription(data.description || "");
      setDrawerOpen(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedRulechain) return;
    try {
      await axios.put(
        `${base_url}/api/data/rulechains/update`,
        {
          rulechain_id: selectedRulechain.rulechain_id,
          user_id: selectedRulechain.user_id,
          name: editedName,
          description: editedDescription,
          rulechain: selectedRulechain.rulechain,
          entities_ids: selectedRulechain.entities_ids,
        }
      );
      setRulechains(prev =>
        prev.map(r =>
          r.rulechain_id === selectedRulechain.rulechain_id
            ? { ...r, name: editedName, description: editedDescription }
            : r
        )
      );
      setDrawerOpen(false);
      setSelectedRulechain(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async ({ rulechain_id }) => {
    try {
      await axios.delete(
        `${base_url}/api/data/rulechains/delete/${rulechain_id}`
      );
      setRulechains(prev => prev.filter(r => r.rulechain_id !== rulechain_id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddRulechain = newRulechain => {
    setRulechains(prev => [...prev, newRulechain]);
  };

  const handleOpenBoardOutside = () => {
    setDrawerOpen(false);
    setEditBoardOpen(true);
  };

  const handleBackToList = () => {
    setEditBoardOpen(false);
    setDrawerOpen(true);
  };

  const handleBoardSave = ({ rulechain: updatedRulechain }) => {
    setSelectedRulechain(prev => ({
      ...prev,
      rulechain: updatedRulechain,
    }));
    // volvemos al drawer para el guardado final
    console.log("rulechain: updatedRulechain",updatedRulechain)
    setEditBoardOpen(false);
    setDrawerOpen(true);
  };

  // If creating new
  if (showAddForm) {
    return (
      <AddRulechain
        onAddRulechain={handleAddRulechain}
        showRulechainList={setShowAddForm}
        setRulechains={setRulechains}
        user={user}
      />
    );
  }

  // If editing board outside
  if (editBoardOpen && selectedRulechain) {
    return (
      <Box height="100vh">
        <RulechainBoard
          rulechain={selectedRulechain}
          onSave={handleBoardSave}
          onCancel={handleBackToList}
          style={{ width: '100%', height: 'calc(100% - 64px)' }}
        />
      </Box>
    );
  }

  const columns = [
    { field: "name", headerName: "Nombre", flex: 1 },
    { field: "entity", headerName: "Entidad Asociada", flex: 1 },
    {
      field: "actions",
      headerName: "Acciones",
      flex: 1,
      renderCell: ({ row }) => (
        <>
          <IconButton onClick={() => handleDelete(row)}>
            <DeleteIcon />
          </IconButton>
          <IconButton onClick={() => handleEditClick(row)}>
            <EditIcon />
          </IconButton>
        </>
      ),
    },
  ];

  const rows = rulechains.map(rc => ({
    id: rc.rulechain_id,
    name: rc.name,
    entity:
      entities.find(ent => ent.entity_id === rc.entities_ids[0])?.disp_name ||
      "N/A",
    ...rc,
  }));

  return (
    <div
    className="rulechain-list-panel h-full overflow-hidden overflow-x-auto  bg-white border border-gray-300 rounded-[12px] p-2.5 shadow-[0px_0px_10px_rgba(0,0,0,0.1)"
    >
<div className="flex justify-between items-center py-4 px-6">
            <Typography
              variant="h5"
              className="text-lg font-semibold mb-4"
              style={{ color: "#232939" }}
            >
              Rulechains Panel
            </Typography>
            <Tooltip title="Add a Rulechain" sx={{ display: "flex" }}>
              <Fab
                color="primary" // usa tu color primario #232939 en el theme o con sx
                size="small"
                onClick={() => setShowAddForm(true)}
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

      {/* Metadata Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sx={{ '& .MuiDrawer-paper': { width: 400, padding: 2 } }}
      >
        {selectedRulechain && (
          <Box className='mt-7'>
            <Toolbar sx={{ justifyContent: 'space-between' }}>
              <h2>Editando: {selectedRulechain.name}</h2>
              <Button onClick={handleOpenBoardOutside}>Abrir Editor</Button>
            </Toolbar>
            <Box mt={2}>
              <TextField
                label="Nombre"
                fullWidth
                variant="filled"
                value={editedName}
                onChange={e => setEditedName(e.target.value)}
                sx={{ mb: 2 }}
              />
              <TextField
                label="Descripción"
                fullWidth
                variant="filled"
                multiline rows={3}
                value={editedDescription}
                onChange={e => setEditedDescription(e.target.value)}
              />
              <Box mt={2} display="flex" justifyContent="flex-end" gap={1}>
                <Button variant="outlined" onClick={() => setDrawerOpen(false)}>
                  Cancelar
                </Button>
                <Button variant="contained" onClick={handleSaveEdit}>
                  Guardar
                </Button>
              </Box>
            </Box>
          </Box>
        )}
      </Drawer>
    </div>
  );
}

export default RulechainList;

import { getApiErrorMessage } from "../../services/api_errors";
import { updateRulechain, deleteRulechain } from "../../services/rulechains_service";
import React, { useState, useEffect } from "react";
import { DataGrid } from "@mui/x-data-grid";
import {
  Alert,
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

import RulechainBoard from "./rulechain_board";
import AddRulechain from "./add_rulechain";

function RulechainList({ rulechains, setRulechains, entities, user }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedRulechain, setSelectedRulechain] = useState(null);
  const [editedName, setEditedName] = useState("");
  const [editedDescription, setEditedDescription] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editBoardOpen, setEditBoardOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  
  const handleEditClick = ({ rulechain_id }) => {
    const rulechain = rulechains.find(
      (r) => r.rulechain_id === rulechain_id
    );

    if (!rulechain) return;

    setSelectedRulechain(rulechain);
    setEditedName(rulechain.name);
    setEditedDescription(rulechain.description ?? "");
    setDrawerOpen(true);
  };

  const handleSaveEdit = async () => {
    if (pending) return;
    if (!editedName.trim()) { setError("Name is required."); return; }
    setPending(true);
    setError("");
    if (!selectedRulechain) { setPending(false); return; }
    try {
      await updateRulechain(
        {
          rulechain_id: selectedRulechain.rulechain_id,
          client_id: selectedRulechain.client_id,
          name: editedName,
          description: editedDescription,
          definition: selectedRulechain.definition,
          entity_ids: selectedRulechain.entity_ids,
        }
      );
      setRulechains(prev =>
        prev.map(r =>
          r.rulechain_id === selectedRulechain.rulechain_id
            ? { ...r, ...selectedRulechain, name: editedName, description: editedDescription }
            : r
        )
      );
      setDrawerOpen(false);
      setSelectedRulechain(null);
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not complete the operation. Please try again."));
    } finally { setPending(false); }
  };

  const handleDelete = async ({ rulechain_id }) => {
    if (pending || !window.confirm("Delete this rulechain? Unassign it from its entities first.")) return;
    setPending(true);
    setError("");
    try {
      await deleteRulechain(rulechain_id);
      setRulechains(prev => prev.filter(r => r.rulechain_id !== rulechain_id));
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not complete the operation. Please try again."));
    } finally { setPending(false); }
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

  const handleBoardSave = ({ definition: updatedRulechain }) => {
    setSelectedRulechain(prev => ({
      ...prev,
      definition: updatedRulechain,
    }));
    // volvemos al drawer para el guardado final
    console.log("definition: updatedRulechain",updatedRulechain)
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
          <IconButton disabled={pending} onClick={() => handleDelete(row)}>
            <DeleteIcon />
          </IconButton>
          <IconButton disabled={pending} onClick={() => handleEditClick(row)}>
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
      entities.find(ent => ent.entity_id === rc.entity_ids[0])?.name ||
      "N/A",
    ...rc,
  }));

  return (
    <div
    className="rulechain-list-panel h-full overflow-hidden overflow-x-auto  bg-white border border-gray-300 rounded-[12px] p-2.5 shadow-[0px_0px_10px_rgba(0,0,0,0.1)"
    >
{error && <Alert severity="error">{error}</Alert>}
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
        onClose={() => { if (!pending) setDrawerOpen(false); }}
        sx={{ '& .MuiDrawer-paper': { width: 400, padding: 2 } }}
      >
        {selectedRulechain && (
          <Box className='mt-7'>
            <Toolbar sx={{ justifyContent: 'space-between' }}>
              <h2>Editando: {selectedRulechain.name}</h2>
              <Button disabled={pending} onClick={handleOpenBoardOutside}>Abrir Editor</Button>
            </Toolbar>
            <Box mt={2}>
              {error && <Alert severity="error">{error}</Alert>}
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
                <Button disabled={pending} variant="outlined" onClick={() => setDrawerOpen(false)}>
                  Cancelar
                </Button>
                <Button variant="contained" disabled={pending} onClick={handleSaveEdit}>
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

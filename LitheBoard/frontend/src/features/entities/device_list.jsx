import React, { useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import {
  IconButton,
  Drawer,
  TextField,
  Button,
  Tooltip,
  Toolbar,
  Typography,
  Fab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Slide,
  Stack, Divider
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import AddDevice from './add_device';
import config from '@config';
import StatusBadge from '../../component/status_badge';
import api from "../../services/api"

function DeviceList(props) {
  const {
    entities = [],
    handleAddDevice,
    setEntities,
    user,
    rulechains = [],
  } = props;
  const [isDeviceListVisible, setDeviceListVisible] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [editedName, setEditedName] = useState('');
  const [editedConfig, setEditedConfig] = useState({});
  const [editedRulechainId, setEditedRulechainId] = useState('');
  const [token, setToken] = useState('');
  const [status, setStatus] = useState(0);

  const baseUrl = `${config.BACKEND_URL}:${config.BACKEND_API_PORT}`;

  const isNameInvalid = !editedName.trim();

  // Toggle visibility of device list vs add form
  const showDeviceList = show => setDeviceListVisible(show);

  const handleEditClick = device => {
    if (!Array.isArray(entities)) return;
    // find matching entity by id
    const match = entities.find(e => e.entity_id === device.id);
    if (!match) {
      console.warn(`Entity not found for id ${device.id}`);
      return;
    }
    setSelectedDevice(device);
    setEditedName(match.disp_name || '');
    setEditedConfig({ ...(match.datasource_config || {}) });
    setToken(match.datasource_config?.token || '');
    setEditedRulechainId(match.rulechain_id || '');
    setDrawerOpen(true);
  };

  const handleDelete = async (entity) => {
    try {
      if (!Array.isArray(entities)) return;

      const match = entities.find((e) => e.entity_id === entity.id);
      if (!match) {
        console.warn(`Entity not found for id ${entity.id}`);
        return;
      }

      const { data } = await api.delete(`/api/entity/${entity.id}`);

      if (data.message === "Entity deleted successfully") {
        setEntities((prev) => prev.filter((d) => d.id !== entity.id));
      }
    } catch (error) {
      console.error(
        "Error deleting entity:",
        error.response?.data || error.message
      );
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedDevice || isNameInvalid) return;
    setStatus(1);
    try {
      const updatedData = {
        entity_id: selectedDevice.id,
        disp_name: editedName,
        datasource_config: { ...editedConfig },
        rulechain_id: editedRulechainId,
      };
      
      await api.put(
        `${baseUrl}/api/entity`,
        updatedData
      );
      // update local list
      setEntities(prev =>
        prev.map(d =>
          d.entity_id === selectedDevice.id
            ? { ...d, ...updatedData }
            : d
        )
      );
      setStatus(2);
      handleCancelEdit();
    } catch (err) {
      console.error('Error updating device:', err);
      setStatus(3);
    }
  };

  const handleCancelEdit = () => {
    setDrawerOpen(false);
    setSelectedDevice(null);
    setEditedName('');
    setEditedConfig({});
    setEditedRulechainId('');
    setToken('');
    setStatus(0);
  };

  const columns = [
    { field: 'disp_name', headerName: 'Nombre', flex: 1 },
    { field: 'datasource_type', headerName: 'Datasource Type', flex: 1 },
    { field: 'rulechain_name', headerName: 'Rulechain Assigned', flex: 1 },
    {
      field: 'actions',
      headerName: 'Acciones',
      flex: 1,
      renderCell: params => (
        <>
          <IconButton onClick={e => { e.stopPropagation(); handleDelete(params.row); }}>
            <DeleteIcon />
          </IconButton>
          <IconButton onClick={e => { e.stopPropagation(); handleEditClick(params.row); }}>
            <EditIcon />
          </IconButton>
        </>
      ),
    },
  ];

  // prepare rows with safe defaults
  const rows = Array.isArray(entities)
    ? entities.map(ent => {
        const rc = rulechains.find(r => r.rulechain_id === ent.rulechain_id) || {};
        return {
          id: ent.entity_id ?? '',
          disp_name: ent.disp_name ?? '',
          datasource_type: ent.datasource_type ?? '',
          datasource_config: JSON.stringify(ent.datasource_config ?? {}),
          rulechain_name: rc.name || `${ent.rulechain_id ?? 'No rulechain assigned'}`,
        };
      })
    : [];

  return (
    <>
      {isDeviceListVisible ? (
        <Box       className="min-w-fit w-full h-full bg-white border border-gray-300 rounded-[12px] shadow-[0px_0px_10px_rgba(0,0,0,0.1)] overflow-hidden"
        sx={{ p: 2 }}>
      <Box className="flex justify-between items-center mb-4 px-2 py-1">
            <Typography variant="h5" style={{ color: '#232939' }}>
              Entities Panel
            </Typography>
            <Tooltip title="Add an Entity">
              <Fab
                size="small"
                onClick={() => showDeviceList(false)}
                sx={{
                  backgroundColor: "#232939",
                  color: "#fff",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                  transition: "all 0.2s ease-in-out",
                  "&:hover": {
                    backgroundColor: "#1f2736",
                    transform: "scale(1.05)",
                  },
                }}
              >
                <AddRoundedIcon />
              </Fab>
            </Tooltip>
          </Box>
          <Box className="h-[calc(100%-72px)] w-full">
            <DataGrid
              rows={rows}
              columns={columns}
              pageSizeOptions={[5, 20, 50]}
              initialState={{ pagination: { paginationModel: { page: 0, pageSize: 5 } } }}
              sx={{ borderRadius: 2 }}
            />
          </Box>
        </Box>
      ) : (
        <AddDevice onAddDevice={handleAddDevice} showDeviceList={showDeviceList} user={user} rulechains={rulechains}/>
      )}

      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={handleCancelEdit}
        TransitionComponent={Slide}
        TransitionProps={{ direction: 'left', timeout: 300 }}
        sx={{ '& .MuiDrawer-paper': { width: 400, backgroundColor: '#f5f5f5' } }}
      >
        <Box className="flex flex-col h-full">
          {/* Header */}
          <Box component="header" mt={4} px={2}>
  <Toolbar disableGutters>
    <Typography variant="h6">
      Edit <span className="font-normal">{selectedDevice?.datasource_type}</span> entity
    </Typography>
  </Toolbar>

  <Divider sx={{ my: 2 }} />

  <Stack spacing={1}>
    <Tooltip title="Coloca este token en el mensaje enviado por el dispositivo.">
      <Typography variant="body2" fontStyle="italic">
        Connection credentials:
      </Typography>
    </Tooltip>

    <Tooltip title="Coloca este token en el mensaje enviado por el dispositivo.">
      <Typography variant="body2" fontFamily="monospace">
        {token}
      </Typography>
    </Tooltip>

    {user && selectedDevice && (
  <Stack spacing={1}>
    <Tooltip title="Tópico para suscripción (sub_topic).">
      <Typography variant="body2" fontFamily="monospace">
        {`users/${user.id}/device/${selectedDevice.id}/data/${selectedDevice.datasource_config.sub_topic}`}
      </Typography>
    </Tooltip>

    <Tooltip title="Tópico para publicación (pub_topic).">
      <Typography variant="body2" fontFamily="monospace">
        {`users/${user.id}/device/${selectedDevice.id}/data/${selectedDevice.datasource_config.pub_topic}`}
      </Typography>
    </Tooltip>
  </Stack>
)}
  </Stack>
</Box>

          {/* Body */}
          <Box component="main" className="flex-1 overflow-y-auto p-4 space-y-4">
            <TextField
              required
              error={isNameInvalid}
              helperText={isNameInvalid ? 'El nombre es obligatorio' : ''}
              label="Name"
              fullWidth
              value={editedName}
              onChange={e => setEditedName(e.target.value)}
            />

            <FormControl fullWidth>
              <InputLabel id="rulechain-label">Rulechain Assigned</InputLabel>
              <Select
                labelId="rulechain-label"
                value={editedRulechainId}
                label="Rulechain Assigned"
                onChange={e => setEditedRulechainId(e.target.value.rulechain_id)}
              >
                {rulechains.map((rc, idx) => (
                  <MenuItem key={rc.id ?? idx} value={rc.id ?? rc}> {rc.name ?? rc} </MenuItem>
                ))}
              </Select>
            </FormControl>

            {selectedDevice?.datasource_type === 'MQTT' && (
            <>
              <TextField
                margin="dense"
                label="Subscribe Topic"
                variant="outlined"
                fullWidth
                value={editedConfig.sub_topic || ''}
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
                variant="outlined"
                fullWidth
                value={editedConfig.pub_topic || ''}
                onChange={(e) =>
                  setEditedConfig({
                    ...editedConfig,
                    pub_topic: e.target.value,
                  })
                }
              />
              <TextField
                margin="dense"
                label="Heartbeat Timeout"
                variant="outlined"
                fullWidth
                value={editedConfig.heartbeat_timeout || ''}
                onChange={(e) =>
                  setEditedConfig({
                    ...editedConfig,
                    heartbeat_timeout: e.target.value,
                  })
                }
              />
            </>
          )}

          {selectedDevice?.datasource_type === 'API' && (
            <>
              <TextField
                margin="dense"
                label="Base URL"
                variant="outlined"
                fullWidth
                value={editedConfig.base_url || ''}
                onChange={(e) =>
                  setEditedConfig({ ...editedConfig, base_url: e.target.value })
                }
              />
              <TextField
                margin="dense"
                label="HTTP Method"
                variant="outlined"
                fullWidth
                value={editedConfig.method || ''}
                onChange={(e) =>
                  setEditedConfig({ ...editedConfig, method: e.target.value })
                }
              />
              <TextField
                margin="dense"
                label="Polling Interval"
                variant="outlined"
                fullWidth
                value={editedConfig.pollingInterval || ''}
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
                variant="outlined"
                fullWidth
                value={
                  typeof editedConfig.query_params === 'string'
                    ? editedConfig.query_params
                    : JSON.stringify(editedConfig.query_params, null, 2)
                }
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
                variant="outlined"
                fullWidth
                value={
                  typeof editedConfig.headers === 'string'
                    ? editedConfig.headers
                    : JSON.stringify(editedConfig.headers, null, 2)
                }
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
                variant="outlined"
                fullWidth
                multiline
                minRows={3}
                value={
                  typeof editedConfig.request_body === 'string'
                    ? editedConfig.request_body
                    : JSON.stringify(editedConfig.request_body, null, 2)
                }
                onChange={(e) =>
                  setEditedConfig({
                    ...editedConfig,
                    request_body: e.target.value,
                  })
                }
              />
            </>
          )}
          </Box>

          {/* Footer */}
          <Box component="footer" className="flex justify-end gap-2 p-4">
            <Button onClick={handleCancelEdit}>Cancel</Button>
            <Button variant="contained" onClick={handleSaveEdit} disabled={isNameInvalid}>Save</Button>
            <StatusBadge status={status} />
          </Box>
        </Box>
      </Drawer>
    </>
  );
}

export default DeviceList;

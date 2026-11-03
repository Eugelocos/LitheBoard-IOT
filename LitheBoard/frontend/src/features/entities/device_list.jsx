import { updateEntity, deleteEntity } from "../../services/entities_service";
import { getApiErrorMessage } from "../../services/api_errors";
import React, { useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import {
  Alert,
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
import StatusBadge from '../../component/status_badge';

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
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);


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
    setEditedName(match.name || '');
    setEditedConfig({ ...(match.datasource_config || {}) });
    setToken(match.credential?.token || '');
    setEditedRulechainId(match.rulechain_id || '');
    setError('');
    setDrawerOpen(true);
  };

  const handleDelete = async (entity) => {
    if (deleting || !window.confirm('Delete this entity and its history? Linked widgets and alarms will be disconnected.')) return;
    setDeleting(true);
    setError('');
    try {
      if (!Array.isArray(entities)) return;

      const match = entities.find((e) => e.entity_id === entity.id);
      if (!match) {
        console.warn(`Entity not found for id ${entity.id}`);
        return;
      }

      // 204 sin cuerpo: si no hubo error, la entidad se eliminó.
      await deleteEntity(entity.id);
      setEntities((prev) => prev.filter((d) => d.entity_id !== entity.id));
    } catch (error) {
      setError(getApiErrorMessage(error, 'Could not delete entity. Please try again.'));
    } finally {
      setDeleting(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedDevice || isNameInvalid || status === 1) return;
    setError('');
    setStatus(1);
    try {
      const updatedData = {
        entity_id: selectedDevice.id,
        name: editedName,
        datasource_config: { ...editedConfig },
        // Zero selects the built-in default storage behavior.
        rulechain_id: editedRulechainId || 0,
      };
      
      await updateEntity(updatedData);
      // update local list
      setEntities(prev =>
        prev.map(d =>
          d.entity_id === selectedDevice.id
            ? { ...d, ...updatedData }
            : d
        )
      );
      setStatus(2);
      setDrawerOpen(false);
      setSelectedDevice(null);
      setStatus(0);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not update entity. Please try again.'));
      setStatus(3);
    }
  };

  const handleCancelEdit = () => {
    if (status === 1) return;
    setDrawerOpen(false);
    setSelectedDevice(null);
    setEditedName('');
    setEditedConfig({});
    setEditedRulechainId('');
    setToken('');
    setStatus(0);
  };

  const columns = [
    { field: 'name', headerName: 'Nombre', flex: 1 },
    { field: 'datasource_type', headerName: 'Datasource Type', flex: 1 },
    { field: 'rulechain_name', headerName: 'Rulechain Assigned', flex: 1 },
    {
      field: 'actions',
      headerName: 'Acciones',
      flex: 1,
      renderCell: params => (
        <>
          <IconButton disabled={deleting} aria-label="Delete entity" onClick={e => { e.stopPropagation(); handleDelete(params.row); }}>
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
          name: ent.name ?? '',
          datasource_type: ent.datasource_type ?? '',
          datasource_config: JSON.stringify(ent.datasource_config ?? {}),
          rulechain_name: rc.name || `${ent.rulechain_id ?? 'No rulechain assigned'}`,
        };
      })
    : [];

  return (
    <>
      {error && !drawerOpen && <Alert severity="error">{error}</Alert>}
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
        {`users/${user.client_id}/device/${selectedDevice.id}/data/${editedConfig.sub_topic}`}
      </Typography>
    </Tooltip>

    <Tooltip title="Tópico para publicación (pub_topic).">
      <Typography variant="body2" fontFamily="monospace">
        {`users/${user.client_id}/device/${selectedDevice.id}/data/${editedConfig.pub_topic}`}
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
                onChange={e => setEditedRulechainId(e.target.value)}
              >
                <MenuItem value="">Default: store received data</MenuItem>
                {rulechains.map(rc => (
                  <MenuItem key={rc.rulechain_id} value={rc.rulechain_id}>{rc.name}</MenuItem>
                ))}
              </Select>
            </FormControl>

            {selectedDevice?.datasource_type === 'mqtt' && (
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
                value={editedConfig.heartbeat_timeout_s || ''}
                onChange={(e) =>
                  setEditedConfig({
                    ...editedConfig,
                    heartbeat_timeout_s: e.target.value,
                  })
                }
              />
            </>
          )}

          {selectedDevice?.datasource_type === 'api' && (
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
                value={editedConfig.polling_interval_ms || ''}
                onChange={(e) =>
                  setEditedConfig({
                    ...editedConfig,
                    polling_interval_ms: e.target.value,
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
          {error && <Alert severity="error">{error}</Alert>}
          <Box component="footer" className="flex justify-end gap-2 p-4">
            <Button disabled={status === 1} onClick={handleCancelEdit}>Cancel</Button>
            <Button variant="contained" onClick={handleSaveEdit} disabled={isNameInvalid || status === 1}>Save</Button>
            <StatusBadge status={status} />
          </Box>
        </Box>
      </Drawer>
    </>
  );
}

export default DeviceList;

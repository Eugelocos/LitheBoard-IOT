import { getApiErrorMessage } from "../../services/api_errors";
import { createAlarm, updateAlarm } from "../../services/alarms_service";
import React, { useState } from "react";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import {
  Alert,
  IconButton,
  TextField,
  Button,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Typography,
  Grid,
  Container
} from "@mui/material";

function AddAlarm({ client_id, onCancel, onSave, entities, alarm = null }) {
  const [selected_entity, setSelectedEntity] = useState(alarm?.entity_id ?? "");
  const [threshold, setValor] = useState(alarm?.threshold ?? "");
  const [data_key, setSelectedKey] = useState(alarm?.data_key ?? "");
  const [condition, setCondition] = useState(alarm?.operator ?? "");


  const handleEntityChange = (e) => {
    setSelectedEntity(e.target.value);
  };

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const handleSaveAlarm = async () => {
    if (submitting) return;
    setError("");
    if (!selected_entity || threshold === "" || !Number.isFinite(Number(threshold)) || !data_key.trim() || !condition) {
      setError("Complete all fields and enter a valid threshold.");
      return;
    }
    setSubmitting(true);
    try {
      const payload = { entity_id: selected_entity, threshold: Number(threshold), client_id, data_key: data_key.trim(), operator: condition };
      const saved = alarm ? await updateAlarm(alarm.alarm_id, payload) : await createAlarm(payload);
      onSave(saved);
    } catch (error) {
      setError(getApiErrorMessage(error, "Could not save alarm. Please try again."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container>
      {error && <Alert severity="error">{error}</Alert>}
      <Grid container spacing={2} alignItems="center">
        <Grid item>
          <IconButton disabled={submitting} onClick={onCancel}>
            <ArrowBackRoundedIcon />
          </IconButton>
        </Grid>
        <Grid item>
          <Typography variant="h5" component="h2">
            {alarm ? "Editar alarma" : "Crear Alarma"}
          </Typography>
        </Grid>
      </Grid>

      <Grid container spacing={3} marginTop={2}>
        <Grid item xs={12}>
          <FormControl fullWidth variant="outlined">
            <InputLabel id="entity-label">Seleccionar Dispositivo</InputLabel>
            <Select
              labelId="entity-label"
              id="entity"
              value={selected_entity}
              onChange={handleEntityChange}
              label="Seleccionar Dispositivo"
            >
              <MenuItem value="">
                <em>Seleccione un dispositivo</em>
              </MenuItem>
              {entities.map((entity) => (
                <MenuItem key={entity.entity_id} value={entity.entity_id}>
                  {entity.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <TextField
            id="threshold"
            label="Valor"
            type="number"
            variant="outlined"
            fullWidth
            value={threshold}
            onChange={(e) => setValor(e.target.value)}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            id="data_key"
            label="Selected Key"
            type="text"
            variant="outlined"
            fullWidth
            value={data_key}
            onChange={(e) => setSelectedKey(e.target.value)}
          />
        </Grid>

        <Grid item xs={12}>
          <FormControl fullWidth variant="outlined">
            <InputLabel id="condition-label">Condición</InputLabel>
            <Select
              labelId="condition-label"
              id="condition"
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              label="Condición"
            >
              <MenuItem value="">
                <em>Seleccione una condición</em>
              </MenuItem>
              <MenuItem value="greater_than">Mayor que</MenuItem>
              <MenuItem value="less_than">Menor que</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} display="flex" justifyContent="flex-end">
          <Button
            variant="contained"
            color="primary"
            disabled={submitting} onClick={handleSaveAlarm}
          >
            Guardar
          </Button>
        </Grid>
      </Grid>
    </Container>
  );
}

export default AddAlarm;

import React, { useState } from "react";
import axios from "axios";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import {
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

function AddAlarm({ clientId, onCancel, onSave, dispositivos }) {
  const [selectedEntity, setSelectedEntity] = useState("");
  const [valor, setValor] = useState("");
  const [selectedKey, setSelectedKey] = useState("");
  const [condicion, setCondicion] = useState("");

  const handleEntityChange = (e) => {
    setSelectedEntity(e.target.value);
  };

  const handleSaveAlarm = () => {
    const alarmData = {
      entity_id: selectedEntity,
      valor,
      client_id: clientId,
      selected_key: selectedKey,
      alarm_condition: condicion
    };

    axios
      .post("http://localhost:3001/api/alarms/instert", alarmData)
      .then((response) => {
        console.log("Alarm saved:", response.data);
        setSelectedEntity("");
        setValor("");
        setSelectedKey("");
        setCondicion("");
        onSave();
      })
      .catch((error) => {
        console.error("Error saving alarm:", error);
      });
  };

  return (
    <Container>
      <Grid container spacing={2} alignItems="center">
        <Grid item>
          <IconButton onClick={onCancel}>
            <ArrowBackRoundedIcon />
          </IconButton>
        </Grid>
        <Grid item>
          <Typography variant="h5" component="h2">
            Crear Alarma
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
              value={selectedEntity}
              onChange={handleEntityChange}
              label="Seleccionar Dispositivo"
            >
              <MenuItem value="">
                <em>Seleccione un dispositivo</em>
              </MenuItem>
              {dispositivos.map((entity) => (
                <MenuItem key={entity.entity_id} value={entity.entity_id}>
                  {entity.disp_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <TextField
            id="valor"
            label="Valor"
            type="number"
            variant="outlined"
            fullWidth
            value={valor}
            onChange={(e) => setValor(e.target.value)}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            id="selectedKey"
            label="Selected Key"
            type="text"
            variant="outlined"
            fullWidth
            value={selectedKey}
            onChange={(e) => setSelectedKey(e.target.value)}
          />
        </Grid>

        <Grid item xs={12}>
          <FormControl fullWidth variant="outlined">
            <InputLabel id="condicion-label">Condición</InputLabel>
            <Select
              labelId="condicion-label"
              id="condicion"
              value={condicion}
              onChange={(e) => setCondicion(e.target.value)}
              label="Condición"
            >
              <MenuItem value="">
                <em>Seleccione una condición</em>
              </MenuItem>
              <MenuItem value=">">Mayor que</MenuItem>
              <MenuItem value="<">Menor que</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} display="flex" justifyContent="flex-end">
          <Button
            variant="contained"
            color="primary"
            onClick={handleSaveAlarm}
          >
            Guardar
          </Button>
        </Grid>
      </Grid>
    </Container>
  );
}

export default AddAlarm;

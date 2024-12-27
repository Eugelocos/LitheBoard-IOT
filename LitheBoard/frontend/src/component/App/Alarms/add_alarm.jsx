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


function AddAlarm({ client_id, onCancel, onSave, entities }) {
  const [selected_entity, setSelectedEntity] = useState("");
  const [valor, setValor] = useState("");
  const [selected_key, setSelectedKey] = useState("");
  const [condition, setCondition] = useState("");

  const baseURL = `http://backend:3001`;

  const handleEntityChange = (e) => {
    setSelectedEntity(e.target.value);
  };

  const handleSaveAlarm = () => {
    const alarmData = {
      entity_id: selected_entity,
      valor,
      client_id: client_id,
      selected_key: selected_key,
      alarm_condition: condition
    };

    axios
      .post(`${baseURL}/api/alarms/insert`, alarmData)
      .then((response) => {
        console.log("Alarm saved:", response.data);
        setSelectedEntity("");
        setValor("");
        setSelectedKey("");
        setCondition("");
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
              value={selected_entity}
              onChange={handleEntityChange}
              label="Seleccionar Dispositivo"
            >
              <MenuItem value="">
                <em>Seleccione un dispositivo</em>
              </MenuItem>
              {entities.map((entity) => (
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
            id="selected_key"
            label="Selected Key"
            type="text"
            variant="outlined"
            fullWidth
            value={selected_key}
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

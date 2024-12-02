import React, { useState } from "react";
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
} from "@mui/material";
import { Link, Navigate } from "react-router-dom";
import axios from "axios";
import "./loginPage.css";
import zIndex from "@mui/material/styles/zIndex";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faGear,
  faHouseSignal,
  faChartLine,
} from "@fortawesome/free-solid-svg-icons";
import bcrypt from "bcryptjs";
import { green } from "@mui/material/colors";
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';

function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    adminEmail: "",
    access_level: "2",  // Por defecto, nivel de usuario
  });
  const [registered, setRegistered] = useState(false);
  const [willAdmin, setWillAdmin] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const hashedPassword = await bcrypt.hash(formData.password, 10);
      const formDataWithHashedPassword = {
        ...formData,
        password: hashedPassword,
      };

      const response = await axios.post(
        "http://localhost:3001/api/register",
        formDataWithHashedPassword
      );
      console.log("Respuesta del servidor:", response.data);
      setRegistered(true);
    } catch (error) {
      console.error("Error al registrar:", error);
    }
  };

  const handleAdminChange = (event) => {
    setWillAdmin(event.target.checked);
    setFormData((prevData) => ({
      ...prevData,
      access_level: event.target.checked ? "1" : "2",  // Admin: 1, Usuario: 2
    }));
  };

  return (
    <>
    <Container component="main" maxWidth="xs" sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", zIndex: 1 }}>
      <Paper elevation={3} sx={{ padding: 4, backgroundColor: "#232939", color: "#FFFFFF", borderRadius: 2, zIndex: 2 }}>
        <Typography component="h1" variant="h5" align="center">Register</Typography>
        <Box component="form" onSubmit={handleRegister} sx={{ mt: 3 }}>
          <TextField required fullWidth id="name" label="Nombre" name="name" autoComplete="name" autoFocus value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} InputLabelProps={{ style: { color: "#FFFFFF" } }} InputProps={{ style: { color: "#FFFFFF" } }} variant="filled" sx={{ backgroundColor: "#1C1C1C", borderRadius: 1 }} />
          <TextField required fullWidth id="email" label="Correo Electrónico" name="email" autoComplete="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} InputLabelProps={{ style: { color: "#FFFFFF" } }} InputProps={{ style: { color: "#FFFFFF" } }} variant="filled" sx={{ backgroundColor: "#1C1C1C", borderRadius: 1 }} />
          <TextField required fullWidth name="password" label="Contraseña" type="password" id="password" autoComplete="current-password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} InputLabelProps={{ style: { color: "#FFFFFF" } }} InputProps={{ style: { color: "#FFFFFF" } }} variant="filled" sx={{ backgroundColor: "#1C1C1C", borderRadius: 1 }} />

          <FormControlLabel control={<Checkbox checked={willAdmin} onChange={handleAdminChange} />} label="Admin" />
          
          {!willAdmin && (
            <TextField fullWidth id="adminEmail" label="Correo Electrónico del Administrador" name="adminEmail" value={formData.adminEmail} onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })} InputLabelProps={{ style: { color: "#FFFFFF" } }} InputProps={{ style: { color: "#FFFFFF" } }} variant="filled" sx={{ backgroundColor: "#1C1C1C", borderRadius: 1 }} />
          )}

          {!registered && (
            <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2, backgroundColor: "#FFFFFF", color: "#232939", textTransform: "none" }}>Register</Button>
          )}
          {registered && (
            <Typography variant="body2" align="center" color="green">
              Registro exitoso. Ahora puedes <Link to="/login" style={{ color: "#FFFFFF" }}>iniciar sesión</Link>.
            </Typography>
          )}
        </Box>
      </Paper>
    </Container>
      <section
        id="background"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 0,
        }}
      >
        <div className="row">
          <div className="iconRow">
            <FontAwesomeIcon icon={faGear} className="icon" />
            <FontAwesomeIcon icon={faHouseSignal} className="icon" />
            <FontAwesomeIcon icon={faChartLine} className="icon" />
            <FontAwesomeIcon icon={faGear} className="icon" />
            <FontAwesomeIcon icon={faHouseSignal} className="icon" />
            <FontAwesomeIcon icon={faChartLine} className="icon" />
            <FontAwesomeIcon icon={faGear} className="icon" />
            <FontAwesomeIcon icon={faHouseSignal} className="icon" />
            <FontAwesomeIcon icon={faChartLine} className="icon" />
          </div>
          <div className="iconRow">
            <FontAwesomeIcon icon={faGear} className="icon" />
            <FontAwesomeIcon icon={faHouseSignal} className="icon" />
            <FontAwesomeIcon icon={faChartLine} className="icon" />
            <FontAwesomeIcon icon={faGear} className="icon" />
            <FontAwesomeIcon icon={faHouseSignal} className="icon" />
            <FontAwesomeIcon icon={faChartLine} className="icon" />
            <FontAwesomeIcon icon={faGear} className="icon" />
            <FontAwesomeIcon icon={faHouseSignal} className="icon" />
            <FontAwesomeIcon icon={faChartLine} className="icon" />
          </div>
        </div>
        <div className="row">
          <div className="iconRow">
            <FontAwesomeIcon icon={faGear} className="icon" />
            <FontAwesomeIcon icon={faHouseSignal} className="icon" />
            <FontAwesomeIcon icon={faChartLine} className="icon" />
            <FontAwesomeIcon icon={faGear} className="icon" />
            <FontAwesomeIcon icon={faHouseSignal} className="icon" />
            <FontAwesomeIcon icon={faChartLine} className="icon" />
            <FontAwesomeIcon icon={faGear} className="icon" />
            <FontAwesomeIcon icon={faHouseSignal} className="icon" />
            <FontAwesomeIcon icon={faChartLine} className="icon" />
          </div>
          <div className="iconRow">
            <FontAwesomeIcon icon={faGear} className="icon" />
            <FontAwesomeIcon icon={faHouseSignal} className="icon" />
            <FontAwesomeIcon icon={faChartLine} className="icon" />
            <FontAwesomeIcon icon={faGear} className="icon" />
            <FontAwesomeIcon icon={faHouseSignal} className="icon" />
            <FontAwesomeIcon icon={faChartLine} className="icon" />
            <FontAwesomeIcon icon={faGear} className="icon" />
            <FontAwesomeIcon icon={faHouseSignal} className="icon" />
            <FontAwesomeIcon icon={faChartLine} className="icon" />
          </div>
        </div>
        <div className="row">
          <div className="iconRow">
            <FontAwesomeIcon icon={faGear} className="icon" />
            <FontAwesomeIcon icon={faHouseSignal} className="icon" />
            <FontAwesomeIcon icon={faChartLine} className="icon" />
            <FontAwesomeIcon icon={faGear} className="icon" />
            <FontAwesomeIcon icon={faHouseSignal} className="icon" />
            <FontAwesomeIcon icon={faChartLine} className="icon" />
            <FontAwesomeIcon icon={faGear} className="icon" />
            <FontAwesomeIcon icon={faHouseSignal} className="icon" />
            <FontAwesomeIcon icon={faChartLine} className="icon" />
          </div>
          <div className="iconRow">
            <FontAwesomeIcon icon={faGear} className="icon" />
            <FontAwesomeIcon icon={faHouseSignal} className="icon" />
            <FontAwesomeIcon icon={faChartLine} className="icon" />
            <FontAwesomeIcon icon={faGear} className="icon" />
            <FontAwesomeIcon icon={faHouseSignal} className="icon" />
            <FontAwesomeIcon icon={faChartLine} className="icon" />
            <FontAwesomeIcon icon={faGear} className="icon" />
            <FontAwesomeIcon icon={faHouseSignal} className="icon" />
            <FontAwesomeIcon icon={faChartLine} className="icon" />
          </div>
        </div>
        <div className="row">
          <div className="iconRow">
            <FontAwesomeIcon icon={faGear} className="icon" />
            <FontAwesomeIcon icon={faHouseSignal} className="icon" />
            <FontAwesomeIcon icon={faChartLine} className="icon" />
            <FontAwesomeIcon icon={faGear} className="icon" />
            <FontAwesomeIcon icon={faHouseSignal} className="icon" />
            <FontAwesomeIcon icon={faChartLine} className="icon" />
            <FontAwesomeIcon icon={faGear} className="icon" />
            <FontAwesomeIcon icon={faHouseSignal} className="icon" />
            <FontAwesomeIcon icon={faChartLine} className="icon" />
          </div>
          <div className="iconRow">
            <FontAwesomeIcon icon={faGear} className="icon" />
            <FontAwesomeIcon icon={faHouseSignal} className="icon" />
            <FontAwesomeIcon icon={faChartLine} className="icon" />
            <FontAwesomeIcon icon={faGear} className="icon" />
            <FontAwesomeIcon icon={faHouseSignal} className="icon" />
            <FontAwesomeIcon icon={faChartLine} className="icon" />
            <FontAwesomeIcon icon={faGear} className="icon" />
            <FontAwesomeIcon icon={faHouseSignal} className="icon" />
            <FontAwesomeIcon icon={faChartLine} className="icon" />
          </div>
        </div>
        <div className="row">
          <div className="iconRow">
            <FontAwesomeIcon icon={faGear} className="icon" />
            <FontAwesomeIcon icon={faHouseSignal} className="icon" />
            <FontAwesomeIcon icon={faChartLine} className="icon" />
            <FontAwesomeIcon icon={faGear} className="icon" />
            <FontAwesomeIcon icon={faHouseSignal} className="icon" />
            <FontAwesomeIcon icon={faChartLine} className="icon" />
            <FontAwesomeIcon icon={faGear} className="icon" />
            <FontAwesomeIcon icon={faHouseSignal} className="icon" />
            <FontAwesomeIcon icon={faChartLine} className="icon" />
          </div>
          <div className="iconRow">
            <FontAwesomeIcon icon={faGear} className="icon" />
            <FontAwesomeIcon icon={faHouseSignal} className="icon" />
            <FontAwesomeIcon icon={faChartLine} className="icon" />
            <FontAwesomeIcon icon={faGear} className="icon" />
            <FontAwesomeIcon icon={faHouseSignal} className="icon" />
            <FontAwesomeIcon icon={faChartLine} className="icon" />
            <FontAwesomeIcon icon={faGear} className="icon" />
            <FontAwesomeIcon icon={faHouseSignal} className="icon" />
            <FontAwesomeIcon icon={faChartLine} className="icon" />
          </div>
        </div>
        <div className="row">
          <div className="iconRow">
            <FontAwesomeIcon icon={faGear} className="icon" />
            <FontAwesomeIcon icon={faHouseSignal} className="icon" />
            <FontAwesomeIcon icon={faChartLine} className="icon" />
            <FontAwesomeIcon icon={faGear} className="icon" />
            <FontAwesomeIcon icon={faHouseSignal} className="icon" />
            <FontAwesomeIcon icon={faChartLine} className="icon" />
            <FontAwesomeIcon icon={faGear} className="icon" />
            <FontAwesomeIcon icon={faHouseSignal} className="icon" />
            <FontAwesomeIcon icon={faChartLine} className="icon" />
          </div>
          <div className="iconRow">
            <FontAwesomeIcon icon={faGear} className="icon" />
            <FontAwesomeIcon icon={faHouseSignal} className="icon" />
            <FontAwesomeIcon icon={faChartLine} className="icon" />
            <FontAwesomeIcon icon={faGear} className="icon" />
            <FontAwesomeIcon icon={faHouseSignal} className="icon" />
            <FontAwesomeIcon icon={faChartLine} className="icon" />
            <FontAwesomeIcon icon={faGear} className="icon" />
            <FontAwesomeIcon icon={faHouseSignal} className="icon" />
            <FontAwesomeIcon icon={faChartLine} className="icon" />
          </div>
        </div>
        <div className="row">
          <div className="iconRow">
            <FontAwesomeIcon icon={faGear} className="icon" />
            <FontAwesomeIcon icon={faHouseSignal} className="icon" />
            <FontAwesomeIcon icon={faChartLine} className="icon" />
            <FontAwesomeIcon icon={faGear} className="icon" />
            <FontAwesomeIcon icon={faHouseSignal} className="icon" />
            <FontAwesomeIcon icon={faChartLine} className="icon" />
            <FontAwesomeIcon icon={faGear} className="icon" />
            <FontAwesomeIcon icon={faHouseSignal} className="icon" />
            <FontAwesomeIcon icon={faChartLine} className="icon" />
          </div>
          <div className="iconRow">
            <FontAwesomeIcon icon={faGear} className="icon" />
            <FontAwesomeIcon icon={faHouseSignal} className="icon" />
            <FontAwesomeIcon icon={faChartLine} className="icon" />
            <FontAwesomeIcon icon={faGear} className="icon" />
            <FontAwesomeIcon icon={faHouseSignal} className="icon" />
            <FontAwesomeIcon icon={faChartLine} className="icon" />
            <FontAwesomeIcon icon={faGear} className="icon" />
            <FontAwesomeIcon icon={faHouseSignal} className="icon" />
            <FontAwesomeIcon icon={faChartLine} className="icon" />
          </div>
        </div>
        <div className="row">
          <div className="iconRow">
            <FontAwesomeIcon icon={faGear} className="icon" />
            <FontAwesomeIcon icon={faHouseSignal} className="icon" />
            <FontAwesomeIcon icon={faChartLine} className="icon" />
            <FontAwesomeIcon icon={faGear} className="icon" />
            <FontAwesomeIcon icon={faHouseSignal} className="icon" />
            <FontAwesomeIcon icon={faChartLine} className="icon" />
            <FontAwesomeIcon icon={faGear} className="icon" />
            <FontAwesomeIcon icon={faHouseSignal} className="icon" />
            <FontAwesomeIcon icon={faChartLine} className="icon" />
          </div>
          <div className="iconRow">
            <FontAwesomeIcon icon={faGear} className="icon" />
            <FontAwesomeIcon icon={faHouseSignal} className="icon" />
            <FontAwesomeIcon icon={faChartLine} className="icon" />
            <FontAwesomeIcon icon={faGear} className="icon" />
            <FontAwesomeIcon icon={faHouseSignal} className="icon" />
            <FontAwesomeIcon icon={faChartLine} className="icon" />
            <FontAwesomeIcon icon={faGear} className="icon" />
            <FontAwesomeIcon icon={faHouseSignal} className="icon" />
            <FontAwesomeIcon icon={faChartLine} className="icon" />
          </div>
        </div>
        <div className="row">
          <div className="iconRow">
            <FontAwesomeIcon icon={faGear} className="icon" />
            <FontAwesomeIcon icon={faHouseSignal} className="icon" />
            <FontAwesomeIcon icon={faChartLine} className="icon" />
            <FontAwesomeIcon icon={faGear} className="icon" />
            <FontAwesomeIcon icon={faHouseSignal} className="icon" />
            <FontAwesomeIcon icon={faChartLine} className="icon" />
            <FontAwesomeIcon icon={faGear} className="icon" />
            <FontAwesomeIcon icon={faHouseSignal} className="icon" />
            <FontAwesomeIcon icon={faChartLine} className="icon" />
          </div>
          <div className="iconRow">
            <FontAwesomeIcon icon={faGear} className="icon" />
            <FontAwesomeIcon icon={faHouseSignal} className="icon" />
            <FontAwesomeIcon icon={faChartLine} className="icon" />
            <FontAwesomeIcon icon={faGear} className="icon" />
            <FontAwesomeIcon icon={faHouseSignal} className="icon" />
            <FontAwesomeIcon icon={faChartLine} className="icon" />
            <FontAwesomeIcon icon={faGear} className="icon" />
            <FontAwesomeIcon icon={faHouseSignal} className="icon" />
            <FontAwesomeIcon icon={faChartLine} className="icon" />
          </div>
        </div>
        <div className="row">
          <div className="iconRow">
            <FontAwesomeIcon icon={faGear} className="icon" />
            <FontAwesomeIcon icon={faHouseSignal} className="icon" />
            <FontAwesomeIcon icon={faChartLine} className="icon" />
            <FontAwesomeIcon icon={faGear} className="icon" />
            <FontAwesomeIcon icon={faHouseSignal} className="icon" />
            <FontAwesomeIcon icon={faChartLine} className="icon" />
            <FontAwesomeIcon icon={faGear} className="icon" />
            <FontAwesomeIcon icon={faHouseSignal} className="icon" />
            <FontAwesomeIcon icon={faChartLine} className="icon" />
          </div>
          <div className="iconRow">
            <FontAwesomeIcon icon={faGear} className="icon" />
            <FontAwesomeIcon icon={faHouseSignal} className="icon" />
            <FontAwesomeIcon icon={faChartLine} className="icon" />
            <FontAwesomeIcon icon={faGear} className="icon" />
            <FontAwesomeIcon icon={faHouseSignal} className="icon" />
            <FontAwesomeIcon icon={faChartLine} className="icon" />
            <FontAwesomeIcon icon={faGear} className="icon" />
            <FontAwesomeIcon icon={faHouseSignal} className="icon" />
            <FontAwesomeIcon icon={faChartLine} className="icon" />
          </div>
        </div>
        <div className="row">
          <div className="iconRow">
            <FontAwesomeIcon icon={faGear} className="icon" />
            <FontAwesomeIcon icon={faHouseSignal} className="icon" />
            <FontAwesomeIcon icon={faChartLine} className="icon" />
            <FontAwesomeIcon icon={faGear} className="icon" />
            <FontAwesomeIcon icon={faHouseSignal} className="icon" />
            <FontAwesomeIcon icon={faChartLine} className="icon" />
            <FontAwesomeIcon icon={faGear} className="icon" />
            <FontAwesomeIcon icon={faHouseSignal} className="icon" />
            <FontAwesomeIcon icon={faChartLine} className="icon" />
          </div>
          <div className="iconRow">
            <FontAwesomeIcon icon={faGear} className="icon" />
            <FontAwesomeIcon icon={faHouseSignal} className="icon" />
            <FontAwesomeIcon icon={faChartLine} className="icon" />
            <FontAwesomeIcon icon={faGear} className="icon" />
            <FontAwesomeIcon icon={faHouseSignal} className="icon" />
            <FontAwesomeIcon icon={faChartLine} className="icon" />
            <FontAwesomeIcon icon={faGear} className="icon" />
            <FontAwesomeIcon icon={faHouseSignal} className="icon" />
            <FontAwesomeIcon icon={faChartLine} className="icon" />
          </div>
        </div>
      </section>
    </>
  );
}

export default Register;

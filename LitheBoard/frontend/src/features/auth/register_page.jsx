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
import { register } from "../../services/auth_service";
import "./login_page.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faGear,
  faHouseSignal,
  faChartLine,
} from "@fortawesome/free-solid-svg-icons";
import { green } from "@mui/material/colors";
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import {IconButton, InputAdornment } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
function Register() {
  const [form_data, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    admin_email: "",
    role: "client",  // Por defecto, nivel de usuario
  });
  const [registered, setRegistered] = useState(false);
  const [will_admin, setWillAdmin] = useState(false);

  const [show_password, setShowPassword] = useState(false);


  const togglePasswordVisibility = () => {
    setShowPassword(!show_password);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      // El hash de la contraseña lo hace el backend (client_service).
      await register(form_data);
      setRegistered(true);
    } catch (error) {
      console.error("Register error:", error);
    }
  };

  const handleAdminChange = (event) => {
    setWillAdmin(event.target.checked);
    setFormData((prevData) => ({
      ...prevData,
      role: event.target.checked ? "admin" : "client",  // Admin: 1, CommonUser: 2
    }));
  };

  return (
    <>
    <Container component="main" maxWidth="xs" sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", zIndex: 1 }}>
      <Paper elevation={3} sx={{ padding: 4, backgroundColor: "#232939", color: "#FFFFFF", borderRadius: 2, zIndex: 2 }}>
        <Typography component="h1" variant="h5" align="center">Register</Typography>
        <Box component="form" onSubmit={handleRegister} sx={{ mt: 3 }}>
          <TextField required fullWidth id="name" label="Nombre" name="name" autoComplete="name" autoFocus value={form_data.name} onChange={(e) => setFormData({ ...form_data, name: e.target.value })} InputLabelProps={{ style: { color: "#FFFFFF" } }} InputProps={{ style: { color: "#FFFFFF" } }} variant="filled" sx={{ backgroundColor: "#1C1C1C", borderRadius: 1 }} />
          <TextField required fullWidth id="email" label="Correo Electrónico" name="email" autoComplete="email" value={form_data.email} onChange={(e) => setFormData({ ...form_data, email: e.target.value })} InputLabelProps={{ style: { color: "#FFFFFF" } }} InputProps={{ style: { color: "#FFFFFF" } }} variant="filled" sx={{ backgroundColor: "#1C1C1C", borderRadius: 1 }} />
          <TextField
      margin="normal"
      required
      fullWidth
      name="password"
      label="Contraseña"
      type={show_password ? "text" : "password"} // Cambia entre "text" y "password"
      id="password"
      autoComplete="current-password"
      value={form_data.password}
      onChange={(e) =>
        setFormData({ ...form_data, password: e.target.value.trim() })
      }
      InputLabelProps={{ style: { color: "#292323" } }}
      InputProps={{
        style: { color: "#292323" },
        endAdornment: (
          <InputAdornment position="end">
            <IconButton onClick={togglePasswordVisibility} edge="end">
              {show_password ? <VisibilityOff /> : <Visibility />}
            </IconButton>
          </InputAdornment>
        ),
      }}
      variant="filled"
      sx={{ backgroundColor: "#ede9fe", borderRadius: 1 }}
    />

          <FormControlLabel control={<Checkbox checked={will_admin} onChange={handleAdminChange} />} label="Admin" />
          
          {!will_admin && (
            <TextField fullWidth id="admin_email" label="Correo Electrónico del Administrador" name="admin_email" value={form_data.admin_email} onChange={(e) => setFormData({ ...form_data, admin_email: e.target.value })} InputLabelProps={{ style: { color: "#FFFFFF" } }} InputProps={{ style: { color: "#FFFFFF" } }} variant="filled" sx={{ backgroundColor: "#1C1C1C", borderRadius: 1 }} />
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

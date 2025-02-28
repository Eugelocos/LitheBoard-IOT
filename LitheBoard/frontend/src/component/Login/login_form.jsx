import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TextField, Button, Typography, Link } from "@mui/material";
import axios from "axios";
import config from "@config";
import {
    Box,
  } from "@mui/material";
  import { IconButton, InputAdornment } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";



const LoginForm = ({ onLoginSuccess }) => {
  const [form_data, setFormData] = useState({ email: "", password: "" });
  const [logged_in, setLoggedIn] = useState(false);
  const [error, setError] = useState("");
  const [show_password, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const [status, setStatus] = useState(0); // 0: initial, 1: loading, 2: success, 3: error

  const base_url = `${config.BACKEND_URL}:${config.BACKEND_API_PORT}`;
const togglePasswordVisibility = () => {
    setShowPassword(!show_password);
  };
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // Lógica de login
      const response = await axios.post(`${base_url}/api/login`, form_data);
      onLoginSuccess(response.data.user);
      await handleRequestOtp();
      navigate("/otp-verification", { state: { email: form_data.email } });
    } catch (error) {
      // Manejo de errores
    }
  };

  const handleRequestOtp = async (e) => {
    setStatus(1);
    e.preventDefault();
    try {
      const response = await axios.post(`${base_url}/api/request-otp`, {
        email: form_data.email,
      });
      setStatus(2);

      console.log("OTP sended:", response.data);
      setStatus(0);
    } catch (error) {
      console.error("Error requesting OTP:", error);
      setStatus(3);
      setError(error.response ? error.response.data.message : "Unknown error");
    }
  };

  return (
    <>
<div className="w-[392px] max-h-[500px] h-full rounded-[10px] bg-[#232939] relative border border-[#232939e0] overflow-hidden">
                <div className="flex flex-col gap-[0.375rem] p-6 text-center pt-4 pb-4 rounded-t-[1.5rem]">
                  <div className="m-auto inline-flex items-center whitespace-nowrap rounded-full border border-transparent px-2 py-[0.125rem] text-sm font-semibold bg-[#bfdbfe] text-[#232939c7]">
                    Welcome Back
                  </div>
                  <Typography
                    sx={{
                      whiteSpace: "nowrap",
                      fontWeight: 600,
                      letterSpacing: "-0.025em",
                      color: "#fff",
                      marginTop: "0.5rem",
                    }}
                    variant="h3"
                  >
                    Login
                  </Typography>
                </div>

                <div
                  className="flex flex-col items-center text-center bg-white rounded-b-[16px] h-[400px] pt-3 px-6 relative z-4 gap-4 overflow-hidden"
                  style={{ borderRadius: "90% / 7% 7% 0 0" }}
                >
                  <Box
                    sx={{ textAlign: "left", marginTop: 2 }}
                    className="w-full mt-4"
                    component="form"
                    onSubmit={handleLogin}
                  >
                    <p className="text-[#6b7280] text-base">Email</p>
                    <TextField
                      margin="normal"
                      required
                      fullWidth
                      id="email"
                      label="Correo Electrónico"
                      name="email"
                      autoComplete="email"
                      autoFocus
                      value={form_data.email}
                      onChange={(e) =>
                        setFormData({ ...form_data, email: e.target.value })
                      }
                      InputLabelProps={{ style: { color: "#292323" } }}
                      InputProps={{ style: { color: "#292323" } }}
                      variant="filled"
                      sx={{ backgroundColor: "#ede9fe", borderRadius: 1 }}
                    />
                    <p className="mt-4 text-[#6b7280] text-base">Password</p>
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
                        setFormData({
                          ...form_data,
                          password: e.target.value.trim(),
                        })
                      }
                      InputLabelProps={{ style: { color: "#292323" } }}
                      InputProps={{
                        style: { color: "#292323" },
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={togglePasswordVisibility}
                              edge="end"
                            >
                              {show_password ? (
                                <VisibilityOff />
                              ) : (
                                <Visibility />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      variant="filled"
                      sx={{ backgroundColor: "#ede9fe", borderRadius: 1 }}
                    />

                    <div className="flex"></div>
                    <div
                      className={`flex justify-start items-center h-[111px] flex-wrap`}
                    >
                      <Button
                        type="submit"
                        variant="contained"
                        onClick={handleLogin}
                        className={`w-[256px] rounded-full "bg-blue-500"
                         font-semibold py-2 text-center m-auto my-2 self-start text-base`}
                      >
                        Login
                      </Button>

                      
                      <div className="inline-flex items-center whitespace-nowrap rounded-full border border-transparent px-2 py-[0.125rem] font-semibold bg-[#ede9fe] text-[#888] self-end bottom-0 mx-auto">
                        <Typography variant="body2" align="center">
                          ¿No tienes una cuenta?{" "}
                          <Link
                            to="/register"
                            style={{
                              color: "#75d176",
                              textDecoration: "none",
                              fontWeight: "bolder",
                              letterSpacing: "1px",
                            }}
                          >
                            Regístrate
                          </Link>
                        </Typography>
                      </div>
                    </div>
                  </Box>
                </div>
              </div>
    </>
  );
};
export default LoginForm;

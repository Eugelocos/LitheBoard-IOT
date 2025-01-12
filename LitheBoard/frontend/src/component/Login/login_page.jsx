import React, { useState } from "react";
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  Avatar,
} from "@mui/material";
import { Link, Navigate } from "react-router-dom";
import axios from "axios";
import "./login_page.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faGear,
  faHouseSignal,
  faChartLine,
} from "@fortawesome/free-solid-svg-icons";
import { MuiOtpInput } from "mui-one-time-password-input";
import { IconButton, InputAdornment } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import config from "@config";
import StatusBadge from "../status_badge";

function Login() {
  axios.defaults.withCredentials = true;
  const [form_data, setFormData] = useState({ email: "", password: "" });
  const [logged_in, setLoggedIn] = useState(false);
  const [error, setError] = useState("");
  const [user_data, setUserData] = useState(null);
  const [otp, setOtp] = useState(""); // Estado para el OTP
  const [otp_requested, setOtpRequested] = useState(false);
  const [show_password, setShowPassword] = useState(false);

  const [status, setStatus] = useState(0); // 0: initial, 1: loading, 2: success, 3: error

  console.log(config);
  const base_url = `${config.BACKEND_URL}:${config.BACKEND_API_PORT}`;

  const togglePasswordVisibility = () => {
    setShowPassword(!show_password);
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
      setOtpRequested(true);
      setStatus(0);
    } catch (error) {
      console.error("Error requesting OTP:", error);
      setStatus(3);
      setError(error.response ? error.response.data.message : "Unknown error");
    }
  };

  const handleVerifyOtp = async (e) => {
    setStatus(1);
    e.preventDefault();
    console.log(otp);
    try {
      console.log(user_data.id, "user data #");
      const response = await axios.post(`${base_url}/api/verify-otp`, {
        client_id: user_data.id,
        otp: otp,
      });
      setStatus(2);
      setLoggedIn(true);
      localStorage.setItem("user", JSON.stringify(user_data));
    } catch (error) {
      setStatus(3);
      setError(error.response ? error.response.data.message : "Unknown error");
    }
  };

  const handleLogin = async (e) => {
    // CHANGE TO PREVENT SECURITY GAP from /login to /dashboard
    e.preventDefault();
    try {
      const response = await axios.post(`${base_url}/api/login`, form_data);

      setUserData(response.data.user);

      localStorage.setItem("user", JSON.stringify(response.data.user));
      await handleRequestOtp(e);
    } catch (error) {
      console.error("Log in error:", error);
      setError(error.response ? error.response.data.message : "Unknown error");
    }
  };

  if (logged_in) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <>
      <Container
        component="main"
        maxWidth="xs"
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          position: "relative",
          zIndex: 1,
        }}
      >
        <Paper
          elevation={0}
          sx={{
            padding: 1,
            backgroundColor: "#232939",
            color: "#FFFFFF",
            borderRadius: 2,
            zIndex: 2,
            position: "relative",
          }}
        >
          {otp_requested ? (
            <>
              <div className="w-[392px] max-h-[500px] h-full rounded-[10px] bg-[#232939] relative border border-[#232939e0] overflow-hidden">
                <div className="flex flex-col gap-[0.375rem] p-6 text-center pt-4 pb-4 rounded-t-[1.5rem]">
                  <div className="m-auto inline-flex items-center whitespace-nowrap rounded-full border border-transparent px-2 py-[0.125rem] text-sm font-semibold bg-[#bfdbfe] text-[#232939c7]">
                    Welcome Back, {form_data.email}
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
                    Email Verification
                  </Typography>
                </div>

                <div
                  className="flex flex-col items-center text-center bg-white rounded-b-[16px] h-[400px] pt-3 px-6 relative z-4 gap-4 overflow-hidden"
                  style={{ borderRadius: "90% / 7% 7% 0 0" }}
                >
                  <Box
                    component="form"
                    onSubmit={handleVerifyOtp}
                    sx={{ mt: 3 }}
                  >
                    <li style={{ display: "flex", alignItems: "center" }}>
                      <p className="text-sm text-nowrap text-[#5c5b5b] m-auto my-[15px] ">
                        A code was sent to your email. It will expire in 5
                        minutes
                      </p>
                    </li>
                    <p className="text-[#6b7280] text-lg text-start mt-3 mb-2">
                      Email Code
                    </p>

                    <div className="my-3">
                      <MuiOtpInput
                        value={otp}
                        onChange={setOtp}
                        length={6}
                        gap={2}
                      />
                    </div>

                    <div className="flex"></div>
                    <div
                      className={`flex justify-start items-center h-[140px] flex-wrap`}
                    >
                      <button
                        type="submit"
                        className={`w-[256px] rounded-full ${
                          error ? "bg-[#df6d6c]" : "bg-blue-500"
                        } font-semibold py-2 text-center m-auto my-2 self-start text-base`}
                      >
                        Verify
                      </button>
                      <StatusBadge status={status} />

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
          ) : (
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
                      <button
                        type="submit"
                        className={`w-[256px] rounded-full "bg-blue-500"
                         font-semibold py-2 text-center m-auto my-2 self-start text-base`}
                      >
                        Login
                      </button>

                      <StatusBadge status={status} />
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
          )}
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
export default Login;

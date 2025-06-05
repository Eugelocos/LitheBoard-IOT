import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { MuiOtpInput } from "mui-one-time-password-input";
import { Navigate, Link} from "react-router-dom";
import axios from "axios";
import config from "@config";
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  Avatar,
} from "@mui/material";
import StatusBadge from "../status_badge";
const OtpVerification = (user_data) => {
  const [otp, setOtp] = useState("");
  const [form_data, setFormData] = useState({ email: "", password: "" });
  const [logged_in, setLoggedIn] = useState(false);
  const [error, setError] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const { email } = location.state || {};

  const [status, setStatus] = useState(0); // 0: initial, 1: loading, 2: success, 3: error

  const base_url = `${config.BACKEND_URL}:${config.BACKEND_API_PORT}`;

  const handleVerifyp = async () => {
    try {
      await axios.post(`${base_url}/api/verify-otp`, { email, otp });
      navigate("/dashboard");
    } catch (error) {
      // Manejo de errores
    }
  };
  const handleVerifyOtp = async (e) => {
    setStatus(1);
    e.preventDefault();
    try {
      await axios.post(`${base_url}/api/verify-otp`, {
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

  useEffect(() => {
    if (!location.state?.email) {
      navigate("/login", { replace: true });
    }
  }, []);

  if (!email) return <Navigate to="/login" />;

  return (
    <div>
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
          <Box component="form" onSubmit={handleVerifyOtp} sx={{ mt: 3 }}>
            <li style={{ display: "flex", alignItems: "center" }}>
              <p className="text-sm text-nowrap text-[#5c5b5b] m-auto my-[15px] ">
                A code was sent to your email. It will expire in 5 minutes
              </p>
            </li>
            <p className="text-[#6b7280] text-lg text-start mt-3 mb-2">
              Email Code
            </p>

            <div className="my-3">
              <MuiOtpInput value={otp} onChange={setOtp} length={6} gap={2} />
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
    </div>
  );
};
export default OtpVerification;

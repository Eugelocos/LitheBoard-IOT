// src/utils/api.js

import axios from "axios";
import config from "@config";

const api = axios.create({
  baseURL: `${config.BACKEND_URL}:${config.BACKEND_API_PORT}`,
  withCredentials: true, // si en tu backend aceptas cookies o necesites enviar credenciales
});

// Interceptor para añadir el token JWT a cada petición
api.interceptors.request.use(
  (request) => {
    const token = localStorage.getItem("token");
    if (token) {
      request.headers.Authorization = `Bearer ${token}`;
    }
    return request;
  },
  (error) => Promise.reject(error)
);

export { getApiErrorMessage, getApiErrorCode } from "./api_errors";

export default api;

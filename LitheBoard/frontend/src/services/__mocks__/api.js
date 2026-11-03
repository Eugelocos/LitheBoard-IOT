// Mock manual del cliente HTTP centralizado. Se activa con
// `jest.mock("<ruta>/services/api")` en cada test que lo necesite.
const api = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  patch: jest.fn(),
  delete: jest.fn(),
  interceptors: {
    request: { use: jest.fn() },
    response: { use: jest.fn() },
  },
};

// Los helpers de errores son funciones puras: se reutiliza la implementación
// real para que los tests vean los mismos mensajes que la app.
export { getApiErrorMessage, getApiErrorCode } from "../api_errors";
export default api;

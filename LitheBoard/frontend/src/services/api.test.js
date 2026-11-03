import api, { getApiErrorCode, getApiErrorMessage } from "./api";
import { BASE_URL, apiError } from "../test/test_utils";

const runRequestInterceptor = (request) =>
  api.interceptors.request.handlers[0].fulfilled(request);

describe("api service", () => {
  it("apunta al backend configurado y envía credenciales", () => {
    expect(api.defaults.baseURL).toBe(BASE_URL);
    expect(api.defaults.withCredentials).toBe(true);
  });

  it("añade el token JWT como cabecera Authorization cuando hay sesión", () => {
    localStorage.setItem("token", "jwt-abc");

    const request = runRequestInterceptor({ headers: {} });

    expect(request.headers.Authorization).toBe("Bearer jwt-abc");
  });

  it("no añade Authorization cuando no hay token", () => {
    const request = runRequestInterceptor({ headers: {} });

    expect(request.headers).not.toHaveProperty("Authorization");
  });

  it("lee el token en cada petición y no uno cacheado", () => {
    localStorage.setItem("token", "primero");
    runRequestInterceptor({ headers: {} });
    localStorage.setItem("token", "segundo");

    const request = runRequestInterceptor({ headers: {} });

    expect(request.headers.Authorization).toBe("Bearer segundo");
  });

  it("propaga los errores de configuración de la petición", async () => {
    const error = new Error("config inválida");

    await expect(api.interceptors.request.handlers[0].rejected(error)).rejects.toBe(error);
  });
});

describe("errores de la API", () => {
  const error = apiError(404, "ENTITY_NOT_FOUND", "Entidad no encontrada");

  it("lee el mensaje y el código del envoltorio de error", () => {
    expect(getApiErrorMessage(error)).toBe("Entidad no encontrada");
    expect(getApiErrorCode(error)).toBe("ENTITY_NOT_FOUND");
  });

  it("usa el texto alternativo si la respuesta no trae envoltorio", () => {
    const network_error = new Error("Network Error");

    expect(getApiErrorMessage(network_error, "Sin conexión")).toBe("Sin conexión");
    expect(getApiErrorMessage(undefined)).toBe("Error desconocido");
    expect(getApiErrorCode(network_error)).toBeNull();
  });
});

// Lectura de errores de la API. El backend responde siempre
// { status: "error", data: null, error: { code, message, details } }
// (docs/CONVENCIONES_Y_CONTRATOS.md §5). Módulo puro: no depende de axios.

/** Mensaje legible del error, o `fallback` si la respuesta no trae envoltorio. */
export function getApiErrorMessage(error, fallback = "Error desconocido") {
  return error?.response?.data?.error?.message || fallback;
}

/** Código estable del error (p. ej. "ENTITY_NOT_FOUND"), o null. */
export function getApiErrorCode(error) {
  return error?.response?.data?.error?.code || null;
}

import React from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import config from "@config";

export const BASE_URL = `${config.BACKEND_URL}:${config.BACKEND_API_PORT}`;

/** Componente auxiliar que muestra la ruta actual para verificar redirecciones. */
export function LocationDisplay() {
  const location = useLocation();
  return <div data-testid="location">{location.pathname}</div>;
}

/**
 * Renderiza `ui` dentro de un MemoryRouter en `route`, junto con rutas
 * adicionales (`extraRoutes`: { path: element }) para comprobar navegaciones.
 */
export function renderWithRouter(ui, { route = "/", path = route, extraRoutes = {} } = {}) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route path={path} element={ui} />
        {Object.entries(extraRoutes).map(([extraPath, element]) => (
          <Route key={extraPath} path={extraPath} element={element} />
        ))}
      </Routes>
      <LocationDisplay />
    </MemoryRouter>,
  );
}

/** Guarda una sesión válida en localStorage, como lo hace el login. */
export function setAuthenticatedUser(user = buildUser(), token = "test-token") {
  localStorage.setItem("user", JSON.stringify(user));
  localStorage.setItem("token", token);
  return user;
}

/** Promesa controlable manualmente, útil para probar estados de "cargando". */
export function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

/** Construye un error con la forma que produce axios ante una respuesta HTTP. */
export function httpError(status, data = {}) {
  const error = new Error(`Request failed with status code ${status}`);
  error.response = { status, data };
  return error;
}

/** Error de axios con el envoltorio de error de la API (docs/CONVENCIONES_Y_CONTRATOS.md §5). */
export function apiError(status, code, message = code, details = []) {
  return httpError(status, { status: "error", data: null, error: { code, message, details } });
}

/** Respuesta de axios con el envoltorio de éxito de la API. */
export function apiSuccess(data, meta) {
  return { data: { status: "success", data, ...(meta ? { meta } : {}), error: null } };
}

/** Respuesta de axios a un 204 sin cuerpo. */
export function apiNoContent() {
  return { status: 204, data: "" };
}

//#region MUI helpers
/** Fila de un DataGrid que contiene `text`. */
export function getGridRow(text) {
  return screen.getByText(text).closest('[role="row"]');
}

/** Pulsa el IconButton de una fila del DataGrid identificado por su icono MUI. */
export function clickRowAction(rowText, iconTestId) {
  const icon = within(getGridRow(rowText)).getByTestId(iconTestId);
  fireEvent.click(icon.closest("button"));
}

/** Pulsa el botón que contiene el icono MUI `iconTestId` (p. ej. "AddRoundedIcon"). */
export function clickIconButton(iconTestId, container = screen) {
  fireEvent.click(container.getByTestId(iconTestId).closest("button"));
}

/** Abre un Select de MUI (por etiqueta o elemento) y elige una opción. */
export function selectMuiOption(labelOrElement, optionName) {
  // La etiqueta también nombra al listbox del menú (que sigue montado mientras
  // se cierra), así que nos quedamos con el disparador del Select.
  const trigger =
    typeof labelOrElement === "string" || labelOrElement instanceof RegExp
      ? screen
          .getAllByLabelText(labelOrElement)
          .find((element) => element.getAttribute("role") !== "listbox")
      : labelOrElement;
  fireEvent.mouseDown(trigger);
  const listbox = screen.getAllByRole("listbox").pop();
  fireEvent.click(within(listbox).getByRole("option", { name: optionName }));
}
//#endregion

//#region Factories
/** Forma que devuelve el backend en POST /api/clients/login. */
export function buildUser(overrides = {}) {
  return {
    client_id: "client-1",
    name: "Test User",
    email: "user@example.com",
    role: "client",
    ...overrides,
  };
}

export function buildDashboard(overrides = {}) {
  return {
    dashboard_id: "dashboard-1",
    client_id: "client-1",
    name: "Planta",
    description: "Sensores de planta",
    shared_client_ids: [],
    ...overrides,
  };
}

export function buildRulechain(overrides = {}) {
  return {
    rulechain_id: "rc-1",
    client_id: "client-1",
    name: "Regla temperatura",
    description: "Alerta por temperatura",
    definition: { nodes: [], edges: [] },
    entity_ids: ["entity-1"],
    ...overrides,
  };
}

export function buildAlarm(overrides = {}) {
  return {
    alarm_id: "alarm-1",
    entity_id: "entity-1",
    name: "Sensor Temperatura",
    threshold: 30,
    data_key: "temp",
    operator: "greater_than",
    ...overrides,
  };
}

export function buildNotification(overrides = {}) {
  return {
    notification_id: "n-1",
    alarm_id: "alarm-1",
    created_at: "2026-10-01T10:00:00.000Z",
    value: 35,
    is_read: false,
    ...overrides,
  };
}

/** Widget ya transformado en Device, como lo consume el dashboard. */
export function buildDevice(overrides = {}) {
  return {
    widget_id: "widget-1",
    entity_id: "entity-1",
    dashboard_id: "dashboard-1",
    client_id: "client-1",
    name: "Temperatura",
    widget_type: "line_chart",
    historics: [],
    widget_config: {
      data_key: "temp",
      datasource_type: "mqtt",
      datasource_config: { sub_topic: "temp", pub_topic: "temp/set", status: "active" },
      entity_name: "Sensor Temperatura",
    },
    ...overrides,
  };
}

export function buildEntity(overrides = {}) {
  return {
    entity_id: "entity-1",
    name: "Sensor Temperatura",
    datasource_type: "mqtt",
    datasource_config: { sub_topic: "temp", pub_topic: "temp/set" },
    connection_status: "online",
    ...overrides,
  };
}

export function buildWidget(overrides = {}) {
  return {
    widget_id: "widget-1",
    name: "Temperatura",
    widget_type: "line_chart",
    entity_id: "entity-1",
    dashboard_id: "dashboard-1",
    widget_config: { data_key: "temp", line_color: "#ff6a00" },
    ...overrides,
  };
}

export function buildHistoric(overrides = {}) {
  return {
    historic_id: "historic-1",
    entity_id: "entity-1",
    data_key: "temp",
    recorded_at: "2026-10-30T12:00:00.000Z",
    data: { temp: 21.5 },
    ...overrides,
  };
}
//#endregion

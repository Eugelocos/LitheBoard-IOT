// Compatibility adapters for existing callers. HTTP lives in services; the
// dashboard presentation model is built by a pure mapper.
import { fetchEntities, createEntity } from "../services/entities_service";
import { fetchWidgets, createWidget } from "../services/widgets_service";
import { fetchClientHistorics, fetchEntityHistorics, createHistoric } from "../services/historics_service";
import { toDashboardWidgets } from "../view_models/dashboard_widgets";

export async function getDashboardWidgets(dashboard_id, client_id) {
  if (!dashboard_id || !client_id) return { devices: [], history: [] };
  const [historics, widgets, entities] = await Promise.all([
    fetchClientHistorics(client_id),
    fetchWidgets(dashboard_id, client_id),
    fetchEntities(client_id),
  ]);
  return { devices: toDashboardWidgets(widgets, entities, historics, client_id), history: historics };
}

export async function setDatosHistoricos(historic, actualizar_hist = null, entity_id = null, data_key = null) {
  const created_historic = await createHistoric(historic);
  if (actualizar_hist && entity_id && data_key) actualizar_hist(entity_id, data_key);
  return created_historic;
}

export const getHistorialEntity = fetchEntityHistorics;
export const setWidget = createWidget;
export const setDevice = createEntity;

export async function getDevice(setEntities, client_id) {
  setEntities([...(await fetchEntities(client_id))]);
}
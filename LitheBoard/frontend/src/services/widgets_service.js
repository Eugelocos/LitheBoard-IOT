import api from "./api";

/** @returns {Promise<import('../contracts/resources').Widget[]>} */
export async function fetchWidgets(dashboard_id, client_id) {
  const response = await api.get(`/api/widgets/${client_id}/${dashboard_id}`);
  return response.data.data.widgets;
}

function buildWidgetPayload({ widget_id, entity_id, client_id, dashboard_id, name, widget_type, widget_config }, update = false) {
  return { ...(update ? { widget_id } : { client_id }), entity_id, dashboard_id, name, widget_type, widget_config };
}

/** @returns {Promise<import('../contracts/resources').Widget>} */
export async function createWidget(widget) {
  const response = await api.post("/api/widgets", buildWidgetPayload(widget));
  return response.data.data.widget;
}

/** @returns {Promise<import('../contracts/resources').Widget>} */
export async function updateWidget(widget) {
  const response = await api.put(`/api/widgets/${widget.widget_id}`, buildWidgetPayload(widget, true));
  return response.data.data.widget;
}

export async function deleteWidget(widget_id) {
  await api.delete(`/api/widgets/${widget_id}`);
}

// Form values and the selected entity are UI state, not API resources. Map them
// here so that presentation fields never become part of the write contract.
export function createWidgetFromForm(form, entity, dashboard_id, client_id) {
  return createWidget({
    name: form.name,
    entity_id: entity.entity_id,
    dashboard_id,
    client_id,
    widget_type: form.widget_type,
    widget_config: buildFormConfig(form.widget_type, {
      ...form,
      is_on: true,
      data_key: form.data_key,
      html_template: form.html_template,
      css: form.css,
    }),
  });
}

export function updateWidgetFromForm(form, dashboard_id) {
  return updateWidget({
    widget_id: form.widget_id,
    name: form.name,
    entity_id: form.entity_id,
    dashboard_id,
    client_id: form.widget_config.client_id,
    widget_type: form.widget_type,
    widget_config: buildFormConfig(form.widget_type, form.widget_config),
  });
}

function buildFormConfig(widget_type, values) {
  return {
    ...(widget_type === "switch" && {
      message_on: values.message_on,
      message_off: values.message_off,
      is_on: values.is_on ?? true,
    }),
    ...(widget_type === "map" && { lat: values.lat, lon: values.lon }),
    ...(["line_chart", "bar_chart"].includes(widget_type) && { line_color: values.line_color }),
    ...(widget_type === "custom_value_card" && { html_template: values.html_template, css: values.css }),
    data_key: values.data_key,
  };
}

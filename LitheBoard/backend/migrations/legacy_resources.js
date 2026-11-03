/* eslint-disable id-denylist */
// Phase 4 boundary: public canonical names, legacy storage/runtime names.
// Keep aliases in responses for one release; SQL changes belong to phase 5.
const AppError = require('../utils/app_error');
const { toDefinition, toRuntimeGraph } = require('../contracts/rulechain_definition');

const has = (object, key) => Object.prototype.hasOwnProperty.call(object, key);
function json(value, fallback) {
  if (typeof value !== 'string') return value ?? fallback;
  try { return JSON.parse(value); } catch { return fallback; }
}
function iso(value) {
  if (value == null) return value;
  const input = typeof value === 'string' && /^\d{4}-\d\d-\d\d[ T]\d\d:\d\d(?::\d\d(?:\.\d+)?)?$/.test(value)
    ? value.replace(' ', 'T') + 'Z' : value;
  const date = new Date(input);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}
const operators = { '>': 'greater_than', '<': 'less_than', greaterThan: 'greater_than', lessThan: 'less_than', equal: 'equal' };
const legacy_operators = { greater_than: '>', less_than: '<' };
const connectionStatus = (value) => ['online', 'active', true, 1].includes(value) ? 'online' : 'offline';
const boolean = (value) => [true, 1, '1', 'true'].includes(value);

function canonicalConfig(config) {
  const source = json(config, {});
  const result = { ...source };
  for (const [old, current] of [['polling_interval', 'polling_interval_ms'], ['heartbeat_timeout', 'heartbeat_timeout_s']]) {
    if (has(source, old)) result[current] = Number(source[old]);
  }
  for (const key of ['query_params', 'headers', 'request_body']) {
    if (has(source, key)) result[key] = json(source[key], {});
  }
  return result;
}
function widgetConfig(config) {
  const source = json(config, {});
  const result = { ...source };
  for (const [old, current] of [['selected_key', 'data_key'], ['widget_clave', 'data_key'], ['scriptHtml', 'html_template'], ['scriptCss', 'css']]) {
    if (has(source, old)) result[current] = source[old];
    delete result[old];
  }
  if (has(source, 'estado_actual') || has(source, 'estadoActual')) result.is_on = boolean(source.estado_actual ?? source.estadoActual);
  for (const key of ['estado_actual', 'estadoActual', 'entity_name', 'sub_topic', 'pub_topic', 'datasource_type', 'datasource_config', 'client_id']) delete result[key];
  return result;
}

function serializeResource(resource, record) {
  if (record == null) return record;
  const result = { ...record };
  const alias = (old, current, convert = (value) => value) => {
    if (has(record, old)) result[current] = convert(record[old]);
  };
  if (resource === 'alarm') {
    alias('valor', 'threshold'); alias('selected_key', 'data_key');
    alias('alarm_condition', 'operator', (value) => operators[value] || value);
  } else if (resource === 'notification') {
    alias('visto', 'is_read', boolean);
    alias('date', 'created_at', iso); alias('data', 'value', (value) => json(value, value));
  } else if (resource === 'historic') {
    alias('date', 'recorded_at', iso); alias('selected_key', 'data_key');
    if (has(record, 'data')) result.data = json(record.data, record.data);
  } else if (resource === 'entity') {
    alias('disp_name', 'name');
    if (has(record, 'datasource_config')) {
      const config = canonicalConfig(record.datasource_config);
      for (const key of ['sub_topic', 'pub_topic']) if (record[key] != null && config[key] == null) config[key] = record[key];
      result.datasource_config = config;
      // Some legacy/API datasources never tracked connectivity. Preserve that
      // absence instead of inventing an offline state for a working datasource.
      if (record.connection_status != null || config.status != null) result.connection_status = connectionStatus(record.connection_status ?? config.status);
      if (record.token != null || config.token != null) result.credential = { token: record.token ?? config.token };
    }
  } else if (resource === 'dashboard') {
    alias('additional_client_ids', 'shared_client_ids', (value) => json(value, []));
    if (Array.isArray(record.widgets)) result.widgets = record.widgets.map((widget) => serializeResource('widget', widget));
  } else if (resource === 'widget') {
    alias('widget_name', 'name'); alias('config_data', 'widget_config', widgetConfig);
  } else if (resource === 'rulechain') {
    alias('user_id', 'client_id'); alias('entities_ids', 'entity_ids', (value) => json(value, []));
    alias('rulechain', 'definition', (value) => toDefinition(json(value, { nodes: [], edges: [] })));
  } else if (resource === 'client') {
    if (!has(record, 'client_id')) {
      if (has(record, 'id')) result.client_id = record.id;
      else if (has(record, '_id')) result.client_id = record._id;
    }
    alias('admin_id', 'admin_client_id');
    const role = record.role ?? record.access_level_id ?? record.access_level;
    if (role != null) result.role = ({ 1: 'admin', 2: 'client', 3: 'manager' })[role] || role;
    delete result.password;
  } else if (resource === 'otp_token') {
    alias('id', 'otp_token_id'); alias('used', 'is_used', boolean);
  }
  for (const key of ['created_at', 'read_at', 'expires_at', 'last_seen_at', 'recorded_at']) {
    if (result[key] != null) result[key] = iso(result[key]);
  }
  return result;
}
const resource_keys = {
  entity: 'entity', entities: 'entity', widget: 'widget', widgets: 'widget',
  alarm: 'alarm', alarms: 'alarm', notification: 'notification', notifications: 'notification',
  historic: 'historic', historics: 'historic', dashboard: 'dashboard', dashboards: 'dashboard',
  rulechain: 'rulechain', rulechains: 'rulechain', client: 'client', clients: 'client',
  otp_token: 'otp_token', otp_tokens: 'otp_token',
};
function serializeData(data) {
  const result = { ...data };
  for (const [key, value] of Object.entries(data || {})) {
    if (resource_keys[key]) result[key] = Array.isArray(value)
      ? value.map((record) => serializeResource(resource_keys[key], record)) : serializeResource(resource_keys[key], value);
    else if (key === 'session') result.session = { ...value, client: serializeResource('client', value.client) };
  }
  return result;
}


module.exports = { serializeResource };

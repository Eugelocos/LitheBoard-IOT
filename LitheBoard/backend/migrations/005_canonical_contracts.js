/* eslint-disable id-denylist */
// MySQL 8 DDL commits implicitly. Each rename is resumable; data updates commit
// together and the journal is written last. Run with all application writers stopped.
const { serializeResource } = require('./legacy_resources');
const { toDefinition } = require('../contracts/rulechain_definition');
const version = '005_canonical_contracts';
const renames = {
  alarms: { valor: 'threshold', selected_key: 'data_key', alarm_condition: 'operator' },
  notifications: { visto: 'is_read', date: 'created_at', data: 'value' },
  historics: { date: 'recorded_at', selected_key: 'data_key' },
  entities: { disp_name: 'name' }, clients: { admin_id: 'admin_client_id' },
  client_admins: { admin_id: 'admin_client_id' },
  dashboards: { additional_client_ids: 'shared_client_ids' },
  widgets: { config_data: 'widget_config', widget_name: 'name' },
  rulechains: { user_id: 'client_id', entities_ids: 'entity_ids', rulechain: 'definition' },
  otp_tokens: { id: 'otp_token_id', used: 'is_used' },
};
function decode(value, fallback) {
  while (typeof value === 'string') {
    try { value = JSON.parse(value); } catch { throw new Error('Invalid stored JSON; migration aborted'); }
  }
  return value ?? fallback;
}
function normalize(resource, row) {
  const source_config = resource === 'entity' ? decode(row.datasource_config, {}) : {};
  if (resource === 'entity') {
    if (typeof source_config !== 'object' || Array.isArray(source_config)) throw new Error('datasource_config must be an object');
    if (row.token && source_config.token && row.token !== source_config.token) throw new Error('Conflicting entity credentials');
    for (const [old,current,scale] of [['polling_interval','polling_interval_ms',1],['heartbeat_timeout','heartbeat_timeout_s',0.001]]) {
      if (source_config[old] != null && source_config[current] != null && Number(source_config[old]) * scale !== Number(source_config[current])) throw new Error(`Conflicting ${current}`);
    }
  }
  const record = serializeResource(resource, resource === 'entity' ? {...row,datasource_config:source_config} : row);
  if (resource === 'entity') {
    const config = record.datasource_config || {};
    for (const [old, current] of [['polling_interval','polling_interval_ms'],['heartbeat_timeout','heartbeat_timeout_s']]) {
      delete config[old];
    }
    // Legacy MQTT timers used milliseconds. Preserve the effective duration.
    if (source_config.heartbeat_timeout != null) config.heartbeat_timeout_s = Number(source_config.heartbeat_timeout) / 1000;
    for (const key of ['status','token']) delete config[key];
    record.datasource_type = record.datasource_type?.toLowerCase();
    if (!['mqtt','api','db'].includes(record.datasource_type)) throw new Error('Unknown datasource_type');
    record.credential = decode(row.credential, record.credential || {});
    const status = row.connection_status ?? source_config.status;
    if (status != null) {
      const states = {online:'online',active:'online',true:'online',1:'online',offline:'offline',inactive:'offline',false:'offline',0:'offline'};
      if (!states[status]) throw new Error('Unknown stored connection status');
      record.connection_status = states[status];
    }
    if (row.token && record.credential.token && row.token !== record.credential.token) throw new Error('Conflicting entity credentials');
    for (const key of ['sub_topic','pub_topic']) if (row[key] != null && config[key] !== row[key]) throw new Error(`Conflicting ${key}`);
  } else if (resource === 'widget') {
    const config = decode(row.config_data ?? row.widget_config, {});
    if (typeof config !== 'object' || Array.isArray(config)) throw new Error('widget_config must be an object');
    for (const [old,current] of [['selected_key','data_key'],['widget_clave','data_key'],['scriptHtml','html_template'],['scriptCss','css'],['estado_actual','is_on'],['estadoActual','is_on']]) {
      if (config[old] !== undefined && config[current] !== undefined && config[old] !== config[current]) throw new Error(`Conflicting widget ${current}`);
    }
    record.widget_config = serializeResource('widget', {config_data:config}).widget_config;
    record.widget_type = ({lineChart:'line_chart',barChart:'bar_chart',customValueCard:'custom_value_card'})[row.widget_type] || row.widget_type;
    if (!['switch','line_chart','bar_chart','custom_value_card','map','value_card','gauge'].includes(record.widget_type)) throw new Error(`Unknown widget_type: ${record.widget_type}`);
  } else if (resource === 'dashboard') {
    record.shared_client_ids = decode(row.additional_client_ids ?? row.shared_client_ids, []);
    if (!Array.isArray(record.shared_client_ids)) throw new Error('shared_client_ids must be an array');
  } else if (resource === 'rulechain') {
    record.entity_ids = decode(row.entities_ids ?? row.entity_ids, []);
    if (!Array.isArray(record.entity_ids)) throw new Error('entity_ids must be an array');
    record.definition = toDefinition(decode(row.rulechain ?? row.definition, {nodes:[],edges:[]}));
    const { error } = require('../schemas/definition_schema').definitionSchema.validate(record.definition);
    const empty_draft = record.definition.nodes.length === 0 && record.definition.edges.length === 0;
    if (error && !empty_draft) throw new Error(`Invalid stored rulechain ${row.rulechain_id}: ${error.message}`);
  } else if (resource === 'alarm') {
    if (!['greater_than','less_than'].includes(record.operator) || !Number.isFinite(Number(record.threshold))) throw new Error('Invalid alarm');
  }
  return record;
}
async function migrate(connection) {
  const [lock] = await connection.query("SELECT GET_LOCK('litheboard_contract_migration', 0) AS acquired");
  if (!lock[0].acquired) throw new Error('Another migration is running');
  try {
    await connection.query('CREATE TABLE IF NOT EXISTS schema_migrations (version VARCHAR(100) PRIMARY KEY, applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP)');
    const [done] = await connection.query('SELECT version FROM schema_migrations WHERE version = ?', [version]);
    if (done.length) return { version, applied: false };
    const [schema] = await connection.query('SELECT TABLE_NAME, COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE()');
    const tables = new Map();
    for (const row of schema) {
      if (!tables.has(row.TABLE_NAME)) tables.set(row.TABLE_NAME, new Set());
      tables.get(row.TABLE_NAME).add(row.COLUMN_NAME);
    }
    for (const [table, columns] of Object.entries(renames)) {
      const source = table === 'historics' && tables.has('historial') ? 'historial' : table === 'rulechains' && tables.has('rulechain') ? 'rulechain' : table;
      if (!tables.has(source)) {
        if (table === 'rulechains') continue; // Older bootstrap dumps lacked this table.
        throw new Error(`Required table missing: ${table}`);
      }
      for (const [old,current] of Object.entries(columns)) {
        if (tables.get(source).has(old) && tables.get(source).has(current)) throw new Error(`Both ${source}.${old} and ${current} exist`);
        if (!tables.get(source).has(old) && !tables.get(source).has(current)) throw new Error(`Required column missing: ${source}.${current}`);
      }
    }
    // Validate/normalize every affected row before the first destructive DDL.
    const prepared = {};
    for (const [table, resource, legacy] of [['entities','entity'],['widgets','widget'],['dashboards','dashboard'],['alarms','alarm'],['rulechains','rulechain','rulechain']]) {
      const source = tables.has(table) ? table : legacy;
      prepared[table] = source && tables.has(source) ? (await connection.query(`SELECT * FROM \`${source}\``))[0].map((row) => normalize(resource,row)) : [];
    }
    for (const [old, current] of [['historial','historics'],['rulechain','rulechains']]) {
      if (tables.has(old) && tables.has(current)) throw new Error(`Both ${old} and ${current} exist`);
      if (tables.has(old)) {
        await connection.query(`RENAME TABLE \`${old}\` TO \`${current}\``);
        tables.set(current,tables.get(old)); tables.delete(old);
      }
    }
    if (!tables.has('rulechains')) {
      await connection.query('CREATE TABLE rulechains (rulechain_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, client_id INT NOT NULL, name VARCHAR(255), description TEXT, definition JSON, entity_ids JSON, compiled JSON)');
      tables.set('rulechains',new Set(['rulechain_id','client_id','name','description','definition','entity_ids','compiled']));
    }
    for (const [table, columns] of Object.entries(renames)) {
      for (const [old,current] of Object.entries(columns)) {
        if (tables.get(table)?.has(old)) {
          if (tables.get(table).has(current)) throw new Error(`Both ${table}.${old} and ${current} exist`);
          await connection.query(`ALTER TABLE \`${table}\` RENAME COLUMN \`${old}\` TO \`${current}\``);
          tables.get(table).delete(old); tables.get(table).add(current);
        }
      }
    }
    for (const [column,type] of [['credential','JSON'],['connection_status',"ENUM('online','offline') NULL"],['rulechain_id','INT NOT NULL DEFAULT 0']]) {
      if (!tables.get('entities').has(column)) await connection.query(`ALTER TABLE entities ADD COLUMN ${column} ${type}`);
    }
    await connection.query('ALTER TABLE alarms MODIFY COLUMN operator VARCHAR(20) NOT NULL');
    // Preserve plain strings while allowing structured notification values.
    const [value_type] = await connection.query("SELECT DATA_TYPE FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='notifications' AND COLUMN_NAME='value'");
    if (value_type[0].DATA_TYPE !== 'json') {
      await connection.query('ALTER TABLE notifications MODIFY COLUMN value LONGTEXT NULL');
      await connection.query('UPDATE notifications SET value = JSON_QUOTE(value) WHERE value IS NOT NULL AND JSON_VALID(value) = 0');
      await connection.query('ALTER TABLE notifications MODIFY COLUMN value JSON NULL');
    }
    await connection.beginTransaction();
    try {
      for (const row of prepared.entities) await connection.query('UPDATE entities SET datasource_type=?, datasource_config=?, credential=?, connection_status=? WHERE entity_id=?', [row.datasource_type,JSON.stringify(row.datasource_config),JSON.stringify(row.credential),row.connection_status ?? null,row.entity_id]);
      for (const row of prepared.widgets) await connection.query('UPDATE widgets SET widget_type=?, widget_config=? WHERE widget_id=?',[row.widget_type,JSON.stringify(row.widget_config),row.widget_id]);
      for (const row of prepared.dashboards) await connection.query('UPDATE dashboards SET shared_client_ids=? WHERE dashboard_id=?',[JSON.stringify(row.shared_client_ids),row.dashboard_id]);
      for (const row of prepared.alarms) await connection.query('UPDATE alarms SET operator=? WHERE alarm_id=?',[row.operator,row.alarm_id]);
      const { generateRulesEngineJson } = require('../services/rulechain_service');
      const { toRuntimeGraph } = require('../contracts/rulechain_definition');
      for (const row of prepared.rulechains) {
        const runtime = toRuntimeGraph(row.definition);
        const compiled = runtime.nodes.length ? await generateRulesEngineJson(runtime.nodes,runtime.edges) : null;
        await connection.query('UPDATE rulechains SET definition=?, entity_ids=?, compiled=? WHERE rulechain_id=?',[JSON.stringify(row.definition),JSON.stringify(row.entity_ids),JSON.stringify(compiled),row.rulechain_id]);
      }
      await connection.commit();
    } catch (error) { await connection.rollback(); throw error; }
    for (const column of ['sub_topic','pub_topic','token']) if (tables.get('entities').has(column)) await connection.query(`ALTER TABLE entities DROP COLUMN ${column}`);
    await connection.query('INSERT INTO schema_migrations (version) VALUES (?)',[version]);
    return { version, applied: true };
  } finally { await connection.query("SELECT RELEASE_LOCK('litheboard_contract_migration')"); }
}
module.exports = { migrate, normalize, version };

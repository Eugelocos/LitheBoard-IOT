// Canonical public projections: storage-only fields stay private.
const fields = {
 entity: ['entity_id','client_id','name','datasource_type','datasource_config','credential','connection_status','rulechain_id','created_at'],
 widget: ['widget_id','client_id','entity_id','dashboard_id','name','widget_type','widget_config'],
 alarm: ['alarm_id','client_id','entity_id','threshold','data_key','operator'],
 notification: ['notification_id','client_id','alarm_id','created_at','value','is_read'],
 historic: ['historic_id','client_id','entity_id','recorded_at','data','data_key'],
 dashboard: ['dashboard_id','client_id','name','description','shared_client_ids','widgets'],
 rulechain: ['rulechain_id','client_id','name','description','entity_ids','definition'],
 client: ['client_id','name','email','role','admin_client_id'],
 otp_token: ['otp_token_id','client_id','expires_at','is_used'],
};
// mysql2 already decodes JSON scalars. Historic data/notification values may
// legitimately be strings such as "0" or "false" and must keep their type.
const json_fields = new Set(['datasource_config','credential','widget_config','shared_client_ids','entity_ids','definition']);
function serializeResource(resource, record) {
 if (record == null) return record;
 const result = {};
 for (const key of fields[resource] || []) {
  if (record[key] === undefined) continue;
  let value = record[key];
  if (json_fields.has(key) && typeof value === 'string') {
   try { value = JSON.parse(value); } catch { /* Historic/value may be plain text. */ }
  }
  if (value != null && key.endsWith('_at')) value = new Date(value).toISOString();
  if (['is_read','is_used'].includes(key)) value = Boolean(value);
  if (key === 'threshold' && value != null) value = Number(value);
  if (key === 'widgets') value = value.map((widget) => serializeResource('widget',widget));
  if (key !== 'connection_status' || value != null) result[key] = value;
 }
 if (resource === 'client') result.role = record.role ?? ({1:'admin',2:'client',3:'manager'})[record.access_level_id];
 return result;
}
function serializeData(data) {
 const result = {};
 for (const [key,value] of Object.entries(data || {})) {
  const resource = key === 'entities' ? 'entity' : fields[key] ? key : key.endsWith('s') && fields[key.slice(0,-1)] ? key.slice(0,-1) : null;
  result[key] = resource ? Array.isArray(value) ? value.map((row) => serializeResource(resource,row)) : serializeResource(resource,value)
   : key === 'session' ? {...value,client:serializeResource('client',value.client)} : value;
 }
 return result;
}
module.exports = {serializeData,serializeResource};

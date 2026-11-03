/* eslint-disable id-denylist */
// Manual integration check against an isolated restored database:
// DB_* node test/integration/migration_mysql.js
const assert = require('node:assert/strict');
const pool = require('../../config/db');
const { migrate } = require('../../migrations/005_canonical_contracts');
async function main() {
 const connection = await pool.getConnection();
 try {
  const [tables] = await connection.query('SHOW TABLES');
  const names = tables.map((row)=>Object.values(row)[0]);
  const counts = {};
  for (const table of names) if (table !== 'schema_migrations') counts[({historial:'historics',rulechain:'rulechains'})[table] || table] = Number((await connection.query(`SELECT COUNT(*) AS count FROM \`${table}\``))[0][0].count);
  console.log(await migrate(connection));
  assert.equal((await migrate(connection)).applied,false);
  for (const [table,count] of Object.entries(counts)) assert.equal(Number((await connection.query(`SELECT COUNT(*) AS count FROM \`${table}\``))[0][0].count),count,table);
  const [columns]=await connection.query('SELECT TABLE_NAME,COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE()');
  const forbidden = {alarms:['valor','selected_key','alarm_condition'],entities:['disp_name','token','sub_topic','pub_topic'],notifications:['visto','date','data'],historics:['date','selected_key'],widgets:['widget_name','config_data'],rulechains:['user_id','entities_ids','rulechain'],otp_tokens:['id','used'],clients:['admin_id'],client_admins:['admin_id'],dashboards:['additional_client_ids']};
  for (const row of columns) assert.ok(!forbidden[row.TABLE_NAME]?.includes(row.COLUMN_NAME),`${row.TABLE_NAME}.${row.COLUMN_NAME}`);
  // Exercise actual service SQL against the migrated schema. Roll back fixtures.
  const db_path = require.resolve('../../config/db');
  require.cache[db_path].exports = connection;
  const initializer_path = require.resolve('../../controllers/datasource_initializer');
  require.cache[initializer_path] = {id:initializer_path,filename:initializer_path,loaded:true,exports:{getDatasourceController:async()=>({addOrUpdateEntity:async()=>{},removeEntity:async()=>{}})}};
  await connection.beginTransaction();
  try {
   const [clients]=await connection.query('SELECT client_id FROM clients LIMIT 1');
   assert.ok(clients.length,'At least one client fixture is required');
   const client_id=clients[0].client_id;
   const entities=require('../../services/entity_service');
   const entity=await entities.createEntity({client_id,name:'Migration test',datasource_type:'mqtt',datasource_config:{sub_topic:'in',pub_topic:'out',heartbeat_timeout_s:60}});
   assert.ok(entity.credential.token);
   const updated=await entities.updateEntity({entity_id:entity.entity_id,name:'Updated',datasource_config:{sub_topic:'new',pub_topic:'out',heartbeat_timeout_s:30}});
   assert.equal(updated.credential.token,entity.credential.token);
   const entity_model=require('../../models/entity_model');
   assert.equal(await entity_model.getToken(client_id,entity.entity_id),entity.credential.token);
   await entity_model.updateEntityStatus(client_id,entity.entity_id,'online');
   assert.equal((await entities.fetchEntityById(entity.entity_id)).connection_status,'online');
   const dashboards=require('../../services/dashboard_service');
   const dashboard=await dashboards.createDashboard({client_id,name:'Migration test',description:'',shared_client_ids:[client_id]});
   const widgets=require('../../services/dbServices/widget_service');
   const widget=await widgets.createWidget({client_id,entity_id:entity.entity_id,dashboard_id:dashboard.dashboard_id,name:'Switch',widget_type:'switch',widget_config:{data_key:'power',is_on:false}});
   assert.equal((await widgets.fetchWidgetsWithEntities(client_id,dashboard.dashboard_id))[0].widget_config.is_on,false);
   assert.equal((await widgets.fetchById(widget.widget_id)).name,'Switch');
   const alarms=require('../../services/alarm_service');
   const alarm=await alarms.createAlarm({client_id,entity_id:entity.entity_id,threshold:0,operator:'greater_than',data_key:'temp'});
   const notifications=require('../../services/notification_service');
   const notification=await notifications.createNotification({client_id,alarm_id:alarm.alarm_id,created_at:new Date(),value:{temp:0}});
   await notifications.markAsRead(notification.notification_id);
   assert.equal((await notifications.fetchById(notification.notification_id)).is_read,1);
   await require('../../services/historic_service').createHistoric({client_id,entity_id:entity.entity_id,recorded_at:new Date(),data:{temp:0},data_key:'temp'});
   await require('../../models/historic_model').saveMessage(entity.entity_id,client_id,'temp',{temp:1});
   assert.equal((await require('../../models/historic_model').getLastHistoricByEntityId(entity.entity_id))[0].data_key,'temp');
   const definition={nodes:[{node_id:'i',node_type:'input',position:{x:0,y:0},node_config:{}}],edges:[]};
   const rulechains=require('../../services/dbServices/rulechain_service');
   const rulechain=await rulechains.createRulechain({client_id,name:'Migration test',rcJson:definition,entity_ids:[entity.entity_id]});
   assert.deepEqual((await rulechains.fetchById(rulechain.rulechain_id)).definition,definition);
   await rulechains.updateRulechain({rulechain_id:rulechain.rulechain_id,name:'Updated',rcJson:definition,entity_ids:[]});
   assert.deepEqual((await rulechains.fetchById(rulechain.rulechain_id)).entity_ids,[]);
   const otp=require('../../services/otp_service');
   const code=await otp.generateOtp(client_id,connection);
   assert.equal(await otp.verifyOtpInDatabase(client_id,code,connection),true);
   assert.equal(await otp.verifyOtpInDatabase(client_id,code,connection),false);
  } finally { await connection.rollback(); }
  console.log('MySQL integration passed: row counts, idempotence, canonical schema and service CRUD');
 } finally { connection.release(); await pool.end(); }
}
main().catch((error)=>{console.error(error);process.exitCode=1;});

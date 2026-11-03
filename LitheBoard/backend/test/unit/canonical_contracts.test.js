jest.mock('../../config/db', () => ({query:jest.fn()}));
/* eslint-disable id-denylist */
const { serializeResource, serializeData } = require('../../contracts/resources');
const { normalize } = require('../../migrations/005_canonical_contracts');
const { validateSchema } = require('../../middlewares/validate');
const { mockResponse } = require('./helpers');
const { toDefinition, toRuntimeGraph } = require('../../contracts/rulechain_definition');
const definition = {nodes:[{node_id:'input',node_type:'input',position:{x:0,y:0},node_config:{}}],edges:[]};
function validate(schema, body) {
 const req = {body}; const next = jest.fn();
 validateSchema(schema)(req,mockResponse(),next);
 return {body:req.body,error:next.mock.calls[0]?.[0]};
}
describe('canonical-only API', () => {
 test.each([
  ['alarm','alarm_schemas','createAlarmSchema',{entity_id:1,client_id:7,threshold:0,data_key:'temp',operator:'greater_than'},'valor'],
  ['entity','entity_schemas','createEntitySchema',{client_id:7,name:'Sensor',datasource_type:'mqtt',datasource_config:{sub_topic:'a',pub_topic:'b',heartbeat_timeout_s:60}},'disp_name'],
  ['widget','widget_schemas','createWidgetSchema',{client_id:7,entity_id:1,dashboard_id:2,name:'Card',widget_type:'switch',widget_config:{data_key:'power',is_on:false}},'config_data'],
  ['dashboard','dashboard_schemas','createDashboardSchema',{client_id:7,name:'Panel',description:'Main panel',shared_client_ids:[]},'additional_client_ids'],
  ['rulechain','rulechain_schemas','createRulechainSchema',{client_id:7,name:'Rules',definition,entity_ids:[]},'rulechain'],
  ['notification','notification_schemas','createNotificationSchema',{client_id:7,alarm_id:1,created_at:'2026-10-31T12:00:00Z',value:false},'date'],
  ['historic','historic_schemas','createHistoricSchema',{client_id:7,entity_id:1,recorded_at:'2026-10-31T12:00:00Z',data:{temp:0},data_key:'temp'},'selected_key'],
  ['client','client_schemas','registerSchema',{name:'Ana',email:'ana@example.com',password:'secret',role:'client'},'access_level'],
 ])('%s accepts canonical input and rejects old/unknown fields', (resource,file,name,body,old) => {
  const schema=require(`../../schemas/${file}`)[name];
  expect(validate(schema,body).error).toBeUndefined();
  expect(validate(schema,{...body,[old]:'legacy'}).error).toMatchObject({statusCode:400,code:'VALIDATION_ERROR'});
  expect(validate(schema,{...body,typo_field:true}).error).toBeDefined();
 });
 test.each(['MQTT','API'])('rejects old datasource enum %s', (datasource_type) => {
  expect(validate(require('../../schemas/entity_schemas').createEntitySchema,{client_id:7,name:'x',datasource_type,datasource_config:{}}).error).toBeDefined();
 });
 test.each(['lineChart','barChart','customValueCard'])('rejects old widget enum %s', (widget_type) => {
  expect(validate(require('../../schemas/widget_schemas').createWidgetSchema,{client_id:7,entity_id:1,dashboard_id:2,name:'x',widget_type,widget_config:{}}).error).toBeDefined();
 });
 test('does not expose credential aliases, passwords, or presentation fields', () => {
  expect(serializeResource('client',{client_id:7,id:7,password:'secret',access_level_id:1,admin_client_id:1})).toEqual({client_id:7,role:'admin',admin_client_id:1});
  expect(serializeResource('widget',{widget_id:1,name:'x',widget_config:{is_on:false},config_data:{},entity_name:'Sensor'})).toEqual({widget_id:1,name:'x',widget_config:{is_on:false}});
  expect(serializeResource('notification',{is_read:0,value:'0'})).toEqual({is_read:false,value:'0'});
  expect(serializeResource('notification',{value:'false'}).value).toBe('false');
  expect(serializeResource('historic',{data:'{"temp":0}'}).data).toBe('{"temp":0}');
  expect(serializeResource('entity',{entity_id:1,connection_status:null})).toEqual({entity_id:1});
  expect(serializeData({entities:[{entity_id:1,disp_name:'old',connection_status:null}]})).toEqual({entities:[{entity_id:1}]});
 });
 test('rejects React Flow nodes and old config names at public graph boundary', () => {
  const {definitionSchema}=require('../../schemas/definition_schema');
  expect(definitionSchema.validate(toRuntimeGraph(definition)).error).toBeDefined();
  expect(definitionSchema.validate({...definition,nodes:[{...definition.nodes[0],node_config:{key:'temp'}}]}).error).toBeDefined();
 });
});
describe('migration of existing data', () => {
 test('moves credentials/connectivity and preserves unknown connectivity', () => {
  const row=normalize('entity',{entity_id:1,disp_name:'Sensor',datasource_type:'MQTT',datasource_config:{sub_topic:'a',pub_topic:'b',token:'secret',status:'active',heartbeat_timeout:60000}});
  expect(row).toMatchObject({name:'Sensor',datasource_type:'mqtt',credential:{token:'secret'},connection_status:'online',datasource_config:{heartbeat_timeout_s:60}});
  expect(row.datasource_config).not.toHaveProperty('token');
  expect(row.datasource_config).not.toHaveProperty('status');
  expect(normalize('entity',{datasource_type:'API',datasource_config:{base_url:'https://example.com',polling_interval:1000,headers:'{"Accept":"application/json"}'}})).toMatchObject({datasource_type:'api',datasource_config:{polling_interval_ms:1000,headers:{Accept:'application/json'}}});
  expect(normalize('entity',{datasource_type:'API',datasource_config:{}})).not.toHaveProperty('connection_status');
 });
 test('preserves false/zero and cleans stored widget metadata', () => {
  expect(normalize('widget',{widget_type:'customValueCard',config_data:JSON.stringify({estadoActual:false,selected_key:'temp',scriptHtml:'<b/>',scriptCss:'b{}',client_id:7})})).toMatchObject({widget_type:'custom_value_card',widget_config:{is_on:false,data_key:'temp',html_template:'<b/>',css:'b{}'}});
  expect(normalize('widget',{widget_type:'switch',widget_config:{is_on:false}}).widget_config).toEqual({is_on:false});
  expect(normalize('alarm',{valor:'0',alarm_condition:'>',selected_key:'temp'})).toMatchObject({threshold:'0',operator:'greater_than',data_key:'temp'});
 });
 test('unwraps JSON strings and rejects malformed data before DDL', () => {
  expect(normalize('dashboard',{additional_client_ids:'"[1,2]"'}).shared_client_ids).toEqual([1,2]);
  expect(() => normalize('dashboard',{additional_client_ids:'broken'})).toThrow();
  expect(() => normalize('entity',{datasource_type:'MQTT',datasource_config:{heartbeat_timeout:2,heartbeat_timeout_s:3}})).toThrow();
 });
 test('normalizes old graphs and keeps canonical graphs stable', () => {
  const graph=toRuntimeGraph(definition);
  expect(normalize('rulechain',{rulechain:graph,entities_ids:'[1]'})).toMatchObject({definition,entity_ids:[1]});
  expect(toDefinition(definition)).toEqual(definition);
  expect(normalize('rulechain',{rulechain:{nodes:[],edges:[]}}).definition).toEqual({nodes:[],edges:[]});
  const invalid={nodes:definition.nodes,edges:[{edge_id:'e',source_node_id:'missing',target_node_id:'input'}]};
  expect(() => normalize('rulechain',{definition:invalid})).toThrow();
 });
});
test('Socket.IO emits only canonical events to authorized rooms', async () => {
 const socket=require('../../sockets/ws_helper'); const io={emit:jest.fn(),to:jest.fn().mockReturnThis()};socket.init(io);
 require('../../config/db').query.mockResolvedValue([[{client_id:7}]]);
 await socket.emitHistoricCreated({entity_id:1,historic_id:1,recorded_at:new Date('2026-10-31T12:00:00Z'),data:{temp:0}});
 await socket.emitEntityStateChange({entity_id:1,connection_status:'online'});
 expect(io.emit.mock.calls.map(([event])=>event)).toEqual(['historic:created','entity:connection_changed']);
 expect(io.emit.mock.calls[0][1].historic).not.toHaveProperty('date');
 expect(socket.emitDataMessage).toBeUndefined();
});

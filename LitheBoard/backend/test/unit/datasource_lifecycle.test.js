jest.mock('../../controllers/datasources/mqtt_handler', () => ({initialize:jest.fn(),stop:jest.fn()}));
jest.mock('../../controllers/datasources/api_handler', () => ({initialize:jest.fn(),stop:jest.fn()}));
jest.mock('../../controllers/datasources/db_handler', () => ({initialize:jest.fn(),stop:jest.fn()}));
jest.mock('../../models/historic_model', () => ({saveMessage:jest.fn()}));
jest.mock('../../models/alarm_model', () => ({getAlarmsByDevice:jest.fn(),saveAlarmNotification:jest.fn()}));
jest.mock('../../models/rulechain_model', () => ({getRulechainById:jest.fn()}));
jest.mock('../../controllers/rulechain_engine', () => ({processDynamicRuleChain:jest.fn()}));
const DatasourceController = require('../../controllers/datasource_controller');
const historic = require('../../models/historic_model');
const alarms = require('../../models/alarm_model');
const rules = require('../../models/rulechain_model');
const engine = require('../../controllers/rulechain_engine');
const api = require('../../controllers/datasources/api_handler');
const entity = {entity_id:1,client_id:7,datasource_type:'api',rulechain_id:0};
beforeEach(() => { jest.resetAllMocks(); alarms.getAlarmsByDevice.mockResolvedValue([]); });
test('unassigned entities persist the full payload exactly once without looking up a rule',async()=>{
 const controller=new DatasourceController([]); const data={temp:0,hum:50,nested:{valid:true}};
 await controller.handleDatasourceEvent({entity,data});
 expect(historic.saveMessage).toHaveBeenCalledTimes(1);
 expect(historic.saveMessage).toHaveBeenCalledWith(1,7,null,data);
 expect(rules.getRulechainById).not.toHaveBeenCalled();
});
test('custom chains accept full payload mode and do not trigger default persistence',async()=>{
 const compiled={rules:[]}; rules.getRulechainById.mockResolvedValue({compiled:JSON.stringify(compiled)});
 await new DatasourceController([]).handleDatasourceEvent({entity:{...entity,rulechain_id:9},data:{temp:10}});
 expect(engine.processDynamicRuleChain).toHaveBeenCalledWith(compiled,expect.any(Object),{temp:10});
 expect(historic.saveMessage).not.toHaveBeenCalled();
});
test('custom chain errors never cause fallback writes',async()=>{
 rules.getRulechainById.mockResolvedValue({compiled:{rules:[]}});
 engine.processDynamicRuleChain.mockRejectedValue(new Error('failed'));
 await new DatasourceController([]).handleDatasourceEvent({entity:{...entity,rulechain_id:9},data:{}});
 expect(historic.saveMessage).not.toHaveBeenCalled();
});
test('updating and deleting entities stops the previous source even with string ids',async()=>{
 const controller=new DatasourceController([entity]);
 await controller.addOrUpdateEntity({...entity,name:'updated'});
 expect(api.stop).toHaveBeenCalledTimes(1);
 expect(api.initialize).toHaveBeenCalledTimes(1);
 expect(api.stop.mock.invocationCallOrder[0]).toBeLessThan(api.initialize.mock.invocationCallOrder[0]);
 await controller.removeEntity('1');
 expect(api.stop).toHaveBeenCalledTimes(2);
 expect(controller.entityMap.size).toBe(0);
});

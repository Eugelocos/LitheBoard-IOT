jest.mock('../../controllers/datasources/mqtt_handler',()=>({publishToTopic:jest.fn()}));
jest.mock('../../models/historic_model',()=>({saveMessage:jest.fn()}));
jest.mock('../../controllers/mail_controller',()=>({}));
const {processDynamicRuleChain}=require('../../controllers/rulechain_engine');
const historic=require('../../models/historic_model');
beforeEach(()=>jest.resetAllMocks());
test('concurrent entities evaluate their own rules and facts',async()=>{
 const makeChain=(threshold)=>({rules:[{conditions:{all:[{fact:'temp',operator:'greaterThan',value:threshold}]},actions:[{type:'store'}]}]});
 await Promise.all([
  processDynamicRuleChain(makeChain(10),{entity_id:1,client_id:7},{temp:20}),
  processDynamicRuleChain(makeChain(100),{entity_id:2,client_id:8},{temp:20}),
 ]);
 expect(historic.saveMessage).toHaveBeenCalledTimes(1);
 expect(historic.saveMessage).toHaveBeenCalledWith(1,7,null,{temp:20});
});
test('condition-only rules do not fail when there is no action',async()=>{
 await expect(processDynamicRuleChain({rules:[{conditions:{all:[{fact:'temp',operator:'greaterThan',value:0}]},actions:[]}]},{entity_id:1,client_id:7},{temp:1})).resolves.toEqual({temp:1});
});

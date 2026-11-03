jest.mock('../../services/alarm_service',()=>({fetchById:jest.fn(),updateAlarm:jest.fn(),deleteAlarm:jest.fn()}));
jest.mock('../../services/entity_service',()=>({fetchEntityById:jest.fn()}));
const service=require('../../services/alarm_service');
const entities=require('../../services/entity_service');
const controller=require('../../controllers/api/alarm_controller');
const {run,forwardedError}=require('./helpers');
beforeEach(()=>jest.resetAllMocks());
test('another account cannot update or delete an alarm',async()=>{
 service.fetchById.mockResolvedValue({alarm_id:1,client_id:999});
 for (const handler of [controller.updateAlarm,controller.deleteAlarm]) {
  const {next}=await run(handler,{params:{alarm_id:1},body:{entity_id:2}});
  expect(forwardedError(next).statusCode).toBe(403);
 }
 expect(service.updateAlarm).not.toHaveBeenCalled();expect(service.deleteAlarm).not.toHaveBeenCalled();
});
test('an update cannot reassign an alarm across client boundaries',async()=>{
 service.fetchById.mockResolvedValue({alarm_id:1,client_id:8});
 entities.fetchEntityById.mockResolvedValue({entity_id:2,client_id:7});
 const {next}=await run(controller.updateAlarm,{user:{client_id:8,role:'client',admin_client_id:7},params:{alarm_id:1},body:{entity_id:2}});
 expect(forwardedError(next).statusCode).toBe(400);expect(service.updateAlarm).not.toHaveBeenCalled();
});
test('an authorized delete returns no content only after the service succeeds',async()=>{
 service.fetchById.mockResolvedValue({alarm_id:1,client_id:7});
 const {res,next}=await run(controller.deleteAlarm,{params:{alarm_id:1}});
 expect(next).not.toHaveBeenCalled();expect(service.deleteAlarm).toHaveBeenCalledWith(1);
 expect(res.status).toHaveBeenCalledWith(204);
});

jest.mock('axios',()=>jest.fn());
const axios=require('axios');const handler=require('../../controllers/datasources/api_handler');
const entity={client_id:7,entity_id:1,datasource_config:{base_url:'https://example.com',polling_interval_ms:10}};
beforeEach(()=>jest.useFakeTimers());
afterEach(()=>{handler.stop(entity);jest.useRealTimers();jest.resetAllMocks();});
test('stopping an in-flight request aborts it and suppresses late data and future polls',async()=>{
 let resolve;axios.mockReturnValue(new Promise(r=>{resolve=r;}));const emitter={emit:jest.fn()};
 handler.initialize(entity,emitter);const signal=axios.mock.calls[0][0].signal;
 handler.stop(entity);expect(signal.aborted).toBe(true);
 resolve({data:{temp:1}});await Promise.resolve();await Promise.resolve();
 jest.advanceTimersByTime(100);
 expect(emitter.emit).not.toHaveBeenCalled();expect(axios).toHaveBeenCalledTimes(1);
});
test('slow requests never overlap and restarting cancels the old poll',async()=>{
 axios.mockResolvedValue({data:{temp:1}});const emitter={emit:jest.fn()};
 handler.initialize(entity,emitter);await Promise.resolve();await Promise.resolve();
 handler.initialize(entity,emitter);await Promise.resolve();await Promise.resolve();
 expect(jest.getTimerCount()).toBe(1);
 handler.stop(entity);expect(jest.getTimerCount()).toBe(0);
});

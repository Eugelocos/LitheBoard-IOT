jest.mock('mysql2/promise',()=>({createConnection:jest.fn()}));
const mysql=require('mysql2/promise');const handler=require('../../controllers/datasources/db_handler');
const entity={entity_id:1,client_id:7,datasource_config:{query:'SELECT 1'}};
afterEach(async()=>{await handler.stop(entity);jest.resetAllMocks();});
test('an immediate delete during startup cannot leave a database polling loop running',async()=>{
 const emitter={emit:jest.fn()};const startup=handler.initialize(entity,emitter);
 await handler.stop(entity);await startup;
 expect(mysql.createConnection).not.toHaveBeenCalled();expect(emitter.emit).not.toHaveBeenCalled();
});
test('a late database connection is closed after cancellation',async()=>{
 let resolve;mysql.createConnection.mockReturnValue(new Promise(r=>{resolve=r;}));
 const connection={end:jest.fn(),query:jest.fn()};const emitter={emit:jest.fn()};
 const startup=handler.initialize(entity,emitter);await Promise.resolve();
 await handler.stop(entity);resolve(connection);await startup;
 expect(connection.end).toHaveBeenCalledTimes(1);expect(connection.query).not.toHaveBeenCalled();
});

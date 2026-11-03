jest.mock('../../config/db',()=>({query:jest.fn(),getConnection:jest.fn()}));
jest.mock('../../controllers/datasource_initializer',()=>({getDatasourceController:jest.fn()}));
const db=require('../../config/db');const service=require('../../services/entity_service');
const entity={entity_id:1,client_id:7,datasource_type:'api',datasource_config:{}};
let connection,controller;
beforeEach(()=>{
 jest.resetAllMocks();
 connection={beginTransaction:jest.fn(),query:jest.fn(),commit:jest.fn(),rollback:jest.fn(),release:jest.fn()};
 controller={removeEntity:jest.fn(),addOrUpdateEntity:jest.fn()};
 db.query.mockResolvedValue([[entity]]);db.getConnection.mockResolvedValue(connection);
 require('../../controllers/datasource_initializer').getDatasourceController.mockResolvedValue(controller);
});
test('entity removal stops the datasource before deleting dependent data in one transaction',async()=>{
 await expect(service.deleteEntity(1)).resolves.toBe('ok');
 expect(controller.removeEntity).toHaveBeenCalledWith(1);
 expect(connection.query).toHaveBeenCalledTimes(4);expect(connection.commit).toHaveBeenCalledTimes(1);
 expect(connection.rollback).not.toHaveBeenCalled();expect(connection.release).toHaveBeenCalledTimes(1);
 expect(controller.removeEntity.mock.invocationCallOrder[0]).toBeLessThan(connection.query.mock.invocationCallOrder[0]);
});
test('a failed delete rolls back and restarts the datasource',async()=>{
 connection.query.mockRejectedValueOnce(new Error('database unavailable'));
 await expect(service.deleteEntity(1)).rejects.toThrow('database unavailable');
 expect(connection.rollback).toHaveBeenCalledTimes(1);expect(connection.commit).not.toHaveBeenCalled();
 expect(controller.addOrUpdateEntity).toHaveBeenCalledWith(entity);expect(connection.release).toHaveBeenCalledTimes(1);
});

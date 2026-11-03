jest.mock('../../config/db', () => ({ query: jest.fn() }));
jest.mock('../../config', () => ({ jwtSecret:'test-secret',jwtExpiresIn:'1h' }));
jest.mock('../../services/client_service');
const db=require('../../config/db');
const socket=require('../../sockets/ws_helper');
const {mockResponse}=require('./helpers');
const jwt=require('jsonwebtoken');
beforeEach(()=>jest.resetAllMocks());
test('historic HTTP writes serialize JSON and emit only after successful insertion', async()=>{
 const io={emit:jest.fn(),to:jest.fn().mockReturnThis()};socket.init(io);
 db.query.mockResolvedValueOnce([[{entity_id:1}]]).mockResolvedValueOnce([[{client_id:7}]]).mockResolvedValueOnce([{insertId:9,affectedRows:1}]).mockResolvedValueOnce([[{client_id:7}]]);
 await require('../../services/historic_service').createHistoric({entity_id:1,client_id:7,recorded_at:new Date('2026-10-31T12:00:00Z'),data:{temp:0},data_key:'temp'});
 expect(db.query.mock.calls[2][1][2]).toBe('{"temp":0}');
 expect(io.emit).toHaveBeenCalledTimes(1);
 expect(io.emit).toHaveBeenCalledWith('historic:created',{historic:{historic_id:9,entity_id:1,client_id:7,recorded_at:'2026-10-31T12:00:00.000Z',data:{temp:0},data_key:'temp'}});
});
test('failed persistence does not publish a historic',async()=>{
 const io={emit:jest.fn(),to:jest.fn().mockReturnThis()};socket.init(io);
 db.query.mockRejectedValueOnce(new Error('write failed'));
 await expect(require('../../models/historic_model').saveMessage(1,7,'temp',{temp:0})).rejects.toThrow('write failed');
 expect(io.emit).not.toHaveBeenCalled();
});
test('telemetry persists its data_key using canonical SQL',async()=>{
 socket.init({emit:jest.fn(),to:jest.fn().mockReturnThis()});db.query.mockResolvedValueOnce([{insertId:10,affectedRows:1}]).mockResolvedValueOnce([[{client_id:7}]]);
 await require('../../models/historic_model').saveMessage(1,7,'temp',{temp:0});
 expect(db.query).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO historics (entity_id, recorded_at, data, client_id, data_key)'),[1,'{"temp":0}',7,'temp']);
});
test('JWT and authenticated client use client_id exclusively',async()=>{
 const auth=require('../../middlewares/auth');const res=mockResponse();
 auth.createSendToken({client_id:7,name:'Admin',email:'admin@example.com',access_level_id:1},200,res);
 const session=res.json.mock.calls[0][0].data.session;
 expect(session.client).not.toHaveProperty('id');
 expect(jwt.verify(session.token,'test-secret')).not.toHaveProperty('id');
 require('../../services/client_service').findById.mockResolvedValue({client_id:7,name:'Admin',access_level_id:1,admin_client_id:null});
 const req={headers:{authorization:'Bearer '+session.token}};const next=jest.fn();
 await auth.protect(req,res,next);
 expect(next).toHaveBeenCalledWith();
 expect(req.user).toMatchObject({client_id:7,role:'admin',admin_client_id:null});
 expect(req.user).not.toHaveProperty('id');
});
test('legacy JWT with only id requires a fresh login',async()=>{
 const token=jwt.sign({id:7},'test-secret');const next=jest.fn();
 await require('../../middlewares/auth').protect({headers:{authorization:'Bearer '+token}},mockResponse(),next);
 expect(next.mock.calls[0][0]).toMatchObject({statusCode:401,code:'TOKEN_INVALID'});
 expect(require('../../services/client_service').findById).not.toHaveBeenCalled();
});

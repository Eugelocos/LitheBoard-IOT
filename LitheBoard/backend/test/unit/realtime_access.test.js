jest.mock('../../config/db',()=>({query:jest.fn()}));
jest.mock('../../middlewares/auth',()=>({protect:jest.fn()}));
jest.mock('socket.io',()=>({Server:jest.fn()}));
const db=require('../../config/db');
const helper=require('../../sockets/ws_helper');
beforeEach(()=>jest.resetAllMocks());
test('telemetry only targets server-authorized clients and shared dashboard viewers',async()=>{
 const emit=jest.fn();const io={to:jest.fn(()=>({emit})),emit:jest.fn()};helper.init(io);
 db.query.mockResolvedValue([[{client_id:7},{client_id:8}]]);
 await helper.emitHistoricCreated({entity_id:1,client_id:7,data:{temp:10}});
 expect(io.to).toHaveBeenCalledWith(['client:7','client:8']);
 expect(emit).toHaveBeenCalledWith('historic:created',expect.any(Object));
 expect(io.emit).not.toHaveBeenCalled();
});
test('access is resolved again for every event and fails closed',async()=>{
 const io={to:jest.fn(),emit:jest.fn()};helper.init(io);
 db.query.mockResolvedValueOnce([[]]).mockRejectedValueOnce(new Error('offline'));
 await helper.emitEntityStateChange({entity_id:1,connection_status:'online'});
 await helper.emitEntityStateChange({entity_id:1,connection_status:'offline'});
 expect(io.to).not.toHaveBeenCalled();expect(io.emit).not.toHaveBeenCalled();
});
test('socket handshake rejects unauthenticated clients',async()=>{
 const io={use:jest.fn(),on:jest.fn()};require('socket.io').Server.mockReturnValue(io);
 require('../../middlewares/auth').protect.mockImplementation(async(req,res,next)=>next(new Error('invalid')));
 require('../../sockets/socket')({});const next=jest.fn();
 await io.use.mock.calls[0][0]({handshake:{auth:{}},data:{}},next);
 expect(next).toHaveBeenCalledWith(expect.any(Error));
});
test('socket room uses the authenticated identity rather than client-supplied account ids',async()=>{
 const io={use:jest.fn(),on:jest.fn()};require('socket.io').Server.mockReturnValue(io);
 require('../../middlewares/auth').protect.mockImplementation(async(req,res,next)=>{req.user={client_id:7};next();});
 require('../../sockets/socket')({});
 const token=require('jsonwebtoken').sign({client_id:7},'test');
 const socket={handshake:{auth:{token,client_id:999}},data:{},join:jest.fn(),on:jest.fn()};
 await io.use.mock.calls[0][0](socket,jest.fn());io.on.mock.calls[0][1](socket);
 expect(socket.join).toHaveBeenCalledWith('client:7');
});

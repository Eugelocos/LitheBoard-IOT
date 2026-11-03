const { sendSuccess, sendCollection, sendNoContent, sendError } = require('../../utils/response');
const { mockResponse, sent } = require('./helpers');

describe('utils/response', () => {
  it('sendSuccess envuelve el recurso con status y error nulo', () => {
    const res = mockResponse();

    sendSuccess(res, 201, { entity: { entity_id: 1 } });

    expect(sent(res)).toEqual({
      status: 201,
      body: { status: 'success', data: { entity: { entity_id: 1 } }, error: null },
    });
  });

  it('sendSuccess incluye meta solo cuando se pasa', () => {
    const res = mockResponse();

    sendSuccess(res, 200, { entities: [] }, { count: 0 });

    expect(sent(res).body).toEqual({ status: 'success', data: { entities: [] }, meta: { count: 0 }, error: null });
  });

  it('sendCollection responde 200 con el arreglo y su cantidad', () => {
    const res = mockResponse();

    sendCollection(res, 'alarms', [{ alarm_id: 1 }, { alarm_id: 2 }]);

    expect(sent(res)).toEqual({
      status: 200,
      body: { status: 'success', data: { alarms: [{ alarm_id: 1 }, { alarm_id: 2 }] }, meta: { count: 2 }, error: null },
    });
  });

  it('sendCollection trata null como colección vacía', () => {
    const res = mockResponse();

    sendCollection(res, 'alarms', null);

    expect(sent(res).body.data).toEqual({ alarms: [] });
  });

  it('sendNoContent responde 204 sin cuerpo', () => {
    const res = mockResponse();

    sendNoContent(res);

    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.send).toHaveBeenCalledWith();
    expect(res.json).not.toHaveBeenCalled();
  });

  it('sendError usa data nulo y un objeto de error con detalles', () => {
    const res = mockResponse();

    sendError(res, 404, { code: 'ENTITY_NOT_FOUND', message: 'No existe' });

    expect(sent(res)).toEqual({
      status: 404,
      body: { status: 'error', data: null, error: { code: 'ENTITY_NOT_FOUND', message: 'No existe', details: [] } },
    });
  });
});

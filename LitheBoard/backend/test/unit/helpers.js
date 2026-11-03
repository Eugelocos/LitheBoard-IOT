// Dobles mínimos de Express para probar controladores y middlewares sin servidor.

function mockResponse() {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  res.send = jest.fn(() => res);
  return res;
}

/** Ejecuta un handler y devuelve { res, next } para inspeccionar el resultado. */
async function run(handler, req = {}) {
  const res = mockResponse();
  const next = jest.fn();
  await handler({ params: {}, query: {}, body: {}, user: ADMIN, ...req }, res, next);
  return { res, next };
}

/** Cuerpo JSON enviado y estado HTTP. */
function sent(res) {
  return { status: res.status.mock.calls[0]?.[0], body: res.json.mock.calls[0]?.[0] };
}

/** Error pasado a next(). */
function forwardedError(next) {
  return next.mock.calls[0]?.[0];
}

const ADMIN = { client_id: 7, name: 'Admin', email: 'admin@example.com', role: 'admin', admin_client_id: null };

module.exports = { mockResponse, run, sent, forwardedError, ADMIN };

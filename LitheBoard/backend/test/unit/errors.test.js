const Joi = require('joi');
const AppError = require('../../utils/app_error');
const errorHandler = require('../../middlewares/error_handler');
const { validateSchema } = require('../../middlewares/validate');
const { mockResponse, sent } = require('./helpers');

describe('AppError', () => {
  it.each([
    [400, 'BAD_REQUEST'],
    [401, 'UNAUTHENTICATED'],
    [403, 'FORBIDDEN'],
    [404, 'NOT_FOUND'],
    [409, 'CONFLICT'],
    [500, 'INTERNAL_ERROR'],
  ])('asigna un código por defecto al estado %i', (status, code) => {
    expect(new AppError('x', status).code).toBe(code);
  });

  it('respeta el código y los detalles explícitos', () => {
    const error = new AppError('No existe', 404, 'ENTITY_NOT_FOUND', [{ field: 'entity_id', issue: 'missing' }]);

    expect(error).toMatchObject({
      statusCode: 404,
      code: 'ENTITY_NOT_FOUND',
      details: [{ field: 'entity_id', issue: 'missing' }],
      isOperational: true,
    });
  });
});

describe('middlewares/error_handler', () => {
  const handle = (err) => {
    const res = mockResponse();
    errorHandler(err, {}, res, jest.fn());
    return sent(res);
  };

  it('responde los errores operacionales con su código y mensaje', () => {
    expect(handle(new AppError('Prohibido', 403))).toEqual({
      status: 403,
      body: { status: 'error', data: null, error: { code: 'FORBIDDEN', message: 'Prohibido', details: [] } },
    });
  });

  it('oculta el detalle de los errores de programación', () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});

    const { status, body } = handle(new TypeError('cannot read x of undefined'));

    expect(status).toBe(500);
    expect(body.error).toEqual({ code: 'INTERNAL_ERROR', message: 'Internal server error', details: [] });
    console.error.mockRestore();
  });

  it('traduce el JSON inválido del cuerpo a INVALID_JSON', () => {
    const parseError = Object.assign(new SyntaxError('Unexpected token'), { type: 'entity.parse.failed' });

    expect(handle(parseError)).toMatchObject({ status: 400, body: { error: { code: 'INVALID_JSON' } } });
  });
});

describe('middlewares/validate', () => {
  const schema = Joi.object({ name: Joi.string().required(), count: Joi.number() });

  it('reemplaza el cuerpo por los valores validados', () => {
    const req = { body: { name: 'Sensor', count: '3' } };
    const next = jest.fn();

    validateSchema(schema)(req, {}, next);

    expect(next).toHaveBeenCalledWith();
    expect(req.body).toEqual({ name: 'Sensor', count: 3 });
  });

  it('rechaza con VALIDATION_ERROR y un detalle por campo', () => {
    const next = jest.fn();

    validateSchema(schema)({ body: { count: 'x' } }, {}, next);

    const error = next.mock.calls[0][0];
    expect(error).toBeInstanceOf(AppError);
    expect(error.statusCode).toBe(400);
    expect(error.code).toBe('VALIDATION_ERROR');
    expect(error.details).toEqual([
      expect.objectContaining({ field: 'name', issue: 'any.required' }),
      expect.objectContaining({ field: 'count', issue: 'number.base' }),
    ]);
  });

  it('valida otras ubicaciones de la petición', () => {
    const req = { params: { name: 'ok' } };
    const next = jest.fn();

    validateSchema(schema, 'params')(req, {}, next);

    expect(next).toHaveBeenCalledWith();
  });
});

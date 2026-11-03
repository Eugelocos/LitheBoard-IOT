// Verifica que cada controlador respete el contrato de respuestas
// (docs/CONVENCIONES_Y_CONTRATOS.md §5). Los servicios se simulan: no hay BD.

jest.mock('../../config', () => ({ jwtSecret: 'test-secret', jwtExpiresIn: '1h' }));
// El automock carga cada servicio real: se cortan antes la BD y los datasources.
jest.mock('../../config/db', () => ({ query: jest.fn() }));
jest.mock('../../controllers/datasource_initializer', () => ({ getDatasourceController: jest.fn() }));
jest.mock('../../services/alarm_service');
jest.mock('../../services/entity_service');
jest.mock('../../services/notification_service');
jest.mock('../../services/historic_service');
jest.mock('../../services/dashboard_service');
jest.mock('../../services/client_service');
jest.mock('../../services/dbServices/widget_service');
jest.mock('../../services/dbServices/rulechain_service');
jest.mock('../../services/dbServices/otp_service');
jest.mock('../../controllers/mail_controller', () => ({ sendOtpEmail: jest.fn() }));

const { serializeData } = require('../../contracts/resources');
const jwt = require('jsonwebtoken');
const AlarmService = require('../../services/alarm_service');
const EntityService = require('../../services/entity_service');
const NotificationService = require('../../services/notification_service');
const HistoricService = require('../../services/historic_service');
const DashboardService = require('../../services/dashboard_service');
const ClientService = require('../../services/client_service');
const WidgetService = require('../../services/dbServices/widget_service');
const RulechainService = require('../../services/dbServices/rulechain_service');
const OtpService = require('../../services/dbServices/otp_service');

const alarmController = require('../../controllers/api/alarm_controller');
const entityController = require('../../controllers/api/entity_controller');
const notificationController = require('../../controllers/api/notification_controller');
const historicController = require('../../controllers/api/historic_controller');
const dashboardController = require('../../controllers/api/dashboard_controller');
const clientController = require('../../controllers/api/client_controller');
const widgetController = require('../../controllers/api/widget_controller');
const rulechainController = require('../../controllers/api/rulechain_controller');
const otpController = require('../../controllers/api/otp_controller');
const { createSendToken } = require('../../middlewares/auth');
const { run, sent, forwardedError, mockResponse, ADMIN } = require('./helpers');

const OWN = ADMIN.client_id;
const entity = { entity_id: 42, client_id: OWN, name: 'Sensor' };
const dashboard = { dashboard_id: 5, client_id: OWN, name: 'Planta', description: 'x', shared_client_ids: [] };

const expectSuccess = (res, status, data) =>
  expect(sent(res)).toEqual({ status, body: expect.objectContaining({ status: 'success', data: serializeData(data), error: null }) });

const expectCollection = (res, key, items) =>
  expect(sent(res)).toEqual({
    status: 200,
    body: { status: 'success', data: serializeData({ [key]: items }), meta: { count: items.length }, error: null },
  });

const expectNoContent = (res) => {
  expect(res.status).toHaveBeenCalledWith(204);
  expect(res.json).not.toHaveBeenCalled();
};

const expectError = (next, statusCode, code) =>
  expect(forwardedError(next)).toMatchObject({ statusCode, code });

beforeEach(() => jest.resetAllMocks());

describe('colecciones vacías responden 200 con []', () => {
  it.each([
    ['alarms', () => AlarmService.fetchAlarmsByClientId, alarmController.getAlarmsByClientId, { params: { client_id: OWN } }],
    ['notifications', () => NotificationService.fetchByClientId, notificationController.getNotificationsByClientId, { params: { client_id: OWN } }],
    ['dashboards', () => DashboardService.fetchDashboardsByClientId, dashboardController.getDashboardsByClientId, { params: { client_id: OWN } }],
    ['entities', () => EntityService.fetchEntitiesByClientId, entityController.getEntities, { query: { client_id: OWN } }],
    ['historics', () => HistoricService.fetchByClientId, historicController.getHistoricByClientId, { params: { client_id: OWN } }],
    ['widgets', () => WidgetService.fetchWidgetsWithEntities, widgetController.getWidgetsWithEntities, { params: { client_id: OWN, dashboard_id: 5 } }],
    ['rulechains', () => RulechainService.fetchByClientId, rulechainController.getRulechains, { query: { client_id: OWN } }],
    ['client_ids', () => ClientService.getAssociatedClientIds, clientController.getAsociatedClientsAdminsByAdminId, { params: { admin_client_id: OWN } }],
    ['clients', () => ClientService.getClientsByIds, clientController.getClientsByIds, { params: { clients_ids: '8,9' } }],
  ])('%s', async (key, getServiceFn, handler, req) => {
    getServiceFn().mockResolvedValue([]);

    const { res, next } = await run(handler, req);

    expect(next).not.toHaveBeenCalled();
    expectCollection(res, key, []);
  });

  it('las colecciones con datos incluyen su cantidad en meta', async () => {
    AlarmService.fetchAlarmsByClientId.mockResolvedValue([{ alarm_id: 1 }]);

    const { res } = await run(alarmController.getAlarmsByClientId, { params: { client_id: OWN } });

    expectCollection(res, 'alarms', [{ alarm_id: 1 }]);
  });
});

describe('lecturas y creaciones devuelven el recurso bajo su nombre', () => {
  it('GET entidad', async () => {
    EntityService.fetchEntityById.mockResolvedValue(entity);

    const { res } = await run(entityController.getEntityById, { params: { entity_id: 42 } });

    expectSuccess(res, 200, { entity });
  });

  it('POST alarma responde 201 con data.alarm', async () => {
    EntityService.fetchEntityById.mockResolvedValue(entity);
    AlarmService.createAlarm.mockResolvedValue({ alarm_id: 9 });

    const { res } = await run(alarmController.insertAlarm, {
      body: { entity_id: 42, threshold: 30, client_id: OWN, data_key: 'temp', operator: '>' },
    });

    expectSuccess(res, 201, { alarm: { alarm_id: 9 } });
  });

  it('POST dashboard responde 201 con data.dashboard', async () => {
    DashboardService.createDashboard.mockResolvedValue(dashboard);

    const { res } = await run(dashboardController.insertDashboard, {
      body: { name: ' Planta ', description: ' x ', client_id: OWN },
    });

    expectSuccess(res, 201, { dashboard });
    expect(DashboardService.createDashboard).toHaveBeenCalledWith(expect.objectContaining({ name: 'Planta' }));
  });
});

describe('actualizaciones devuelven el recurso completo', () => {
  it('PUT dashboard', async () => {
    const updated = { ...dashboard, name: 'Nuevo' };
    DashboardService.fetchById.mockResolvedValueOnce(dashboard).mockResolvedValueOnce(updated);
    DashboardService.updateDashboard.mockResolvedValue(true);

    const { res } = await run(dashboardController.updateDashboard, {
      body: { dashboard_id: 5, name: 'Nuevo', description: 'x' },
    });

    expectSuccess(res, 200, { dashboard: updated });
  });

  it('PUT widget', async () => {
    const widget = { widget_id: 3, client_id: OWN, name: 'Temp' };
    WidgetService.fetchById.mockResolvedValue(widget);

    const { res } = await run(widgetController.updateWidget, { params: { widget_id: 3 }, body: { name: 'Temp' } });

    expectSuccess(res, 200, { widget });
    expect(WidgetService.updateWidget).toHaveBeenCalled();
  });

  it('PUT rulechain', async () => {
    const rulechain = { rulechain_id: 2, client_id: OWN, name: 'Regla' };
    RulechainService.fetchById.mockResolvedValue(rulechain);

    const { res } = await run(rulechainController.updateRulechain, { body: { rulechain_id: 2, name: 'Regla' } });

    expectSuccess(res, 200, { rulechain });
  });

  it('PUT entidad', async () => {
    EntityService.fetchEntityById.mockResolvedValue(entity);
    EntityService.updateEntity.mockResolvedValue({ ...entity, name: 'Nuevo' });

    const { res } = await run(entityController.updateEntity, { body: { entity_id: 42, name: 'Nuevo' } });

    expectSuccess(res, 200, { entity: { ...entity, name: 'Nuevo' } });
  });

  it('PATCH notificación leída', async () => {
    NotificationService.fetchById
      .mockResolvedValueOnce({ notification_id: 1, client_id: OWN, is_read: 0 })
      .mockResolvedValueOnce({ notification_id: 1, client_id: OWN, is_read: 1 });

    const { res } = await run(notificationController.markNotificationAsRead, { params: { notification_id: 1 } });

    expectSuccess(res, 200, { notification: { notification_id: 1, client_id: OWN, is_read: 1 } });
  });

  it('PUT cliente no expone el hash de la contraseña', async () => {
    ClientService.updateClient.mockResolvedValue(true);
    ClientService.findById.mockResolvedValue({ client_id: 8, name: 'Ana', email: 'ana@example.com', password: 'hash', access_level_id: 2 });

    const { res } = await run(clientController.updateClient, { body: { client_id: 8, name: 'Ana', email: 'ana@example.com' } });

    expectSuccess(res, 200, { client: { client_id: 8, name: 'Ana', email: 'ana@example.com' } });
  });

  it('asignar un dashboard usa client_id y dashboard_id y devuelve el dashboard', async () => {
    DashboardService.fetchById.mockResolvedValue(dashboard);
    DashboardService.assignDashboardToClient.mockResolvedValue('already_assigned');

    const { res } = await run(dashboardController.assignDashboardToClient, { body: { client_id: 8, dashboard_id: 5 } });

    expect(DashboardService.assignDashboardToClient).toHaveBeenCalledWith(8, 5);
    expectSuccess(res, 200, { dashboard });
  });
});

describe('borrados y acciones sin recurso responden 204', () => {
  it.each([
    ['dashboard', () => {
      DashboardService.fetchById.mockResolvedValue(dashboard);
      DashboardService.deleteDashboard.mockResolvedValue(true);
    }, dashboardController.deleteDashboard, { params: { dashboard_id: 5 } }],
    ['widget', () => {
      WidgetService.fetchById.mockResolvedValue({ widget_id: 3, client_id: OWN });
      WidgetService.deleteWidget.mockResolvedValue(true);
    }, widgetController.deleteWidget, { params: { widget_id: 3 } }],
    ['entidad', () => {
      EntityService.fetchEntityById.mockResolvedValue(entity);
      EntityService.deleteEntity.mockResolvedValue(true);
    }, entityController.deleteEntity, { params: { entity_id: 42 } }],
    ['rulechain', () => {
      RulechainService.fetchById.mockResolvedValue({ rulechain_id: 2, client_id: OWN });
      RulechainService.deleteRulechain.mockResolvedValue(true);
    }, rulechainController.deleteRulechain, { params: { rulechain_id: 2 } }],
    ['cliente', () => ClientService.deleteClient.mockResolvedValue(true), clientController.deleteClient, { params: { client_id: 8 } }],
    ['histórico creado', () => EntityService.fetchEntityById.mockResolvedValue(entity), historicController.insertHistoric, {
      body: { entity_id: 42, client_id: OWN, data: {} },
    }],
    ['logout', () => {}, clientController.logout, {}],
    ['OTP verificado', () => OtpService.verifyOtp.mockResolvedValue(true), otpController.verifyOtp, { body: { client_id: OWN, otp: '123456' } }],
  ])('%s', async (_name, arrange, handler, req) => {
    arrange();

    const { res, next } = await run(handler, req);

    expect(next).not.toHaveBeenCalled();
    expectNoContent(res);
  });
});

describe('errores con código estable', () => {
  it.each([
    ['ENTITY_NOT_FOUND', () => EntityService.fetchEntityById.mockResolvedValue(null), entityController.getEntityById, { params: { entity_id: 1 } }],
    ['DASHBOARD_NOT_FOUND', () => DashboardService.fetchById.mockResolvedValue(null), dashboardController.deleteDashboard, { params: { dashboard_id: 1 } }],
    ['WIDGET_NOT_FOUND', () => WidgetService.fetchById.mockResolvedValue(null), widgetController.getWidgetById, { params: { widget_id: 1 } }],
    ['RULECHAIN_NOT_FOUND', () => RulechainService.fetchById.mockResolvedValue(null), rulechainController.getRulechainById, { params: { rulechain_id: 1 } }],
    ['NOTIFICATION_NOT_FOUND', () => NotificationService.fetchById.mockResolvedValue(null), notificationController.markNotificationAsRead, { params: { notification_id: 1 } }],
    ['CLIENT_NOT_FOUND', () => ClientService.deleteClient.mockResolvedValue('not_found'), clientController.deleteClient, { params: { client_id: 1 } }],
  ])('%s', async (code, arrange, handler, req) => {
    arrange();

    const { res, next } = await run(handler, req);

    expectError(next, 404, code);
    expect(res.json).not.toHaveBeenCalled();
  });

  it('acceder a recursos de otro cliente es 403 FORBIDDEN', async () => {
    EntityService.fetchEntityById.mockResolvedValue({ ...entity, client_id: 999 });

    const { next } = await run(entityController.getEntityById, { params: { entity_id: 42 } });

    expectError(next, 403, 'FORBIDDEN');
  });

  it('un email ya registrado es 409 EMAIL_ALREADY_REGISTERED', async () => {
    ClientService.findByEmail.mockResolvedValue({ client_id: 1 });

    const { next } = await run(clientController.register, {
      body: { name: 'Ana', email: 'ana@example.com', password: 'x', role: 'client' },
    });

    expectError(next, 409, 'EMAIL_ALREADY_REGISTERED');
  });

  it('al registrar un cliente común se asocia al client_id de su administrador', async () => {
    ClientService.findByEmail
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ client_id: 3, email: 'jefe@example.com' });
    ClientService.createClient.mockResolvedValue({ client_id: 10, name: 'Ana', email: 'ana@example.com', role: 'client', admin_client_id: 3 });

    const { res } = await run(clientController.register, {
      body: { name: 'Ana', email: 'ana@example.com', password: 'x', role: 'client', admin_email: 'jefe@example.com' },
    });

    expect(ClientService.createClient).toHaveBeenCalledWith(expect.objectContaining({ admin_client_id: 3 }));
    expect(sent(res).status).toBe(201);
    expect(sent(res).body.data.client).toMatchObject({ client_id: 10, admin_client_id: 3 });
  });

  it('un cliente con dashboards no se borra: 409 CLIENT_HAS_DEPENDENCIES', async () => {
    ClientService.deleteClient.mockResolvedValue('has_dependencies');

    const { next } = await run(clientController.deleteClient, { params: { client_id: 8 } });

    expectError(next, 409, 'CLIENT_HAS_DEPENDENCIES');
  });

  it('un OTP inválido es 400 OTP_INVALID', async () => {
    OtpService.verifyOtp.mockResolvedValue(false);

    const { next } = await run(otpController.verifyOtp, { body: { client_id: OWN, otp: '000000' } });

    expectError(next, 400, 'OTP_INVALID');
  });
});

describe('sesión', () => {
  it('el login devuelve data.session con token y cliente', () => {
    const res = mockResponse();

    createSendToken({ client_id: 7, email: 'admin@example.com', name: 'Admin', access_level_id: 1 }, 200, res);

    const { status, body } = sent(res);
    expect(status).toBe(200);
    expect(body.status).toBe('success');
    expect(body.data.session.client).toEqual({
      client_id: 7,
      email: 'admin@example.com',
      name: 'Admin',
      role: 'admin',
    });
    expect(jwt.verify(body.data.session.token, 'test-secret')).toMatchObject({ client_id: 7, role: 'admin' });
  });

  it('GET session devuelve data.client', async () => {
    const { res } = await run(clientController.getUserSession);

    expectSuccess(res, 200, {
      client: { client_id: ADMIN.client_id, email: ADMIN.email, name: ADMIN.name, role: 'admin' },
    });
  });
});

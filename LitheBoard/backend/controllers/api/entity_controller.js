// backend/controllers/api/entity_controller.js

const AppError = require('../../utils/app_error');
const EntityService = require('../../services/entity_service');
const { assertOwnership } = require('../../utils/authorization');
const { sendSuccess, sendCollection, sendNoContent } = require('../../utils/response');

const entityNotFound = () => new AppError('Entidad no encontrada', 404, 'ENTITY_NOT_FOUND');

/**
 * GET /api/entity?client_id=<id>
 * Recupera todas las entidades asociadas a un client_id.
 */
exports.getEntities = async (req, res, next) => {
  try {
    const { client_id } = req.query;

    assertOwnership(req.user, client_id, 'listado de entidades');

    const entities = await EntityService.fetchEntitiesByClientId(client_id);
    return sendCollection(res, 'entities', entities);
  } catch (err) {
    if (err instanceof AppError) return next(err);
    return next(new AppError(err.message, 500));
  }
};

/**
 * POST /api/entity
 * Inserta una nueva entidad en la BD y la registra en el datasource correspondiente.
 */
exports.insertEntity = async (req, res, next) => {
  try {
    const { client_id, name, datasource_type, datasource_config, rulechain_id } = req.body;
    // Se asume validateSchema(createEntitySchema) antes de este controlador

    // FIX S-02: un admin sólo puede crear entidades para su propia cuenta
    assertOwnership(req.user, client_id, 'cliente');

    const entity = await EntityService.createEntity({
      client_id,
      name,
      datasource_type,
      datasource_config,
      rulechain_id,
    });

    return sendSuccess(res, 201, { entity });
  } catch (err) {
    if (err instanceof AppError) return next(err);
    return next(new AppError(err.message, 500));
  }
};

/**
 * GET /api/entity/:entity_id
 * Recupera una entidad específica por su ID.
 */
exports.getEntityById = async (req, res, next) => {
  try {
    const { entity_id } = req.params;
    // Se asume validateSchema(getEntityByIdSchema, 'params') antes de este controlador

    const entity = await EntityService.fetchEntityById(entity_id);
    if (!entity) return next(entityNotFound());

    // FIX S-02: la entidad debe pertenecer al usuario autenticado
    assertOwnership(req.user, entity.client_id, 'entidad');

    return sendSuccess(res, 200, { entity });
  } catch (err) {
    if (err instanceof AppError) return next(err);
    return next(new AppError(err.message, 500));
  }
};

/**
 * PUT /api/entity
 * Actualiza datos de una entidad existente (name, datasource_config, rulechain_id).
 */
exports.updateEntity = async (req, res, next) => {
  try {
    const { entity_id, name, datasource_config, rulechain_id } = req.body;
    // Se asume validateSchema(updateEntitySchema) antes de este controlador

    // FIX S-02: verificar ownership ANTES de tocar la entidad
    const existing = await EntityService.fetchEntityById(entity_id);
    if (!existing) return next(entityNotFound());
    assertOwnership(req.user, existing.client_id, 'entidad');

    const entity = await EntityService.updateEntity({
      entity_id,
      name,
      datasource_config,
      rulechain_id,
    });

    return sendSuccess(res, 200, { entity });
  } catch (err) {
    if (err instanceof AppError) return next(err);
    return next(new AppError(err.message, 500));
  }
};

/**
 * DELETE /api/entity/:entity_id
 * Elimina una entidad y sus datos relacionados (historics, desvincula widgets y alarmas).
 */
exports.deleteEntity = async (req, res, next) => {
  try {
    const { entity_id } = req.params;
    // Se asume validateSchema(deleteEntitySchema, 'params') antes de este controlador

    // FIX S-02
    const existing = await EntityService.fetchEntityById(entity_id);
    if (!existing) return next(entityNotFound());
    assertOwnership(req.user, existing.client_id, 'entidad');

    const result = await EntityService.deleteEntity(entity_id);
    if (result === 'not_found') return next(entityNotFound());

    return sendNoContent(res);
  } catch (err) {
    if (err instanceof AppError) return next(err);
    return next(new AppError(err.message, 500));
  }
};

/**
 * PATCH /api/entity/:entity_id/rulechain
 * Actualiza únicamente el campo `rulechain` dentro de `datasource_config`.
 */
exports.updateEntityRulechain = async (req, res, next) => {
  try {
    const { entity_id } = req.params;
    const { rulechain } = req.body;
    // Se asume validateSchema(updateEntityRulechainSchema) antes de este controlador

    // FIX S-02
    const existing = await EntityService.fetchEntityById(entity_id);
    if (!existing) return next(entityNotFound());
    assertOwnership(req.user, existing.client_id, 'entidad');

    await EntityService.updateEntityRulechain(entity_id, rulechain);

    const entity = await EntityService.fetchEntityById(entity_id);
    return sendSuccess(res, 200, { entity });
  } catch (err) {
    if (err instanceof AppError) return next(err);
    return next(new AppError(err.message, 500));
  }
};

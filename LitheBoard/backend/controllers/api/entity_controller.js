// backend/controllers/api/entity_controller.js

const AppError = require('../../utils/app_error');
const EntityService = require('../../services/entity_service');

/**
 * GET /api/entity?client_id=<id>
 * Recupera todas las entidades asociadas a un client_id.
 */
exports.getEntities = async (req, res, next) => {
  try {
    const { client_id } = req.query;
    // Se asume validateSchema(getEntitiesSchema, 'query') antes de este controlador

    // Llamamos al service para obtener entidades
    const entities = await EntityService.fetchEntitiesByClientId(client_id);

    return res.status(200).json({
      status: 'success',
      results: entities.length,
      data: { entities },
    });
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
    const { client_id, disp_name, datasource_type, datasource_config, rulechain_id } = req.body;
    // Se asume validateSchema(createEntitySchema) antes de este controlador

    const newEntity = await EntityService.createEntity({
      client_id,
      disp_name,
      datasource_type,
      datasource_config,
      rulechain_id,
    });

    return res.status(201).json({
      status: 'success',
      data: { entity: newEntity },
    });
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
    if (!entity) {
      return next(new AppError('Entitad no encontrada', 404));
    }

    return res.status(200).json({
      status: 'success',
      data: { entity },
    });
  } catch (err) {
    if (err instanceof AppError) return next(err);
    return next(new AppError(err.message, 500));
  }
};

/**
 * PUT /api/entity
 * Actualiza datos de una entidad existente (disp_name, datasource_config, rulechain_id).
 */
exports.updateEntity = async (req, res, next) => {
  try {
    const { entity_id, disp_name, datasource_config, rulechain_id } = req.body;
    // Se asume validateSchema(updateEntitySchema) antes de este controlador

    const updatedEntity = await EntityService.updateEntity({
      entity_id,
      disp_name,
      datasource_config,
      rulechain_id,
    });

    return res.status(200).json({
      status: 'success',
      message: 'Entity updated successfully',
      data: { entity: updatedEntity },
    });
  } catch (err) {
    if (err instanceof AppError) return next(err);
    return next(new AppError(err.message, 500));
  }
};

/**
 * DELETE /api/entity/:entity_id
 * Elimina una entidad y sus datos relacionados (historial, desvincula widgets y alarmas).
 */
exports.deleteEntity = async (req, res, next) => {
  try {
    const { entity_id } = req.params;
    // Se asume validateSchema(deleteEntitySchema, 'params') antes de este controlador

    const result = await EntityService.deleteEntity(entity_id);
    if (result === 'not_found') {
      return next(new AppError('Entidad no encontrada', 404));
    }

    return res.status(200).json({
      status: 'success',
      message: 'Entity and related data successfully deleted',
    });
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

    await EntityService.updateEntityRulechain(entity_id, rulechain);

    return res.status(200).json({
      status: 'success',
      message: 'Entity rulechain successfully updated',
    });
  } catch (err) {
    if (err instanceof AppError) return next(err);
    return next(new AppError(err.message, 500));
  }
};

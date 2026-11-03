// backend/routes/mqtt_routes.js

const express = require('express');
const router = express.Router();
const { publishMessage } = require('../controllers/datasources/mqtt_handler');
const EntityService = require('../services/entity_service');
const { protect } = require('../middlewares/auth');
const { assertOwnership } = require('../utils/authorization');
const AppError = require('../utils/app_error');
const { sendNoContent } = require('../utils/response');

/**
 * POST /api/mqtt/publish
 *
 * FIX S-03 (crítico): esta ruta no tenía `protect`, así que cualquiera sin
 * sesión podía publicar comandos MQTT hacia cualquier dispositivo.
 *
 * FIX adicional (no estaba en el informe pero es la misma familia de bug):
 * el body original mandaba el objeto `entity` completo (incluyendo
 * client_id, entity_id y datasource_config) y el backend confiaba en esos
 * datos tal cual para armar el topic de publicación. Eso significa que,
 * aunque agreguemos `protect`, un usuario autenticado podría mandar un
 * `entity` inventado con el client_id/entity_id de OTRO cliente y publicar
 * igual. La solución es recibir sólo `entity_id` desde el body, resolver
 * la entidad real contra la base de datos, y validar ownership sobre esa
 * entidad real (nunca sobre el objeto que manda el cliente).
 */
router.post('/publish', protect, async (req, res, next) => {
  try {
    const { entity_id, message } = req.body;

    if (!entity_id) {
      return next(
        new AppError('entity_id es requerido', 400, 'VALIDATION_ERROR', [{ field: 'entity_id', issue: 'any.required' }])
      );
    }

    // Resolver la entidad real desde la BD (nunca confiar en un `entity` del body)
    const entity = await EntityService.fetchEntityById(entity_id);
    if (!entity) {
      return next(new AppError('Entidad no encontrada', 404, 'ENTITY_NOT_FOUND'));
    }

    // Verificar que la entidad pertenezca al usuario autenticado
    assertOwnership(req.user, entity.client_id, 'entidad');

    await publishMessage(entity, message);

    return sendNoContent(res);
  } catch (err) {
    if (err instanceof AppError) return next(err);
    return next(new AppError(err.message, 500));
  }
});

module.exports = router;
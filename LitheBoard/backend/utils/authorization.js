// backend/utils/authorization.js
//
// Helper central de autorización a nivel de objeto (fix de S-02, IDOR sistémico).
// req.user es inyectado por middlewares/auth.js::protect y tiene la forma:
//   { id, name, email, role, admin_client_id }
//
// Regla de negocio (ajustar si el modelo real difiere):
//  - Un "admin" es dueño de sus propias entidades/dashboards/widgets/etc.
//    (resourceClientId === user.client_id)
//  - Un "client" (sub-cuenta) puede ver los recursos de SU admin
//    (resourceClientId === user.admin_client_id)
//  - Compartir vía shared_client_ids (dashboards) se maneja aparte,
//    ya que no es "dueño" sino "invitado".

const AppError = require('./app_error');

function isOwner(user, resourceClientId) {
  if (!user || resourceClientId === null || resourceClientId === undefined) return false;

  const resId = Number(resourceClientId);
  if (Number.isNaN(resId)) return false;

  if (Number(user.client_id) === resId) return true;
  if (user.role === 'client' && user.admin_client_id != null && Number(user.admin_client_id) === resId) {
    return true;
  }
  return false;
}

/**
 * Lanza un 403 si el usuario autenticado no es dueño del recurso.
 * Usar SIEMPRE antes de devolver o modificar un recurso identificado por ID.
 */
function assertOwnership(user, resourceClientId, resourceName = 'recurso') {
  if (!isOwner(user, resourceClientId)) {
    throw new AppError(`No tenés permiso para acceder a este ${resourceName}.`, 403);
  }
}

module.exports = { isOwner, assertOwnership };
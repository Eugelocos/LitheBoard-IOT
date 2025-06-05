// backend/middlewares/auth.js

const jwt = require('jsonwebtoken');
const AppError = require('../utils/app_error');
const { jwtSecret, jwtExpiresIn } = require('../config');
const clientService = require('../services/client_service'); // <-- usamos client_service en lugar de user_model
const bcrypt = require('bcryptjs'); // Solo si lo necesitas para comparar contraseñas en otro punto

/**
 * Middleware para proteger rutas: verifica que exista un token JWT válido.
 * - Se espera que el token venga en el header "Authorization: Bearer <token>".
 * - Si el token es válido, recupera al cliente de la BD y lo inyecta en req.user.
 */
exports.protect = async (req, res, next) => {
  try {
    let token;

    // 1) Verificar que el header Authorization exista y tenga formato "Bearer <token>"
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('No estás autenticado. Proporciona un token.', 401));
    }

    // 2) Verificar y decodificar el token
    let decoded;
    try {
      decoded = jwt.verify(token, jwtSecret);
    } catch (err) {
      return next(new AppError('Token inválido o expirado. Inicia sesión de nuevo.', 401));
    }

    // 3) Comprobar que el cliente aún existe en la base de datos
    //    (podría haber sido eliminado)
    const clientRecord = await clientService.findById(decoded.id);
    if (!clientRecord) {
      return next(new AppError('El cliente del token ya no existe.', 401));
    }

    // 4) Verificar si el cliente cambió su contraseña después de que el token fue emitido
    if (clientRecord.password_changed_at) {
      const passwordChangedTimestamp = parseInt(
        new Date(clientRecord.password_changed_at).getTime() / 1000,
        10
      );
      if (decoded.iat < passwordChangedTimestamp) {
        return next(
          new AppError(
            'El cliente cambió la contraseña recientemente. Inicia sesión de nuevo.',
            401
          )
        );
      }
    }

    // 5) Si todo ok, adjuntamos los datos mínimos del cliente en req.user
    req.user = {
      id: clientRecord.id,
      name: clientRecord.name,
      email: clientRecord.email,
      role: clientRecord.role,
      admin_id: clientRecord.admin_id,
    };
    next();
  } catch (err) {
    return next(new AppError('No se pudo verificar la autenticación.', 500));
  }
};

/**
 * Middleware para restringir accesos según roles.
 * - rolesPermitidos: array de strings, p. ej. ['admin', 'manager']
 * Solo los clientes cuyo req.user.role esté en rolesPermitidos podrán continuar.
 */
exports.restrictTo = (...rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.user) {
      // Si no se aplicó protect primero, lanzamos error
      return next(new AppError('Debes estar autenticado para ejecutar esta acción.', 401));
    }
    if (!rolesPermitidos.includes(String(req.user.role))) {
      // Asegúrate de comparar con String si tu "role" es integer en la BD
      return next(new AppError('No tienes permisos para realizar esta acción.', 403));
    }
    next();
  };
};

/**
 * Función para generar y enviar un JWT al cliente tras login o signup.
 * - client: objeto con { id, email, role }.
 * - statusCode: código HTTP de respuesta (200, 201, etc.).
 * - res: objeto response de Express.
 */
exports.createSendToken = (client, statusCode, res) => {
  // 1) Crear el payload mínimo (id y role)
  const role = client.admin_id!=null ? "client" : "admin";

  const payload = { id: client.id, role: role };

  // 2) Firmar el token con el secreto y establecer expiración
  const token = jwt.sign(payload, jwtSecret, {
    expiresIn: jwtExpiresIn,
  });

  
  // 3) Enviar JSON con token y datos mínimos del cliente
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      client: {
        id: client.client_id,
        email: client.email,
        role: role,
        name: client.name
      },
    },
  });
};

// backend/middlewares/auth.js

const jwt = require('jsonwebtoken');
const AppError = require('../utils/appError');
const { jwtSecret, jwtExpiresIn } = require('../config'); 
const User = require('../models/user_model'); // Ajusta la ruta según tengas definido tu modelo de usuario

/**
 * Middleware para proteger rutas: verifica que exista un token JWT válido.
 * - Se espera que el token venga en el header "Authorization: Bearer <token>".
 * - Si el token es válido, recupera al usuario de la BD y lo inyecta en req.user.
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

    // 3) Comprobar que el usuario aún existe en la base de datos
    //    (por ejemplo, pudo haber sido eliminado)
    const user = await User.findById(decoded.id);
    if (!user) {
      return next(new AppError('El usuario del token ya no existe.', 401));
    }

    // 4) Verificar si el usuario cambió su contraseña después de que el token fue emitido
    //    (Opcional: si guardas en User un campo passwordChangedAt)
    if (user.passwordChangedAt) {
      const passwordChangedTimestamp = parseInt(user.passwordChangedAt.getTime() / 1000, 10);
      if (decoded.iat < passwordChangedTimestamp) {
        return next(
          new AppError(
            'El usuario cambió la contraseña recientemente. Inicia sesión de nuevo.',
            401
          )
        );
      }
    }

    // 5) Si todo ok, adjuntamos el usuario al request para que lo use el controlador
    req.user = user;
    next();
  } catch (err) {
    return next(new AppError('No se pudo verificar la autenticación.', 500));
  }
};

/**
 * Middleware para restringir accesos según roles.
 * - rolesPermitidos: array de strings, p. ej. ['admin', 'manager']
 * Solo los usuarios cuyo user.role esté en rolesPermitidos podrán continuar.
 */
exports.restrictTo = (...rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.user) {
      // Si no se aplicó protect primero, lanzamos error
      return next(new AppError('Debes estar autenticado para ejecutar esta acción.', 401));
    }
    if (!rolesPermitidos.includes(req.user.role)) {
      return next(new AppError('No tienes permisos para realizar esta acción.', 403));
    }
    next();
  };
};

/**
 * Middleware para generar y enviar un JWT al usuario tras login o signup.
 * Puede usarse en controllers de auth (por ejemplo, signupController, loginController).
 * - user: objeto de usuario (modelo) proveniente de la BD.
 * - statusCode: código HTTP de respuesta (p. ej. 200 o 201).
 * - res: objeto response de Express.
 */
exports.createSendToken = (user, statusCode, res) => {
  // 1) Crear el payload mínimo (aquí, solo incluimos user.id y role; puedes agregar otros campos si lo necesitas)
  const payload = { id: user._id, role: user.role };

  // 2) Firmar el token con el secreto y establecer expiración
  const token = jwt.sign(payload, jwtSecret, {
    expiresIn: jwtExpiresIn,
  });

  // 3) Para mayor seguridad, podrías enviar el token como HTTP-only cookie.
  //    Aquí lo devolvemos en JSON, pero puedes ajustar a tu preferencia.
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        // No es buena práctica enviar la contraseña ni campos sensibles
      },
    },
  });
};

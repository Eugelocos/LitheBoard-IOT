// backend/controllers/api/client_controller.js

const bcrypt = require('bcryptjs');
const AppError = require('../../utils/app_error');
const ClientService = require('../../services/client_service');
const { createSendToken } = require('../../middlewares/auth');
const { sendSuccess, sendCollection, sendNoContent } = require('../../utils/response');

const clientNotFound = () => new AppError('Cliente no encontrado', 404, 'CLIENT_NOT_FOUND');

/**
 * POST /api/clients/login
 * Autentica a un cliente: verifica correo y contraseña, y responde con JWT.
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validación mínima (idealmente con Joi antes en la ruta)
    if (!email || !password) {
      return next(new AppError('Email y contraseña son requeridos', 400, 'VALIDATION_ERROR'));
    }

    // Buscar cliente por email
    const client = await ClientService.findByEmail(email);
    if (!client) {
      return next(new AppError('Email o contraseña inválidos', 401, 'INVALID_CREDENTIALS'));
    }

    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(password.trim(), client.password);
    if (!isPasswordValid) {
      return next(new AppError('Email o contraseña inválidos', 401, 'INVALID_CREDENTIALS'));
    }

    // Remover el password del objeto antes de enviar (por seguridad)
    client.password = undefined;

    // Generar y enviar token
    return createSendToken(client, 200, res);
  } catch (err) {
    return next(new AppError(err.message, 500));
  }
};

/**
 * GET /api/clients/session
 * Devuelve datos básicos del cliente autenticado (usando JWT).
 */
exports.getUserSession = async (req, res, next) => {
  try {
    // El middleware `protect` ya habrá agregado req.user si el JWT es válido
    const user = req.user;
    if (!user) {
      return next(new AppError('Usuario no autenticado', 401));
    }
    return sendSuccess(res, 200, {
      client: { client_id: user.client_id, email: user.email, name: user.name, role: user.role },
    });
  } catch (err) {
    return next(new AppError(err.message, 500));
  }
};

/**
 * POST /api/clients/logout
 * (Opcional en JWT: puede invalidar token en cliente; aquí solo devolvemos 204)
 */
exports.logout = async (_req, res) => {
  // En un sistema JWT puro, basta con que el cliente borre el token.
  return sendNoContent(res);
};

/**
 * POST /api/clients/register
 * Registra un cliente nuevo, hash de contraseña, y opcionamente lo asocia a un admin.
 */
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, admin_email, role } = req.body;

    // Validación mínima (idealmente con Joi antes en la ruta)
    if (!name || !email || !password || !role) {
      return next(
        new AppError('Todos los campos (name, email, password, role) son requeridos', 400, 'VALIDATION_ERROR')
      );
    }

    // Verificar que no exista otro cliente con ese email
    const existing = await ClientService.findByEmail(email);
    if (existing) {
      return next(new AppError('Ya existe un cliente con ese correo', 409, 'EMAIL_ALREADY_REGISTERED'));
    }

    // Determinar admin_client_id si corresponde
    let admin_client_id = null;
    if (role === 'client' && admin_email) {
      const admin = await ClientService.findByEmail(admin_email);
      if (!admin) {
        return next(new AppError('No hay un administrador con ese email', 404, 'ADMIN_NOT_FOUND'));
      }
      admin_client_id = admin.client_id;
    }

    // Crear el cliente (en el service se hace el hash de password)
    const newClient = await ClientService.createClient({ name, email, password, role, admin_client_id });

    // Si quieres, puedes directamente loguear al usuario tras registrarse:
    // createSendToken(newClient, 201, res);
    return sendSuccess(res, 201, {
      client: {
        client_id: newClient.client_id,
        name: newClient.name,
        email: newClient.email,
        role: newClient.role,
        admin_client_id: newClient.admin_client_id || null,
      },
    });
  } catch (err) {
    return next(new AppError(err.message, 500));
  }
};

/**
 * PUT /api/clients
 * Actualiza nombre y email de un cliente existente.
 */
exports.updateClient = async (req, res, next) => {
  try {
    const { client_id, name, email } = req.body;
    if (!client_id || !name || !email) {
      return next(new AppError('Los campos id, name y email son obligatorios', 400, 'VALIDATION_ERROR'));
    }

    // Verificar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return next(
        new AppError('Email no válido', 400, 'VALIDATION_ERROR', [{ field: 'email', issue: 'string.email' }])
      );
    }

    const updated = await ClientService.updateClient({ client_id, name, email });
    if (!updated) return next(clientNotFound());

    // findById devuelve también el hash de la contraseña: se exponen solo los campos públicos.
    const record = await ClientService.findById(client_id);
    return sendSuccess(res, 200, {
      client: { client_id: record.client_id, name: record.name, email: record.email },
    });
  } catch (err) {
    return next(new AppError(err.message, 500));
  }
};

/**
 * GET /api/clients/admins/:admin_client_id/clients
 * Obtiene todos los client_ids asociados a un admin dado.
 */
exports.getAsociatedClientsAdminsByAdminId = async (req, res, next) => {
  try {
    const { admin_client_id } = req.params;
    if (!admin_client_id) {
      return next(new AppError('El parámetro admin_client_id es requerido', 400));
    }

    const client_ids = await ClientService.getAssociatedClientIds(admin_client_id);
    return sendCollection(res, 'client_ids', client_ids);
  } catch (err) {
    return next(new AppError(err.message, 500));
  }
};

/**
 * GET /api/clients/:clients_ids
 * Obtiene detalles de clientes cuyos IDs vienen en coma-separados en params.
 */
exports.getClientsByIds = async (req, res, next) => {
  try {
    const { clients_ids } = req.params;
    if (!clients_ids) {
      return next(new AppError('Debe proporcionar una lista de client IDs', 400));
    }

    // Convertir "1,2,3" en [1, 2, 3]
    const idsArray = clients_ids.split(',').map((id) => parseInt(id, 10));
    if (idsArray.some((id) => isNaN(id))) {
      return next(new AppError('Todos los IDs deben ser valores numéricos válidos', 400, 'VALIDATION_ERROR'));
    }

    const clients = await ClientService.getClientsByIds(idsArray);
    return sendCollection(res, 'clients', clients);
  } catch (err) {
    return next(new AppError(err.message, 500));
  }
};

/**
 * DELETE /api/clients/:client_id
 * Elimina un cliente si no tiene dependencias (dashboards asociados).
 */
exports.deleteClient = async (req, res, next) => {
  try {
    const { client_id } = req.params;
    if (!client_id) {
      return next(new AppError('El parámetro client_id es requerido', 400));
    }

    // Verificar si existe y no tiene dependencias
    const deleted = await ClientService.deleteClient(client_id);
    if (deleted === 'not_found') return next(clientNotFound());
    if (deleted === 'has_dependencies') {
      return next(
        new AppError(
          'No se puede eliminar el cliente porque tiene dashboards asociados',
          409,
          'CLIENT_HAS_DEPENDENCIES'
        )
      );
    }

    return sendNoContent(res);
  } catch (err) {
    return next(new AppError(err.message, 500));
  }
};

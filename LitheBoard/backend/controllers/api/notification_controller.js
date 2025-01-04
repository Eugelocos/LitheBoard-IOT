
const db = require("../../config/db");

const getNotificationsByClientId = async (req, res) => {
  const { client_id } = req.params;

  // Validación del parámetro `client_id`
  if (!client_id) {
    return res
      .status(400)
      .json({ message: "El parámetro client_id es obligatorio." });
  }

  const query = "SELECT * FROM notifications WHERE client_id = ?";

  try {
    // Ejecutar la consulta con `async/await`
    const [results] = await db.promise().query(query, [client_id]);

    // Comprobar si no hay notificaciones
    if (results.length === 0) {
      return res.status(404).json({
        message: "No se encontraron notificaciones para este cliente.",
      });
    }

    // Devolver las notificaciones
    res.status(200).json(results);
  } catch (err) {
    console.error("Error fetching notifications:", err);
    res.status(500).json({
      message: "Error en el servidor al obtener notificaciones.",
      error: err.message,
    });
  }
};

const instertNotification = async (req, res) => {
  const { alarm_id, client_id, date, data } = req.body;

  // Validar los datos de entrada
  if (!alarm_id || !client_id || !date || !data) {
    return res.status(400).json({
      message:
        "Todos los campos (alarm_id, client_id, date, data) son obligatorios.",
    });
  }

  const query = `
      INSERT INTO notifications (alarm_id, client_id, date, data) 
      VALUES (?, ?, ?, ?)
    `;
  const values = [alarm_id, client_id, date, data];

  try {
    // Ejecutar la consulta con async/await
    const [result] = await db.promise().query(query, values);

    // Responder con el ID de la notificación recién creada
    res.status(201).json({
      notification_id: result.insertId,
      alarm_id,
      client_id,
      date,
      data,
    });
  } catch (err) {
    console.error("Error inserting notification data:", err);
    res.status(500).json({
      message: "Error en el servidor al insertar notificación.",
      error: err.message,
    });
  }
};

 const markNotificationAsRead= async (req, res) => {
  const { notification_id } = req.params;

  // Verifica que notification_id esté presente
  if (!notification_id) {
    return res.status(400).json({
      message: "El ID de la notificación es obligatorio.",
    });
  }

  const query = "UPDATE notifications SET visto = 1 WHERE notification_id = ?";

  try {
    // Ejecutar la consulta con async/await
    const [result] = await db.promise().query(query, [notification_id]);

    // Verificar si alguna fila fue afectada
    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Notificación no encontrada.",
      });
    }

    res.status(200).json({
      message: "Notificación marcada como leída.",
    });
  } catch (err) {
    console.error("Error marcando la notificación como leída:", err);
    res.status(500).json({
      message: "Error en el servidor al marcar la notificación como leída.",
      error: err.message,
    });
  }
}

module.exports={
    getNotificationsByClientId,
    instertNotification,
    markNotificationAsRead
}
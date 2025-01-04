const db = require("../../config/db");


/**
 * Retrieves alarms for a specific client from the database and sends the results in the response.
 * 
 * This function handles an incoming HTTP request to fetch alarms associated with a given client ID.
 * It performs a SQL query to join the alarms and entities tables and returns the relevant data.
 * If no alarms are found, it responds with a 404 status and a message indicating that no alarms were found.
 * If an error occurs during the database query, it responds with a 500 status and the error message.
 * 
 * @param {Object} req - The request object, which contains parameters for the API call.
 * @param {Object} res - The response object, used to send back the desired HTTP response.
 * @returns {Promise<void>} A Promise that resolves when the response has been sent.
 * 
 * @throws {Error} In case of a database query error, a 500 status will be sent back with the error message.
 */

const getAlarmsByClientId = async (req, res) => {
  const { client_id } = req.params;

  const query = `
      SELECT 
        a.alarm_id, 
        a.entity_id, 
        a.valor, 
        a.client_id, 
        a.selected_key,
        a.alarm_condition,
        e.disp_name,
        e.token,
        e.sub_topic
      FROM 
        alarms a
      JOIN 
        entities e ON a.entity_id = e.entity_id
      WHERE 
        a.client_id = ?;
    `;

  try {
    const [results] = await db.promise().query(query, [client_id]);
    if (results.length === 0) {
      return res
        .status(404)
        .json({ message: "No se encontraron alarmas para este cliente." });
    }
    res.status(200).json(results);
  } catch (err) {
    console.error("Error fetching alarms:", err);
    res
      .status(500)
      .json({ message: "Error en el servidor", error: err.message });
  }
};

const insterAlarm = async (req, res) => {
  const { entity_id, valor, client_id, selected_key, alarm_condition } =
    req.body;

  // Validación básica de entrada
  if (
    !entity_id ||
    valor == null ||
    !client_id ||
    !selected_key ||
    !alarm_condition
  ) {
    return res
      .status(400)
      .json({
        message:
          "Todos los campos son obligatorios: entity_id, valor, client_id, selected_key, alarm_condition.",
      });
  }

  const query = `
      INSERT INTO alarms (entity_id, valor, client_id, selected_key, alarm_condition) 
      VALUES (?, ?, ?, ?, ?)
    `;

  try {
    const [result] = await db
      .promise()
      .query(query, [
        entity_id,
        valor,
        client_id,
        selected_key,
        alarm_condition,
      ]);

    res.status(201).json({
      message: "Alarma insertada exitosamente",
      alarm_id: result.insertId,
      entity_id,
      valor,
      client_id,
      selected_key,
      alarm_condition,
    });
  } catch (err) {
    console.error("Error inserting alarm data:", err);
    res
      .status(500)
      .json({ message: "Error en el servidor", error: err.message });
  }
};

module.exports={
    getAlarmsByClientId,
    insterAlarm
}

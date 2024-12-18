const db = require("../../config/db");

const instertDashboard = async (req, res) => {
  const { name, description, client_id, additional_client_ids = [] } = req.body;

  if (!name || !description || !client_id) {
    return res
      .status(400)
      .json({
        message:
          "Por favor, complete todos los campos requeridos (name, description, client_id)",
      });
  }

  if (!Array.isArray(additional_client_ids)) {
    return res
      .status(400)
      .json({ message: "additional_client_ids debe ser un arreglo" });
  }

  const query =
    "INSERT INTO dashboards (name, description, client_id, additional_client_ids) VALUES (?, ?, ?, ?)";

  try {
    const [result] = await db
      .promise()
      .query(query, [
        name,
        description,
        client_id,
        JSON.stringify(additional_client_ids),
      ]);

    const newDashboard = {
      dashboard_id: result.insertId,
      name,
      description,
      client_id,
      additional_client_ids,
    };

    res.status(201).json(newDashboard);
  } catch (err) {
    console.error("Error inserting dashboard:", err);
    return res
      .status(500)
      .json({ message: "Error en el servidor", error: err.message });
  }
}

const getDahboardsByClientId = async (req, res) => {
  const { client_id } = req.params;

  if (!client_id) {
    return res.status(400).json({ message: "Se requiere un client_id válido" });
  }

  const query = `
      SELECT * FROM dashboards
      WHERE client_id = ?
      OR JSON_CONTAINS(additional_client_ids, CAST(? AS JSON), '$')
    `;

  try {
    const [results] = await db.promise().query(query, [client_id, client_id]);

    if (results.length === 0) {
      return res
        .status(404)
        .json({ message: "No se encontraron dashboards para este cliente" });
    }

    res.json(results);
  } catch (err) {
    console.error("Error executing query:", err);
    return res
      .status(500)
      .json({ message: "Error en el servidor", error: err.message });
  }
}

const updateDashboard = async (req, res) => {
  const {
    dashboard_id,
    name,
    description,
    additional_client_ids = [],
  } = req.body;

  if (!dashboard_id || !name || !description) {
    return res.status(400).json({ message: "Faltan parámetros necesarios" });
  }

  const query = `
      UPDATE dashboards
      SET name = ?, description = ?, additional_client_ids = ?
      WHERE dashboard_id = ?
    `;

  try {

    const [result] = await db
      .promise()
      .query(query, [
        name,
        description,
        JSON.stringify(additional_client_ids),
        dashboard_id,
      ]);


    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Dashboard no encontrado" });
    }

    res.status(200).json({ message: "Dashboard actualizado correctamente" });
  } catch (err) {
    console.error("Error updating dashboard:", err);
    return res
      .status(500)
      .json({ message: "Error en el servidor", error: err.message });
  }
}

const deleteDahboard = async (req, res) => {
  const { dashboard_id } = req.params;

  const deleteWidgetsQuery = "DELETE FROM widgets WHERE dashboard_id = ?";
  const deleteDashboardQuery = "DELETE FROM dashboards WHERE dashboard_id = ?";

  try {

    const [widgetsResult] = await db
      .promise()
      .query(deleteWidgetsQuery, [dashboard_id]);

    const [dashboardResult] = await db
      .promise()
      .query(deleteDashboardQuery, [dashboard_id]);

    if (dashboardResult.affectedRows === 0) {
      return res.status(404).json({ message: "Dashboard no encontrado" });
    }

    res
      .status(200)
      .json({ message: "Dashboard y widgets eliminados correctamente" });
  } catch (err) {
    console.error("Error deleting dashboard or widgets:", err);
    return res.status(500).json({
      message: "Error en el servidor al eliminar dashboard y/o widgets",
      error: err.message,
    });
  }
}

const assignDashboardToClient = async (req, res) => {
  const { clientId, dashboardId } = req.body;

  if (!clientId || !dashboardId) {
    console.error("Error con cliente", clientId, "o con dahboard", dashboardId);
  }
  try {
    const [dashboardResults] = await db
      .promise()
      .query(
        "SELECT additional_client_ids FROM dashboards WHERE dashboard_id = ?",
        [dashboardId]
      );

    if (dashboardResults.length === 0) {
      return res.status(404).json({ message: "Dashboard no encontrado" });
    }

    const dashboard = dashboardResults[0];
    let associatedClients = [];

    try {
      associatedClients = dashboard.additional_client_ids || "[]";
    } catch (parseError) {
      console.error("Error parsing JSON:", parseError);
      return res.status(500).json({
        message: "Error en el servidor al procesar los datos",
        error: parseError,
      });
    }

    if (!associatedClients.includes(clientId)) {
      associatedClients.push(clientId);

      await db
        .promise()
        .query(
          "UPDATE dashboards SET additional_client_ids = ? WHERE dashboard_id = ?",
          [JSON.stringify(associatedClients), dashboardId]
        );

      return res
        .status(200)
        .json({ message: "Dashboard assigned successfully" });
    } else {
      return res
        .status(200)
        .json({ message: "Client is already assigned to this dashboard" });
    }
  } catch (err) {
    console.error("Error processing dashboard assignment:", err);
    return res
      .status(500)
      .json({ message: "Error en el servidor", error: err.message });
  }
}

module.exports={
  instertDashboard,
  getDahboardsByClientId,
  updateDashboard,
  deleteDahboard,
  assignDashboardToClient
}
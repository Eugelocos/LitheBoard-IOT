const db = require("../../config/db");
const {generateToken} = require('../../services/otp_service')
const { getDatasourceController } = require('../datasource_initializer');

/**
 * Namespace to separate APIs controllers
 * @namespace controllers.api.entity
 */








/**
 * 
 * The function `getEntities` retrieves entities from a database based on a client ID provided in the
 * request query parameters.
 * @param {object} req - The `req` parameter in the `getEntities` function typically represents the HTTP request
 * object, which contains information about the incoming request from the client, such as the request
 * headers, query parameters, body content, and more. In this specific function, `req.query` is used to
 * access the query
 * @param {object} res - The `res` parameter in the `getEntities` function is the response object that will be
 * used to send responses back to the client making the request. It is typically provided by the
 * Express.js framework in Node.js applications. The `res` object has methods like `status`, `send`,
 * and
 * @returns {object} If the `client_id` is not provided in the request query parameters, a response with status
 * code 400 and the message "client_id es requerido" (client_id is required) will be sent.
 * @function 
 * @memberof controllers.api.entity
 */
const getEntities = async (req, res) => {
  const { client_id } = req.query;
  if (!client_id) {
    return res.status(400).send("Client_id is required");
  }

  try {
    const query = "SELECT * FROM entities WHERE client_id = ?";
    const [results] = await db.promise().query(query, [client_id]);
    res.json(results);
  } catch (err) {
    res.status(500).send({ message: "Database error", error: err });
  }
};

/**
 * Inserts entity data into the database and returns the inserted entity's details.
 * 
 * @param {object} req - HTTP request object containing `client_id`, `disp_name`, 
 * `datasource_type`, and `datasource_config` in `req.body`.
 * @param {object} res - HTTP response object to send the result back to the client.
 * 
 * @function
 * @memberof controllers.api.entity
 */
const insertEntities = async (req, res) => {
  const { client_id, disp_name, datasource_type, datasource_config } = req.body;

  try {
      const token = await generateToken();

      let query, values;

      if (datasource_type === 'MQTT') {
          const { sub_topic, pub_topic } = datasource_config;
          query = `
              INSERT INTO entities 
              (client_id, disp_name, datasource_type, datasource_config) 
              VALUES (?, ?, ?, ?)
          `;
          values = [
              client_id,
              disp_name,
              datasource_type,
              JSON.stringify({ sub_topic, pub_topic, token }),
          ];
      } else if (datasource_type === 'API') {
          const {
              base_url,
              endpoint,
              method,
              polling_interval,
              query_params,
              headers,
              request_body,
              data_key,
          } = datasource_config;

          query = `
              INSERT INTO entities 
              (client_id, disp_name, datasource_type, datasource_config) 
              VALUES (?, ?, ?, ?)
          `;
          values = [
              client_id,
              disp_name,
              datasource_type,
              JSON.stringify({
                  base_url,
                  endpoint,
                  method,
                  polling_interval,
                  query_params,
                  headers,
                  request_body,
                  data_key,
              }),
          ];
      } else {
          throw new Error('Unsupported datasource type');
      }

      const [result] = await db.promise().query(query, values);


      const newEntity = {
          entity_id: result.insertId,
          client_id,
          disp_name,
          datasource_type,
          datasource_config: { ...datasource_config, token },
      };

      const datasourceController = await getDatasourceController();
      datasourceController.addOrUpdateEntity(newEntity);

      res.status(201).json(newEntity);
  } catch (error) {
      console.error('Error inserting entity:', error);
      res.status(500).send({ message: 'Failed to insert entity', error: error.message });
  }
};



/**
 * 
 * The function `getEntityById` retrieves an entity from a database based on the provided entity ID and
 * handles error responses accordingly.
 * @param {object} req - The `req` parameter in the `getEntityById` function is typically the request object
 * representing the HTTP request made to the server. It contains information about the request such as
 * the parameters, body, headers, and other details sent by the client. In this case, `req.params` is
 * used
 * @param {object} res - The `res` parameter in the `getEntityById` function is the response object that will be
 * used to send the response back to the client making the request. It is typically used to send HTTP
 * responses with data or error messages. In the provided code snippet, `res` is used to send
 * @returns {object} If the entity with the specified `entity_id` is found in the database, the function will
 * return the details of that entity in JSON format. If the entity is not found, it will return a 404
 * status with a message "Entity not found". If there is an error during the process, it will return a
 * 500 status with a message "Error fetching entity" along with the error details
 * @function
 * @memberof controllers.api.entity
 */
const getEntityById = async (req, res) => {
  const { entity_id } = req.params;
  const query = "SELECT * FROM entities WHERE entity_id = ?";

  try {
    const [results] = await db.promise().query(query, [entity_id]);

    if (results.length === 0) {
      return res.status(404).json({ message: "Entity not found" });
    }

    res.json(results);
  } catch (err) {
    console.error("Error fetching entity:", err);
    res.status(500).send({ message: "Error fetching entity", error: err });
  }
};

/**
 * 
 * The function `updateEntity` updates entity data in a database table based on the provided request
 * body parameters.
 * @param {object} req - The `req` parameter in the `updateEntity` function typically represents the HTTP
 * request object, which contains information about the incoming request from the client, such as
 * request headers, parameters, body, and more. In this specific function, `req.body` is being used to
 * extract the `entity_id
 * @param {object} res - The `res` parameter in the `updateEntity` function is the response object that will be
 * used to send a response back to the client making the request. It is typically an instance of the
 * Express response object in Node.js applications. The response object allows you to send HTTP
 * responses with status codes,
 * @returns {object} The `updateEntity` function returns a JSON response with a success message if the entity is
 * updated successfully. If any required data is missing in the request body, it returns a 400 status
 * with a message indicating missing data. If the entity is not found in the database, it returns a 404
 * status with a message indicating the entity was not found. If there is an error during the update
 * process
 * @function
 * @memberof controllers.api.entity
 */
const updateEntity = async (req, res) => {
  const { entity_id, disp_name, datasource_config} = req.body;
  if (!entity_id || !disp_name || !datasource_config) {
    return res.status(400).json({ message: "Missing required data" });
  }

  const query = `
      UPDATE entities
      SET disp_name = ?, datasource_config = ?
      WHERE entity_id = ?
    `;
  const values = [disp_name, datasource_config, entity_id];

  try {
    const [result] = await db.promise().query(query, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Entity not found" });
    }

    const datasourceController = await getDatasourceController();

    // Actualizar la entidad en el DatasourceController
    const updatedEntity = {
      entity_id,
      disp_name,
      datasource_config: JSON.parse(datasource_config), // Asegúrate de convertirlo de nuevo a objeto si es necesario
    };

    // Obtén el tipo de datasource desde la entidad existente en el DatasourceController
    const existingEntity = datasourceController.entityMap.get(entity_id);
    if (!existingEntity) {
      return res.status(404).json({ message: "Entity not found in controller" });
    }

    updatedEntity.datasource_type = existingEntity.datasource_type;

    datasourceController.addOrUpdateEntity(updatedEntity);


    res.json({ message: "Entity successfully upated" });
  } catch (err) {
    console.error("Error updating entity data:", err);
    res
      .status(500)
      .json({ message: "Error updating entity data:", error: err });
  }
};

/**
 * 
 * The function `deleteEntity` deletes an entity from a database and updates related widgets and alarms
 * accordingly.
 * @param {object} req - The `req` parameter in the `deleteEntity` function stands for the request object. It
 * contains information about the HTTP request that triggered the function, such as request headers,
 * parameters, body, and more. In this case, `req.params` is used to extract the `entity_id` from
 * @param {object} res - The `res` parameter in the `deleteEntity` function is the response object that will be
 * used to send a response back to the client making the request. It is typically used to set the
 * status code and send JSON data in response to the client's request.
 * @returns {object} The `deleteEntity` function is returning a JSON response with a success message if the
 * entity and related widgets were updated successfully. If the entity was not found (no rows
 * affected), it returns a 404 status with a message indicating that the entity was not found. In case
 * of any errors during the process, it returns a 500 status with an error message.
 * @function
 * @memberof controllers.api.entity
 */
const deleteEntity = async (req, res) => {
  const { entity_id } = req.params;

  const updateWidgetsQuery =
    "UPDATE widgets SET entity_id = NULL WHERE entity_id = ?";
  const updateAlarmsQuery =
    "UPDATE alarms SET entity_id = NULL WHERE entity_id = ?";
  const deleteEntityQuery = "DELETE FROM entities WHERE entity_id = ?";

  try {
    const [widgetsResult] = await db
      .promise()
      .query(updateWidgetsQuery, [entity_id]);
    const [alarmsResult] = await db
      .promise()
      .query(updateAlarmsQuery, [entity_id]);
    const [entityResult] = await db
      .promise()
      .query(deleteEntityQuery, [entity_id]);

    if (entityResult.affectedRows === 0) {
      return res.status(404).json({ message: "Entidad not found" });
    }

    res
      .status(200)
      .json({ message: "Entity and widgets successfully upated" });
  } catch (err) {
    console.error("Error deleting entity or updating widgets or alarms:", err);
    return res.status(500).json({
      message:
        "Error in the server on deleting entity or updating widgets or alarms:",
      error: err.message,
    });
  }
};

module.exports={
    getEntities,
    getEntityById,
    insertEntities,
    updateEntity,
    deleteEntity
}
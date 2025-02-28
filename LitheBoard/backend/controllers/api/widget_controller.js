const db = require("../../config/db");

/**
 * Namespace to separate APIs widgets controllers
 * @namespace controllers.api.widget
 */

/**
 * The function `getWidgetsWithEntities` retrieves widgets with associated entities based on client and
 * dashboard IDs, enhancing the results with additional configuration data before returning them as
 * JSON.
 * @param {object} req - The function `getWidgetsWithEntities` is an asynchronous function that retrieves
 * widgets with associated entities based on the provided `dashboard_id` and `client_id` from the
 * request parameters (`req.params`).
 * @param {object} res - The code you provided is a function that retrieves widgets with associated entities
 * based on the provided `dashboard_id` and `client_id`. It executes a SQL query to fetch the necessary
 * data from the database and then enhances the results by adding certain properties to the
 * configuration data of each widget.
 * @function 
 * @memberof controllers.api.widget
 */
const getWidgetsWithEntities = async (req, res) => {
  const { dashboard_id, client_id } = req.params;

  const query = `
      SELECT 
        e.entity_id, 
        e.client_id, 
        e.disp_name, 
        e.datasource_type,
        e.datasource_config,
        w.widget_id,
        w.dashboard_id, 
        w.widget_type, 
        w.config_data, 
        w.widget_name
      FROM 
        widgets w
      LEFT JOIN 
        entities e ON e.entity_id = w.entity_id
      WHERE 
        w.client_id = ? 
        AND w.dashboard_id = ?;
    `;

  try {
    const [results] = await db
      .promise()
      .query(query, [client_id, dashboard_id]);

    const enhancedResults = results.map((result) => {
      let config = result.config_data || {};

      let datasource_config = {};

      if (result.datasource_type === 'MQTT') {
        datasource_config = {
          ...result.datasource_config, 
        };
      } else if (result.datasource_type === 'API') {

        const apiConfig = result.datasource_config || {};

        datasource_config = {
          base_url: apiConfig.base_url || '', 
          endpoint: apiConfig.endpoint || '',
          method: apiConfig.method || 'GET',
          polling_interval: apiConfig.polling_interval || 0,
          query_params: apiConfig.query_params || {},
          headers: apiConfig.headers || {},
          request_body: apiConfig.request_body || {},
          data_key: apiConfig.data_key || '',
        };
      }


      config = {
        ...config,
        datasource_type: result.datasource_type,
        datasource_config,
      };

      return {
        ...result,
        config_data: JSON.stringify(config),
      };
    });

    res.json(enhancedResults);
  } catch (err) {
    console.error("Database query error:", err);
    res.status(500).json({ message: "Error in database query", error: err });
  }
};


/**
 * The function `getWidgetById` retrieves a widget from the database based on the provided widget_id
 * and returns the result or an error message.
 * @param {object} req - The `req` parameter in the `getWidgetById` function typically represents the HTTP
 * request object. It contains information about the incoming request such as the request parameters,
 * headers, body, and other details. In this specific function, `req.params` is used to extract the
 * `widget_id` from
 * @param {object} res - The `res` parameter in the `getWidgetById` function is the response object that will be
 * used to send a response back to the client making the request. It is typically used to send HTTP
 * responses with data or error messages. In the provided code snippet, `res` is used to send
 * @returns {object} If the database query is successful and a widget with the specified `widget_id` is found,
 * the widget data will be returned in the JSON format. If no widget is found with the given
 * `widget_id`, a 404 status with a message "Widget not found" will be returned. If there is an error
 * in the database query, a 500 status with a message "Error in database query"
 * @function 
 * @memberof controllers.api.widget
 */
const getWidgetById = async (req, res) => {
  const { widget_id } = req.params;

  const query = "SELECT * FROM widgets WHERE widget_id = ?";

  try {
    const [results] = await db.promise().query(query, [widget_id]);

    if (results.length === 0) {
      return res.status(404).json({ message: "Widget not found" });
    }

    res.json(results);
  } catch (err) {
    console.error("Database query error:", err);
    res.status(500).json({ message: "Error in database query", error: err });
  }
};

/**
 * The function `getWidgets` retrieves all widgets from a database and sends the results as a JSON
 * response, handling any errors that occur during the database query.
 * @param {object} req - The `req` parameter typically represents the HTTP request object, which contains
 * information about the incoming request such as headers, parameters, body, etc. It is commonly used
 * in web development to access data sent by the client to the server. In the context of your code
 * snippet, `req` is likely
 * @param {object} res - The `res` parameter in the `getWidgets` function is the response object that will be
 * used to send a response back to the client making the request. It is typically provided by the
 * Express.js framework in Node.js and contains methods like `json()` for sending JSON responses and
 * `status()` for
 * @function 
 * @memberof controllers.api.widget
 */
const getWidgets = async (req, res) => {
  const query = "SELECT * FROM widgets";

  try {
    const [results] = await db.promise().query(query);

    res.json(results);
  } catch (err) {
    console.error("Database query error:", err);
    res.status(500).json({ message: "Error in database query", error: err });
  }
};

/**

 * The function `insertWidget` is an asynchronous function that inserts a new widget into a database
 * table and returns a success message or an error message.
 * @param {object} req - The `insertWidget` function you provided is an asynchronous function that inserts a new
 * widget into a database table. It expects the following parameters in the `req.body` object:
 * @param {object} res - The `res` parameter in the `insertWidget` function is the response object that will be
 * used to send a response back to the client making the request. It is typically used to set the HTTP
 * status code, send data back to the client, and handle errors during the request processing.
 * @function
 * @memberof controllers.api.widget
 */
const insertWidget = async (req, res) => {
  const {
    widget_name,
    entity_id,
    dashboard_id,
    widget_type,
    config_data,
    client_id,
  } = req.body;

  const query = `
      INSERT INTO widgets (widget_name, entity_id, dashboard_id, widget_type, config_data, client_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

  try {
    const [results] = await db
      .promise()
      .query(query, [
        widget_name,
        entity_id,
        dashboard_id,
        widget_type,
        JSON.stringify(config_data),
        client_id,
      ]);

    res.status(201).json({
      message: "Widget created successfully",
      data: results,
    });
  } catch (err) {
    console.error("Error insterting widget:", err);
    res.status(500).json({ message: "Error insterting widget:", error: err });
  }
};

/**
 * The function `updateWidget` updates a widget in a database table based on the provided parameters
 * and returns a success message or an error message.
 * @param {object} req - The `updateWidget` function you provided is an asynchronous function that updates a
 * widget in a database based on the information provided in the request (`req`) parameters. Here's a
 * breakdown of the parameters used in the function:
 * @param {object} res - The `res` parameter in the `updateWidget` function is the response object that will be
 * used to send a response back to the client making the request. It is typically used to send HTTP
 * responses with status codes, headers, and data back to the client. In the provided code snippet, `
 * @returns {object} The `updateWidget` function returns a JSON response with a success message and the updated
 * data if the widget was successfully updated. If the widget was not found or not updated, it returns
 * a 404 status with a corresponding message. If there is an error during the update process, it
 * returns a 500 status with an error message.
 * @function 
 * @memberof controllers.api.widget
 */
const updateWidget = async (req, res) => {
  const { widget_id } = req.params;
  const { widget_name, entity_id, dashboard_id, widget_type, config_data } =
    req.body;

  const query = `
      UPDATE widgets
      SET widget_name = ?, 
          entity_id = ?, 
          dashboard_id = ?, 
          widget_type = ?, 
          config_data = ?
      WHERE widget_id = ?
    `;

  const queryValues = [
    widget_name,
    entity_id,
    dashboard_id || null,
    widget_type,
    JSON.stringify(config_data || {}),
    widget_id,
  ];

  try {
    const [results] = await db.promise().query(query, queryValues);

    if (results.affectedRows === 0) {
      return res.status(404).json({
        message: "Widget not found or not updated.",
      });
    }

    res.status(200).json({
      message: "Widget successfully updated",
      data: results,
    });
  } catch (err) {
    console.error("Error updating the widget:", err);
    res.status(500).json({
      message: "Error updating the widget:",
      error: err,
    });
  }
};

/**
 * The function `deleteWidget` deletes a widget from a database based on the provided widget ID and
 * returns appropriate messages based on the outcome.
 * @param {object} req - The `req` parameter in the `deleteWidget` function is typically the request object
 * representing the HTTP request made to the server. It contains information about the request such as
 * the parameters, body, headers, and other details sent by the client. In this case, `req.params` is
 * used to
 * @param {object} res - The `res` parameter in the `deleteWidget` function is the response object that will be
 * used to send the response back to the client making the request. It is typically used to set the
 * status code and send JSON data in response to the deletion operation of a widget.
 * @returns {object} The `deleteWidget` function is an asynchronous function that deletes a widget from a
 * database table based on the `widget_id` provided in the request parameters.
 * @function 
 * @memberof controllers.api.widget
 */
const deleteWidget = async (req, res) => {
  const { widget_id } = req.params;

  try {
    const [result] = await db.promise().query(
      "DELETE FROM widgets WHERE widget_id = ?",
      [widget_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Widget not found" });
    }

    res.status(200).json({ message: "Widget deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error", error: err });
  }
};


module.exports = {
  getWidgetsWithEntities,
  getWidgetById,
  getWidgets,
  insertWidget,
  updateWidget,
  deleteWidget
};

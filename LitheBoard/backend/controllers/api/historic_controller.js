const db = require("../../config/db");

/**
 * The function `getHistoricsByEntityId` retrieves historical data from a database based on the
 * provided entity ID.
 * @param {object} req - The `req` parameter in the `getHistoricsByEntityId` function is typically an object
 * representing the HTTP request. It contains information about the request made to the server, such as
 * the request headers, parameters, body, and other details. In this specific function, `req.params` is
 * @param {object} res - The `res` parameter in the `getHistoricsByEntityId` function is the response object
 * that will be used to send a response back to the client making the request. It is typically used to
 * send data, status codes, and other information back to the client. In this function, `
 */
const getHistoricsByEntityId = async (req, res) => {
  const { entity_id } = req.params;
  const query = "SELECT * FROM historial WHERE entity_id = ?";

  try {
    const [results] = await db.promise().query(query, [entity_id]);
    res.json(results);
  } catch (err) {
    console.error("Error fetching historic data:", err);
    res
      .status(500)
      .json({ message: "Error fetching historic data", error: err });
  }
};



/**
 * The function `getHistoricByClientId` retrieves historic data for a specific client ID from a
 * database and sends the results as a JSON response, handling errors appropriately.
 * @param {object} req - The `req` parameter in the `getHistoricByClientId` function is typically an object
 * representing the HTTP request. It contains information about the request made to the server, such as
 * the request headers, parameters, body, and more. In this specific function, `req.params` is used to
 * @param {object} res - The `res` parameter in the `getHistoricByClientId` function is the response object that
 * will be used to send a response back to the client making the request. It is typically used to send
 * data, status codes, and other information back to the client. In this case, the function
 */
const getHistoricByClientId = async (req, res) => {
  const { client_id } = req.params;
  const query = "SELECT * FROM historial WHERE client_id = ?";

  try {
    const [results] = await db.promise().query(query, [client_id]);
    res.json(results);
  } catch (err) {
    console.error("Error fetching historic data for client:", err);
    res
      .status(500)
      .json({ message: "Error fetching historic data for client", error: err });
  }
}



/**
 * The function `insertHistoric` inserts historical data into a database table based on the provided
 * request body parameters.
 * @param {object} req - The `req` parameter in the `insertHistoric` function is the request object that
 * contains information sent from the client-side to the server-side. It typically includes data such
 * as the body of the request, parameters, headers, and other relevant information needed to process
 * the request. In this case,
 * @param {object} res - The `res` parameter in the `insertHistoric` function is the response object that will
 * be used to send a response back to the client making the request. It is typically used to send
 * status codes, data, and messages back to the client to inform them about the outcome of the request.
 * @returns {object} The `instertHistoric` function is returning a response with status code 200 and the message
 * "Historic data inserted successfully" if the insertion into the database is successful. If there is
 * an error during the insertion process, it will return a response with status code 500 and the
 * message "Error inserting historic data".
 */
const instertHistoric = async (req, res) => {
  const { entity_id, date, data, client_id, selected_key } = req.body;

  const query = `
      INSERT INTO historial (entity_id, date, data, client_id, selected_key) 
      VALUES (?, ?, ?, ?, ?);
    `;

  const values = [entity_id, date, data, client_id, selected_key];

  try {
    await db.promise().query(query, values);
    console.log("Historic data inserted successfully:", values);
    return res.status(200).send("Historic data inserted successfully");
  } catch (error) {
    console.error("Error inserting historic data:", error);
    return res.status(500).send("Error inserting historic data");
  }
};

module.exports = {
  getHistoricsByEntityId,
  instertHistoric,
  getHistoricByClientId
};

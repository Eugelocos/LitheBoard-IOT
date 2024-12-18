const db = require("../config/db");

/**
 * The function `getEntities` asynchronously retrieves all entities from a database table using a
 * parameterized query.
 * @returns {Promise<Object>} - The function `getEntities()` is returning the results obtained from executing the query
 * `SELECT * FROM entities` using `db.promise().query()`. The results are returned as an array
 * `[results]`.
 */
async function getEntities() {
  const query = 'SELECT * FROM entities'; // Consulta con parámetro

  try {
    // Ejecutamos la consulta usando db.promise().query()
    const [results] = await db.promise().query(query); // Pasamos client_id como parámetro
    return results; // Devolvemos los resultados obtenidos
  } catch (err) {
    console.error('Error al obtener las entidades:', err);
    throw err; // Lanzamos el error para que se maneje en el lugar donde se llame la función
  }
}

/**
 * This function retrieves a token from a database based on the provided client_id and device_id.
 * @param {int} client_id - Client ID is a unique identifier assigned to a client or user in the system. It
 * helps in identifying and distinguishing different clients or users.
 * @param {int} device_id - The `device_id` parameter in the `getToken` function represents the unique
 * identifier of the device for which you want to retrieve the token. It is used in the database query
 * to fetch the token associated with the specified `client_id` and `device_id` from the `entities`
 * table.
 * @returns {Promise<String>} - The `getToken` function is returning a promise that queries the database to select the
 * token from the `entities` table where the `client_id` matches the provided `client_id` and the
 * `entity_id` matches the provided `device_id`. The function then returns the result of the query. If
 * there is an error during the query, it will be caught and logged before rethrowing the error
 */
function getToken(client_id, device_id) {
  return db
    .promise()
    .query("SELECT token FROM entities WHERE client_id = ? AND entity_id = ?", [
      client_id,
      device_id,
    ])
    .then((result) => {
      return result;
    })
    .catch((error) => {
      console.error("Error al getToken:", error);
      throw error;
    });
}


module.exports = {
  getEntities,
  getToken,
};

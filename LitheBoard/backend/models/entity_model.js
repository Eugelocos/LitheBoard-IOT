const db = require("../config/db");

/**
 * The function `getEntities` asynchronously retrieves all entities from a database table using a
 * parameterized query.
 * @returns {Promise<Object>} - The function `getEntities()` is returning the results obtained from executing the query
 * `SELECT * FROM entities` using `db.promise().query()`. The results are returned as an array
 * `[results]`.
 */
async function getEntities() {
    const query = `
        SELECT 
            entity_id,
            client_id,
            disp_name,
            datasource_type,
            datasource_config
        FROM entities
    `;

    try {
        const [rows] = await db.promise().query(query);
        return rows.map(entity => ({
            ...entity,
            datasource_config: (() => {
                try {
                    return entity.datasource_config; // Parsear JSON
                } catch (error) {
                    console.error(`Error parsing datasource_config for entity ${entity.entity_id}:`, error.message);
                    return null;
                }
            })()
        }));
x
    } catch (error) {
        console.error('Error fetching entities:', error.message);
        throw error;
    }
}

/**
 * This function retrieves a token from a database based on the provided client_id and device_id.
 * @param {int} client_id - Client ID is a unique identifier assigned to a client or user in the system. It
 * helps in identifying and distinguishing different clients or users.
 * @param {int} entity_id - The `entity_id` parameter in the `getToken` function represents the unique
 * identifier of the entity for which you want to retrieve the token. It is used in the database query
 * to fetch the token associated with the specified `client_id` and `entity_id` from the `entities`
 * table.
 * @returns {Promise<String>} - The `getToken` function is returning a promise that queries the database to select the
 * token from the `datasource_config` from the `entities` table where the `client_id` matches the provided `client_id` and the
 * `entity_id` matches the provided `entity_id`. The function then returns the result of the query. If
 * there is an error during the query, it will be caught and logged before rethrowing the error
 */
async function getToken(client_id, entity_id) {
  try {
    const [result] = await db.promise().query(
      "SELECT datasource_config FROM entities WHERE client_id = ? AND entity_id = ?",
      [client_id, entity_id]
    );
    const datasource_config = result[0]?.datasource_config || {};
    return datasource_config.token || null; 
  } catch (error) {
    console.error("Error al obtener el token:", error);
    throw error;
  }
}



//missing doc

async function getDatasourceType(client_id, entity_id) {
  try {
    const [result] = await db.promise().query(
      "SELECT datasource_config FROM entities WHERE client_id = ? AND entity_id = ?",
      [client_id, entity_id]
    );
    const datasource_config = result[0]?.datasource_config || {};
    return datasource_type || null; 
  } catch (error) {
    console.error("Error al obtener el tipo de datasource:", error);
    throw error;
  }
}

module.exports = {
  getEntities,
  getToken,
  getDatasourceType,
};


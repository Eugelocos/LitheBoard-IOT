const db = require("../config/db");


/**
 * The function `getWidgetsByEntityId` retrieves widgets based on entity_id and client_id from a
 * database asynchronously.
 * @param {int} entity_id - The `entity_id` parameter is used to specify the ID of the entity for which you
 * want to retrieve widgets. This function will fetch widgets from the database that are associated
 * with the provided `entity_id` and `client_id`.
 * @param {int} client_id - The `client_id` parameter is used to filter widgets based on the client to which
 * they belong. It helps in retrieving widgets specific to a particular client.
 * @returns {Promise<Object>} -The function `getWidgetsByEntityId` is returning the results of the query that fetches
 * widgets based on the provided `entity_id` and `client_id`. The results are returned after
 * successfully fetching the widgets from the database.
 */
async function getWidgetsByEntityId(entity_id, client_id) {
  const query = "SELECT * FROM widgets WHERE entity_id = ? AND client_id = ?";

  try {
    const [results] = await db.promise().query(query, [entity_id, client_id]);
    console.log("Widgets fetched successfully.");
    return Array.isArray(results) ? results : [results];
  } catch (error) {
    console.error("Error fetching widgets:", error);
    throw error;
  }
}

module.exports = {
  getWidgetsByEntityId,
};
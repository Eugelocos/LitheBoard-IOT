const db = require('../config/db');

/**
 * The function `saveMessage` saves a message with specified parameters into a database table called
 * `historial`.
 * @param {int}entity_id - The `entity_id` parameter typically represents the identifier of the entity for
 * which the message is being saved. It could be a unique identifier for a specific entity in your
 * system, such as a user ID, a product ID, or any other entity that the message is associated with.
 * @param {int}client_id - The `client_id` parameter in the `saveMessage` function represents the ID of the
 * client associated with the message being saved. This ID is used to identify which client the message
 * belongs to in the database.
 * @param {string}selected_key - The `selected_key` parameter in the `saveMessage` function is used to specify
 * a key that is associated with the data being saved. It is used as a reference point or identifier
 * for the data being stored in the database. In the provided code snippet, the `selected_key` is being
 * logged
 * @param {object}data - The `data` parameter in the `saveMessage` function is the information that you want to
 * save in the database. It could be any kind of data that you want to store for the given `entity_id`
 * and `client_id`. In the function, the `data` parameter is being string
 * @returns {Promise<Object>} - The `saveMessage` function is returning the result of the database query execution. This
 * result could include information about the success or failure of the query operation, such as the
 * number of affected rows or specific data related to the insertion.
 */ 
async function saveMessage(entity_id, client_id, selected_key, data) {
    
    const query = 'INSERT INTO historial (entity_id, date, data, client_id, selected_key) VALUES (?, NOW(), ?, ?, ?)';
    
    try {
        const result = await db.query(query, [entity_id, JSON.stringify(data), client_id, null]);
        console.log('Message saved');
        return result;
    } catch (error) {
        console.error('Saving message error', error);
        throw error;
    }
}


async function getLastHistoricByEntityId(entity_id) {
    const query = "SELECT * FROM historial WHERE entity_id = ? ORDER BY date DESC LIMIT 1";

    try {
        const result = await db.query(query, [entity_id]);
        return result;
    } catch (error) {
        console.error('Getting historic error:', error);
        throw error;
    }
    
}

module.exports = {
  saveMessage,
  getLastHistoricByEntityId
};

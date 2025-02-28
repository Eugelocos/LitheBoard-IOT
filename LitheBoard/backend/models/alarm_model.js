

const db = require("../config/db");

/**
 * Retrieves alarms associated with a specific device and client from the database.
 *
 * @param {int} device_id - The unique identifier of the device/entity.
 * @param {int} client_id - The unique identifier of the client.
 * @returns {Promise<Array>} - Returns a promise that resolves to the retrieved alarms.
 */
async function getAlarmsByDevice(device_id, client_id) {
  const query = "SELECT * FROM alarms WHERE entity_id = ? AND client_id = ?";
  try {
    const [result] = await db.promise().query(query, [device_id, client_id]);
    
    if (result.length === 0) {
      return null;
    }
    
    return result;
  } catch (error) {
    console.error("Error retrieving alarms:", error);
    throw error;
  }
}


/**
 * Saves a notification into the database when an alarm is triggered.
 *
 * @param {int} alarm_id - The unique identifier of the alarm.
 * @param {int} client_id - The unique identifier of the client.
 * @param {Object} messageData - The message data (payload) to save in the notification.
 * @returns {Promise<Object>} - Returns a promise that resolves to the database operation result.
 */
async function saveAlarmNotification(alarm_id, client_id, messageData) {
  const query = `
    INSERT INTO notifications (alarm_id, client_id, date, data) 
    VALUES (?, ?, NOW(), ?)
  `;
  console.log("Saving notification...");
  try {
    const result = await db.promise().query(query, [
      alarm_id,
      client_id,
      JSON.stringify(messageData),
    ]);
    console.log('Notification saved');
    return result;
  } catch (error) {
    console.error("Error saving notification:", error);
    throw error;
  }
}

module.exports = {
  getAlarmsByDevice,
  saveAlarmNotification,
};

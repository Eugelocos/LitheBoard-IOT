
const express = require('express');
const router = express.Router();
/*const mqttController = require('../controllers/mqtt_controller');*/

/* This code snippet defines a POST route in an Express router. When a POST request is made to the
'/publish' endpoint, it extracts the `client_id`, `device_id`, and `message` from the request body.
It then attempts to publish a message using the `mqttController.publishMessage` function with the
extracted parameters. */
router.post('/publish', async (req, res) => {
  /*const { client_id, device_id, message } = req.body;
  try {
    await mqttController.publishMessage(client_id, device_id, message);
    res.status(200).send('Message published');
  } catch (error) {
    res.status(500).send('Error publishing message');
  }*/
});

module.exports = router;

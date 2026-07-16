
const express = require('express');
const router = express.Router();
const {publishMessage, getEntity} = require('../controllers/datasources/mqtt_handler')
/*const mqttController = require('../controllers/mqtt_controller');*/

/* This code snippet defines a POST route in an Express router. When a POST request is made to the
'/publish' endpoint, it extracts the `client_id`, `device_id`, and `message` from the request body.
It then attempts to publish a message using the `mqttController.publishMessage` function with the
extracted parameters. */
router.post('/publish', async (req, res) => {
  try {
      const { entity, message } = req.body;


      if (!entity) {
          return res.status(404).json({
              error: "Entity not initialized"
          });
      }

      await publishMessage(entity, message);

      res.sendStatus(200);

  } catch (err) {
      console.error(err);
      res.sendStatus(500);
  }
});

module.exports = router;

const express = require("express");
const router = express.Router();
const {
  getHistoricsByEntityId,
  instertHistoric,
  getHistoricByClientId,
} = require("../controllers/api/historic_controller");

/*This line of code is setting up a GET route for accessing historical data 
 by entity ID. When a GET request is made to "/data/historic/ei/get/:entity_id" 
 endpoint, the `getHistoricsByEntityId` function from the historic_controller 
 will be called to handle the request and provide the corresponding historical 
 data for the specified entity ID.*/
router.get("/data/historic/ei/get/:entity_id", getHistoricsByEntityId);

/*The line `router.post("/data/historic/insert", instertHistoric);` is setting 
 up a POST route for inserting historical data. When a POST request is made to 
 the "/data/historic/insert" endpoint, the `instertHistoric` function from the 
 historic_controller will be called to handle the request and insert the provided 
 historical data into the system.*/
router.post("/data/historic/insert", instertHistoric);

/**This line of code is setting up a GET route for accessing historical data by client ID.
 When a GET request is made to "/data/historic/ci/get/:client_id" endpoint, the 
 `getHistoricByClientId` function from the historic_controller will be called to 
 handle the request and provide the corresponding historical data for the specified client ID.*/
router.get("/data/historic/ci/get/:client_id", getHistoricByClientId);

module.exports = router;

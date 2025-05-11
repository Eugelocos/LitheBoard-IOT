const express = require("express");
const router = express.Router();
const {
  getEntities,
  getEntityById,
  insertEntities,
  updateEntity,
  deleteEntity,
  updateEntityRulechain
} = require("../controllers/api/entity_controller");

/*This line of code is setting up a GET route in the Express router. 
When a GET request is made to the "/data/entities/get" endpoint, 
the `getEntities` function from the `entity_controller` module will be called to handle the request.*/
router.get("/data/entities/get", getEntities);

/*The line `router.post("/data/entities/insert", insertEntities);` 
is setting up a POST route in the Express router. When a POST request 
is made to the "/data/entities/insert" endpoint, the `insertEntities` function 
from the `entity_controller` module will be called to handle the request. 
This route is typically used for creating or inserting new entities into the system/database.*/
router.post("/data/entities/insert", insertEntities);

/*This line of code is setting up a GET route in the Express router
with a dynamic parameter `:entity_id`. When a GET request is made 
to the "/data/entities/get/byId/:entity_id" endpoint, the `getEntityById` function 
from the `entity_controller` module will be called to handle the request.
The `:entity_id` in the route acts as a placeholder for a specific entity ID that 
will be passed as a parameter to the `getEntityById` function to retrieve a specific entity based on that ID.*/
router.get("/data/entities/get/byId/:entity_id", getEntityById);

/*`router.put("/data/entities/update", updateEntity);` is setting up a PUT route 
in the Express router. When a PUT request is made to the "/data/entities/update" endpoint,
the `updateEntity` function from the `entity_controller` module will be called to
handle the request. This route is typically used for updating an existing entity 
in the system/database based on the provided data in the request body.*/
router.put("/data/entities/update", updateEntity);


/* The line `router.delete("/entities/delete/:entity_id", deleteEntity);` is setting up a DELETE route
in the Express router. When a DELETE request is made to the "/entities/delete/:entity_id" endpoint,
the `deleteEntity` function from the `entity_controller` module will be called to handle the
request. */
router.delete("/entities/delete/:entity_id", deleteEntity);

/* This line of code is setting up a PUT route in the Express router. When a PUT request is made to the
"/entities/update/rulechain/:entity_id" endpoint, the `updateEntityRulechain` function from the
`entity_controller` module will be called to handle the request. */
router.put("/entities/update/rulechain/:entity_id", updateEntityRulechain);

module.exports = router;

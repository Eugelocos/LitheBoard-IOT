const express = require("express");
const router = express.Router();
const {
  getWidgetsWithEntities,
  getWidgetById,
  getWidgets,
  insertWidget,
  updateWidget,
  deleteWidget
} = require("../controllers/api/widget_controller");

/* This line of code is setting up a GET route in the Express router. When a GET request is made to
"/data/entitiesWidgets/:dashboard_id/:client_id", the function `getWidgetsWithEntities` from the
widget_controller will be called. The `:dashboard_id` and `:client_id` are route parameters that can
be accessed within the `getWidgetsWithEntities` function to retrieve specific data based on the
values provided in the URL. */
router.get("/data/entitiesWidgets/:dashboard_id/:client_id", getWidgetsWithEntities);

/* `router.get("/data/widgets/get/:widget_id", getWidgetById);` is setting up a GET route in the
Express router. When a GET request is made to "/data/widgets/get/:widget_id", the function
`getWidgetById` from the widget_controller will be called. The `:widget_id` is a route parameter
that can be accessed within the `getWidgetById` function to retrieve a specific widget based on the
ID provided in the URL. */
router.get("/data/widgets/get/:widget_id", getWidgetById);

/* `router.get("/data/widgets/get", getWidgets);` is setting up a GET route in the Express router. When
a GET request is made to "/data/widgets/get", the function `getWidgets` from the widget_controller
will be called. This route is used to retrieve all widgets, typically used for fetching a list of
widgets from the database or any other data source. */
router.get("/data/widgets/get", getWidgets);

/* `router.post("/data/widgets/insert", insertWidget);` is setting up a POST route in the Express
router. When a POST request is made to "/data/widgets/insert", the function `insertWidget` from the
widget_controller will be called. This route is typically used to insert a new widget into the
database or any other data source. The `insertWidget` function will handle the logic for inserting
the widget data provided in the request body into the appropriate data storage. */
router.post("/data/widgets/insert", insertWidget);

/* `router.put("/data/widgets/update/:widget_id", updateWidget);` is setting up a PUT route in the
Express router. When a PUT request is made to "/data/widgets/update/:widget_id", the function
`updateWidget` from the widget_controller will be called. The `:widget_id` is a route parameter that
can be accessed within the `updateWidget` function to update a specific widget based on the ID
provided in the URL. This route is typically used to update an existing widget in the database or
any other data source based on the data provided in the request body. The `updateWidget` function
will handle the logic for updating the widget data with the specified ID. */
router.put("/data/widgets/update/:widget_id", updateWidget);

/* `router.delete("/data/widgets/delete/:widget_id", deleteWidget);` is setting up a DELETE route in
the Express router. When a DELETE request is made to "/data/widgets/delete/:widget_id", the function
`deleteWidget` from the widget_controller will be called. The `:widget_id` is a route parameter that
can be accessed within the `deleteWidget` function to delete a specific widget based on the ID
provided in the URL. This route is typically used to delete an existing widget from the database or
any other data source based on the ID specified in the URL. The `deleteWidget` function will handle
the logic for deleting the widget with the specified ID. */
router.delete("/data/widgets/delete/:widget_id", deleteWidget);


module.exports = router;


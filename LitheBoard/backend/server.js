const config = require("./config/index.js")
const express = require("express")
const http = require("http");
const bodyParser = require("body-parser");
const cors = require("cors");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const db = require("./config/db");
const mqtt_routes = require('./routes/mqtt_routes');
require('dotenv').config();
const configureSocket = require("./sockets/socket");
const ws_helper = require("./sockets/ws_helper");
const otp_routes = require('./routes/otp_routes');
const entity_routes = require('./routes/entity_routes')
const widget_routes = require('./routes/widget_routes')
const historic_routes = require('./routes/historic_routes');
const client_routes = require('./routes/client_routes');
const dashboard_routes = require('./routes/dashboard_routes');
const alarm_routes = require('./routes/alarm_routes');
const notification_routes = require('./routes/notification_routes');
const rulechain_routes = require('./routes/rulechain_routes')

const DatasourceController = require('./controllers/datasource_controller');
const entityModel = require('./models/entity_model');


const errorHandler = require('./middlewares/error_handler');
/* The above code snippet is written in JavaScript and it is setting up a server using the
Express framework. */

const app = express();
const port = process.env.BACKEND_PORT || 3001;

app.use(cors({
  origin: ['http://localhost:3000', 'http://backend:3000', 'http://tongavla.mooo.com:3000', 'http://localhost:3007'], // Permitir orígenes específicos
  //allowedHeaders: ['Content-Type', 'Authorization'], // Encabezados permitidos
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Métodos permitidos
  credentials: true // Permite el envío de cookies, que puede ser útil para CORS
}));
  // cors({
  //   origin: '*',`${process.env.WEB_URL}`, `0.0.0.0`],  Frontend URL 
  //   credentials: true, // cookies sending
  // })
//); 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  session({
    secret: 'secret', //          <------------------------------------------------   -CAMBIAR CLAVE-
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // true if its HTTPS
      maxAge: 1000 * 60 * 60 * 24, // 24 hours
    },
  })
);


//#region Routes
/* The above code is setting up routes for different functionalities in a Node.js application using
Express framework. It is using the `app.use` method to mount middleware functions at specified
paths. */
app.use("/api", mqtt_routes);
app.use('/api/otp', require('./routes/otp_routes'));
app.use('/api/enitity', require('./routes/entity_routes'));
app.use('/api/widget', require('./routes/widget_routes'));
app.use('/api/historic', require('./routes/historic_routes'));
app.use('/api/clients', require('./routes/client_routes'));
app.use('/api/dashboard', require('./routes/dashboard_routes'));
app.use('/api/alarm', require('./routes/alarm_routes'));
app.use('/api/notification', require('./routes/notification_routes'));
app.use('/api/rulechain', require('./routes/rulechain_routes'));
//#endregion




app.all('*', (req, res) => {
  res.status(404).json({ error: `Ruta ${req.originalUrl} no encontrada` });
});










//#region HTPP_WebSocket
/* The above code is creating a server using the `http` module in Node.js and configuring a socket
connection using the `configureSocket` function. It then initializes a MQTT socket using the
`ws_helper.init` function with the configured socket connection. */
const server = http.createServer(app);
const io = configureSocket(server);
ws_helper.init(io);
server.listen(process.env.BACKEND_WS_PORT, () => {
  console.log(`Websocket server runing in ${process.env.WEB_URL}:${process.env.BACKEND_WS_PORT}`);
});
//#endregion






/*
//#region Notifications
app.get("/api/notifications/get/:client_id", async (req, res) => {
  const { client_id } = req.params;

  // Validación del parámetro `client_id`
  if (!client_id) {
    return res
      .status(400)
      .json({ message: "El parámetro client_id es obligatorio." });
  }

  const query = "SELECT * FROM notifications WHERE client_id = ?";

  try {
    // Ejecutar la consulta con `async/await`
    const [results] = await db.promise().query(query, [client_id]);

    // Comprobar si no hay notificaciones
    if (results.length === 0) {
      return res.status(404).json({
        message: "No se encontraron notificaciones para este cliente.",
      });
    }

    // Devolver las notificaciones
    res.status(200).json(results);
  } catch (err) {
    console.error("Error fetching notifications:", err);
    res.status(500).json({
      message: "Error en el servidor al obtener notificaciones.",
      error: err.message,
    });
  }
});


app.post("/api/notifications/insert", async (req, res) => {
  const { alarm_id, client_id, date, data } = req.body;

  // Validar los datos de entrada
  if (!alarm_id || !client_id || !date || !data) {
    return res.status(400).json({
      message: "Todos los campos (alarm_id, client_id, date, data) son obligatorios.",
    });
  }

  const query = `
    INSERT INTO notifications (alarm_id, client_id, date, data) 
    VALUES (?, ?, ?, ?)
  `;
  const values = [alarm_id, client_id, date, data];

  try {
    // Ejecutar la consulta con async/await
    const [result] = await db.promise().query(query, values);

    // Responder con el ID de la notificación recién creada
    res.status(201).json({
      notification_id: result.insertId,
      alarm_id,
      client_id,
      date,
      data,
    });
  } catch (err) {
    console.error("Error inserting notification data:", err);
    res.status(500).json({
      message: "Error en el servidor al insertar notificación.",
      error: err.message,
    });
  }
});

app.post("/api/notifications/markAsRead/:notification_id", async (req, res) => {
  const { notification_id } = req.params;

  // Verifica que notification_id esté presente
  if (!notification_id) {
    return res.status(400).json({
      message: "El ID de la notificación es obligatorio.",
    });
  }

  const query = "UPDATE notifications SET visto = 1 WHERE notification_id = ?";

  try {
    // Ejecutar la consulta con async/await
    const [result] = await db.promise().query(query, [notification_id]);

    // Verificar si alguna fila fue afectada
    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Notificación no encontrada.",
      });
    }

    res.status(200).json({
      message: "Notificación marcada como leída.",
    });
  } catch (err) {
    console.error("Error marcando la notificación como leída:", err);
    res.status(500).json({
      message: "Error en el servidor al marcar la notificación como leída.",
      error: err.message,
    });
  }
});

//#endregion
*/






app.use(errorHandler);

app.listen(port,'0.0.0.0',() => {
  console.log(`Server running on port ${port}`);
});

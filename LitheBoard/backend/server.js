// server.js
const config = require("./config/index.js")
const express = require("express")
const http = require("http");
const bodyParser = require("body-parser");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require('dotenv').config();
const configureSocket = require("./sockets/socket");
const ws_helper = require("./sockets/ws_helper");
const { initializeDatasource } = require("./controllers/datasource_initializer");

// Importar todas las rutas
const mqtt_routes = require('./routes/mqtt_routes');
const otp_routes = require('./routes/otp_routes');
const entity_routes = require('./routes/entity_routes');
const widget_routes = require('./routes/widget_routes');
const historic_routes = require('./routes/historic_routes');
const client_routes = require('./routes/client_routes');
const dashboard_routes = require('./routes/dashboard_routes');
const alarm_routes = require('./routes/alarm_routes');
const notification_routes = require('./routes/notification_routes');
const rulechain_routes = require('./routes/rulechain_routes');

const errorHandler = require('./middlewares/error_handler');
const AppError = require('./utils/app_error');

const app = express();
const port = process.env.BACKEND_PORT || 3001;

// CORS configurado correctamente
app.use(cors({
  origin: ['http://localhost:3000', 'http://backend:3000', 'http://tongavla.mooo.com:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// Montar rutas CORRECTAMENTE
app.use("/api/mqtt", mqtt_routes);
app.use('/api/otp', otp_routes);
app.use('/api/entities', entity_routes);
app.use('/api/widgets', widget_routes);
app.use('/api/historics', historic_routes);
app.use('/api/clients', client_routes);
app.use('/api/dashboards', dashboard_routes);
app.use('/api/alarms', alarm_routes);
app.use('/api/notifications', notification_routes);
app.use('/api/rulechains', rulechain_routes);

// 404 handler
app.all('*', (req, res, next) => {
  next(new AppError(`Ruta ${req.method} ${req.originalUrl} no encontrada`, 404, 'ROUTE_NOT_FOUND'));
});

// Error handler
app.use(errorHandler);

// WebSocket
const server = http.createServer(app);
const io = configureSocket(server);
ws_helper.init(io);

server.listen(process.env.BACKEND_WS_PORT, () => {
  console.log(`Websocket server running on ${process.env.WEB_URL}:${process.env.BACKEND_WS_PORT}`);
});

// HTTP Server
app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
});
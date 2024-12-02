const express = require("express");
const mysql = require("mysql");
const bodyParser = require("body-parser");
const cors = require("cors");
const bcrypt = require("bcrypt");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const { default: axios } = require("axios");
const crypto = require("crypto");
const { sendOtpEmail } = require("./controllers/mailController");
const {
  generateOtp,
  verifyOtp,
  generateToken,
} = require("./services/otpService");
const { access } = require("fs");

axios.defaults.withCredentials = true;
const app = express();
const port = 3001;

app.use(
  cors({
    origin: ["http://localhost:3000"], // Cambia esto a la URL de tu frontend
    credentials: true, // Habilita el envío de cookies
  })
);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  session({
    secret: "secret", //          <------------------------------------------------   -CAMBIAR CLAVE-
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Configura esto como true si usas HTTPS
      maxAge: 1000 * 60 * 60 * 24, // 24 horas
    },
  })
);

const db = mysql.createConnection({
  host: "bizoepeecwuj1ltr1bxy-mysql.services.clever-cloud.com",
  user: "uwuoycljtgbuqcsn",
  password: "VIGXbsXbsM14HNqiZ26Y",
  database: "bizoepeecwuj1ltr1bxy",
});

db.connect((err) => {
  if (err) {
    console.error("Error connecting to the database:", err);
    return;
  }
  console.log("Connected to the MySQL database");
});

//#region OTP
app.post("/api/request-otp", (req, res) => {
  const { email } = req.body;

  db.query(
    "SELECT client_id FROM clients WHERE email = ?",
    [email],
    (err, results) => {
      if (err)
        return res.status(500).json({ message: "Database error", error: err });

      if (results.length === 0)
        return res.status(404).json({ message: "Email not found" });

      const client_id = results[0].client_id;

      generateOtp(client_id, db, (err, otp) => {
        if (err)
          return res
            .status(500)
            .json({ message: "Error generating OTP", error: err });
        sendOtpEmail(email, otp)
          .then(() =>
            res.status(200).json({ message: "OTP sent to email", otp: otp })
          )
          .catch((err) =>
            res.status(500).json({ message: "Failed to send OTP", error: err })
          );
      });
    }
  );
});

// Ruta para verificar OTP
app.post("/api/verify-otp", (req, res) => {
  const { client_id, otp } = req.body;

  verifyOtp(client_id, otp, db, (err, verified) => {
    if (err)
      return res.status(500).json({ message: "Database error", error: err });

    if (verified) {
      res.status(200).json({ message: "OTP verified successfully" });
    } else {
      res.status(400).json({ message: "Invalid OTP  " });
    }
  });
});
//#endregion











//#region Entities (formerly Devices)

app.get("/api/data/entities/get", (req, res) => {
  const { client_id } = req.query;
  if (!client_id) {
    return res.status(400).send("client_id es requerido");
  }

  const query = "SELECT * FROM entities WHERE client_id = ?";
  db.query(query, [client_id], (err, results) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.json(results);
  });
});

app.post("/api/data/entities/insert", (req, res) => {
  const { client_id, disp_name, sub_topic, pub_topic } = req.body;

  console.log("Received data:", req.body); // Log de datos recibidos

  // Generar un token único para la entidad
  const token = generateToken();

  const query =
    "INSERT INTO entities (client_id, disp_name, sub_topic, pub_topic, token) VALUES (?, ?, ?, ?, ?)";
  const values = [client_id, disp_name, sub_topic, pub_topic, token];

  db.query(query, values, (err, result) => {
    if (err) {
      console.error("Error inserting entity data:", err); // Log de error detallado
      return res.status(500).send(err);
    }
    res.json({ entity_id: result.insertId, ...req.body, token });
  });
});

app.get("/api/data/entities/get/byId/:entity_id", (req, res) => {
  const { entity_id } = req.params;
  const query = "SELECT * FROM entities WHERE entities.entity_id = 1";

  db.query(query, [entity_id], (err, results) => {
    if (err) {
      return res.status(500).send(err);
    }
    console.log("entity           : " + results);
    res.json(results);
  });
});

app.put("/api/data/entities/update", (req, res) => {
  const { entity_id, disp_name, sub_topic, pub_topic } = req.body;

  if (!entity_id || !disp_name || !sub_topic || !pub_topic) {
    return res.status(400).json({ message: "Faltan datos requeridos" });
  }

  console.log("Received update data:", req.body);

  const query = `
    UPDATE entities
    SET disp_name = ?, sub_topic = ?, pub_topic = ?
    WHERE entity_id = ?
  `;
  const values = [disp_name, sub_topic, pub_topic, entity_id];

  db.query(query, values, (err, result) => {
    if (err) {
      console.error("Error updating entity data:", err);
      return res.status(500).send(err);
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Entidad no encontrada" });
    }

    res.json({ message: "Entidad actualizada correctamente" });
  });
});

//#endregion










//#region Widgets

app.get("/api/data/entitiesWidgets/:dashboard_id/:client_id", (req, res) => {
  const { dashboard_id, client_id } = req.params;
  const query = `
    SELECT 
      e.entity_id, 
      e.client_id, 
      e.disp_name, 
      e.sub_topic, 
      e.pub_topic, 
      e.token,
      w.widget_id,
      w.dashboard_id, 
      w.widget_type, 
      w.config_data, 
      w.widget_name
    FROM 
      entities e
    INNER JOIN 
      widgets w ON e.entity_id = w.entity_id
    WHERE 
      w.client_id = ? 
      AND w.dashboard_id = ?;
  `;

  db.query(query, [client_id, dashboard_id], (err, results) => {
    if (err) {
      console.error("Database query error:", err);
      return res.status(500).send(err);
    }

    const enhancedResults = results.map((result) => {
      let config;
      try {
        config = JSON.parse(result.config_data || "{}");
        console.log("Config después de parsear:", config); // Aquí deberías ver `scriptHtml`
      } catch (parseError) {
        console.error("Error parsing config_data:", parseError);
        config = {}; // Fallback en caso de error
      }
      config.sub_topic = result.sub_topic;
      config.pub_topic = result.pub_topic;
      config.lineColor = result.lineColor;

      config.token = result.token;

      return {
        ...result,
        config_data: JSON.stringify(config), // Guardar la configuración como un string JSON
      };
    });

    res.json(enhancedResults);
  });
});

app.get("/api/data/widgets/get/:widget_id", (req, res) => {
  const { entity_id } = req.params;
  const query = "SELECT * FROM widgets WHERE dashboard_id = 1";
  db.query(query, [entity_id], (err, results) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.json(results);
  });
});

app.get("/api/data/widgets/get", (req, res) => {
  const query = "SELECT * FROM widgets";
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.json(results);
  });
});

app.post("/api/data/widgets/insert", (req, res) => {
  const {
    widget_name,
    entity_id,
    dashboard_id,
    widget_type,
    config_data,
    client_id,
  } = req.body;



  const query = `
    INSERT INTO widgets (widget_name, entity_id, dashboard_id, widget_type, config_data, client_id)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(
    query,
    [
      widget_name,
      entity_id,
      dashboard_id,
      widget_type,
      JSON.stringify(config_data),
      client_id,
    ],
    (err, results) => {
      if (err) {
        console.error("Error al insertar widget:", err);
        return res.status(500).send(err);
      }
      res
        .status(201)
        .json({ message: "Widget creado con éxito", data: results });
    }

  );
});

app.put("/api/data/widgets/update/:widget_id", (req, res) => {
  const { widget_id } = req.params;
  const {
    widget_name,
    entity_id,
    dashboard_id,
    widget_type,
    config_data,
  } = req.body;

  const query = `
    UPDATE widgets
    SET widget_name = ?, 
        entity_id = ?, 
        dashboard_id = ?, 
        widget_type = ?, 
        config_data = ?
    WHERE widget_id = ?
  `;

  const queryValues = [
    widget_name,
    entity_id,
    dashboard_id || null,
    widget_type,
    JSON.stringify(config_data || {}),
    widget_id,
  ];

  // Debugging: Log the formatted SQL query
  console.log(db.format(query, queryValues));

  db.query(query, queryValues, (err, results) => {
    if (err) {
      console.error("Error al actualizar el widget:", err);
      return res.status(500).send(err);
    }

    if (results.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: "Widget no encontrado o no actualizado." });
    }

    res.status(200).json({
      message: "Widget actualizado con éxito.",
      data: results,
    });
  });
});




//#endregion











//#region Historic

app.get("/api/data/historic/ei/get/:entity_id", (req, res) => {
  const { entity_id } = req.params;
  const query = "SELECT * FROM historial WHERE historial.entity_id = ?";
  db.query(query, [entity_id], (err, results) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.json(results);
  });
});

app.get("/api/data/historic/ci/get/:client_id", (req, res) => {
  const { client_id } = req.params;
  const query = "SELECT * FROM historial WHERE historial.client_id = ?";
  db.query(query, [client_id], (err, results) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.json(results);
  });
});

app.post("/api/data/historic/insert", (req, res) => {
  const { entity_id, date, data, client_id, selected_key } = req.body;

  const query = `
    INSERT INTO historial (entity_id, date, data, client_id, selected_key) 
    VALUES (?, ?, ?, ?, ?);
  `;
  
  const values = [entity_id, date, data, client_id, selected_key];

  db.query(query, values, (error, results) => {
    if (error) {
      console.error("Error inserting historic data:", error);
      return res.status(500).send("Error inserting historic data");
    }
    console.log("Historic data inserted successfully:", values);
    return res.status(200).send("Historic data inserted successfully");
  });
});

//#endregion











//#region clients
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  const query = "SELECT * FROM clients WHERE email = ?";
  db.query(query, [email], async (err, results) => {
    if (err) {
      console.error("Error en la consulta de login:", err);
      return res
        .status(500)
        .json({
          message: "Error en el servidor, prueba mas tarde",
          error: err,
        });
    }

    if (results.length === 0) {
      return res
        .status(400)
        .json({ message: "Correo electrónico o contraseña no encontrado" });
    }

    const user = results[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res
        .status(400)
        .json({ message: "Correo electrónico o contraseña no encontrado" });
    }

    req.session.client = {
      id: user.client_id,
      name: user.name,
      email: user.email,
      access_level_id: user.access_level_id,
      admin_id: user.admin_id,
    };

    res.status(200).json({
      user: req.session.client,
    });
  });
});

// Ruta para obtener la sesión del usuario
app.get("/api/user", (req, res) => {
  if (req.session.client) {
    res.status(200).json(req.session.client);
  } else {
    res.status(401).json({ message: "No autenticado" });
  }
});

// Ruta para cerrar sesión
app.post("/api/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send("Error al cerrar sesión");
    }
    res.clearCookie("connect.sid");
    res.send("Sesión cerrada correctamente");
  });
});

app.post('/api/register', (req, res) => {
  const { name, email, password, adminEmail, access_level } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Por favor, complete todos los campos' });
  }

  // Si es admin, buscar admin_id
  if (access_level === '2' && adminEmail) {
    db.query('SELECT client_id FROM clients WHERE email = ?', [adminEmail], (err, adminResult) => {
      if (err) {
        console.error('Error al buscar el admin_id:', err);
        return res.status(500).json({ message: 'Error en el servidor', error: err });
      }

      const admin_id = adminResult.length ? adminResult[0].client_id : null;
      insertClient(name, email, password, access_level, admin_id, res);
    });
  } else {
    // No admin, admin_id es null
    insertClient(name, email, password, access_level, null, res);
  }
});

function insertClient(name, email, password, access_level, admin_id, res) {
  const access_level_id = access_level;

  if (!access_level_id) {
    return res.status(400).json({ message: 'Nivel de acceso no válido' });
  }

  db.query('INSERT INTO clients (name, email, password, access_level_id, admin_id) VALUES (?, ?, ?, ?, ?)', [name, email, password, access_level_id, admin_id], (err, result) => {
    if (err) {
      console.error('Error al registrar el usuario:', err);
      return res.status(500).json({ message: 'Error en el servidor', error: err });
    }

    const newClientId = result.insertId;

    if (admin_id) {
      db.query('INSERT INTO client_admins (client_id, admin_id) VALUES (?, ?)', [newClientId, admin_id], (err) => {
        if (err) {
          console.error('Error al insertar en client_admins:', err);
          return res.status(500).json({ message: 'Error en el servidor', error: err });
        }

        res.status(201).json({ message: 'Usuario registrado exitosamente' });
      });
    } else {
      res.status(201).json({ message: 'Usuario registrado exitosamente' });
    }
  });
}


app.put("/api/user/update", (req, res) => {
  const { id, name, email } = req.body;

  const query = "UPDATE clients SET name = ?, email = ? WHERE client_id = ?";
  db.query(query, [name, email, id], (err, result) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Error en el servidor", error: err });
    }
    res.status(200).json({ message: "Perfil actualizado exitosamente" });
  });
});

app.get("/api/asociatedClients-Admins/:admin_id", (req, res) => {
  const { admin_id } = req.params;
  const query = "SELECT client_id FROM client_admins WHERE admin_id = ?";
  db.query(query, [admin_id], (err, results) => {
    if (err) {
      return res.status(500).send(err);
    }
    const clientIds = results.map((result) => result.client_id);
    res.json(clientIds);
  });
});

app.get("/api/clients_id-client/:clients_ids", (req, res) => {
  const { clients_ids } = req.params;
  const idsArray = clients_ids.split(",").map((id) => parseInt(id));
  const query = "SELECT * FROM clients WHERE client_id IN (?)";
  db.query(query, [idsArray], (err, results) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.json(results);
  });
});

//#endregion











//#region Dashboards
app.post("/api/dashboards/set", (req, res) => {
  const { name, description, client_id, additional_client_ids = [] } = req.body;
  const query =
    "INSERT INTO dashboards (name, description, client_id, additional_client_ids) VALUES (?, ?, ?, ?)";
  db.query(
    query,
    [name, description, client_id, JSON.stringify(additional_client_ids)],
    (err, result) => {
      if (err) {
        console.error("Error inserting dashboard:", err);
        return res
          .status(500)
          .json({ message: "Error en el servidor", error: err });
      }
      const newDashboard = {
        dashboard_id: result.insertId,
        name,
        description,
        client_id,
        additional_client_ids,
      };
      res.status(201).json(newDashboard);
    }
  );
});

app.get("/api/data/dashboards/:client_id", (req, res) => {
  const { client_id } = req.params;

  // Consulta SQL ajustada para manejar números en el JSON
  const query = `
    SELECT * FROM dashboards
    WHERE client_id = ?
    OR JSON_CONTAINS(additional_client_ids, CAST(? AS JSON), '$')
  `;

  // Ejecutar consulta
  db.query(query, [client_id, client_id], (err, results) => {
    if (err) {
      console.error("Error executing query:", err);
      return res
        .status(500)
        .json({ message: "Error en el servidor", error: err });
    }
    res.json(results);
  });
});

app.put("/api/dashboards/update", (req, res) => {
  const {
    dashboard_id,
    name,
    description,
    additional_client_ids = [],
  } = req.body;
  const query =
    "UPDATE dashboards SET name = ?, description = ?, additional_client_ids = ? WHERE dashboard_id = ?";
  db.query(
    query,
    [name, description, JSON.stringify(additional_client_ids), dashboard_id],
    (err, result) => {
      if (err) {
        console.error("Error updating dashboard:", err);
        return res
          .status(500)
          .json({ message: "Error en el servidor", error: err });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Dashboard no encontrado" });
      }
      res.status(200).json({ message: "Dashboard actualizado correctamente" });
    }
  );
});

app.delete("/api/dashboards/delete/:dashboard_id", (req, res) => {
  const { dashboard_id } = req.params;

  const deleteWidgetsQuery = "DELETE FROM widgets WHERE dashboard_id = ?";
  const deleteDashboardQuery = "DELETE FROM dashboards WHERE dashboard_id = ?";

  // Primero elimina los widgets asociados
  db.query(deleteWidgetsQuery, [dashboard_id], (err, result) => {
    if (err) {
      console.error("Error deleting widgets:", err);
      return res
        .status(500)
        .json({
          message: "Error en el servidor al eliminar widgets",
          error: err,
        });
    }

    // Luego elimina el dashboard
    db.query(deleteDashboardQuery, [dashboard_id], (err, result) => {
      if (err) {
        console.error("Error deleting dashboard:", err);
        return res
          .status(500)
          .json({
            message: "Error en el servidor al eliminar el dashboard",
            error: err,
          });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Dashboard no encontrado" });
      }

      res
        .status(200)
        .json({ message: "Dashboard y widgets eliminados correctamente" });
    });
  });
});

app.post("/api/assign-dashboard", (req, res) => {
  const { clientId, dashboardId } = req.body;

  // Primero obtenemos el dashboard actual
  const getDashboardQuery =
    "SELECT additional_client_ids FROM dashboards WHERE dashboard_id = ?";
  db.query(getDashboardQuery, [dashboardId], (err, results) => {
    if (err) {
      console.error("Error fetching dashboard:", err);
      return res
        .status(500)
        .json({ message: "Error en el servidor", error: err });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "Dashboard no encontrado" });
    }

    const dashboard = results[0];
    let associatedClients = [];

    // Asegúrate de manejar el caso en que `additional_client_ids` no sea un JSON válido
    try {
      associatedClients = JSON.parse(dashboard.additional_client_ids || "[]");
    } catch (parseError) {
      console.error("Error parsing JSON:", parseError);
      return res
        .status(500)
        .json({
          message: "Error en el servidor al procesar los datos",
          error: parseError,
        });
    }

    // Verificar si el cliente ya está asociado
    if (!associatedClients.includes(clientId)) {
      associatedClients.push(clientId);

      // Actualizar la columna additional_client_ids
      const updateQuery =
        "UPDATE dashboards SET additional_client_ids = ? WHERE dashboard_id = ?";
      db.query(
        updateQuery,
        [JSON.stringify(associatedClients), dashboardId],
        (err, result) => {
          if (err) {
            console.error("Error updating dashboard:", err);
            return res
              .status(500)
              .json({ message: "Error en el servidor", error: err });
          }
          res.status(200).json({ message: "Dashboard assigned successfully" });
        }
      );
    } else {
      res
        .status(200)
        .json({ message: "Client is already assigned to this dashboard" });
    }
  });
});

//#endregion











//#region Alarms
app.get("/api/alarms/:client_id", (req, res) => {
  const { client_id } = req.params;
  const query = `
    SELECT 
      a.alarm_id, 
      a.entity_id, 
      a.valor, 
      a.client_id, 
      a.selected_key,
      a.alarm_condition,
      e.disp_name,
      e.token,
      e.sub_topic
    FROM 
      alarms a
    JOIN 
      entities e ON a.entity_id = e.entity_id
    WHERE 
      a.client_id = ?;
  `;

  db.query(query, [client_id], (err, results) => {
    if (err) {
      console.error("Database query error:", err);
      return res.status(500).send(err);
    }
    res.json(results);
  });
});

app.post("/api/alarms/instert", (req, res) => {
  const { entity_id, valor, client_id, selected_key, alarm_condition } =
    req.body;
  const query =
    "INSERT INTO alarms (entity_id, valor, client_id, selected_key, alarm_condition) VALUES (?, ?, ?, ?, ?)";

  db.query(
    query,
    [entity_id, valor, client_id, selected_key, alarm_condition],
    (err, result) => {
      if (err) {
        console.error("Error inserting alarm data:", err);
        return res.status(500).send(err);
      }
      res.json({ alarm_id: result.insertId, ...req.body });
    }
  );
});

//#endregion











//#region Notifications
app.get("/api/notifications/get/:client_id", (req, res) => {
  const { client_id } = req.params;
  console.log(req.params);
  const query = "SELECT * FROM notifications WHERE client_id = ?";
  db.query(query, [client_id], (err, results) => {
    if (err) {
      return res.status(500).send(err);
    }
    console.log(results);
    res.json(results);
  });
});

app.post("/api/notifications/instert", (req, res) => {
  const { alarm_id, client_id, date, data } = req.body;

  const query = `
    INSERT INTO notifications (alarm_id, client_id, date, data) 
    VALUES (?, ?, ?, ?)
  `;
  const values = [alarm_id, client_id, date, data];

  db.query(query, values, (err, result) => {
    if (err) {
      console.error("Error inserting notification data:", err);
      return res.status(500).send(err);
    }
    res.json({ notification_id: result.insertId, ...req.body });
  });
});

app.post("/api/notifications/markAsRead/:notification_id", (req, res) => {
  const { notification_id } = req.params;
  const query = "UPDATE notifications SET visto = 1 WHERE notification_id = ?";
  db.query(query, [notification_id], (err) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.status(200).send("Notificación marcada como leída");
  });
});
//#endregion










//#region Deprecated API Endpoints

// Este endpoint está obsoleto debido a la eliminación de `entities.dashboard_id`
app.get("/api/data/entities/:dashboard_id", (req, res) => {
  return res.status(404).send("This endpoint is no longer supported.");
});

//#endregion

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

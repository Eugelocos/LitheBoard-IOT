const db = require("../../config/db");
const bcrypt = require("bcryptjs");

/**
 * The function `login` handles user authentication by comparing the provided password with the hashed
 * password stored in the database for a given email.
 * @param {object} req - The `req` parameter in your code represents the request object, which contains
 * information about the HTTP request that the client has made. This object includes properties such as
 * `req.body` (containing the parsed request body), `req.params` (containing route parameters),
 * `req.query` (cont
 * @param {object} res - The `res` parameter in the `login` function is the response object that will be used to
 * send a response back to the client making the request. It is typically used to send HTTP responses
 * with status codes, headers, and data back to the client. In the provided code snippet, `res
 * @returns The login function returns either a success response with the user information in JSON
 * format if the email and password are valid, or a 400 status with a message "Email or password not
 * found" if the email or password do not match. In case of any server error during the process, it
 * returns a 500 status with a message "Server error, try later" along with the error details.
 */
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const query = "SELECT * FROM clients WHERE email = ?";
    const [results] = await db.promise().query(query, [email]);

    if (results.length === 0) {
      return res.status(400).json({ message: "Email or password not found" });
    }

    const user = results[0];
    console.log("Password hash from DB:", user.password);

    // Verificar si la contraseña es válida
    const passwordToCompare = password.trim(); // Limpiar espacios antes de comparar
    const isPasswordValid = await bcrypt.compareSync(passwordToCompare, user.password);

    console.log(
      "Contraseña introducida:",
      passwordToCompare,
      "Contraseña almacenada:",
      user.password,
      "Validación:",
      isPasswordValid
    );

    if (!isPasswordValid) {
      return res.status(400).json({ message: "Email or password not found" });
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
  } catch (err) {
    console.error("Login process error:", err);
    res.status(500).json({
      message: "Server error, try later",
      error: err.message || err,
    });
  }
};

/**
 * The function `getUserSession` checks if a user is authenticated and returns the user session data or
 * an error message accordingly.
 * @param {object} req - The `req` parameter typically represents the request object in a Node.js application.
 * It contains information about the HTTP request that is being made, such as the request headers,
 * parameters, body, and more. In this context, `req.session.client` is likely referring to a client
 * session stored in the 
 * @param {object} res - The `res` parameter in the `getUserSession` function is the response object that will
 * be used to send a response back to the client making the request. It is typically an instance of the
 * response class in a Node.js application using Express framework.
 * @returns The `getUserSession` function is returning a JSON response based on the presence of
 * `req.session.client`. If `req.session.client` exists, it returns a status of 200 with the client
 * session data in JSON format. If `req.session.client` does not exist, it returns a status of 401 with
 * a message indicating that the user is not authenticated and needs to log in to continue.
 */
const getUserSession = (req, res) => {
  if (req.session.client) {
    return res.status(200).json(req.session.client);
  } else {
    return res.status(401).json({
      message: "User not authenticated. Please log in to continue.",
    });
  }
};
/**
 * The function 'logout' handles users log outs of the plattform, destroying the session
 * @param {object} req - The `req` parameter typically represents the request object in a Node.js application.
 * It contains information about the HTTP request that is being made, such as the request headers,
 * parameters, body, and more.
 * @param {object} res - The `res` parameter in the `getUserSession` function is the response object that will
 * be used to send a response back to the client making the request. It is typically an instance of the
 * response class in a Node.js application using Express framework.
 */
const logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying the session:", err);
      return res.status(500).send("Error logging out. Please try again later.");
    }
    res.clearCookie("connect.sid");
    res.status(200).send("Session successfully closed.");
  });
};

const register = async (req, res) => {
  const { name, email, password, adminEmail, access_level } = req.body;

  console.log("Email recibido:", email.trim());
  console.log("Contraseña recibida:", password.trim());

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Please, fill all the fields" });
  }

  try {
    let admin_id = null;

    if (access_level === "2" && adminEmail) {
      const [adminResult] = await db
        .promise()
        .query("SELECT client_id FROM clients WHERE email = ?", [adminEmail]);

      if (adminResult.length === 0) {
        return res.status(404).json({ message: "Admin not found" });
      }

      admin_id = adminResult[0].client_id;
    }

    await insertClient(name, email, password, access_level, admin_id);

    res.status(201).json({ message: "User successfully registered." });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


async function insertClient(name, email, password, access_level, admin_id) {
  const access_level_id = access_level;

  if (!access_level_id) {
    throw new Error("Access level not valid");
  }

  try {
    console.log("password", password);


    const [result] = await db
      .promise()
      .query(
        "INSERT INTO clients (name, email, password, access_level_id, admin_id) VALUES (?, ?, ?, ?, ?)",
        [name, email, password, access_level_id, admin_id]
      );

    const newClientId = result.insertId;
    console.log("result", admin_id);

    if (admin_id) {
      await db
        .promise()
        .query(
          "INSERT INTO client_admins (client_id, admin_id) VALUES (?, ?)",
          [newClientId, admin_id]
        );
    }
  } catch (err) {
    console.error("Registration error:", err);
    throw new Error("Access level not valid");
  }
};

const updateClient = async (req, res) => {
  const { name, email, id } = req.body;
  if (!id || !name || !email) {
    return res.status(400).json({ message: "All the fields are required" });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "Email not valid" });
  }

  try {
    const query = "UPDATE clients SET name = ?, email = ? WHERE client_id = ?";
    const [result] = await db.promise().query(query, [name, email, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json({ message: "User successfully updated." });
  } catch (err) {
    console.error("Updating user error.", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const getAsociatedClientsAdminsByAdminId = async (req, res) => {
  const { admin_id } = req.params;
  if (!admin_id) {
    return res.status(400).json({ message: "Admin Id is required" });
  }

  try {
    const query = "SELECT client_id FROM client_admins WHERE admin_id = ?";
    const [results] = await db.promise().query(query, [admin_id]);
    if (results.length === 0) {
      return res.status(404).json({
        message: "No clients associated with this admin were found.",
      });
    }
    const clientIds = results.map((result) => result.client_id);
    res.status(200).json(clientIds);
  } catch (err) {
    console.error("Error retrieving associated clients.", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const getClientsByIds = async (req, res) => {
  const { clients_ids } = req.params;

  if (!clients_ids) {
    return res
      .status(400)
      .json({ message: "A list of client IDs is required." });
  }

  const idsArray = clients_ids.split(",").map((id) => parseInt(id, 10));

  if (idsArray.some((id) => isNaN(id))) {
    return res
      .status(400)
      .json({ message: "All IDs must be valid numeric values." });
  }

  const query = "SELECT * FROM clients WHERE client_id IN (?)";

  try {
    const [results] = await db.promise().query(query, [idsArray]);

    if (results.length === 0) {
      return res
        .status(404)
        .json({ message: "No clients found with those IDs." });
    }

    res.status(200).json(results);
  } catch (err) {
    console.error("Error retrieving clients.", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = {
  login,
  getClientsByIds,
  getUserSession,
  logout,
  register,
  updateClient,
  getAsociatedClientsAdminsByAdminId,
};

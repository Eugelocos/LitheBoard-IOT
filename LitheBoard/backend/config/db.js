const mysql = require('mysql2');
require('dotenv').config();

/* This code snippet is creating a MySQL connection pool using the `mysql2` library in a Node.js
application. Here's a breakdown of what each part of the code is doing: */

// Create a MySQL connection pool with configuration settings
const db = mysql.createPool({
  host: process.env.DB_HOST,               // Database host from environment variables
  user: process.env.DB_USER,               // Database user from environment variables
  password: process.env.DB_PASSWORD,       // Database password from environment variables
  database: process.env.DB_NAME,           // Database name from environment variables
  waitForConnections: true,                 // Wait for connections before rejecting them
  connectionLimit: 5,                       // Set the connection limit; increase if higher load is expected
  queueLimit: 0                             // Unlimited queue length
});

// Export the database connection pool for use in other modules
module.exports = db;

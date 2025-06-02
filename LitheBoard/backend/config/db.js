/*
const mysql = require('mysql2');
require('dotenv').config();


// Create a MySQL connection pool with configuration settings
const db = mysql.createPool({
  host: process.env.DB_HOST,               // Database host from environment variables
  port: process.env.DB_PORT || 3306,       // Database port from environment variables
  user: process.env.DB_USER,               // Database user from environment variables
  password: process.env.DB_PASSWORD,       // Database password from environment variables
  database: process.env.DB_NAME,           // Database name from environment variables
  waitForConnections: true,                // Wait for connections before rejecting them
  connectionLimit: 5,                      // Set the connection limit; increase if higher load is expected
  queueLimit: 0                            // Unlimited queue length
});

// Export the database connection pool for use in other modules
module.exports = db;

*/

// backend/config/db.js
const mysql = require('mysql2/promise');
const {
  dbHost,
  dbPort,
  dbUser,
  dbPassword,
  dbName
} = require('./index');

const pool = mysql.createPool({
  host: dbHost,            
  port: dbPort,          
  user: dbUser,            
  password: dbPassword,    
  database: dbName,
  waitForConnections: true, 
  connectionLimit: 10,    
  queueLimit: 0         
});

module.exports = pool;

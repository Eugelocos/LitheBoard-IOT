const dotenv = require('dotenv');

const envFile = `.env`; //.${process.env.NODE_ENV || 'development'}
dotenv.config({ path: envFile });

module.exports = {
  dbHost: process.env.DB_HOST,
  dbPort: process.env.DB_PORT || 3306,
  dbUser: process.env.DB_USER,
  dbPassword: process.env.DB_PASSWORD,
  dbName: process.env.DB_NAME,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn:process.env.JWT_EXPIRES_IN

};

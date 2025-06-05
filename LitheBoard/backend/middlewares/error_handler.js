// backend/middlewares/error_handler.js
module.exports = (err, req, res, next) => {
  console.error(err);
  const status = err.statusCode || 500;
  const message = err.isOperational ? err.message : 'Internal server error';
  res.status(status).json({ error: message });
};

const { Server } = require('socket.io');
const { protect } = require('../middlewares/auth');
const jwt = require('jsonwebtoken');

module.exports = function configureSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: `${process.env.WEB_URL}:${process.env.FRONTEND_PORT}`,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });
  io.use(async (socket, next) => {
    const token = socket.handshake.auth?.token;
    const req = { headers: { authorization: token ? `Bearer ${token}` : '' } };
    await protect(req, {}, (error) => {
      if (error) return next(new Error('Authentication required. Please sign in again.'));
      socket.data.user = req.user;
      socket.data.expiresAt = jwt.decode(token)?.exp;
      next();
    });
  });
  io.on('connection', (socket) => {
    // The client never chooses rooms or supplies an account id.
    socket.join(`client:${socket.data.user.client_id}`);
    const expiry = socket.data.expiresAt;
    let expiryTimer;
    if (expiry) {
      const disconnectWhenExpired = () => {
        const remaining = expiry * 1000 - Date.now();
        if (remaining <= 0) socket.disconnect(true);
        else expiryTimer = setTimeout(disconnectWhenExpired, Math.min(remaining, 2147483647));
      };
      disconnectWhenExpired();
    }
    socket.on('disconnect', () => clearTimeout(expiryTimer));
  });
  return io;
};

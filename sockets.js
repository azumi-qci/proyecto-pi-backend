const { Server } = require('socket.io');

const SOCKET_PORT = process.env.SOCKER_PORT || 3000;

const io = new Server(SOCKET_PORT, {
  cors: {
    origin: '*',
  },
});

io.on('connection', (socket) => {
  console.log(`Connected client: ${socket.id}`);
});

module.exports = io;

const { Server } = require('socket.io');

const SOCKET_PORT = process.env.SOCKER_PORT || 3000;

const io = new Server(SOCKET_PORT, {
  cors: {
    origin: '*',
  },
});

io.on('connection', (socket) => {
  console.log(`Connected client: ${socket.id}`);

  socket.on('join-room', (doorId) => {
    for (const room of socket.rooms) {
      socket.leave(room);
    }
    console.log(`The client ${socket.id} has joined the room door-${doorId}`);
  });
});

module.exports = io;

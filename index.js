const { Server } = require('socket.io');

const io = new Server(3000, {
  cors: {
    origin: '*',
  },
});

io.on('connection', (socket) => {
  console.log(`Connected client: ${socket.id}`);
});

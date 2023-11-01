const io = require('./sockets');
const express = require('express');

const app = express();

app.get('/', (req, res) => {
  res.json({
    message: 'Hello world!',
  });
});

app.listen(3000, () => {
  console.log('Express server running in the port 3000');
});

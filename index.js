const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const app = express();

const logsRoute = require('./routes/logs.route');
const authRoute = require('./routes/auth.route');

const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Routes
app.use('/api', logsRoute);
app.use('/api/auth', authRoute);

// Base route
app.get('/api', (req, res) => {
  res.json({
    message: 'The API works as expected!',
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`API running on port ${PORT}`);
});

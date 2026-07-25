const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/api', (req, res) => {
  res.send('API running');
});

app.use('/api/expenses', require('./routes/expenses'));

module.exports = app;

// app.js
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const seatRoutes = require('./routes/seatRoutes');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());



app.use('/api/auth', authRoutes);

app.use('/api/seats', seatRoutes);

// Basic route for testing
app.get('/', (req, res) => {
  res.send('Seat Booking API is running');
});

module.exports = app;

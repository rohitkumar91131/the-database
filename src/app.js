const express = require('express');
const connectDB = require('./config/db');
const movieRoutes = require('./routes/movieRoutes');

const app = express();

connectDB();

app.use(express.json());

app.use('/movies', movieRoutes);
app.use('/api/data', require('./routes/dataRoutes'));
module.exports = app;
const express = require('express');
const path = require('path');
const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));

app.use(express.static(path.join(__dirname, '../public')));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/', require('./routes/viewRoutes'));
app.use('/actors', require('./routes/actorRoutes'));
app.use('/products', require('./routes/productRoutes'));
app.use('/api/movies', require('./routes/movieRoutes'));

module.exports = app;
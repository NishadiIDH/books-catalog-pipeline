const express = require('express');
const app = express();

app.use(express.static(__dirname + '/public'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const booksRoutes = require('./routes/books');
app.use('/api/books', booksRoutes);

app.get('/', (req, res) => {
  res.send('Welcome to the Books Catalog!');
});

app.use((req, res) => res.status(404).json({ message: 'Not found' }));
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: 'Server error' });
});

module.exports = app;

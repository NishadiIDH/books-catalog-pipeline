const express = require('express');
const PORT = 3000;
const mongoose = require('mongoose');

  mongoose.connect('mongodb://127.0.0.1:27017/booksDB');

  mongoose.connection.on('connected', () => {
    console.log('Connected to MongoDB');
  });

  const app = express();
  app.use(express.static(__dirname + '/public'));
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

// Import route file
const booksRoutes = require('./routes/books');

// Mount the route at /api/books
app.use('/api/books', booksRoutes);

// Root route
app.get('/', (req, res) => {
  res.send('Welcome to the Books Catalog!');
});

app.use((req, res) => res.status(404).json({ message: 'Not found' }));
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: 'Server error' });
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
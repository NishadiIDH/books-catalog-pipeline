const mongoose = require('mongoose');
const app = require('./app');
const PORT = 3000;

mongoose.connect('mongodb://127.0.0.1:27017/booksDB');

mongoose.connection.on('connected', () => {
  console.log('Connected to MongoDB');
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});

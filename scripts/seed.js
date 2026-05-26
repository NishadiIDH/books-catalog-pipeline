const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/booksDB');

const Book = require('../models/booksModel');

const books = [
  {
    id: 'b1',
    title: 'The Three-Body Problem',
    author: 'Liu Cixin',
    year: 2008,
    genre: 'Science Fiction',
    summary: 'The Three-Body Problem is the first novel in the Remembrance of Earth\'s Past trilogy. The series portrays a fictional past, present, and future wherein Earth encounters an alien civilization from a nearby system of three Sun-like stars orbiting one another.',
    price: '29.99',
    currency: 'AUD'
  },
  {
    id: 'b2',
    title: 'Jane Eyre',
    author: 'Charlotte Brontë',
    year: 1847,
    genre: 'Classic',
    summary: 'An orphaned governess confronts class, morality, and love at Thornfield Hall, uncovering Mr. Rochester\'s secret and forging her own independence.',
    price: '22.00',
    currency: 'AUD'
  },
  {
    id: 'b3',
    title: 'Pride and Prejudice',
    author: 'Jane Austen',
    year: 1813,
    genre: 'Classic',
    summary: 'Elizabeth Bennet and Mr. Darcy navigate pride, misjudgement, and social expectations.',
    price: '22.00',
    currency: 'AUD'
  },
  {
    id: 'b4',
    title: 'The English Patient',
    author: 'Michael Ondaatje',
    year: 1992,
    genre: 'Historical Fiction',
    summary: 'In a ruined Italian villa at the end of WWII, four strangers with intersecting pasts confront memory, identity, and loss.',
    price: '25.39',
    currency: 'AUD'
  },
  {
    id: 'b5',
    title: 'Small Gods',
    author: 'Terry Pratchett',
    year: 1992,
    genre: 'Fantasy',
    summary: 'In Omnia, the god Om returns as a tortoise, and novice Brutha must confront belief and empire.',
    price: '31.99',
    currency: 'AUD'
  }
];

(async () => {
  try {
    await Book.collection.createIndex({ title: 1 }, { unique: true });

    await Book.deleteMany({});

    await Book.insertMany(books);

    console.log('Seeded 5 books.');
  } catch (err) {
    console.error('Seeding failed:', err.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
})();
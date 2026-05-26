const express = require('express');
const router = express.Router();

const Controllers = require('../controllers');

// GET /api/books
router.get('/', Controllers.booksController.getAllBooks);

// GET /api/books/:id
router.get('/:id', Controllers.booksController.getBookById);

// POST /api/books
router.post('/', Controllers.booksController.createBook);

// PUT /api/books/:id
router.put('/:id', Controllers.booksController.updateBook);

module.exports = router;
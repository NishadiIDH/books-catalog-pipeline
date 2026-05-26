const Book = require('../models/booksModel');

// get all books
const getAllBooks = async () => {
  return Book.find().lean({ getters: true });
};

// get book by id
const getBookById = async (id) => {
  return Book.findOne({ id }).lean({ getters: true });
};

// create book
const createBook = async (data) => {
  const book = new Book(data);
  await book.save();
  return book;
};

// update book
const updateBook = async (id, data) => {
  return Book.findOneAndUpdate(
    { id },
    { $set: data },
    {
      new: true,
      runValidators: true,
      context: 'query'
    }
  );
};

module.exports = {
  getAllBooks,
  getBookById,
  createBook,
  updateBook
};
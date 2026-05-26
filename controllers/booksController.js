// Import the service
const booksService = require('../services/booksService');

// allowed fields to create
const ALLOWED_FIELDS = ['id', 'title', 'author', 'year', 'genre', 'summary', 'price'];
// allowed fields to update
const ALLOWED_UPDATE_FIELDS = ['title', 'author', 'year', 'genre', 'summary', 'price'];

function parseValidationError(err) {
  return Object.values(err.errors)
    .map(e => e.message)
    .join(', ');
}

// check for unknown fields in the body
function findUnknownFields(body, allowedFields) {
  return Object.keys(body).filter(key => !allowedFields.includes(key));
}

// get all book details
exports.getAllBooks = async (req, res, next) => {
  try {
  const items = await booksService.getAllBooks();
  res.status(200).json({
  data: items,
  message: 'Books retrieved successfully'
});
} catch (err) {
  next(err);
}
};

// get a single book by ID from the database
exports.getBookById = async (req, res, next) => {
  try {
  const book = await booksService.getBookById(req.params.id);

  if (!book) {
    return res.status(404).json({
      status: 404,
      message: 'Book not found'
    });
  }

  res.status(200).json({
  data: book,
  message: 'Single book retrieved'
  });

  } catch (err) {
  next(err);
}
};

// create a new book with validation and safe writes
exports.createBook = async (req, res, next) => {
  try {
    // reject unknown fields
    const unknownFields = findUnknownFields(req.body, ALLOWED_FIELDS);
    if (unknownFields.length > 0) {
      return res.status(400).json({
        status: 400,
        message: `Unknown field(s) not permitted: ${unknownFields.join(', ')}`
      });
    }

    // extract only allowed fields
    const { id, title, author, year, genre, summary, price } = req.body;
    const data = { id, title, author, year, genre, summary, price };

    const book = await booksService.createBook(data);

    res.status(201).json({
      status: 201,
      data: book,
      message: 'Book created successfully'
    });
  } catch (err) {
    // duplicate primary key
    if (err.code === 11000) {
      return res.status(409).json({
        status: 409,
        message: 'A book with this id already exists'
      });
    }
    // Mongoose validation error
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        status: 400,
        message: parseValidationError(err)
      });
    }
    next(err);
  }
};

// update existing book with validation and safe writes
exports.updateBook = async (req, res, next) => {
  try {
    // Reject attempt to change id
    if ('id' in req.body) {
      return res.status(400).json({
        status: 400,
        message: 'id is immutable and cannot be changed'
      });
    }

    // Reject unknown fields
    const unknownFields = findUnknownFields(req.body, ALLOWED_UPDATE_FIELDS);
    if (unknownFields.length > 0) {
      return res.status(400).json({
        status: 400,
        message: `Unknown field(s) not permitted: ${unknownFields.join(', ')}`
      });
    }

    // Extract only allowed update fields
    const { title, author, year, genre, summary, price } = req.body;
    const data = {};
    if (title !== undefined) data.title = title;
    if (author !== undefined) data.author = author;
    if (year !== undefined) data.year = year;
    if (genre !== undefined) data.genre = genre;
    if (summary !== undefined) data.summary = summary;
    if (price !== undefined) data.price = price;

    const book = await booksService.updateBook(req.params.id, data);

    if (!book) {
      return res.status(404).json({
        status: 404,
        message: 'Book not found'
      });
    }

    res.json({
      status: 200,
      data: book,
      message: 'Book updated successfully'
    });
  } catch (err) {
    // Mongoose validation error
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        status: 400,
        message: parseValidationError(err)
      });
    }
    next(err);
  }
};
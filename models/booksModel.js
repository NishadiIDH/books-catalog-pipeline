const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  id: {
    type: String,
    required: [true, 'id is required'],
    unique: true,
    index: true,
    trim: true,
    minlength: [2, 'id must be at least 2 characters'],
    maxlength: [10, 'id must be at most 10 characters'],
    match: [/^b\d+$/, 'id must match format b1, b2, b100 etc.']
  },

  title: {
    type: String,
    required: [true, 'title is required'],
    trim: true,
    minlength: [2, 'title must be at least 2 characters'],
    maxlength: [100, 'title must be at most 100 characters']
  },

  author: {
    type: String,
    required: [true, 'author is required'],
    trim: true,
    minlength: [2, 'author must be at least 2 characters'],
    maxlength: [60, 'author must be at most 60 characters']
  },

  year: {
    type: Number,
    required: [true, 'year is required'],
    min: [1000, 'year must be 1000 or later'],
    max: [2026, 'year cannot be in the future']
  },

  genre: {
    type: String,
    required: [true, 'genre is required'],
    enum: {
      values: [
        'Fiction',
        'Non-Fiction',
        'Classic',
        'Science Fiction',
        'Fantasy',
        'Historical Fiction',
        'Mystery',
        'Biography',
        'Other'
      ],
    message: 'Invalid genre value'
    }
  },

  summary: {
    type: String,
    required: [true, 'summary is required'],
    trim: true,
    minlength: [20, 'summary must be at least 20 characters'],
    maxlength: [1000, 'summary must be at most 1000 characters']
  },

  price: {
    type: mongoose.Schema.Types.Decimal128,
    required: [true, 'price is required'],
    get: v => v ? v.toString() : null,
    validate: {
      validator: function(v) {
        return v && parseFloat(v.toString()) > 0;
      },
      message: 'price must be a positive number'
    }
  }

}, {
  toJSON: {getters: true, virtuals: false, transform: (doc, ret) => { delete ret._id; delete ret.__v; return ret;}},
  toObject: { getters: true, virtuals: false }
});

module.exports = mongoose.model('Book', bookSchema);
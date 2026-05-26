const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');

beforeAll(async () => {
  await mongoose.connect('mongodb://127.0.0.1:27017/booksDB_test');
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

describe('Books API', () => {
  let bookId = `b${Date.now() % 100000}`;

  test('POST /api/books - should create a valid book', async () => {
    const res = await request(app)
      .post('/api/books')
      .send({
        id: bookId,
        title: 'Test Book',
        author: 'Test Author',
        year: 2020,
        genre: 'Science Fiction',
        summary: 'This is a test summary that is long enough to pass validation.',
        price: '19.99'
      });
    expect(res.statusCode).toBe(201);
  });

  test('POST /api/books - should reject duplicate ID', async () => {
    const res = await request(app)
      .post('/api/books')
      .send({
        id: bookId,
        title: 'Test Book',
        author: 'Test Author',
        year: 2020,
        genre: 'Science Fiction',
        summary: 'This is a test summary that is long enough to pass validation.',
        price: '19.99'
      });
    expect(res.statusCode).toBe(409);
  });

  test('POST /api/books - should reject missing title', async () => {
    const res = await request(app)
      .post('/api/books')
      .send({
        id: `b${Date.now() % 100000}`,
        author: 'Test Author',
        year: 2020,
        genre: 'Science Fiction',
        summary: 'This is a test summary that is long enough to pass validation.',
        price: '19.99'
      });
    expect(res.statusCode).toBe(400);
  });

  test('PUT /api/books/:id - should update a book', async () => {
    const res = await request(app)
      .put(`/api/books/${bookId}`)
      .send({
        title: 'Updated Book',
        author: 'Updated Author',
        year: 2021,
        genre: 'Fantasy',
        summary: 'This is an updated summary that is long enough to pass validation.',
        price: '29.99'
      });
    expect(res.statusCode).toBe(200);
  });

  test('PUT /api/books/:id - should return 404 for non-existent book', async () => {
    const res = await request(app)
      .put('/api/books/b99999')
      .send({
        title: 'Updated Book',
        author: 'Updated Author',
        year: 2021,
        genre: 'Fantasy',
        summary: 'This is an updated summary that is long enough to pass validation.',
        price: '29.99'
      });
    expect(res.statusCode).toBe(404);
  });
});

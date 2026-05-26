/**
 * SIT725 – 5.4D Validation Tests (MANDATORY TEMPLATE)
 *
 * HOW TO RUN: (Node.js 18+ is required)
 *   1. Start MongoDB
 *   2. Start your server (npm start)
 *   3. node validation-tests.js
 *
 * DO NOT MODIFY:
 *   - Output format (TEST|, SUMMARY|, COVERAGE|)
 *   - test() function signature
 *   - Exit behaviour
 *   - coverageTracker object
 *   - Logging structure
 *
 * YOU MUST:
 *   - Modify makeValidBook() to satisfy your schema rules
 *   - Add sufficient tests to meet coverage requirements
 */

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const API_BASE = "/api/books";

// =============================
// INTERNAL STATE (DO NOT MODIFY)
// =============================

const results = [];

const coverageTracker = {
  CREATE_FAIL: 0,
  UPDATE_FAIL: 0,
  TYPE: 0,
  REQUIRED: 0,
  BOUNDARY: 0,
  LENGTH: 0,
  TEMPORAL: 0,
  UNKNOWN_CREATE: 0,
  UNKNOWN_UPDATE: 0,
  IMMUTABLE: 0,
};

// =============================
// OUTPUTS FORMAT (DO NOT MODIFY)
// =============================

function logHeader(uniqueId) {
  console.log("SIT725_VALIDATION_TESTS");
  console.log(`BASE_URL=${BASE_URL}`);
  console.log(`API_BASE=${API_BASE}`);
  console.log(`INFO|Generated uniqueId=${uniqueId}`);
}

function logResult(r) {
  console.log(
    `TEST|${r.id}|${r.name}|${r.method}|${r.path}|expected=${r.expected}|actual=${r.actual}|pass=${r.pass ? "Y" : "N"}`
  );
}

function logSummary() {
  const failed = results.filter(r => !r.pass).length;
  console.log(
    `SUMMARY|pass=${failed === 0 ? "Y" : "N"}|failed=${failed}|total=${results.length}`
  );
  return failed === 0;
}

function logCoverage() {
  console.log(
    `COVERAGE|CREATE_FAIL=${coverageTracker.CREATE_FAIL}` +
    `|UPDATE_FAIL=${coverageTracker.UPDATE_FAIL}` +
    `|TYPE=${coverageTracker.TYPE}` +
    `|REQUIRED=${coverageTracker.REQUIRED}` +
    `|BOUNDARY=${coverageTracker.BOUNDARY}` +
    `|LENGTH=${coverageTracker.LENGTH}` +
    `|TEMPORAL=${coverageTracker.TEMPORAL}` +
    `|UNKNOWN_CREATE=${coverageTracker.UNKNOWN_CREATE}` +
    `|UNKNOWN_UPDATE=${coverageTracker.UNKNOWN_UPDATE}` +
    `|IMMUTABLE=${coverageTracker.IMMUTABLE}`
  );
}

// =============================
// HTTP HELPER
// =============================

async function http(method, path, body) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  return { status: res.status, text };
}

// =============================
// TEST REGISTRATION FUNCTION
// =============================

async function test({ id, name, method, path, expected, body, tags }) {

  const { status } = await http(method, path, body);
  const pass = status === expected;

  const result = { id, name, method, path, expected, actual: status, pass };
  results.push(result);
  logResult(result);

  const safeTags = Array.isArray(tags) ? tags : [];

  safeTags.forEach(tag => {
    if (Object.prototype.hasOwnProperty.call(coverageTracker, tag)) {
      coverageTracker[tag]++;
    }
  });
}

// =============================
// STUDENT MUST MODIFY THESE
// =============================

function makeValidBook(id) {
  return {
    id,
    title: "The Hitchhikers Guide to the Galaxy",
    author: "Douglas Adams",
    year: 1979,
    genre: "Science Fiction",
    summary: "Arthur Dent is whisked off Earth moments before it is demolished to make way for a hyperspace bypass, embarking on a wild journey across the universe.",
    price: "19.99"
  };
}

function makeValidUpdate() {
  return {
    title: "Harry Potter and the Deathly Hallows",
    author: "J K Rowling",
    year: 2007,
    genre: "Fantasy",
    summary: "Harry Potter embarks on a final quest to destroy the remaining Horcruxes and defeat Lord Voldemort once and for all, with the fate of the wizarding world at stake.",
    price: "29.99"
  };
}

// =============================
// REQUIRED BASE TESTS (DO NOT REMOVE)
// =============================

async function run() {

  const uniqueId = `b${Date.now() % 100000}`;
  logHeader(uniqueId);

  const createPath = API_BASE;
  const updatePath = (id) => `${API_BASE}/${id}`;

  // ---- T01 Valid CREATE ----
  // create a valid book with all correct fields
  await test({
    id: "T01",
    name: "Valid create",
    method: "POST",
    path: createPath,
    expected: 201,
    body: makeValidBook(uniqueId),
    tags: []
  });

  // ---- T02 Duplicate ID ----
  // Tries to create a book with existing ID
  await test({
    id: "T02",
    name: "Duplicate ID",
    method: "POST",
    path: createPath,
    expected: 409,
    body: makeValidBook(uniqueId),
    tags: ["CREATE_FAIL"]
  });

  // ---- T03 Immutable ID ----
  // Tries to update ID of an existing book
  await test({
    id: "T03",
    name: "Immutable ID on update",
    method: "PUT",
    path: updatePath(uniqueId),
    expected: 400,
    body: { ...makeValidUpdate(), id: "b999" },
    tags: ["UPDATE_FAIL", "IMMUTABLE"]
  });

  // ---- T04 Unknown field CREATE ----
  // Tries to create a book with extra unknown field
  await test({
    id: "T04",
    name: "Unknown field CREATE",
    method: "POST",
    path: createPath,
    expected: 400,
    body: { ...makeValidBook(`b${(Date.now() + 1) % 100000}`), hack: true },
    tags: ["CREATE_FAIL", "UNKNOWN_CREATE"]
  });

  // ---- T05 Unknown field UPDATE ----
  // Tries to update a book with extra unknown field
  await test({
    id: "T05",
    name: "Unknown field UPDATE",
    method: "PUT",
    path: updatePath(uniqueId),
    expected: 400,
    body: { ...makeValidUpdate(), hack: true },
    tags: ["UPDATE_FAIL", "UNKNOWN_UPDATE"]
  });

  // =====================================
  // ADDITIONAL TESTS
  // =====================================

  // ---- T06 Missing title on CREATE ----
  // Tries to create a book with missing title
  await test({
    id: "T06",
    name: "Missing title on CREATE",
    method: "POST",
    path: createPath,
    expected: 400,
    body: (() => { const b = makeValidBook(`b${(Date.now() + 1) % 100000}`); delete b.title; return b; })(),
    tags: ["CREATE_FAIL", "REQUIRED"]
  });

  // ---- T07 Missing author on CREATE ----
  // Tries to create a book with missing author
  await test({
    id: "T07",
    name: "Missing author on CREATE",
    method: "POST",
    path: createPath,
    expected: 400,
    body: (() => { const b = makeValidBook(`b${Date.now() + 3}`); delete b.author; return b; })(),
    tags: ["CREATE_FAIL", "REQUIRED"]
  });

  // ---- T08 Missing year on CREATE ----
  // Tries to create a book with missing year
  await test({
    id: "T08",
    name: "Missing year on CREATE",
    method: "POST",
    path: createPath,
    expected: 400,
    body: (() => { const b = makeValidBook(`b${Date.now() + 4}`); delete b.year; return b; })(),
    tags: ["CREATE_FAIL", "REQUIRED"]
  });

  // ---- T09 Missing genre on CREATE ----
  // Tries to create a book with missing genre
  await test({
    id: "T09",
    name: "Missing genre on CREATE",
    method: "POST",
    path: createPath,
    expected: 400,
    body: (() => { const b = makeValidBook(`b${Date.now() + 5}`); delete b.genre; return b; })(),
    tags: ["CREATE_FAIL", "REQUIRED"]
  });

  // ---- T10 Missing summary on CREATE ----
  // Tries to create a book with missing summary
  await test({
    id: "T10",
    name: "Missing summary on CREATE",
    method: "POST",
    path: createPath,
    expected: 400,
    body: (() => { const b = makeValidBook(`b${Date.now() + 6}`); delete b.summary; return b; })(),
    tags: ["CREATE_FAIL", "REQUIRED"]
  });

  // ---- T11 Missing price on CREATE ----
  // Tries to create a book with missing price
  await test({
    id: "T11",
    name: "Missing price on CREATE",
    method: "POST",
    path: createPath,
    expected: 400,
    body: (() => { const b = makeValidBook(`b${Date.now() + 7}`); delete b.price; return b; })(),
    tags: ["CREATE_FAIL", "REQUIRED"]
  });

  // ---- T12 year is a string instead of number ----
  // Tries to create a book where year is non-numeric
  await test({
    id: "T12",
    name: "year wrong type (string) on CREATE",
    method: "POST",
    path: createPath,
    expected: 400,
    body: { ...makeValidBook(`b${Date.now() + 8}`), year: "not-a-year" },
    tags: ["CREATE_FAIL", "TYPE"]
  });

  // ---- T13 price is negative on CREATE ----
  // Tries to create a book where book price is negative value
  await test({
    id: "T13",
    name: "Negative price on CREATE",
    method: "POST",
    path: createPath,
    expected: 400,
    body: { ...makeValidBook(`b${Date.now() + 9}`), price: "-5.00" },
    tags: ["CREATE_FAIL", "BOUNDARY"]
  });

  // ---- T14 price is zero on CREATE ----
  // Tries to create a book where book price is zero
  await test({
    id: "T14",
    name: "Zero price on CREATE",
    method: "POST",
    path: createPath,
    expected: 400,
    body: { ...makeValidBook(`b${Date.now() + 10}`), price: "0" },
    tags: ["CREATE_FAIL", "BOUNDARY"]
  });

  // ---- T15 year below min boundary (999) ----
  // Tries to create a book where year < 1000
  await test({
    id: "T15",
    name: "year below min boundary on CREATE",
    method: "POST",
    path: createPath,
    expected: 400,
    body: { ...makeValidBook(`b${Date.now() + 11}`), year: 999 },
    tags: ["CREATE_FAIL", "BOUNDARY", "TEMPORAL"]
  });

  // ---- T16 year above max boundary (future year) ----
  // Tries to create a book where year > 2026
  await test({
    id: "T16",
    name: "year in future on CREATE",
    method: "POST",
    path: createPath,
    expected: 400,
    body: { ...makeValidBook(`b${Date.now() + 12}`), year: 2099 },
    tags: ["CREATE_FAIL", "BOUNDARY", "TEMPORAL"]
  });

  // ---- T17 title too short (1 char) ----
  // Tries to create a book where title (char) < 2
  await test({
    id: "T17",
    name: "title too short on CREATE",
    method: "POST",
    path: createPath,
    expected: 400,
    body: { ...makeValidBook(`b${Date.now() + 13}`), title: "A" },
    tags: ["CREATE_FAIL", "LENGTH"]
  });

  // ---- T18 title too long (101 chars) ----
  // Tries to create a book where title (char) > 100
  await test({
    id: "T18",
    name: "title too long on CREATE",
    method: "POST",
    path: createPath,
    expected: 400,
    body: { ...makeValidBook(`b${Date.now() + 14}`), title: "A".repeat(101) },
    tags: ["CREATE_FAIL", "LENGTH"]
  });

  // ---- T19 author too short (1 char) ----
  // Tries to create a book where author (char) < 2
  await test({
    id: "T19",
    name: "author too short on CREATE",
    method: "POST",
    path: createPath,
    expected: 400,
    body: { ...makeValidBook(`b${Date.now() + 15}`), author: "A" },
    tags: ["CREATE_FAIL", "LENGTH"]
  });

  // ---- T20 summary too short (under 20 chars) ----
  // Tries to create a book where summary (char) < 20
  await test({
    id: "T20",
    name: "summary too short on CREATE",
    method: "POST",
    path: createPath,
    expected: 400,
    body: { ...makeValidBook(`b${Date.now() + 16}`), summary: "Too short" },
    tags: ["CREATE_FAIL", "LENGTH"]
  });

  // ---- T21 summary too long (over 1000 chars) ----
  // Tries to create a book where sumary (char) < 1000
  await test({
    id: "T21",
    name: "summary too long on CREATE",
    method: "POST",
    path: createPath,
    expected: 400,
    body: { ...makeValidBook(`b${Date.now() + 17}`), summary: "A".repeat(1001) },
    tags: ["CREATE_FAIL", "LENGTH"]
  });

  // ---- T22 invalid genre on CREATE ----
  // Tries to create a book with not allowed genre
  await test({
    id: "T22",
    name: "Invalid genre on CREATE",
    method: "POST",
    path: createPath,
    expected: 400,
    body: { ...makeValidBook(`b${Date.now() + 18}`), genre: "Cooking" },
    tags: ["CREATE_FAIL", "TYPE"]
  });

  // ---- T23 id wrong format on CREATE ----
  // Tries to create a book with wrong ID format
  await test({
    id: "T23",
    name: "id wrong format on CREATE",
    method: "POST",
    path: createPath,
    expected: 400,
    body: { ...makeValidBook(`b${(Date.now() + 1) % 100000}`), id: "book-abc" },
    tags: ["CREATE_FAIL", "TYPE"]
  });

  // ---- T24 Valid UPDATE ----
  // Update a book with correct fields
  await test({
    id: "T24",
    name: "Valid update",
    method: "PUT",
    path: updatePath(uniqueId),
    expected: 200,
    body: makeValidUpdate(),
    tags: []
  });

  // ---- T25 UPDATE on non-existent book ----
  // Tries to update a non-existing book
  await test({
    id: "T25",
    name: "Update non-existent book",
    method: "PUT",
    path: updatePath("b99999"),
    expected: 404,
    body: makeValidUpdate(),
    tags: ["UPDATE_FAIL"]
  });

  const pass = logSummary();
  logCoverage();

  process.exit(pass ? 0 : 1);
}

run().catch(err => {
  console.error("ERROR", err);
  process.exit(2);
});
const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
let { isValid, users } = require("./auth_users.js");
const public_users = express.Router();
const axios = require('axios');

const JWT_SECRET = "fingerprint"; // Replace with a secure secret

const getBooksByAuthor = (author) => {
  return Object.values(books).filter(book => book.author.toLowerCase() === author.toLowerCase());
};

const getBooksByTitle = (title) => {
  return Object.values(books).filter(book => book.title.toLowerCase() === title.toLowerCase());
};

// Task 1: Get the list of books available in the shop
public_users.get('/', async function (req, res) {
  res.send(JSON.stringify(books, null, 4));
});

// Task 2: Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (book) {
    res.json(book);
  } else {
    res.status(404).json({ message: "Book not found" });
  }
});

// Task 3: Get book details based on author
public_users.get('/author/:author', async function (req, res) {
  const author = req.params.author;
  const authorBooks = getBooksByAuthor(author);
  if (authorBooks.length > 0) {
    res.json(authorBooks);
  } else {
    res.status(404).json({ message: "No books found for this author" });
  }
});

// Task 4: Get book details based on title

public_users.get('/title/:title', async function (req, res) {
  const title = req.params.title;
  const titleBooks = getBooksByTitle(title);
  if (titleBooks.length > 0) {
    res.json(titleBooks);
  } else {
    res.status(404).json({ message: "No books found for this title" });
  }
});

// Task 5: Get book review
public_users.get('/review/:isbn', async function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (book && book.reviews) {
    res.json(book.reviews);
  } else {
    res.status(404).json({ message: "No reviews found for this book" });
  }
});

// Task 6: Register a new user
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (users[username]) {
    return res.status(400).json({ message: "Username already exists" });
  }

  users[username] = { password };
  res.status(201).json({ message: "User registered successfully" });
});

// Task 7: Login as a registered user
public_users.post("/customer/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  const user = users[username];
  if (user && user.password === password) {

    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ message: "Login successful", token });
  } else {
    res.status(401).json({ message: "Invalid credentials" });
  }
});

// Task 8: Add or modify a book review
public_users.put("/review/:isbn", (req, res) => {
  const { username } = req.body;
  const isbn = req.params.isbn;
  const review = req.body.review;

  if (!username || !review) {
    return res.status(400).json({ message: "Username and review are required" });
  }

  if (books[isbn]) {
    books[isbn].reviews[username] = review;
    res.json({ message: "Review added/updated successfully", reviews: books[isbn].reviews });
  } else {
    res.status(404).json({ message: "Book not found" });
  }
});

// Get books (Task 1 using Axios Async-Await)
public_users.get('/async/books', async (req, res) => {
  try {
      const response = await axios.get('http://localhost:5000/public_users');
      res.json(response.data);
  } catch (error) {
      res.status(404).json({ message: "Error fetching books via async-await" });
  }
});

// Get book details by ISBN (Task 2 using Axios Async-Await)
public_users.get('/async/isbn/:isbn', async (req, res) => {
  try {
      const isbn = req.params.isbn;
      const response = await axios.get(`http://localhost:5000/public_users/isbn/${isbn}`);
      res.json(response.data);
  } catch (error) {
      res.status(404).json({ message: "Error fetching book details via async-await" });
  }
});


// Get book details by author (Task 3 using Axios Async-Await)
public_users.get('/async/author/:author', async (req, res) => {
  try {
      const author = req.params.author;
      const response = await axios.get(`http://localhost:5000/public_users/author/${author}`);
      res.json(response.data);
  } catch (error) {
      res.status(404).json({ message: "Error fetching book details via async-await" });
  }
});

// Get book details by title (Task 4 using Axios Async-Await)
public_users.get('/async/title/:title', async (req, res) => {
  try {
    const title = req.params.title;
    const response = await axios.get(`http://localhost:5000/public_users/title/${title}`);
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching book details:", error);
    res.status(404).json({ message: "Error fetching book details by title" });
  }
});

module.exports.general = public_users;

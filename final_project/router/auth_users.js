const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [
  { username: "ali", password: "ali010" },
];

// Middleware
regd_users.use(express.json());

const isValid = (username) => {
    return !users.some(user => user.username === username);
};

// Authenticate the user
const authenticatedUser = (username, password) => {
  return users.some(user => user.username === username && user.password === password);
};

// Only registered users can login

regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required." });
  }

  if (!authenticatedUser(username, password)) {
      return res.status(401).json({ message: "Invalid username or password." });
  }

  const accessToken = jwt.sign({ username }, "access", { expiresIn: '1h' });

  req.session.authorization = {
      accessToken,
      username
  };

  console.log("Logged in user:", username);
  console.log("Session data after login:", req.session);

  res.status(200).json({ message: "User logged in successfully", token: accessToken });
});

// Add or modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params; 
  const { review } = req.body; 

  if (!req.session || !req.session.authorization) {
      return res.status(403).json({ message: "User not logged in" });
  }

  const { username } = req.session.authorization;

  if (!isbn || !review) {
      return res.status(400).json({ message: "ISBN and review are required." });
  }

  if (!books[isbn]) {
      return res.status(404).json({ message: `Book with ISBN ${isbn} not found.` });
  }

  if (!books[isbn].reviews) {
      books[isbn].reviews = {};
  }

  books[isbn].reviews[username] = review;

  res.status(200).json({
      message: `Review for book with ISBN ${isbn} updated successfully.`,
      reviews: books[isbn].reviews
  });
});

// Delete a book review with user logged in

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params;

  if (!req.session || !req.session.authorization || !req.session.authorization.username) {
      return res.status(403).json({ message: "User not logged in or session expired." });
  }

  const username = req.session.authorization.username;

  if (!books[isbn]) {
      return res.status(404).json({ message: `Book with ISBN ${isbn} not found` });
  }

  const bookReviews = books[isbn].reviews || {};

  if (!bookReviews[username]) {
      return res.status(403).json({ message: "You can only delete your own reviews." });
  }

  delete bookReviews[username];

  if (Object.keys(bookReviews).length === 0) {
      delete books[isbn].reviews;
  }

  res.status(200).json({ message: `Review for book with ISBN ${isbn} deleted successfully.` });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
    // Retrieve username and password from the request body.
    const username = req.body.username;
    const password = req.body.password;
  
    // Check if both username and password are provided.
    if (username && password) {
      // Check if the username already exists in the 'users' array.
      // The 'users' array is imported from auth_users.js.
      const doesExist = users.filter((user) => user.username === username).length > 0;
  
      if (!doesExist) {
        // If the user does not exist, add them to the users array.
        users.push({"username":username, "password":password});
        // Send a success response. Status 201 means "Created".
        return res.status(201).json({message: "User successfully registered. Now you can login."});
      } else {
        // If the user already exists, send a conflict error.
        return res.status(409).json({message: "User with this username already exists."});
      }
    }
    // If username or password are not provided, send a bad request error.
    return res.status(400).json({message: "Unable to register user. Username and/or password not provided."});
  });

// Get the book list available in the shop
// Simulate an async function that returns books data
const getBooksAsync = async () => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve(books);
      }, 100); // 100ms delay to simulate async
    });
  };
  
  // Updated route using async/await
  public_users.get('/', async function (req, res) {
    try {
      const bookList = await getBooksAsync();
      return res.status(200).json(bookList);
    } catch (error) {
      return res.status(500).json({ message: "Error fetching books." });
    }
  });
  

// Get book details based on ISBN
// Simulated async function to get book details by ISBN
const getBookByISBN = async (isbn) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (books[isbn]) {
          resolve(books[isbn]);
        } else {
          reject("Book with the specified ISBN not found.");
        }
      }, 100); // Simulate async delay
    });
  };
  
  // Updated route using async/await
  public_users.get('/isbn/:isbn', async function (req, res) {
    const isbn = req.params.isbn;
    try {
      const book = await getBookByISBN(isbn);
      return res.status(200).json(book);
    } catch (error) {
      return res.status(404).json({ message: error });
    }
  });
  
  
// Get book details based on author
// Get book details based on author using async/await
public_users.get('/author/:author', async function (req, res) {
    const authorName = req.params.author;

    // Wrap the logic in a Promise
    const getBooksByAuthor = () => {
        return new Promise((resolve, reject) => {
            const allISBNs = Object.keys(books);
            let booksByAuthor = [];

            for (const isbn of allISBNs) {
                const book = books[isbn];
                if (book.author === authorName) {
                    booksByAuthor.push({ isbn: isbn, ...book });
                }
            }

            if (booksByAuthor.length > 0) {
                resolve(booksByAuthor);
            } else {
                reject("No books found for the specified author.");
            }
        });
    };

    try {
        const result = await getBooksByAuthor();
        return res.json({ booksbyauthor: result });
    } catch (error) {
        return res.status(404).json({ message: error });
    }
});


// Get all books based on title
// Get all books based on title using async/await and Promises
public_users.get('/title/:title', async function (req, res) {
    const bookTitle = req.params.title;

    const getBooksByTitle = () => {
        return new Promise((resolve, reject) => {
            const allISBNs = Object.keys(books);
            let booksByTitle = [];

            for (const isbn of allISBNs) {
                const book = books[isbn];
                if (book.title === bookTitle) {
                    booksByTitle.push({ isbn: isbn, ...book });
                }
            }

            if (booksByTitle.length > 0) {
                resolve(booksByTitle);
            } else {
                reject("No books found for the specified title.");
            }
        });
    };

    try {
        const result = await getBooksByTitle();
        return res.json({ booksbytitle: result });
    } catch (error) {
        return res.status(404).json({ message: error });
    }
});
  

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    // Retrieve the ISBN from the request parameters.
    const isbn = req.params.isbn;
  
    // Check if a book with the given ISBN exists in our database.
    if (books[isbn]) {
      // If the book is found, send its 'reviews' object as the response.
      return res.json(books[isbn].reviews);
    } else {
      // If the book is not found, send a 404 Not Found error with a message.
      return res.status(404).json({message: "Book with the specified ISBN not found."});
    }
  });
  
  module.exports.general = public_users;
  
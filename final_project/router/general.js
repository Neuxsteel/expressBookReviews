const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');

// Verificar si un usuario con el nombre de usuario dado ya existe
const doesExist = (username) => { 
  let userswithsamename = users.filter((user) => {
      return user.username === username;
  });
 
  return userswithsamename.length > 0;
}

// Ruta para registrar un nuevo usuario
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;
    console.log(req.body)
  if (username && password) {
    if (!doesExist(username)) {
      if (isValid(username)) {
        users.push({ username, password });
        return res.status(200).json({ message: "Usuario registrado exitosamente. Ahora puedes iniciar sesión" });
      } else {
        return res.status(404).json({ message: "¡Usuario no es válido!" });
      }
    } else {
      return res.status(404).json({ message: "¡El usuario ya existe!" });
    }
  }
  return res.status(404).json({ message: "No se pudo registrar el usuario." });
});

// Ruta para obtener la lista de libros disponibles en la tienda
public_users.get('/', function (req, res) {
  return res.status(200).send(JSON.stringify(books, null, 4));
});

// Ruta para obtener los detalles de un libro basado en el ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  console.log(isbn)
  if (books[isbn]) {
    return res.status(200).send(books[isbn]);
  } else {
    return res.status(404).json({ message: "Libro no encontrado" });
  }
});

// Ruta para obtener los detalles de los libros basados en el autor
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author;
  const filteredBooks = Object.values(books).filter(book => book.author === author);
  if (filteredBooks.length > 0) {
    return res.status(200).send(filteredBooks);
  } else {
    return res.status(404).json({ message: "Ningún libro encontrado de este autor" });
  }
});

// Ruta para obtener todos los libros basados en el título
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title;
  const filteredBooks = Object.values(books).filter(book => book.title === title);
  if (filteredBooks.length > 0) {
    return res.status(200).send(filteredBooks);
  } else {
    return res.status(404).json({ message: "Ningún libro encontrado con este título" });
  }
});

// Ruta para obtener la reseña de un libro
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  if (books[isbn]) {
    return res.status(200).send(books[isbn].reviews);
  } else {
    return res.status(404).json({ message: "No se encontraron reseñas para este libro" });
  }
});

// Ruta para obtener la lista de libros disponibles en la tienda (Task 10)
public_users.get('/async/', async function (req, res) {
  try {
      const response = await axios.get('http://localhost:5000/');
      return res.status(200).send(JSON.stringify(response.data, null, 4));
  } catch (error) {
      return res.status(500).json({ error: "Error al obtener la lista de libros" });
  }
});

// Ruta para obtener los detalles de un libro basado en el ISBN (Task 11)
public_users.get('/async/isbn/:isbn', async function (req, res) {
  const isbn = req.params.isbn;
  try {
      const response = await axios.get(`http://localhost:5000/isbn/${isbn}`);
      return res.status(200).send(JSON.stringify(response.data, null, 4));
  } catch (error) {
      return res.status(500).json({ error: `Error al obtener el libro con ISBN: ${isbn}` });
  }
});

// Ruta para obtener los detalles de los libros basados en el autor (Task 12)
public_users.get('/async/author/:author', async function (req, res) {
  const author = req.params.author;
  try {
      const response = await axios.get(`http://localhost:5000/author/${author}`);
      return res.status(200).send(JSON.stringify(response.data, null, 4));
  } catch (error) {
      return res.status(500).json({ error: `Error al obtener los libros del autor: ${author}` });
  }
});

// Ruta para obtener los detalles de los libros basados en el título (Task 13)
public_users.get('/async/title/:title', async function (req, res) {
  const title = req.params.title;
  try {
      const response = await axios.get(`http://localhost:5000/title/${title}`);
      return res.status(200).send(JSON.stringify(response.data, null, 4));
  } catch (error) {
      return res.status(500).json({ error: `Error al obtener los libros con el título: ${title}` });
  }
});

module.exports.general = public_users;
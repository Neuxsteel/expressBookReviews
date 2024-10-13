const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => { 
  // Verificar si el nombre de usuario es una cadena y no está vacío
  return typeof username === 'string' && username.trim() !== '';
}

// Verificar si el usuario con el nombre de usuario y contraseña dados existe
const authenticatedUser = (username, password) => {
  // Filtrar el array de usuarios para cualquier usuario con el mismo nombre de usuario y contraseña
  let validusers = users.filter((user) => {
      return (user.username === username && user.password === password);
  });
  // Retornar true si se encuentra algún usuario válido, de lo contrario false
  return validusers.length > 0;
}

// Solo los usuarios registrados pueden iniciar sesión
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  // Verificar si los campos están presentes
  if (!username || !password) {
    return res.status(400).json({ message: "Nombre de usuario y contraseña son requeridos" });
  }

  // Validar las credenciales
  if (authenticatedUser(username, password)) {
    // Crear un token JWT
    const accessToken = jwt.sign({ username }, 'access', { expiresIn: '1h' });

    // Guardar el token y el nombre de usuario en la sesión
    req.session.authorization = {
      accessToken, username
    };

    return res.status(200).json({ message: "Inicio de sesión exitoso" });
  } else {
    return res.status(401).json({ message: "Nombre de usuario o contraseña inválidos" });
  }
});

// Añadir una reseña de libro
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.body.review;
   console.log(body)
  // Verificar si el libro existe
  if (!books[isbn]) {
    return res.status(404).json({ message: "Libro no encontrado" });
  }

  // Verificar si el usuario está autenticado
  const username = req.session.authorization?.username;
  if (!username) {
    return res.status(401).json({ message: "Usuario no autenticado" });
  }

  // Si no existen reseñas, inicializar el objeto de reseñas
  if (!books[isbn].reviews) {
    books[isbn].reviews = {};
  }

  // Añadir o modificar la reseña del usuario
  books[isbn].reviews[username] = review;

  return res.status(200).json({ message: "Reseña añadida/modificada exitosamente" });
});

// Eliminar una reseña de libro
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;

  // Verificar si el libro existe
  if (!books[isbn]) {
    return res.status(404).json({ message: "Libro no encontrado" });
  }

  // Verificar si el usuario está autenticado
  const username = req.session.authorization?.username;
  if (!username) {
    return res.status(401).json({ message: "Usuario no autenticado" });
  }

  // Verificar si el usuario ha escrito una reseña
  if (!books[isbn].reviews || !books[isbn].reviews[username]) {
    return res.status(404).json({ message: "Reseña no encontrada" });
  }

  // Eliminar la reseña
  delete books[isbn].reviews[username];

  return res.status(200).json({ message: "Reseña eliminada exitosamente" });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
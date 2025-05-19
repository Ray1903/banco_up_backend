const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const db = require('../models');

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Email:", email);
    console.log("Password:", password);
 
    const usuario = await db.User.findOne({ where: { email } });
    if (!usuario) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

  
    const esValido = await bcrypt.compare(password, usuario.password);
    if (!esValido) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }


    const token = jwt.sign(
      { id: usuario.id, type: usuario.type },
      process.env.JWT_SECRET,
      { expiresIn: '2h' } 
    );

   
    res.json({ token });
  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
});

module.exports = router;

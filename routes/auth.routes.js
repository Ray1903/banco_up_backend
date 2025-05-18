const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const db = require('../models');

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const usuario = await db.user.findOne({ where: { email } });
  if (!usuario || !(await bcrypt.compare(password, usuario.password))) {
    return res.status(401).json({ message: "Credenciales inválidas" });
  }
  const token = jwt.sign({ id: usuario.id, tipo: usuario.tipo }, process.env.JWT_SECRET);
  res.json({ token });
});

module.exports = router;
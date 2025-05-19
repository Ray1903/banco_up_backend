const db = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// 🔐 Iniciar sesión
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const usuario = await db.User.findOne({ where: { email } });
    if (!usuario) return res.status(401).json({ message: "Usuario no encontrado" });

    if (usuario.bloqueado) return res.status(403).json({ message: "Usuario bloqueado" });

    const passwordValid = await bcrypt.compare(password, usuario.password);
    if (!passwordValid) return res.status(401).json({ message: "Contraseña incorrecta" });

    const token = jwt.sign(
      { id: usuario.id, tipo: usuario.type },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    res.json({ token });
  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
};

// 👤 Obtener perfil (datos del usuario)
exports.getProfile = async (req, res) => {
  try {
    const usuario = await db.User.findByPk(req.usuario.id, {
      attributes: ['id', 'email', 'type', 'failedAttempts']
    });

    if (!usuario) return res.status(404).json({ message: "Usuario no encontrado" });

    res.json(usuario);
  } catch (error) {
    console.error("Error al obtener perfil:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
};

// 💰 Ver saldo de cuenta
exports.getBalance = async (req, res) => {
  try {
    const account = await db.Account.findOne({ where: { userID: req.usuario.id } });
    if (!account) return res.status(404).json({ message: "Cuenta no encontrada" });

    res.json({ balance: account.balance });
  } catch (error) {
    console.error("Error al obtener balance:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
};

// 📜 Ver historial de transferencias
exports.getHistorial = async (req, res) => {
  try {
    const account = await db.Account.findOne({ where: { userID: req.usuario.id } });
    if (!account) return res.status(404).json({ message: "Cuenta no encontrada" });

    const transfers = await db.Transaction.findAll({
      where: {
        [db.Sequelize.Op.or]: [
          { senderID: account.id },
          { receiverID: account.id }
        ]
      },
      order: [['date', 'DESC']]
    });

    res.json(transfers);
  } catch (error) {
    console.error("Error al obtener historial:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
};

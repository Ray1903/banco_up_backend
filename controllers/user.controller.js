const db = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { INTEGER } = require('sequelize');


exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const usuario = await db.User.findOne({ where: { email } });
    if (!usuario) return res.status(401).json({ message: "Usuario no encontrado" });

    if (usuario.bloqueado) return res.status(403).json({ message: "Usuario bloqueado" });

    const passwordValid = await bcrypt.compare(password, usuario.password);
    if (!passwordValid) 
    {
      const nuevos_intentos = (usuario.failedAttempts || 0) + 1;
      const bloqueado = nuevos_intentos >= 3;

      await usuario.update({
        failedAttempts: nuevos_intentos,
        bloqueado
      });

      const msg = bloqueado ? "Usuario bloqueado por múltiples intentos fallidos" : "Contraseña incorrecta";
      const status = bloqueado ? 403:401
  
      return res.status(status).json({message:msg});
    };

    usuario.update({failedAttempts : 0});

    const token = jwt.sign(
      { id: usuario.id, tipo: usuario.type },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    res.json({ token:token,
      usuario:usuario.id,
      correo:usuario.email,   
     });

  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
};


exports.insertUser = async (req, res) => {
  try {
    const { email, password, type } = req.body;

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])[A-Za-z\d\W_]{8,10}$/;
    const normalizedEmail = email.toLowerCase()

    if(!passwordRegex.test(password)){
      return res.status(400).json(
        {
          message:"La contraseña debe de ser de 8 - 10 caracteres, e incluir mayúsculas, minúsculas, números y caracteres especiales."
        }
      );
    }
  
    const existingUser = await db.User.findOne({ where: {email:normalizedEmail } });

    if (existingUser) {
      return res.status(400).json({ message: 'El usuario ya existe' });
    }

 
    const hashedPassword = await bcrypt.hash(password, 10);

    
    const newUser = await db.User.create({
      email: normalizedEmail,
      password: hashedPassword,
      type,
      failedAttempts: 0
    });

    const { password: _, ...userSafe } = newUser.get({ plain: true });
    return res.status(201).json({ message: 'Usuario creado correctamente', user: userSafe })
  } catch (error) {
    console.error('Error al insertar usuario:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};



exports.getProfile = async (req, res) => {
  try {
    const {id} = req.body
    const usuario = await db.User.findOne({where:{id}});

    if (!usuario) return res.status(404).json({ message: "Usuario no encontrado" });

    res.json({id:usuario.id, email:usuario.email});
  } catch (error) {
    console.error("Error al obtener perfil:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
};


exports.getUsersByBlockedStatus = async (req, res) => {
  try {
    const { blocked } = req.query;

    const whereCondition = {};
    if (blocked !== undefined) {
      if (blocked !== '0' && blocked !== '1') {
        return res.status(400).json({ message: "Parámetro 'blocked' debe ser '0' o '1'." });
      }
      whereCondition.blocked = blocked === '1';
    }

    const usuarios = await db.User.findAll({
      where: whereCondition,
      attributes: ['id', 'email', 'blocked', 'failedAttempts', 'type'],
      include: [
        {
          model: db.Account,
          attributes: ['id', 'balance']
        }
      ]
    });

    res.json({ usuarios });
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
};


exports.unlockUser = async (req, res) => {
  try {
    const { id } = req.body;

    const usuario = await db.User.findByPk(id);
    if (!usuario) return res.status(404).json({ message: "Usuario no encontrado" });

    await usuario.update({ blocked: false, failedAttempts: 0 });

    res.status(200).json({ message: "Usuario desbloqueado exitosamente" });
  } catch (error) {
    console.error("Error al desbloquear usuario:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
};

exports.blockUser = async (req, res) => {
  try {
    const { id } = req.body;

    const usuario = await db.User.findByPk(id);
    if (!usuario) return res.status(404).json({ message: "Usuario no encontrado" });

    await usuario.update({ blocked: true, failedAttempts: 3 });

    res.json({ message: "Usuario bloqueado exitosamente." });
  } catch (error) {
    console.error("Error al bloquear usuario:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
};




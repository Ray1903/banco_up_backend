const db = require('../models');

exports.createAccount = async (req, res) => {
    try {
        const { userID } = req.body;

        const existing = await db.Account.findOne({ where: { userID } });
        if (existing) return res.status(400).json({ message: 'El usuario ya tiene una cuenta.' });

        const nueva = await db.Account.create({ userID });
        res.status(201).json({ message: 'Cuenta creada exitosamente', account: nueva });
    } catch (error) {
        console.error("Error al crear cuenta:", error);
        res.status(500).json({ message: "Error del servidor" });
    }
};

exports.activateAccount = async (req, res) => {
    try {
        const { accountID } = req.body;

        const cuenta = await db.Account.findByPk(accountID);
        if (!cuenta) return res.status(404).json({ message: "Cuenta no encontrada" });

        await cuenta.update({ active: true });
        res.json({ message: "Cuenta activada" });
    } catch (error) {
        console.error("Error al activar cuenta:", error);
        res.status(500).json({ message: "Error del servidor" });
    }
};

exports.deactivateAccount = async (req, res) => {
    try {
        const { accountID } = req.body;

        const cuenta = await db.Account.findByPk(accountID);
        if (!cuenta) return res.status(404).json({ message: "Cuenta no encontrada" });

        await cuenta.update({ active: false });
        res.json({ message: "Cuenta desactivada" });
    } catch (error) {
        console.error("Error al desactivar cuenta:", error);
        res.status(500).json({ message: "Error del servidor" });
    }
};

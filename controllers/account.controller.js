const db = require('../models');

/**
 * Creates a new account for a user if one does not already exist.
 * @route POST /account/create
 * @param {number} userID - ID of the user.
 * @returns {Object} Success or error message.
 */
exports.createAccount = async (req, res) => {
    try {
        const { userID } = req.body;

        const existing = await db.Account.findOne({ where: { userID } });
        if (existing) return res.status(400).json({ message: 'User already has an account.' });

        const nueva = await db.Account.create({ userID });
        res.status(201).json({ message: 'Account created successfully', account: nueva });
    } catch (error) {
        console.error("Error creating account:", error);
        res.status(500).json({ message: "Server error" });
    }
};

/**
 * Activates an existing account.
 * @route POST /account/activate
 * @param {number} accountID - ID of the account.
 * @returns {Object} Success or error message.
 */
exports.activateAccount = async (req, res) => {
    try {
        const { accountID } = req.body;

        const cuenta = await db.Account.findByPk(accountID);
        if (!cuenta) return res.status(404).json({ message: "Account not found" });

        await cuenta.update({ active: true });
        res.json({ message: "Account activated" });
    } catch (error) {
        console.error("Error activating account:", error);
        res.status(500).json({ message: "Server error" });
    }
};

/**
 * Deactivates an existing account.
 * @route POST /account/deactivate
 * @param {number} accountID - ID of the account.
 * @returns {Object} Success or error message.
 */
exports.deactivateAccount = async (req, res) => {
    try {
        const { accountID } = req.body;

        const cuenta = await db.Account.findByPk(accountID);
        if (!cuenta) return res.status(404).json({ message: "Account not found" });

        await cuenta.update({ active: false });
        res.json({ message: "Account deactivated" });
    } catch (error) {
        console.error("Error deactivating account:", error);
        res.status(500).json({ message: "Server error" });
    }
};

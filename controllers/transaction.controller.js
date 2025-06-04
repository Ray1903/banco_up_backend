const db = require('../models');
const { Op } = require('sequelize');

/**
 * Performs a transfer between two accounts with various validations.
 * @route POST /transaction
 * @param {number} senderId - Sender account ID.
 * @param {number} recipientAccountNumber - Recipient account ID.
 * @param {number} amount - Transfer amount.
 * @param {string} concept - Transfer concept.
 * @returns {Object} Success message with transaction details or error message.
 */
exports.transfer = async (req, res) => {
  try {
    const { senderId, recipientAccountNumber, amount, concept } = req.body;
    const parsedAmount = Number(amount);

    if (!recipientAccountNumber) {
      return res.status(400).json({ message: 'Recipient account not provided.' });
    }

    if (isNaN(parsedAmount)) {
      return res.status(400).json({ message: 'Amount must be a valid number.' });
    }

    if (parsedAmount < 500 || parsedAmount > 10000) {
      return res.status(400).json({ message: 'Amount out of allowed range ($500 - $10,000).' });
    }

    const sender = await db.Account.findOne({ where: { id: senderId } });
    const recipient = await db.Account.findOne({ where: { id: recipientAccountNumber, active: 1 } });

    if (!sender) {
      return res.status(404).json({ message: 'Sender account not found.' });
    }

    if (!recipient) {
      return res.status(404).json({ message: 'Recipient account not found or inactive.' });
    }

    if (sender.id === recipient.id) {
      return res.status(400).json({ message: 'Cannot transfer to your own account.' });
    }

    if (sender.balance < parsedAmount) {
      return res.status(400).json({ message: 'Insufficient funds.' });
    }

    const today = new Date().toISOString().slice(0, 10);

    const sentToday = await db.TotalSentPerDay.sum('amount', {
      where: { accountID: sender.id, date: today }
    }) || 0;

    const receivedToday = await db.TotalReceivedPerDay.sum('amount', {
      where: { accountID: recipient.id, date: today }
    }) || 0;

    if (sentToday + parsedAmount > 10000 || receivedToday + parsedAmount > 10000) {
      return res.status(400).json({ message: 'Daily limit exceeded for sending or receiving.' });
    }

    if (recipient.balance + parsedAmount > 50000) {
      return res.status(400).json({ message: 'Recipient would exceed the maximum allowed balance.' });
    }

    const now = new Date();
    const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000);

    await db.sequelize.transaction(async (t) => {
      sender.balance -= parsedAmount;
      recipient.balance += parsedAmount;
      await sender.save({ transaction: t });
      await recipient.save({ transaction: t });

      await db.Transaction.create({
        senderID: sender.id,
        receiverID: recipient.id,
        amount: parsedAmount,
        concept,
        status: 'completed',
        date: localDate
      }, { transaction: t });

      const [sentRecord] = await db.TotalSentPerDay.findOrCreate({
        where: { accountID: sender.id, date: today },
        defaults: { amount: 0 },
        transaction: t
      });
      sentRecord.amount += parsedAmount;
      await sentRecord.save({ transaction: t });

      const [receivedRecord] = await db.TotalReceivedPerDay.findOrCreate({
        where: { accountID: recipient.id, date: today },
        defaults: { amount: 0 },
        transaction: t
      });
      receivedRecord.amount += parsedAmount;
      await receivedRecord.save({ transaction: t });
    });

    return res.status(200).json({
      message: 'Transfer completed successfully.',
      accountNumber: recipient.id,
      amount: parsedAmount,
      date: localDate.toISOString()
    });

  } catch (error) {
    console.error('Error during transfer:', error);
    return res.status(500).json({ message: 'Server error during transfer.' });
  }
};

/**
 * Retrieves all transactions associated with a specific account.
 * @route GET /transaction/account/:accountId
 * @param {number} accountId - ID of the account.
 * @returns {Array} List of transactions.
 */
exports.getTransactionsByAccount = async (req, res) => {
  try {
    const { accountId } = req.params;

    const transactions = await db.Transaction.findAll({
      where: {
        [Op.or]: [
          { senderID: accountId },
          { receiverID: accountId }
        ]
      },
      order: [['date', 'DESC']]
    });

    return res.status(200).json(transactions);
  } catch (error) {
    console.error('Error retrieving transactions:', error);
    return res.status(500).json({ message: 'Server error retrieving transactions.' });
  }
};
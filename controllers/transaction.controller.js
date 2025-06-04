const db = require('../models');
const { Op } = require('sequelize');

exports.transfer = async (req, res) => {
  try {
    const { senderId, recipientAccountNumber, amount, concept } = req.body;
    const parsedAmount = Number(amount);

    if (!recipientAccountNumber) {
      return res.status(400).json({ message: 'Cuenta destino no proporcionada.' });
    }

    if (isNaN(parsedAmount)) {
      return res.status(400).json({ message: 'El monto debe ser un número válido.' });
    }

    if (parsedAmount < 500 || parsedAmount > 10000) {
      return res.status(400).json({ message: 'Monto fuera de límites ($500 - $10,000).' });
    }

    const sender = await db.Account.findOne({ where: { id: senderId } });
    const recipient = await db.Account.findOne({ where: { id: recipientAccountNumber, active: 1 } });

    if (!sender) {
      return res.status(404).json({ message: 'Cuenta del emisor no encontrada.' });
    }

    if (!recipient) {
      return res.status(404).json({ message: 'Cuenta destino no encontrada o está inactiva.' });
    }

    if (sender.id === recipient.id) {
      return res.status(400).json({ message: 'No puedes transferirte a tu propia cuenta.' });
    }

    if (sender.balance < parsedAmount) {
      return res.status(400).json({ message: 'Fondos insuficientes.' });
    }

    const today = new Date().toISOString().slice(0, 10);

    const sentToday = await db.TotalSentPerDay.sum('amount', {
      where: { accountID: sender.id, date: today }
    }) || 0;

    const receivedToday = await db.TotalReceivedPerDay.sum('amount', {
      where: { accountID: recipient.id, date: today }
    }) || 0;

    if (sentToday + parsedAmount > 10000 || receivedToday + parsedAmount > 10000) {
      return res.status(400).json({ message: 'Límite diario excedido para el envío o recepción.' });
    }

    if (recipient.balance + parsedAmount > 50000) {
      return res.status(400).json({ message: 'El receptor excedería el saldo máximo permitido.' });
    }

    const now = new Date();
    const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000);

    await db.sequelize.transaction(async (t) => {
      // Actualizar balances
      sender.balance -= parsedAmount;
      recipient.balance += parsedAmount;
      await sender.save({ transaction: t });
      await recipient.save({ transaction: t });

      // Registrar la transacción
      await db.Transaction.create({
        senderID: sender.id,
        receiverID: recipient.id,
        amount: parsedAmount,
        concept,
        status: 'completed',
        date: localDate
      }, { transaction: t });

      // Actualizar TotalSentPerDay
      const [sentRecord] = await db.TotalSentPerDay.findOrCreate({
        where: { accountID: sender.id, date: today },
        defaults: { amount: 0 },
        transaction: t
      });
      sentRecord.amount += parsedAmount;
      await sentRecord.save({ transaction: t });

      // Actualizar TotalReceivedPerDay
      const [receivedRecord] = await db.TotalReceivedPerDay.findOrCreate({
        where: { accountID: recipient.id, date: today },
        defaults: { amount: 0 },
        transaction: t
      });
      receivedRecord.amount += parsedAmount;
      await receivedRecord.save({ transaction: t });
    });

    return res.status(200).json({
      message: 'Transferencia completada con éxito.',
      accountNumber: recipient.id,
      amount: parsedAmount,
      date: localDate.toISOString()
    });

  } catch (error) {
    console.error('Error al realizar la transferencia:', error);
    return res.status(500).json({ message: 'Error en el servidor al realizar la transferencia.' });
  }
};


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
    console.error('Error al obtener transacciones:', error);
    return res.status(500).json({ message: 'Error del servidor al obtener transacciones.' });
  }
};

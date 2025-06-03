const db = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { INTEGER } = require('sequelize');
const { Op } = require('sequelize');

exports.transfer = async (req, res) => {
  try {
    const { senderId, recipientAccountNumber, amount,concept } = req.body;
    
    if (!recipientAccountNumber || !amount || amount < 500 || amount > 10000) {
      return res.status(400).json({ message: 'Datos inválidos o monto fuera de límites ($500 - $10,000).' });
    }

    
    const sender = await db.Account.findOne({ where: { userID: senderId } });
    const recipient = await db.Account.findOne({ where: { id: recipientAccountNumber } });
    
    if (!sender || !recipient) {
      return res.status(404).json({ message: 'Cuenta no encontrada.' });
    }

    if (sender.id === recipient.id) {
      return res.status(400).json({ message: 'No puedes transferirte a tu propia cuenta.' });
    }

    if (sender.balance < amount) {
      return res.status(400).json({ message: 'Fondos insuficientes.' });
    }

   
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const sentToday = await db.TotalSentPerDay.sum('amount', {
  where: {
    accountID: sender.id,
    date: new Date().toISOString().slice(0, 10)  
  }
}) || 0;

const receivedToday = await db.TotalSentPerDay.sum('amount', {
  where: {
    accountID: recipient.id,
    date: new Date().toISOString().slice(0, 10)
  }
}) || 0;


    if (sentToday + amount > 10000 || receivedToday + amount > 10000) {
      return res.status(400).json({ message: 'Límite diario excedido para el envío o recepción.' });
    }
   
    if (recipient.balance + amount > 50000) {
      
      
      return res.status(400).json({ message: 'El receptor excedería el saldo máximo permitido.' });
    }

    
    await db.sequelize.transaction(async (t) => {
      sender.balance -= amount;
      recipient.balance += amount;

      await sender.save({ transaction: t });
      await recipient.save({ transaction: t });
      const now = new Date();
      const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000); 

      await db.Transaction.create({
        senderID: sender.id,
        receiverID: recipient.id,
        amount,
        concept,
        status: 'completed',
        date: localDate
      }, { transaction: t });
    });

    return res.status(200).json({ message: 'Transferencia completada con éxito.' });
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

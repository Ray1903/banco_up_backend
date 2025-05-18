const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const authRoutes = require('./routes/auth.routes');
const transferRoutes = require('./routes/transfer.routes');
const adminRoutes = require('./routes/admin.routes');
const db = require('./models');

const app = express();
app.use(cors());
app.use(express.json());

db.sequelize.sync();

app.use('/api/auth', authRoutes);
app.use('/api/transferencias', transferRoutes);
app.use('/api/admin', adminRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
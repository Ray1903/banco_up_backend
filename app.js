const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const db = require('./models');
const routes = require('./routes/routes');

const app = express();
app.use(cors());
app.use(express.json());

db.sequelize.sync();

app.use('', routes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});

const Sequelize = require("sequelize");
const dbConfig = require("../config/db.config.js");

const sequelize = new Sequelize(
  dbConfig.DB,
  dbConfig.USER,
  dbConfig.PASSWORD,
  {
    host: dbConfig.HOST,
    dialect: dbConfig.dialect,
  }
);

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Importar modelos
db.User = require("./user.model")(sequelize, Sequelize);
db.Account = require("./account.model")(sequelize, Sequelize);
db.Transaction = require("./transaction.model")(sequelize, Sequelize);
db.TotalSentPerDay = require("./totalSentPerDay.model")(sequelize, Sequelize);
db.TotalReceivedPerDay = require("./totalReceivedPerDay.model")(sequelize, Sequelize);

// Relaciones

// Un usuario tiene una cuenta
db.User.hasOne(db.Account, { foreignKey: "userID", onDelete: 'CASCADE', as: 'account' });
db.Account.belongsTo(db.User, { foreignKey: "userID", as: 'user' });

// Una cuenta puede enviar muchas transferencias
db.Account.hasMany(db.Transaction, { foreignKey: "senderID", as: "enviadas" });
db.Account.hasMany(db.Transaction, { foreignKey: "receiverID", as: "recibidas" });

// Cada transferencia pertenece a una cuenta remitente y una destinataria
db.Transaction.belongsTo(db.Account, { foreignKey: "senderID", as: "remitente" });
db.Transaction.belongsTo(db.Account, { foreignKey: "receiverID", as: "destinatario" });

// Relación de totales por día
db.Account.hasMany(db.TotalSentPerDay, { foreignKey: "accountID" });
db.TotalSentPerDay.belongsTo(db.Account, { foreignKey: "accountID" });

db.Account.hasMany(db.TotalReceivedPerDay, { foreignKey: "accountID" });
db.TotalReceivedPerDay.belongsTo(db.Account, { foreignKey: "accountID" });

module.exports = db;

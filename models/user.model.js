module.exports = (sequelize, DataTypes) => {
  return sequelize.define("user", {
    email: { type: DataTypes.STRING, unique: true },
    password: DataTypes.STRING,
    tipo: { type: DataTypes.ENUM("normal", "admin"), defaultValue: "normal" },
    bloqueado: { type: DataTypes.BOOLEAN, defaultValue: false },
    saldo: { type: DataTypes.FLOAT, defaultValue: 0 },
    cuenta: { type: DataTypes.STRING(5), unique: true }
  });
};
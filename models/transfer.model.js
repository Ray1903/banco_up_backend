module.exports = (sequelize, DataTypes) => {
  return sequelize.define("transfer", {
    remitenteId: DataTypes.INTEGER,
    destinatarioId: DataTypes.INTEGER,
    monto: DataTypes.FLOAT,
    concepto: DataTypes.STRING,
    fecha: DataTypes.DATE
  });
};
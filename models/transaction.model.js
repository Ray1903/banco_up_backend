module.exports = (sequelize, DataTypes) => {
  return sequelize.define('transaction', {
    amount: { type: DataTypes.FLOAT, allowNull: false },
    status: { type: DataTypes.STRING },
    type: { type: DataTypes.BOOLEAN },
    observations: { type: DataTypes.STRING },
    date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    concept: { type: DataTypes.STRING }
  }, { createdAt: false, updatedAt: false, freezeTableName: true});
};
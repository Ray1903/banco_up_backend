module.exports = (sequelize, DataTypes) => {
  return sequelize.define('account', {
    balance: { type: DataTypes.FLOAT, defaultValue: 0 },
    active: { type: DataTypes.BOOLEAN, defaultValue: true }
  },{ createdAt: false, updatedAt: false });
};
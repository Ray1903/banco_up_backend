module.exports = (sequelize, DataTypes) => {
  return sequelize.define('account', {
    balance: { type: DataTypes.FLOAT, defaultValue: 0 },
    active: { type: DataTypes.INTEGER, defaultValue: 1 }
  },{ createdAt: false, updatedAt: false, freezeTableName: true});
};
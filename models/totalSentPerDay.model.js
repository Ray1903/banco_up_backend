module.exports = (sequelize, DataTypes) => {
  return sequelize.define('totalSentPerDay', {
    date: { type: DataTypes.DATEONLY },
    amount: { type: DataTypes.FLOAT },
  
  },
  {
    freezeTableName: true,
  });
};
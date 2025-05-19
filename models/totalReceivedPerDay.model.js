module.exports = (sequelize, DataTypes) => {
  return sequelize.define('totalReceivedPerDay', {
    date: { type: DataTypes.DATEONLY },
    amount: { type: DataTypes.FLOAT }
  }, 
{
    freezeTableName: true,
});
};
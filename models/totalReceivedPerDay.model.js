module.exports = (sequelize, DataTypes) => {
  const TotalReceivedPerDay = sequelize.define('TotalReceivedPerDay', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    accountID: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    amount: {
      type: DataTypes.FLOAT,
      allowNull: true
    }
  }, {
    tableName: 'totalreceivedperday',
    timestamps: false
  });

  return TotalReceivedPerDay;
};

module.exports = (sequelize, DataTypes) => {
  const TotalSentPerDay = sequelize.define('TotalSentPerDay', {
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
    tableName: 'totalsentperday',
    timestamps: false 
  });

  return TotalSentPerDay;
};

module.exports = (sequelize, DataTypes) => {
  return sequelize.define('user', {
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    type: { type: DataTypes.STRING, allowNull: false },
    failedAttempts: { type: DataTypes.INTEGER, defaultValue: 0 }
  },{ createdAt: false, updatedAt: false });
};
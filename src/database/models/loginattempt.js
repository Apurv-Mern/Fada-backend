'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class LoginAttempt extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  LoginAttempt.init({
    email: DataTypes.STRING,
    ipAddress: DataTypes.STRING,
    userAgent: DataTypes.STRING,
    success: DataTypes.BOOLEAN,
    message: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'LoginAttempt',
  });
  return LoginAttempt;
};
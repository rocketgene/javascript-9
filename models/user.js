'use strict';
const Sequelize = require('sequelize');
const bcrypt = require('bcrypt');

module.exports = (sequelize) => {
  class User extends Sequelize.Model {}
  User.init({
    firstName: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'first name is null. Please enter first name'
        },
        notEmpty: {
          msg: 'first name is empty. Please enter first name'
        }
      }
    },
    lastName: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'last name is null. Please enter last name'
        },
        notEmpty: {
          msg: 'last name is empty. Please enter last name'
        }
      }
    },
    emailAddress: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: {
        msg: 'This email already exists'
      },
      validate: {
        isEmail: {
          msg: 'please enter a valid email',
        },
        notNull: {
          msg: 'email is null. Please enter email'
        },
        notEmpty: {
          msg: 'email is empty. Please enter email'
        }
      }
    },
    password: {
      type: Sequelize.STRING,
      allowNull: false,
      set(val) {
        const hashedPassword = bcrypt.hashSync(val, 10);
        this.setDataValue('password', hashedPassword);
      },
      validate: {
        notNull: {
          msg: 'password is null. Please enter password'
        },
        notEmpty: {
          msg: 'password is empty. Please enter password'
        }
      }
    },
  }, { sequelize });

  User.associate = (models) => {
    User.hasMany(models.Course, {
      as: 'user',
      foreignKey: {
        fieldName: 'userId',
        allowNull: false,
      },
    });
  };

  return User;
};
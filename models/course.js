'use strict';
const Sequelize = require('sequelize');

module.exports = (sequelize) => {
  class Course extends Sequelize.Model {}
  Course.init({
    title: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          notNull: {
            msg: 'title is null. Please enter title'
          },
          notEmpty: {
            msg: 'title is empty. Please enter title'
          }
        }
    },
    description: {
        type: Sequelize.TEXT,
        allowNull: false,
        validate: {
          notNull: {
            msg: 'description is null. Please enter description'
          },
          notEmpty: {
            msg: 'description is empty. Please enter description'
          }
        }
    },
    estimatedTime: {
        type: Sequelize.STRING,
    },
    materialsNeeded: {
        type: Sequelize.STRING,
    },
  }, { sequelize });

  Course.associate = (models) => {
    Course.belongsTo(models.User, {
      as: 'user',
      foreignKey: {
        fieldName: 'userId',
      },
    });
  };

  return Course;
};

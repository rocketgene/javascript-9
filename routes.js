'use strict';

const express = require('express');
const { asyncHandler } = require('./middleware/async_handler');
const { User, Course } = require('./models');
const { authenticateUser } = require('./middleware/auth-user');
const course = require('./models/course');

// Construct a router instance.
const router = express.Router();

// GET user
router.get('/users', authenticateUser, asyncHandler(async (req, res) => {
  const user = req.currentUser;

  res.json({
    firstName: user.firstName,
    lastName: user.lastName,
    emailAddress: user.emailAddress
  });
}));

// POST create new user
router.post('/users', asyncHandler(async (req, res) => {
    try {
      await User.create(req.body);
      res.setHeader('Location', '/');
      res.status(201).json({ "message": "Account successfully created!" });
    } catch (error) {
      if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
        const errors = error.errors.map(err => err.message);
        res.status(400).json({ errors });   
      } else {
        throw error;
      }
    }
}));

// GET course list
router.get('/courses', asyncHandler(async (req, res) => {
    const courses = await Course.findAll({
      attributes: ['id', 'title', 'description', 'estimatedTime', 'materialsNeeded'],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'emailAddress']
        }],
    });
    res.status(200).json( courses );
}));

// GET a specific course
router.get('/courses/:id', asyncHandler(async (req, res) => {
    const course = await Course.findByPk(req.params.id, {
        attributes: ['id', 'title', 'description', 'estimatedTime', 'materialsNeeded'],
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'firstName', 'lastName', 'emailAddress']
          }],
    });
    res.status(200).json(course);
}));

// POST create new course
router.post('/courses', authenticateUser, asyncHandler(async (req, res) => {
    try {
      await Course.create({
          title: req.body.title,
          description: req.body.description,
          userId: req.body.userId
      });
      const newCourse = await Course.findOne({ where: {title: req.body.title} });
      res.setHeader('Location', '/courses/' + newCourse.id);
      res.status(201).end();
    } catch (error) {
      if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
        const errors = error.errors.map(err => err.message);
        res.status(400).json({ errors });   
      } else {
        next(error);
      }
    }
}));

// PUT update existing course
router.put('/courses/:id', authenticateUser, asyncHandler(async (req, res) => {
  let course;
  try {
    const user = req.currentUser;
    course = await Course.findByPk(req.params.id);

    // verify user = owner of the course
    if (req.currentUser.dataValues.id === course.dataValues.userId) {
      await course.update({
        title: req.body.title,
        description: req.body.description,
        userId: req.body.userId
      });
      res.status(204).end();
    } else {
      res.status(403).json( {
        message: 'authorization failed'
      })
    }
  } catch (error) {
    if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
      const errors = error.errors.map(err => err.message);
      res.status(400).json({ errors });   
    } else {
      next(error);
    }
  }
}));

// DELETE course
router.delete('/courses/:id', authenticateUser, asyncHandler(async (req, res) => {
  const course = await Course.findByPk(req.params.id);

  // verify user = owner of the course
  if (req.currentUser.dataValues.id === course.dataValues.userId) {
    await course.destroy();
    res.status(204).end();
  } else {
    res.status(403).json( {
      message: 'authorization failed'
    })
  }
}));


module.exports = router;

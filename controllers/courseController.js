const { validationResult } = require("express-validator");
const Course = require("../models/Course");

exports.createCourse = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ message: "Validation failed", errors: errors.array() });

    const course = await Course.create(req.body);
    return res.status(201).json(course);
  } catch (err) {
    return next(err);
  }
};

exports.listCourses = async (req, res, next) => {
  try {
    const { parentId } = req.query;
    const filter = parentId ? { parentId } : { parentId: null };
    const courses = await Course.find(filter).sort({ order: 1, createdAt: -1 });
    return res.json(courses);
  } catch (err) {
    return next(err);
  }
};

exports.getCourseById = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });
    return res.json(course);
  } catch (err) {
    return next(err);
  }
};


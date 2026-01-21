const { validationResult } = require("express-validator");
const Section = require("../models/Section");
const Course = require("../models/Course");

exports.createSection = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ message: "Validation failed", errors: errors.array() });

    const { courseId, title, order } = req.body;

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    const section = await Section.create({ courseId, title, order: order ?? 0 });
    return res.status(201).json(section);
  } catch (err) {
    return next(err);
  }
};

exports.listByCourse = async (req, res, next) => {
  try {
    const sections = await Section.find({ courseId: req.params.courseId }).sort({ order: 1, createdAt: 1 });
    return res.json(sections);
  } catch (err) {
    return next(err);
  }
};


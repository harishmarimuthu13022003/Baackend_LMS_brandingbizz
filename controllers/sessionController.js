const { validationResult } = require("express-validator");
const Session = require("../models/Session");
const Section = require("../models/Section");

exports.createSession = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ message: "Validation failed", errors: errors.array() });

    const { sectionId, title, studyMaterialUrl, pptUrl, videoUrl, duration } = req.body;

    const section = await Section.findById(sectionId);
    if (!section) return res.status(404).json({ message: "Section not found" });

    const session = await Session.create({
      sectionId,
      title,
      studyMaterialUrl: studyMaterialUrl || "",
      pptUrl: pptUrl || "",
      videoUrl: videoUrl || "",
      duration: duration || "",
    });

    return res.status(201).json(session);
  } catch (err) {
    return next(err);
  }
};

exports.listBySection = async (req, res, next) => {
  try {
    const sessions = await Session.find({ sectionId: req.params.sectionId }).sort({ createdAt: 1 });
    return res.json(sessions);
  } catch (err) {
    return next(err);
  }
};

exports.getSessionById = async (req, res, next) => {
  try {
    const session = await Session.findById(req.params.id).populate({
      path: "sectionId",
      populate: {
        path: "courseId",
        model: "Course",
      },
    });
    if (!session) return res.status(404).json({ message: "Session not found" });
    return res.json(session);
  } catch (err) {
    return next(err);
  }
};


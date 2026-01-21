const express = require("express");
const { body } = require("express-validator");
const { authRequired, adminOnly } = require("../middleware/auth");
const { createSection, listByCourse } = require("../controllers/sectionController");

const router = express.Router();

router.get("/by-course/:courseId", authRequired, listByCourse);

router.post(
  "/",
  authRequired,
  adminOnly,
  [
    body("courseId").notEmpty().withMessage("courseId is required"),
    body("title").trim().notEmpty().withMessage("title is required"),
    body("order").optional().isNumeric(),
  ],
  createSection
);

module.exports = router;


const express = require("express");
const { body } = require("express-validator");
const { authRequired, adminOnly } = require("../middleware/auth");
const {
  createSession,
  listBySection,
  getSessionById,
} = require("../controllers/sessionController");

const router = express.Router();

router.get("/by-section/:sectionId", authRequired, listBySection);
router.get("/:id", authRequired, getSessionById);

router.post(
  "/",
  authRequired,
  adminOnly,
  [
    body("sectionId").notEmpty().withMessage("sectionId is required"),
    body("title").trim().notEmpty().withMessage("title is required"),
    body("studyMaterialUrl").optional().isString(),
    body("pptUrl").optional().isString(),
    body("videoUrl").optional().isString(),
    body("duration").optional().isString(),
  ],
  createSession
);

module.exports = router;


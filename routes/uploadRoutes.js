const express = require("express");
const { authRequired, adminOnly } = require("../middleware/auth");
const { makeUploader } = require("../config/upload");
const { uploadSingle } = require("../controllers/uploadController");

const router = express.Router();

// Thumbnail images for courses (stored as image resource type)
const thumbnailUpload = makeUploader({
  folder: "thumbnails",
  resourceType: "image",
  allowedMimes: ["image/jpeg", "image/jpg", "image/png", "image/webp"],
  maxSizeMb: 5,
});

// PDFs (study material) - stored as raw resource type
const pdfUpload = makeUploader({
  folder: "materials",
  resourceType: "raw",
  allowedMimes: ["application/pdf"],
  maxSizeMb: 25,
});

// PPT/PPTX (classroom slides) - stored as raw resource type
const pptUpload = makeUploader({
  folder: "ppts",
  resourceType: "raw",
  allowedMimes: [
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "application/octet-stream",
  ],
  allowedExts: ["ppt", "pptx"],
  maxSizeMb: 50,
});

// Videos - stored as video resource type
const videoUpload = makeUploader({
  folder: "videos",
  resourceType: "video",
  allowedMimes: ["video/mp4", "video/webm", "video/quicktime", "video/x-msvideo"],
  allowedExts: ["mp4", "webm", "mov", "avi", "m4v"],
  maxSizeMb: 200,
});

router.post("/thumbnail", authRequired, adminOnly, thumbnailUpload, uploadSingle);
router.post("/pdf", authRequired, adminOnly, pdfUpload, uploadSingle);
router.post("/ppt", authRequired, adminOnly, pptUpload, uploadSingle);
router.post("/video", authRequired, adminOnly, videoUpload, uploadSingle);

module.exports = router;


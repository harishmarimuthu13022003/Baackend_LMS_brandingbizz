const express = require("express");
const { authRequired, adminOnly } = require("../middleware/auth");
const { makeUploader } = require("../config/upload");
const { uploadSingle, getUploadConfig } = require("../controllers/uploadController");

const router = express.Router();

// Get GCS upload configuration
router.post("/config", authRequired, adminOnly, getUploadConfig);

// Thumbnail images for courses
const thumbnailUpload = makeUploader({
  folder: "thumbnails",
  allowedMimes: ["image/jpeg", "image/jpg", "image/png", "image/webp"],
  maxSizeMb: 5,
});

// PDFs (study material)
const pdfUpload = makeUploader({
  folder: "materials",
  allowedMimes: ["application/pdf"],
  maxSizeMb: 25,
});

// PPT/PPTX (classroom slides)
const pptUpload = makeUploader({
  folder: "ppts",
  allowedMimes: [
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "application/octet-stream",
  ],
  allowedExts: ["ppt", "pptx"],
  maxSizeMb: 50,
});

// Videos
const videoUpload = makeUploader({
  folder: "videos",
  allowedMimes: ["video/mp4", "video/webm", "video/quicktime", "video/x-msvideo"],
  allowedExts: ["mp4", "webm", "mov", "avi", "m4v"],
  maxSizeMb: 1000, // Increased for large video files
});

router.post("/thumbnail", authRequired, adminOnly, thumbnailUpload, uploadSingle);
router.post("/pdf", authRequired, adminOnly, pdfUpload, uploadSingle);
router.post("/ppt", authRequired, adminOnly, pptUpload, uploadSingle);
router.post("/video", authRequired, adminOnly, videoUpload, uploadSingle);

module.exports = router;


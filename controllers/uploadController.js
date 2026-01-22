const { generateFilePath, getPublicUrl } = require("../config/gcs");

/**
 * Get GCS upload configuration (for direct browser uploads if needed)
 * POST /api/uploads/config
 * Body: { resourceType: "video"|"raw"|"image", courseTitle?: string, sessionTitle?: string }
 */
exports.getUploadConfig = async (req, res, next) => {
  try {
    const { resourceType = "video", courseTitle, sessionTitle, contentType = "videos" } = req.body;

    const { GCS_BUCKET_NAME, GCS_PROJECT_ID } = process.env;

    if (!GCS_BUCKET_NAME || !GCS_PROJECT_ID) {
      return res.status(400).json({
        message: "GCS not configured. Please set GCS_BUCKET_NAME and GCS_PROJECT_ID in .env file.",
        error: "MISSING_GCS_CONFIG",
      });
    }

    // Generate folder path if course/session info provided
    let folder = undefined;
    if (courseTitle && sessionTitle) {
      const sanitize = (str) => str.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
      const courseSlug = sanitize(courseTitle || "general");
      const sessionSlug = sanitize(sessionTitle || "session");
      folder = `lms/${contentType}/${courseSlug}/${sessionSlug}`;
    }

    return res.json({
      bucketName: GCS_BUCKET_NAME,
      projectId: GCS_PROJECT_ID,
      resourceType,
      folder: folder || `lms/${contentType}`,
      // Note: For direct browser uploads, you'd need to generate signed URLs
      // For now, we'll use backend uploads
      uploadEndpoint: "/api/uploads/upload", // Backend upload endpoint
    });
  } catch (err) {
    return next(err);
  }
};

/**
 * Handle single file upload (already uploaded to GCS by multer middleware)
 * The file is already in GCS at this point, we just return the URL
 */
exports.uploadSingle = async (req, res, next) => {
  try {
    console.log("[Upload Controller] File received:", req.file ? "Yes" : "No");

    if (!req.file) {
      return res.status(400).json({
        message: "No file uploaded. Please select a file and try again.",
      });
    }

    console.log("[Upload Controller] File details:", {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path,
      filename: req.file.filename,
    });

    // File is already uploaded to GCS by multer middleware
    const url = req.file.path || req.file.url;
    const publicId = req.file.filename || req.file.publicId;
    const originalName = req.file.originalname;
    const resourceType = req.file.mimetype?.split("/")[0] || "file"; // 'image', 'video', 'application'

    if (!url) {
      console.error("[Upload Controller] GCS upload response missing URL:", JSON.stringify(req.file, null, 2));
      return res.status(500).json({
        message: "Failed to get file URL from GCS. Please check server logs.",
      });
    }

    console.log("[Upload Controller] Upload successful:", url);

    return res.status(201).json({
      url,
      publicId,
      originalName,
      resourceType,
      size: req.file.size,
    });
  } catch (err) {
    console.error("[Upload Controller] Error:", err.message);
    console.error("[Upload Controller] Stack:", err.stack);
    return next(err);
  }
};

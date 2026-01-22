const multer = require("multer");
const { uploadFile, generateFilePath } = require("./gcs");

// Memory storage - files will be stored in memory as Buffer
const memoryStorage = multer.memoryStorage();

/**
 * Create a multer uploader middleware for GCS
 * @param {Object} options - Upload options
 * @param {string} options.folder - Folder name (thumbnails, videos, materials, ppts)
 * @param {string[]} options.allowedMimes - Allowed MIME types
 * @param {string[]} options.allowedExts - Allowed file extensions (fallback)
 * @param {number} options.maxSizeMb - Maximum file size in MB
 */
function makeUploader({ folder, allowedMimes, allowedExts, maxSizeMb }) {
  const maxSize = (maxSizeMb || 50) * 1024 * 1024; // Convert MB to bytes

  const uploader = multer({
    storage: memoryStorage, // Store in memory, then upload to GCS
    limits: { fileSize: maxSize },
    fileFilter: (req, file, cb) => {
      console.log(`[Upload] File received: ${file.originalname}, type: ${file.mimetype}, size: ${file.size}`);
      
      const mimeOk = !allowedMimes || allowedMimes.includes(file.mimetype);
      
      if (!mimeOk) {
        // Windows browsers sometimes send application/octet-stream for various file types
        // Allow by extension as a fallback when configured
        const name = (file.originalname || "").toLowerCase();
        const ext = name.includes(".") ? name.slice(name.lastIndexOf(".") + 1) : "";
        const extOk = Array.isArray(allowedExts) && allowedExts.includes(ext);
        
        if (!extOk) {
          return cb(
            new Error(
              `Invalid file type: ${file.mimetype}. Allowed mimes: ${allowedMimes?.join(", ") || "any"}${
                allowedExts?.length ? `. Allowed extensions: .${allowedExts.join(", .")}` : ""
              }`
            )
          );
        }
      }
      
      return cb(null, true);
    },
  });

  return (req, res, next) => {
    // Use multer to parse the file into memory
    uploader.single("file")(req, res, async (err) => {
      if (err) {
        console.error(`[Upload] Multer error:`, err.message);
        
        // Handle file size errors
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({
            message: `File too large. Maximum size: ${maxSizeMb}MB`,
          });
        }
        
        return next(err);
      }

      // If no file, continue (some routes might not require files)
      if (!req.file) {
        return next();
      }

      // Upload to GCS
      try {
        // Get course/session info from body (form-data)
        const courseTitle = req.body.courseTitle;
        const sessionTitle = req.body.sessionTitle;
        const uniqueId = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const sanitizedName = req.file.originalname.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9._-]/g, "");
        const filename = `${uniqueId}-${sanitizedName}`;

        // Generate file path
        let filePath;
        if (courseTitle && sessionTitle) {
          filePath = generateFilePath(courseTitle, sessionTitle, folder, filename);
        } else {
          filePath = `lms/${folder}/${filename}`;
        }

        console.log(`[Upload] Uploading to GCS: ${filePath}`);

        // Upload to GCS
        const result = await uploadFile(
          req.file.buffer,
          filePath,
          req.file.mimetype,
          {
            originalName: req.file.originalname,
            uploadedBy: req.user?.email || "unknown",
          }
        );

        // Attach GCS result to req.file for compatibility
        req.file.path = result.url;
        req.file.filename = result.path;
        req.file.publicId = result.publicId;
        req.file.url = result.url;

        console.log(`[Upload] GCS upload successful: ${result.url}`);
        next();
      } catch (gcsError) {
        console.error(`[Upload] GCS upload error:`, gcsError.message);
        return res.status(500).json({
          message: `Failed to upload file to Google Cloud Storage: ${gcsError.message}`,
        });
      }
    });
  };
}

module.exports = { makeUploader };

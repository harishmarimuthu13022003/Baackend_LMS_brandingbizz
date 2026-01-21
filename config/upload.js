const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const { requireCloudinary } = require("./cloudinary");

function getCloudinaryStorage(folder, resourceType) {
  try {
    const cloudinary = requireCloudinary();
    return new CloudinaryStorage({
      cloudinary,
      params: (req, file) => {
        // Generate unique filename
        const uniqueId = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const sanitizedName = file.originalname.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9._-]/g, "");
        // IMPORTANT:
        // When `folder` is provided, `public_id` should NOT include the folder prefix.
        // Otherwise Cloudinary can end up with duplicated folder paths.
        const publicId = `${uniqueId}-${sanitizedName}`;

        const params = {
          folder: `lms/${folder}`,
          resource_type: resourceType,
          public_id: publicId,
        };

        // Note: For images, we don't set format/quality in upload params.
        // Cloudinary preserves the original format. Use URL transformations
        // (e.g., ?f_auto,q_auto) when serving images if needed.

        // For videos, we can optionally specify format, but Cloudinary
        // will handle conversion automatically based on the file type.
        // Removing format specification to avoid conflicts.

        return params;
      },
    });
  } catch (err) {
    throw new Error(
      `Cloudinary configuration error: ${err.message}. Please check your CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in .env file.`
    );
  }
}

function makeUploader({ folder, resourceType, allowedMimes, allowedExts, maxSizeMb }) {
  // Lazily create the multer instance so missing Cloudinary env doesn't crash at import-time
  let uploader = null;

  const maxSize = (maxSizeMb || 50) * 1024 * 1024;

  return (req, res, next) => {
    try {
      if (!uploader) {
        console.log(`[Upload] Creating uploader for ${folder} (${resourceType})`);
        const storage = getCloudinaryStorage(folder, resourceType);
        uploader = multer({
          storage,
          limits: { fileSize: maxSize },
          fileFilter: (req, file, cb) => {
            console.log(`[Upload] File received: ${file.originalname}, type: ${file.mimetype}, size: ${file.size}`);
            const mimeOk = !allowedMimes || allowedMimes.includes(file.mimetype);
            if (!mimeOk) {
              // Windows browsers sometimes send application/octet-stream for pptx/mp4/etc.
              // Allow by extension as a fallback when configured.
              const name = (file.originalname || "").toLowerCase();
              const ext = name.includes(".") ? name.slice(name.lastIndexOf(".") + 1) : "";
              const extOk = Array.isArray(allowedExts) && allowedExts.includes(ext);
              if (!extOk) {
                return cb(
                  new Error(
                    `Invalid file type: ${file.mimetype}. Allowed mimes: ${allowedMimes?.join(
                      ", "
                    ) || "any"}${allowedExts?.length ? `. Allowed extensions: .${allowedExts.join(", .")}` : ""}`
                  )
                );
              }
            }
            return cb(null, true);
          },
        });
      }

      // Must match our routes: single("file")
      console.log(`[Upload] Processing file upload for ${folder}`);
      
      // Wrap multer middleware to catch Cloudinary errors
      return uploader.single("file")(req, res, (err) => {
        if (err) {
          console.error(`[Upload] Multer/Cloudinary error:`, err.message);
          console.error(`[Upload] Error details:`, {
            name: err.name,
            code: err.code,
            http_code: err.http_code,
            message: err.message,
          });
          
          // Handle Cloudinary API errors (502 Bad Gateway)
          if (err.http_code === 502 || (err.message && err.message.includes("502"))) {
            return res.status(502).json({
              message: "Cloudinary service temporarily unavailable (502 Bad Gateway). This may be due to:\n" +
                "1. Large video file causing timeout\n" +
                "2. Cloudinary service issue\n" +
                "3. Network connectivity problem\n\n" +
                "Please try again in a few moments or use a smaller file (under 100MB recommended).",
            });
          }
          
          // Handle timeout errors
          if (err.http_code === 504 || err.message?.includes("timeout") || err.message?.includes("Timeout")) {
            return res.status(504).json({
              message: "Upload timed out. Large video files may take longer to upload. Please try again or use a smaller file.",
            });
          }
          
          // Handle other Cloudinary errors
          if (err.http_code) {
            return res.status(err.http_code).json({
              message: `Cloudinary error (${err.http_code}): ${err.message || "Upload failed"}`,
            });
          }
          
          return next(err);
        }
        next();
      });
    } catch (err) {
      console.error(`[Upload] Error creating uploader:`, err);
      return next(err);
    }
  };
}

module.exports = { makeUploader };


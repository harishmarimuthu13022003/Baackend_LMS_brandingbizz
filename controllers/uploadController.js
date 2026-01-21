exports.uploadSingle = async (req, res, next) => {
  try {
    console.log("[Upload Controller] File received:", req.file ? "Yes" : "No");
    
    if (!req.file) {
      return res.status(400).json({ 
        message: "No file uploaded. Please select a file and try again." 
      });
    }

    console.log("[Upload Controller] File details:", {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      hasPath: !!req.file.path,
      hasSecureUrl: !!req.file.secure_url,
      hasUrl: !!req.file.url,
      filename: req.file.filename,
      publicId: req.file.public_id,
      resourceType: req.file.resource_type,
    });

    /**
     * multer-storage-cloudinary puts Cloudinary response on req.file.
     * Common fields:
     * - req.file.path      -> URL
     * - req.file.filename  -> public_id
     * - req.file.size      -> bytes
     * - req.file.mimetype  -> mime type
     *
     * (Some examples online use secure_url/url/public_id, but those are not always present here.)
     */
    const url = req.file.path || req.file.secure_url || req.file.url;
    const publicId = req.file.filename || req.file.public_id;
    const originalName = req.file.originalname;
    const resourceType = req.file.resource_type || req.file.resourceType; // 'image', 'video', 'raw'

    if (!url) {
      console.error("[Upload Controller] Cloudinary upload response missing URL:", JSON.stringify(req.file, null, 2));
      return res.status(500).json({ 
        message:
          "Failed to read Cloudinary URL from upload response (multer-storage-cloudinary). Please check server logs for req.file shape.",
      });
    }

    console.log("[Upload Controller] Upload successful:", url);

    return res.status(201).json({
      url,
      publicId,
      originalName,
      resourceType,
      size: req.file.bytes || req.file.size,
    });
  } catch (err) {
    console.error("[Upload Controller] Error:", err.message);
    console.error("[Upload Controller] Stack:", err.stack);
    
    // Handle Cloudinary-specific errors
    if (err.message && err.message.includes("502")) {
      return res.status(502).json({
        message: "Cloudinary service temporarily unavailable (502). This may be due to:\n" +
          "1. Large file size causing timeout\n" +
          "2. Cloudinary service issue\n" +
          "3. Network connectivity problem\n\n" +
          "Please try again in a few moments or use a smaller file.",
      });
    }
    
    if (err.message && (err.message.includes("timeout") || err.message.includes("Timeout"))) {
      return res.status(504).json({
        message: "Upload timed out. Large video files may take longer to upload. Please try again or use a smaller file.",
      });
    }
    
    return next(err);
  }
};


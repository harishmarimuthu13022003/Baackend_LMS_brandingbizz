const multer = require("multer");

function notFound(req, res) {
  res.status(404).json({ message: "Route not found" });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  // eslint-disable-next-line no-console
  console.error("[Error Handler] Error:", err.message || err);
  if (err.stack) {
    // eslint-disable-next-line no-console
    console.error("[Error Handler] Stack:", err.stack);
  }
  
  const status = err.statusCode || err.status || 500;
  let message = err.message || "Server error";
  
  // Handle multer errors
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        message: `File too large: ${err.message}. Maximum size exceeded.`,
      });
    }
    if (err.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({
        message: `Unexpected file field: ${err.message}`,
      });
    }
    return res.status(400).json({
      message: `Upload error: ${err.message}`,
    });
  }
  
  // Handle Cloudinary errors
  if (message.includes("Cloudinary") || message.includes("cloudinary") || err.http_code) {
    if (err.http_code === 502) {
      message = "Cloudinary service temporarily unavailable (502 Bad Gateway). This may be due to:\n" +
        "1. Large file size causing timeout\n" +
        "2. Cloudinary service issue\n" +
        "3. Network connectivity problem\n\n" +
        "Please try again in a few moments or use a smaller file.";
      return res.status(502).json({ message });
    }
    if (err.http_code === 504 || message.includes("timeout") || message.includes("Timeout")) {
      message = "Upload timed out. Large video files may take longer to upload. Please try again or use a smaller file.";
      return res.status(504).json({ message });
    }
    if (message.includes("Invalid") || message.includes("invalid") || err.http_code === 401) {
      message = `Cloudinary configuration error: ${message}. Please check your Cloudinary credentials in .env file.`;
      return res.status(401).json({ message });
    }
    if (err.http_code === 400) {
      message = `Cloudinary upload error: ${message}. Please check file format and size limits.`;
      return res.status(400).json({ message });
    }
  }
  
  res.status(status).json({
    message,
    ...(process.env.NODE_ENV === "development" && { 
      stack: err.stack,
      error: err.toString(),
    }),
  });
}

module.exports = { notFound, errorHandler };


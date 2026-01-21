const cloudinary = require("cloudinary").v2;

function hasCloudinaryEnv() {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } =
    process.env;
  return Boolean(CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET);
}

function initCloudinary() {
  // Important: don't crash the whole server at startup if Cloudinary is not configured yet.
  if (!hasCloudinaryEnv()) return null;

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  return cloudinary;
}

function requireCloudinary() {
  const configured = initCloudinary();
  if (!configured) {
    throw new Error(
      "Cloudinary env vars are missing. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your .env file."
    );
  }
  
  // Test Cloudinary connection
  try {
    configured.api.ping((error, result) => {
      if (error) {
        console.error("[Cloudinary] Connection test failed:", error.message);
      } else {
        console.log("[Cloudinary] Connection test successful:", result.status);
      }
    });
  } catch (err) {
    console.warn("[Cloudinary] Could not test connection:", err.message);
  }
  
  return configured;
}

module.exports = { initCloudinary, requireCloudinary, hasCloudinaryEnv, cloudinary };


const { Storage } = require("@google-cloud/storage");
const path = require("path");

let storage = null;
let bucket = null;

/**
 * Initialize Google Cloud Storage
 * Requires GOOGLE_APPLICATION_CREDENTIALS or GCS credentials in .env
 */
function initGCS() {
  try {
    const { GCS_PROJECT_ID, GCS_BUCKET_NAME, GCS_KEY_FILE, GCS_CREDENTIALS } = process.env;

    if (!GCS_PROJECT_ID || !GCS_BUCKET_NAME) {
      console.warn("[GCS] GCS_PROJECT_ID or GCS_BUCKET_NAME not set. GCS uploads will be disabled.");
      return null;
    }

    let storageConfig = {
      projectId: GCS_PROJECT_ID,
    };

    // Option 1: Use service account key file path
    if (GCS_KEY_FILE) {
      storageConfig.keyFilename = path.resolve(GCS_KEY_FILE);
      console.log("[GCS] Using key file:", storageConfig.keyFilename);
    }
    // Option 2: Use credentials JSON string from .env
    else if (GCS_CREDENTIALS) {
      try {
        storageConfig.credentials = JSON.parse(GCS_CREDENTIALS);
        console.log("[GCS] Using credentials from .env");
      } catch (err) {
        console.error("[GCS] Failed to parse GCS_CREDENTIALS JSON:", err.message);
        return null;
      }
    }
    // Option 3: Use default credentials (GOOGLE_APPLICATION_CREDENTIALS env var)
    else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      console.log("[GCS] Using GOOGLE_APPLICATION_CREDENTIALS");
    }
    // No credentials found
    else {
      console.warn("[GCS] No credentials found. Set GCS_KEY_FILE, GCS_CREDENTIALS, or GOOGLE_APPLICATION_CREDENTIALS");
      return null;
    }

    storage = new Storage(storageConfig);
    bucket = storage.bucket(GCS_BUCKET_NAME);

    // Test connection (non-blocking, won't crash server if it fails)
    bucket
      .exists()
      .then(([exists]) => {
        if (exists) {
          console.log(`[GCS] ✅ Connected to bucket: ${GCS_BUCKET_NAME}`);
        } else {
          console.warn(`[GCS] ⚠️  Bucket ${GCS_BUCKET_NAME} does not exist!`);
        }
      })
      .catch((err) => {
        console.warn("[GCS] ⚠️  Connection test failed:", err.message);
        console.warn("[GCS] ⚠️  This might be a permission issue. Make sure your service account has 'Storage Admin' role.");
        console.warn("[GCS] ⚠️  Server will continue, but file uploads may fail.");
      });

    return { storage, bucket };
  } catch (err) {
    console.error("[GCS] Initialization error:", err.message);
    return null;
  }
}

/**
 * Get GCS storage instance
 */
function getStorage() {
  if (!storage || !bucket) {
    const initialized = initGCS();
    if (!initialized) {
      throw new Error(
        "GCS not configured. Please set GCS_PROJECT_ID, GCS_BUCKET_NAME, and credentials in .env file."
      );
    }
  }
  return { storage, bucket };
}

/**
 * Generate a file path based on course hierarchy
 * Format: lms/{contentType}/{courseSlug}/{sessionSlug}/{filename}
 */
function generateFilePath(courseTitle, sessionTitle, contentType = "videos", filename) {
  const sanitize = (str) => str.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
  const courseSlug = sanitize(courseTitle || "general");
  const sessionSlug = sanitize(sessionTitle || "session");
  return `lms/${contentType}/${courseSlug}/${sessionSlug}/${filename}`;
}

/**
 * Get public URL for a file in GCS bucket
 * @param {string} filePath - Path to file in bucket
 * @returns {string} Public URL
 */
function getPublicUrl(filePath) {
  const { GCS_BUCKET_NAME } = process.env;
  if (!GCS_BUCKET_NAME) {
    throw new Error("GCS_BUCKET_NAME not configured");
  }
  
  // For public buckets
  return `https://storage.googleapis.com/${GCS_BUCKET_NAME}/${filePath}`;
  
  // Alternative: If using custom domain
  // return `https://your-custom-domain.com/${filePath}`;
}

/**
 * Upload file to GCS
 * @param {Buffer|Stream} fileBuffer - File buffer or stream
 * @param {string} destinationPath - Destination path in bucket
 * @param {string} contentType - MIME type
 * @param {Object} metadata - Additional metadata
 * @returns {Promise<{url: string, path: string}>}
 */
async function uploadFile(fileBuffer, destinationPath, contentType, metadata = {}) {
  const { bucket } = getStorage();

  const file = bucket.file(destinationPath);

  const stream = file.createWriteStream({
    metadata: {
      contentType,
      metadata: {
        ...metadata,
        uploadedAt: new Date().toISOString(),
      },
    },
    resumable: false, // For files < 5MB, use false. For larger files, use true
  });

  return new Promise((resolve, reject) => {
    stream.on("error", (err) => {
      console.error("[GCS] Upload error:", err);
      reject(err);
    });

    stream.on("finish", async () => {
      try {
        // Make file publicly readable (required for video playback)
        await file.makePublic();

        const url = getPublicUrl(destinationPath);
        console.log("[GCS] Upload successful:", url);

        // Set CORS-friendly metadata
        await file.setMetadata({
          contentType,
          cacheControl: "public, max-age=3600",
          metadata: {
            ...metadata,
            uploadedAt: new Date().toISOString(),
          },
        });

        resolve({
          url,
          path: destinationPath,
          publicId: destinationPath, // For compatibility with existing code
        });
      } catch (err) {
        console.error("[GCS] Error making file public:", err);
        // Still return URL even if makePublic fails
        const url = getPublicUrl(destinationPath);
        console.warn("[GCS] File might not be publicly accessible. Make sure bucket has public access enabled.");
        resolve({
          url,
          path: destinationPath,
          publicId: destinationPath,
        });
      }
    });

    stream.end(fileBuffer);
  });
}

/**
 * Delete file from GCS
 * @param {string} filePath - Path to file in bucket
 */
async function deleteFile(filePath) {
  const { bucket } = getStorage();
  try {
    await bucket.file(filePath).delete();
    console.log("[GCS] File deleted:", filePath);
  } catch (err) {
    console.error("[GCS] Delete error:", err.message);
    throw err;
  }
}

module.exports = {
  initGCS,
  getStorage,
  generateFilePath,
  getPublicUrl,
  uploadFile,
  deleteFile,
};

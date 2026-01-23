/**
 * Script to apply CORS configuration to GCS bucket
 * Run: node scripts/applyCors.js
 */

const { Storage } = require("@google-cloud/storage");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

async function applyCors() {
  try {
    const { GCS_PROJECT_ID, GCS_BUCKET_NAME, GCS_KEY_FILE } = process.env;

    if (!GCS_PROJECT_ID || !GCS_BUCKET_NAME) {
      console.error("❌ Error: GCS_PROJECT_ID and GCS_BUCKET_NAME must be set in .env");
      process.exit(1);
    }

    // Initialize GCS
    let storageConfig = {
      projectId: GCS_PROJECT_ID,
    };

    if (GCS_KEY_FILE) {
      storageConfig.keyFilename = path.resolve(GCS_KEY_FILE);
    } else if (process.env.GCS_CREDENTIALS) {
      storageConfig.credentials = JSON.parse(process.env.GCS_CREDENTIALS);
    } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      // Use default
    } else {
      console.error("❌ Error: No GCS credentials found. Set GCS_KEY_FILE, GCS_CREDENTIALS, or GOOGLE_APPLICATION_CREDENTIALS");
      process.exit(1);
    }

    const storage = new Storage(storageConfig);
    const bucket = storage.bucket(GCS_BUCKET_NAME);

    // Read CORS config
    const corsFilePath = path.join(__dirname, "..", "gcs-cors.json");
    if (!fs.existsSync(corsFilePath)) {
      console.error(`❌ Error: CORS config file not found: ${corsFilePath}`);
      process.exit(1);
    }

    const corsConfig = JSON.parse(fs.readFileSync(corsFilePath, "utf8"));
    console.log("📋 CORS Configuration:");
    console.log(JSON.stringify(corsConfig, null, 2));

    // Apply CORS
    console.log(`\n🔄 Applying CORS configuration to bucket: ${GCS_BUCKET_NAME}...`);
    await bucket.setCorsConfiguration(corsConfig);

    console.log("✅ CORS configuration applied successfully!");
    console.log("\n📝 Next steps:");
    console.log("1. Make sure your bucket has public access enabled");
    console.log("2. Test video playback in your frontend");
    console.log("3. Check browser console for any CORS errors");

  } catch (err) {
    console.error("❌ Error applying CORS:", err.message);
    if (err.code === 403) {
      console.error("\n💡 Tip: Make sure your service account has 'Storage Admin' role");
    }
    process.exit(1);
  }
}

applyCors();

/**
 * Test Cloudinary connection and upload
 * Usage: node scripts/testCloudinary.js
 */

require("dotenv").config();
const cloudinary = require("cloudinary").v2;

async function testCloudinary() {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;

  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    console.error("❌ Cloudinary credentials missing in .env file");
    console.error("Required: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET");
    process.exit(1);
  }

  console.log("Testing Cloudinary connection...");
  console.log(`Cloud Name: ${CLOUDINARY_CLOUD_NAME}`);
  console.log(`API Key: ${CLOUDINARY_API_KEY.substring(0, 10)}...`);

  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
  });

  try {
    // Test 1: Ping Cloudinary
    console.log("\n1. Testing API connection...");
    const pingResult = await cloudinary.api.ping();
    console.log("✅ Ping successful:", pingResult.status);

    // Test 2: List resources
    console.log("\n2. Testing resource access...");
    const resources = await cloudinary.api.resources({ max_results: 1 });
    console.log("✅ Resource access successful");
    console.log(`   Found ${resources.total_count} resources in account`);

    console.log("\n✅ Cloudinary is configured correctly!");
    console.log("\nYou can now upload files through the admin panel.");
  } catch (error) {
    console.error("\n❌ Cloudinary test failed:");
    console.error("Error:", error.message);
    if (error.http_code) {
      console.error("HTTP Code:", error.http_code);
    }
    if (error.message.includes("Invalid API Key")) {
      console.error("\n💡 Tip: Check your CLOUDINARY_API_KEY in .env file");
    }
    if (error.message.includes("Invalid API Secret")) {
      console.error("\n💡 Tip: Check your CLOUDINARY_API_SECRET in .env file");
    }
    if (error.message.includes("Invalid Cloud Name")) {
      console.error("\n💡 Tip: Check your CLOUDINARY_CLOUD_NAME in .env file");
    }
    process.exit(1);
  }
}

testCloudinary();

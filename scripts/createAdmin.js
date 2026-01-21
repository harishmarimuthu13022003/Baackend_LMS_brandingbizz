/**
 * Script to create an admin user
 * Usage: node scripts/createAdmin.js <email> <password> <name>
 * Example: node scripts/createAdmin.js admin@example.com admin123 "Admin User"
 */

require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { connectDB } = require("../config/db");

async function createAdmin() {
  const args = process.argv.slice(2);
  if (args.length < 3) {
    console.error("Usage: node scripts/createAdmin.js <email> <password> <name>");
    console.error('Example: node scripts/createAdmin.js admin@example.com admin123 "Admin User"');
    process.exit(1);
  }

  const [email, password, name] = args;

  try {
    await connectDB();
    console.log("Connected to MongoDB");

    // Check if admin already exists
    const existing = await User.findOne({ email });
    if (existing) {
      if (existing.role === "admin") {
        console.log(`✅ Admin user already exists: ${email}`);
        process.exit(0);
      } else {
        // Update existing user to admin
        existing.role = "admin";
        const hash = await bcrypt.hash(password, 10);
        existing.password = hash;
        existing.name = name;
        await existing.save();
        console.log(`✅ Updated user to admin: ${email}`);
        process.exit(0);
      }
    }

    // Create new admin user
    const hash = await bcrypt.hash(password, 10);
    const admin = await User.create({
      name,
      email,
      password: hash,
      role: "admin",
    });

    console.log(`✅ Admin user created successfully!`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Name: ${admin.name}`);
    console.log(`   Role: ${admin.role}`);
    console.log(`\nYou can now login with these credentials.`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating admin:", error.message);
    process.exit(1);
  }
}

createAdmin();

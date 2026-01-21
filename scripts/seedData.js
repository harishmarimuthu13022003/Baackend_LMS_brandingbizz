/**
 * Seed script to populate database with BrandingBeez Academy dummy data
 * Usage: node scripts/seedData.js
 */

require("dotenv").config();
const mongoose = require("mongoose");
const Course = require("../models/Course");
const Section = require("../models/Section");
const Session = require("../models/Session");
const { connectDB } = require("../config/db");

async function seedData() {
  try {
    await connectDB();
    console.log("Connected to MongoDB");

    // Clear existing data
    await Course.deleteMany({});
    await Section.deleteMany({});
    await Session.deleteMany({});
    console.log("Cleared existing data");

    // Level 1: Top-level categories
    const naanMudhalvan = await Course.create({
      title: "Naan Mudhalvan",
      description: "Naan Mudhalvan program",
      order: 1,
    });

    const knowvaa = await Course.create({
      title: "Knowvaa",
      description: "Knowvaa platform",
      order: 2,
    });

    console.log("Created top-level categories");

    // Level 2: Subcategories under Naan Mudhalvan
    const artsScience = await Course.create({
      title: "Arts and Science",
      description: "Arts and Science courses",
      parentId: naanMudhalvan._id,
      order: 1,
    });

    const paramedical = await Course.create({
      title: "Paramedical",
      description: "Paramedical courses",
      parentId: naanMudhalvan._id,
      order: 2,
    });

    console.log("Created subcategories");

    // Level 3: Actual courses under Arts and Science
    const digitalMarketing = await Course.create({
      title: "Digital Marketing",
      description: "Learn digital marketing strategies and techniques",
      parentId: artsScience._id,
      order: 1,
    });

    const aiDigitalMarketing = await Course.create({
      title: "AI Driven Digital Marketing",
      description: "Master AI-powered digital marketing tools and strategies",
      parentId: artsScience._id,
      order: 2,
    });

    // Courses under Paramedical
    const communicativeEnglish = await Course.create({
      title: "Communicative English for Nursing",
      description: "Improve English communication skills for nursing professionals",
      parentId: paramedical._id,
      order: 1,
    });

    const digitalSkills = await Course.create({
      title: "Digital Skills for Nursing",
      description: "Essential digital skills for modern nursing practice",
      parentId: paramedical._id,
      order: 2,
    });

    console.log("Created courses");

    // Create sections for AI Driven Digital Marketing (as shown in images)
    const aiSection = await Section.create({
      courseId: aiDigitalMarketing._id,
      title: "AI Digital Marketing Fundamentals",
      order: 1,
    });

    // Create 18 sessions for AI Driven Digital Marketing
    const sessionTitles = Array.from({ length: 18 }, (_, i) => `Session ${i + 1}`);
    const sessions = [];

    for (let i = 0; i < 18; i++) {
      const session = await Session.create({
        sectionId: aiSection._id,
        title: sessionTitles[i],
        // Point to locally served static assets (copy your files into backend/public/*)
        studyMaterialUrl: `http://localhost:5000/static/materials/AI_Driven_Digital_Marketing.pdf`,
        pptUrl: `http://localhost:5000/static/ppts/AI_Driven_Digital_Marketing.pptx`,
        videoUrl: `http://localhost:5000/static/videos/WhatsApp-Video.mp4`,
        duration: `${60 + i * 5} min`,
      });
      sessions.push(session);
    }

    console.log(`Created ${sessions.length} sessions for AI Driven Digital Marketing`);

    // Create sections and sessions for Digital Marketing
    const dmSection = await Section.create({
      courseId: digitalMarketing._id,
      title: "Digital Marketing Basics",
      order: 1,
    });

    for (let i = 1; i <= 12; i++) {
      await Session.create({
        sectionId: dmSection._id,
        title: `Session ${i}`,
        studyMaterialUrl: `http://localhost:5000/static/materials/AI_Driven_Digital_Marketing.pdf`,
        pptUrl: `http://localhost:5000/static/ppts/AI_Driven_Digital_Marketing.pptx`,
        videoUrl: `http://localhost:5000/static/videos/WhatsApp-Video.mp4`,
        duration: `${45 + i * 3} min`,
      });
    }

    console.log("Created sessions for Digital Marketing");

    // Create sections and sessions for Communicative English
    const ceSection = await Section.create({
      courseId: communicativeEnglish._id,
      title: "English Communication Skills",
      order: 1,
    });

    for (let i = 1; i <= 10; i++) {
      await Session.create({
        sectionId: ceSection._id,
        title: `Session ${i}`,
        studyMaterialUrl: `http://localhost:5000/static/materials/AI_Driven_Digital_Marketing.pdf`,
        pptUrl: `http://localhost:5000/static/ppts/AI_Driven_Digital_Marketing.pptx`,
        videoUrl: `http://localhost:5000/static/videos/WhatsApp-Video.mp4`,
        duration: `${50 + i * 5} min`,
      });
    }

    console.log("Created sessions for Communicative English");

    // Create sections and sessions for Digital Skills
    const dsSection = await Section.create({
      courseId: digitalSkills._id,
      title: "Digital Skills Essentials",
      order: 1,
    });

    for (let i = 1; i <= 15; i++) {
      await Session.create({
        sectionId: dsSection._id,
        title: `Session ${i}`,
        studyMaterialUrl: `http://localhost:5000/static/materials/AI_Driven_Digital_Marketing.pdf`,
        pptUrl: `http://localhost:5000/static/ppts/AI_Driven_Digital_Marketing.pptx`,
        videoUrl: `http://localhost:5000/static/videos/WhatsApp-Video.mp4`,
        duration: `${40 + i * 4} min`,
      });
    }

    console.log("Created sessions for Digital Skills");

    console.log("\n✅ Seed data created successfully!");
    console.log("\nData structure:");
    console.log("- Academy");
    console.log("  ├── Naan Mudhalvan");
    console.log("  │   ├── Arts and Science");
    console.log("  │   │   ├── Digital Marketing (12 sessions)");
    console.log("  │   │   └── AI Driven Digital Marketing (18 sessions)");
    console.log("  │   └── Paramedical");
    console.log("  │       ├── Communicative English for Nursing (10 sessions)");
    console.log("  │       └── Digital Skills for Nursing (15 sessions)");
    console.log("  └── Knowvaa");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding data:", error);
    process.exit(1);
  }
}

seedData();

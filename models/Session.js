const mongoose = require("mongoose");

// Schema for individual video items
const videoItemSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  videoUrl: { type: String, required: true }, // Cloudinary secure_url
  publicId: { type: String, required: true }, // Cloudinary public_id for management
  duration: { type: String, default: "" }, // Video duration in seconds or "HH:MM:SS"
  thumbnail: { type: String, default: "" }, // Cloudinary thumbnail URL
  order: { type: Number, default: 0 }, // Play order
  bytes: { type: Number, default: 0 }, // File size in bytes
}, { _id: false });

// Schema for individual PPT items
const pptItemSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  pptUrl: { type: String, required: true }, // Cloudinary secure_url
  publicId: { type: String, required: true }, // Cloudinary public_id
  order: { type: Number, default: 0 },
  bytes: { type: Number, default: 0 },
}, { _id: false });

// Schema for individual study material items
const materialItemSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  materialUrl: { type: String, required: true }, // Cloudinary secure_url
  publicId: { type: String, required: true }, // Cloudinary public_id
  order: { type: Number, default: 0 },
  bytes: { type: Number, default: 0 },
}, { _id: false });

const sessionSchema = new mongoose.Schema(
  {
    sectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Section",
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    
    // Arrays of content items (replaces single URLs)
    videos: { type: [videoItemSchema], default: [] },
    ppts: { type: [pptItemSchema], default: [] },
    materials: { type: [materialItemSchema], default: [] },
    
    // Legacy fields (kept for backward compatibility, but deprecated)
    studyMaterialUrl: { type: String, default: "" },
    pptUrl: { type: String, default: "" },
    videoUrl: { type: String, default: "" },
    duration: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Session", sessionSchema);


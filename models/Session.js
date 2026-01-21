const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema(
  {
    sectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Section",
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true },
    studyMaterialUrl: { type: String, default: "" },
    pptUrl: { type: String, default: "" },
    videoUrl: { type: String, default: "" },
    duration: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Session", sessionSchema);


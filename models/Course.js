const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    thumbnail: { type: String, default: "" },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      default: null,
      index: true,
    },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Course", courseSchema);


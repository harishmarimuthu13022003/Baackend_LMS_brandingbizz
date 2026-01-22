const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const morgan = require("morgan");
const path = require("path");

const { connectDB } = require("./config/db");
const { initGCS } = require("./config/gcs");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const authRoutes = require("./routes/authRoutes");
const courseRoutes = require("./routes/courseRoutes");
const sectionRoutes = require("./routes/sectionRoutes");
const sessionRoutes = require("./routes/sessionRoutes");
const uploadRoutes = require("./routes/uploadRoutes");

dotenv.config();

async function start() {
  await connectDB();
  initGCS(); // Initialize Google Cloud Storage

  const app = express();

  app.use(
    cors({
      origin: process.env.CORS_ORIGIN?.split(",").map((s) => s.trim()) || "*",
      credentials: true,
    })
  );
  app.use(express.json({ limit: "2mb" }));
  app.use(express.urlencoded({ extended: true, limit: "200mb" }));
  app.use(morgan("dev"));
  
  // Increase timeout for file uploads (GCS can take time for large files)
  app.use("/api/uploads", (req, res, next) => {
    req.setTimeout(1800000); // 30 minutes for very large video files (500MB+)
    res.setTimeout(1800000);
    next();
  });

  // Serve locally stored assets (PDF/PPT/MP4) via URLs like:
  // http://localhost:5000/static/materials/AI_Driven_Digital_Marketing.pdf
  app.use("/static", express.static(path.join(__dirname, "public")));

  app.get("/health", (req, res) => res.json({ ok: true }));

  app.use("/api/auth", authRoutes);
  app.use("/api/courses", courseRoutes);
  app.use("/api/sections", sectionRoutes);
  app.use("/api/sessions", sessionRoutes);
  app.use("/api/uploads", uploadRoutes);

  app.use(notFound);
  app.use(errorHandler);

  const port = process.env.PORT || 5000;
  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Server running on port ${port}`);
  });
}

start().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("Failed to start server", err);
  process.exit(1);
});


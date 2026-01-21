Place your learning files here so the backend can serve them via `/static/...`.

Examples:
- backend/public/materials/AI_Driven_Digital_Marketing.pdf
- backend/public/ppts/AI_Driven_Digital_Marketing.pptx
- backend/public/videos/your-video.mp4

Then the URL becomes:
- http://localhost:5000/static/materials/AI_Driven_Digital_Marketing.pdf
- http://localhost:5000/static/ppts/AI_Driven_Digital_Marketing.pptx
- http://localhost:5000/static/videos/your-video.mp4

Store these URLs in MongoDB in `Session.studyMaterialUrl`, `Session.pptUrl`, `Session.videoUrl`.


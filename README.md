# LMS Backend API

Node.js + Express.js backend API for the BrandingBeez Learning Management System.

## 🚀 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js 5.x
- **Database**: MongoDB (Mongoose)
- **Authentication**: JWT (jsonwebtoken)
- **File Upload**: Multer + Cloudinary
- **Validation**: express-validator
- **Password Hashing**: bcryptjs

## 📋 Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or MongoDB Atlas)
- Cloudinary account (for file uploads)

## 🔧 Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` and fill in your values:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRES_IN=7d
   CORS_ORIGIN=http://localhost:5173
   
   # Cloudinary Configuration
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

3. **Start the server**
   ```bash
   # Development mode (with auto-reload)
   npm run dev
   
   # Production mode
   npm start
   ```

The server will run on `http://localhost:5000` (or your configured PORT).

## 📁 Project Structure

```
backend/
├── config/
│   ├── db.js              # MongoDB connection
│   ├── cloudinary.js      # Cloudinary configuration
│   └── upload.js          # Multer upload configuration
├── controllers/
│   ├── authController.js
│   ├── courseController.js
│   ├── sectionController.js
│   ├── sessionController.js
│   └── uploadController.js
├── middleware/
│   ├── auth.js            # JWT authentication middleware
│   └── errorHandler.js    # Global error handler
├── models/
│   ├── User.js
│   ├── Course.js
│   ├── Section.js
│   └── Session.js
├── routes/
│   ├── authRoutes.js
│   ├── courseRoutes.js
│   ├── sectionRoutes.js
│   ├── sessionRoutes.js
│   └── uploadRoutes.js
├── scripts/
│   ├── createAdmin.js     # Create admin user script
│   ├── seedData.js        # Seed database with dummy data
│   └── testCloudinary.js  # Test Cloudinary connection
├── public/                # Static files (if using local storage)
│   ├── materials/         # PDFs
│   ├── ppts/             # PowerPoint files
│   ├── videos/           # Video files
│   └── thumbnails/       # Course thumbnails
├── server.js             # Main server file
└── package.json
```

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication.

### Register a User
```bash
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "user"  # or "admin"
}
```

### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

### Using the Token
Include the token in the Authorization header:
```
Authorization: Bearer <your-token>
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get JWT token

### Courses (Protected)
- `GET /api/courses` - List all top-level courses
- `GET /api/courses?parentId=<id>` - List courses by parent
- `GET /api/courses/:id` - Get course by ID
- `POST /api/courses` - Create course (Admin only)

### Sections (Protected)
- `GET /api/sections/by-course/:courseId` - List sections by course
- `POST /api/sections` - Create section (Admin only)

### Sessions (Protected)
- `GET /api/sessions/by-section/:sectionId` - List sessions by section
- `GET /api/sessions/:id` - Get session by ID (with populated course/section)
- `POST /api/sessions` - Create session (Admin only)

### File Uploads (Admin only)
- `POST /api/uploads/thumbnail` - Upload course thumbnail (image)
- `POST /api/uploads/pdf` - Upload PDF study material
- `POST /api/uploads/ppt` - Upload PowerPoint presentation
- `POST /api/uploads/video` - Upload video file

**Upload Format:**
```
Content-Type: multipart/form-data
Form field: file
```

**Response:**
```json
{
  "url": "https://res.cloudinary.com/...",
  "publicId": "lms/materials/...",
  "originalName": "document.pdf",
  "resourceType": "raw",
  "size": 1024000
}
```

## 🗄️ Database Models

### User
- `name` (String, required)
- `email` (String, required, unique)
- `password` (String, required, hashed)
- `role` (String, enum: ["admin", "user"], default: "user")
- `enrolledCourses` (Array of Course IDs)

### Course
- `title` (String, required)
- `description` (String)
- `thumbnail` (String, URL)
- `parentId` (ObjectId, reference to Course, for hierarchy)
- `order` (Number, for sorting)

### Section
- `courseId` (ObjectId, reference to Course, required)
- `title` (String, required)
- `order` (Number, for sorting)

### Session
- `sectionId` (ObjectId, reference to Section, required)
- `title` (String, required)
- `studyMaterialUrl` (String, PDF URL)
- `pptUrl` (String, PPT URL)
- `videoUrl` (String, Video URL)
- `duration` (String, e.g., "45 min")

## 🛠️ Scripts

### Create Admin User
```bash
node scripts/createAdmin.js <email> <password> <name>
```

Example:
```bash
node scripts/createAdmin.js admin@lms.com admin123 "LMS Admin"
```

### Seed Database
Populate the database with dummy courses, sections, and sessions:
```bash
npm run seed
```

### Test Cloudinary Connection
```bash
node scripts/testCloudinary.js
```

## 📝 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port | No (default: 5000) |
| `MONGO_URI` | MongoDB connection string | Yes |
| `JWT_SECRET` | Secret key for JWT signing | Yes |
| `JWT_EXPIRES_IN` | JWT expiration time | No (default: 7d) |
| `CORS_ORIGIN` | Allowed CORS origins | No (default: *) |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | Yes |
| `CLOUDINARY_API_KEY` | Cloudinary API key | Yes |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | Yes |

## 🔒 Security Features

- Password hashing with bcryptjs
- JWT-based authentication
- Role-based access control (admin/user)
- Protected routes with middleware
- File upload validation (type and size)
- CORS configuration

## 📦 File Upload Limits

- **Thumbnails**: 5MB (JPG, PNG, WEBP)
- **PDFs**: 25MB
- **PPTs**: 50MB
- **Videos**: 200MB (MP4, WebM, MOV, AVI)

## 🐛 Error Handling

The API uses a centralized error handler that returns consistent error responses:

```json
{
  "message": "Error description"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden (Admin only)
- `404` - Not Found
- `500` - Internal Server Error
- `502` - Bad Gateway (Cloudinary issues)
- `504` - Gateway Timeout

## 🚨 Troubleshooting

### MongoDB Connection Issues
- Verify `MONGO_URI` is correct
- Check MongoDB is running (if local)
- Verify network access (if MongoDB Atlas)

### Cloudinary Upload Errors
- Verify Cloudinary credentials in `.env`
- Check file size limits
- Test connection: `node scripts/testCloudinary.js`
- Large videos (>100MB) may timeout - try smaller files

### JWT Token Issues
- Verify `JWT_SECRET` is set
- Check token expiration time
- Ensure token is sent in Authorization header

## 📚 Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [JWT Documentation](https://jwt.io/)

## 📄 License

ISC
